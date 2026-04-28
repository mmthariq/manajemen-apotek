const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const pool = require('../config/database');

const toCurrency = (value) => Number(value || 0);

const loadAnalyticsData = async ({ startDate, endDate, category }) => {
  const [summaryResult, purchaseSummaryResult, lowStockResult, purchaseResult] = await Promise.all([
    pool.query(
      `SELECT
         COALESCE(SUM(t."totalPrice"), 0)::float8 AS "penjualanPeriode",
         COUNT(*)::int AS "totalTransaksi"
       FROM "transactions" t
       WHERE ($1::date IS NULL OR DATE(t."createdAt") >= $1::date)
         AND ($2::date IS NULL OR DATE(t."createdAt") <= $2::date)
         AND t."status" IN ('VERIFIED', 'COMPLETED')`,
      [startDate || null, endDate || null]
    ),
    pool.query(
      `SELECT
         COALESCE(SUM(p."totalPrice"), 0)::float8 AS "pembelianPeriode",
         COUNT(*)::int AS "totalPengadaan"
       FROM "purchases" p
       WHERE ($1::date IS NULL OR DATE(p."createdAt") >= $1::date)
         AND ($2::date IS NULL OR DATE(p."createdAt") <= $2::date)`,
      [startDate || null, endDate || null]
    ),
    pool.query(
      `SELECT "name", COALESCE(NULLIF(TRIM("unit"), ''), 'Lainnya') AS "category", "stock"
       FROM "drugs"
       WHERE "stock" <= 10
         AND ($1::text IS NULL OR $1::text = '' OR COALESCE(NULLIF(TRIM("unit"), ''), 'Lainnya') = $1::text)
       ORDER BY "stock" ASC, "id" ASC`,
      [category || null]
    ),
    pool.query(
      `SELECT p."id", p."purchaseCode", p."createdAt", p."totalPrice", s."name" AS "supplierName"
       FROM "purchases" p
       JOIN "suppliers" s ON s."id" = p."supplierId"
       WHERE ($1::date IS NULL OR DATE(p."createdAt") >= $1::date)
         AND ($2::date IS NULL OR DATE(p."createdAt") <= $2::date)
       ORDER BY p."id" ASC`,
      [startDate || null, endDate || null]
    ),
  ]);

  const penjualanPeriode = toCurrency(summaryResult.rows[0]?.penjualanPeriode);
  const pembelianPeriode = toCurrency(purchaseSummaryResult.rows[0]?.pembelianPeriode);

  return {
    summary: {
      penjualanPeriode,
      pembelianPeriode,
      labaKotorPeriode: penjualanPeriode - pembelianPeriode,
      totalTransaksi: Number(summaryResult.rows[0]?.totalTransaksi || 0),
      totalPengadaan: Number(purchaseSummaryResult.rows[0]?.totalPengadaan || 0),
      stokMenipis: lowStockResult.rowCount,
    },
    lowStockProducts: lowStockResult.rows.map((item) => ({
      name: item.name,
      category: item.category,
      stock: Number(item.stock || 0),
    })),
    purchases: purchaseResult.rows.map((item) => ({
      id: item.id,
      purchaseCode: item.purchaseCode ?? item.purchasecode,
      createdAt: item.createdAt,
      supplierName: item.supplierName ?? item.suppliername,
      totalPrice: Number(item.totalPrice || 0),
    })),
  };
};

const loadKasirSalesData = async ({ date }) => {
  const [salesResult] = await Promise.all([
    pool.query(
      `SELECT t."id", t."createdAt", t."totalPrice",
              COALESCE(SUM(td."quantity"), 0)::int AS "totalItems"
       FROM "transactions" t
       LEFT JOIN "transaction_details" td ON td."transactionId" = t."id"
       WHERE ($1::date IS NULL OR DATE(t."createdAt") = $1::date)
         AND t."status" IN ('VERIFIED', 'COMPLETED')
       GROUP BY t."id", t."createdAt", t."totalPrice"
       ORDER BY t."id" ASC`,
      [date || null]
    ),
  ]);

  const totalSales = salesResult.rows.reduce((sum, item) => sum + Number(item.totalPrice || 0), 0);

  return {
    summary: {
      date: date || null,
      totalTransactions: salesResult.rowCount,
      totalSales,
    },
    transactions: salesResult.rows.map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      totalItems: Number(item.totalItems ?? item.totalitems ?? 0),
      totalPrice: Number(item.totalPrice || 0),
    })),
  };
};

const buildAnalyticsExcel = async (payload) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Apotek Pemuda';

  const summarySheet = workbook.addWorksheet('Ringkasan');
  summarySheet.columns = [
    { header: 'Metrik', key: 'metric', width: 28 },
    { header: 'Nilai', key: 'value', width: 24 },
  ];

  summarySheet.addRows([
    { metric: 'Penjualan Periode', value: payload.summary.penjualanPeriode },
    { metric: 'Pembelian Periode', value: payload.summary.pembelianPeriode },
    { metric: 'Laba Kotor Periode', value: payload.summary.labaKotorPeriode },
    { metric: 'Total Transaksi', value: payload.summary.totalTransaksi },
    { metric: 'Total Pengadaan', value: payload.summary.totalPengadaan },
    { metric: 'Stok Menipis', value: payload.summary.stokMenipis },
  ]);

  const stockSheet = workbook.addWorksheet('Stok Menipis');
  stockSheet.columns = [
    { header: 'Nama Obat', key: 'name', width: 36 },
    { header: 'Kategori', key: 'category', width: 20 },
    { header: 'Stok', key: 'stock', width: 12 },
  ];

  payload.lowStockProducts.forEach((item) => stockSheet.addRow(item));

  const purchaseSheet = workbook.addWorksheet('Pembelian');
  purchaseSheet.columns = [
    { header: 'Kode Pembelian', key: 'purchaseCode', width: 24 },
    { header: 'Waktu', key: 'createdAt', width: 24 },
    { header: 'Supplier', key: 'supplierName', width: 28 },
    { header: 'Total Harga', key: 'totalPrice', width: 16 },
  ];

  payload.purchases.forEach((item) => {
    purchaseSheet.addRow({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '-',
    });
  });

  return workbook.xlsx.writeBuffer();
};

const buildKasirExcel = async (payload) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Apotek Pemuda';

  const summarySheet = workbook.addWorksheet('Ringkasan');
  summarySheet.columns = [
    { header: 'Metrik', key: 'metric', width: 28 },
    { header: 'Nilai', key: 'value', width: 24 },
  ];

  summarySheet.addRows([
    { metric: 'Tanggal', value: payload.summary.date || 'Semua tanggal' },
    { metric: 'Total Transaksi', value: payload.summary.totalTransactions },
    { metric: 'Total Penjualan', value: payload.summary.totalSales },
  ]);

  const txSheet = workbook.addWorksheet('Transaksi');
  txSheet.columns = [
    { header: 'ID', key: 'id', width: 10 },
    { header: 'Waktu', key: 'createdAt', width: 24 },
    { header: 'Jumlah Item', key: 'totalItems', width: 16 },
    { header: 'Total Harga', key: 'totalPrice', width: 16 },
  ];

  payload.transactions.forEach((item) => {
    txSheet.addRow({
      ...item,
      createdAt: item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '-',
    });
  });

  return workbook.xlsx.writeBuffer();
};

const buildPdfBuffer = (title, rows) => new Promise((resolve, reject) => {
  const doc = new PDFDocument({ size: 'A4', margin: 36 });
  const chunks = [];

  doc.on('data', (chunk) => chunks.push(chunk));
  doc.on('end', () => resolve(Buffer.concat(chunks)));
  doc.on('error', reject);

  doc.fontSize(16).text(title, { align: 'left' });
  doc.moveDown(0.8);
  doc.fontSize(10);
  rows.forEach((line) => {
    doc.text(line);
  });

  doc.end();
});

const exportAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, category, type = 'pdf' } = req.query;
    const payload = await loadAnalyticsData({ startDate, endDate, category });

    if (String(type).toLowerCase() === 'excel') {
      const buffer = await buildAnalyticsExcel(payload);
      const filename = `laporan-analitik-${Date.now()}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(Buffer.from(buffer));
    }

    const pdfRows = [
      `Periode: ${startDate || '-'} s/d ${endDate || '-'}`,
      `Penjualan Periode: ${payload.summary.penjualanPeriode}`,
      `Pembelian Periode: ${payload.summary.pembelianPeriode}`,
      `Laba Kotor Periode: ${payload.summary.labaKotorPeriode}`,
      `Total Transaksi: ${payload.summary.totalTransaksi}`,
      `Total Pengadaan: ${payload.summary.totalPengadaan}`,
      `Stok Menipis: ${payload.summary.stokMenipis}`,
      '',
      'Daftar Stok Menipis:',
      ...payload.lowStockProducts.map((item, index) => `${index + 1}. ${item.name} | ${item.category} | stok ${item.stock}`),
      '',
      'Daftar Pembelian:',
      ...payload.purchases.map((item, index) => {
        const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '-';
        return `${index + 1}. ${item.purchaseCode || `#${item.id}`} | ${createdAt} | ${item.supplierName} | Rp ${item.totalPrice.toLocaleString('id-ID')}`;
      }),
    ];

    const buffer = await buildPdfBuffer('Laporan Analitik Apotek', pdfRows);
    const filename = `laporan-analitik-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

const exportKasirSales = async (req, res, next) => {
  try {
    const { date, type = 'pdf' } = req.query;
    const payload = await loadKasirSalesData({ date });

    if (String(type).toLowerCase() === 'excel') {
      const buffer = await buildKasirExcel(payload);
      const filename = `laporan-penjualan-kasir-${Date.now()}.xlsx`;

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
      return res.send(Buffer.from(buffer));
    }

    const pdfRows = [
      `Tanggal: ${payload.summary.date || 'Semua tanggal'}`,
      `Total Transaksi: ${payload.summary.totalTransactions}`,
      `Total Penjualan: ${payload.summary.totalSales}`,
      '',
      'Daftar Transaksi:',
      ...payload.transactions.map((item, index) => {
        const createdAt = item.createdAt ? new Date(item.createdAt).toLocaleString('id-ID') : '-';
        return `${index + 1}. #${item.id} | ${createdAt} | item ${item.totalItems} | Rp ${item.totalPrice.toLocaleString('id-ID')}`;
      }),
    ];

    const buffer = await buildPdfBuffer('Laporan Penjualan Kasir', pdfRows);
    const filename = `laporan-penjualan-kasir-${Date.now()}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    return res.send(buffer);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportAnalytics,
  exportKasirSales,
};
