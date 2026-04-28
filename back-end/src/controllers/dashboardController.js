const pool = require('../config/database');

const getDashboardSummary = async (req, res, next) => {
  try {
    const [drugResult, transactionTodayResult, supplierResult, userResult] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM "drugs"'),
      pool.query(
        `SELECT COUNT(*)::int AS total
        FROM "transactions"
         WHERE DATE("createdAt") = CURRENT_DATE`
      ),
      pool.query('SELECT COUNT(*)::int AS total FROM "suppliers"'),
      pool.query('SELECT COUNT(*)::int AS total FROM "users"'),
    ]);

    res.status(200).json({
      message: 'Ringkasan dashboard berhasil diambil.',
      data: {
        totalObat: drugResult.rows[0].total,
        transaksiHariIni: transactionTodayResult.rows[0].total,
        totalSupplier: supplierResult.rows[0].total,
        totalPengguna: userResult.rows[0].total,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardAnalytics = async (req, res, next) => {
  try {
    const { startDate, endDate, category } = req.query;

    const [
      summaryResult,
      periodSalesResult,
      periodPurchaseResult,
      weeklySalesResult,
      hourlySalesResult,
      categoryResult,
      lowStockResult,
      expiringSoonResult,
      recentTransactionsResult,
      recentPurchasesResult,
    ] = await Promise.all([
      pool.query(
        `SELECT
           (SELECT COUNT(*)::int FROM "drugs") AS "totalObat",
           (SELECT COUNT(*)::int FROM "suppliers") AS "totalSupplier",
           (SELECT COUNT(*)::int FROM "users") AS "totalPengguna",
           (SELECT COUNT(*)::int FROM "transactions" WHERE DATE("createdAt") = CURRENT_DATE) AS "transaksiHariIni",
           COALESCE((SELECT SUM("totalPrice") FROM "transactions" WHERE DATE("createdAt") = CURRENT_DATE), 0)::float8 AS "penjualanHariIni"
        `
      ),
      pool.query(
        `SELECT
           COALESCE(SUM(t."totalPrice"), 0)::float8 AS "penjualanPeriode"
         FROM "transactions" t
         WHERE ($1::date IS NULL OR DATE(t."createdAt") >= $1::date)
           AND ($2::date IS NULL OR DATE(t."createdAt") <= $2::date)
           AND t."status" IN ('VERIFIED', 'COMPLETED')`,
        [startDate || null, endDate || null]
      ),
      pool.query(
        `SELECT
           COALESCE(SUM(p."totalPrice"), 0)::float8 AS "pembelianPeriode"
         FROM "purchases" p
         WHERE ($1::date IS NULL OR DATE(p."createdAt") >= $1::date)
           AND ($2::date IS NULL OR DATE(p."createdAt") <= $2::date)`,
        [startDate || null, endDate || null]
      ),
      pool.query(
        `SELECT TO_CHAR(d::date, 'Dy') AS "name",
                COALESCE(SUM(t."totalPrice"), 0)::float8 AS "penjualan"
         FROM generate_series(CURRENT_DATE - INTERVAL '6 day', CURRENT_DATE, INTERVAL '1 day') AS d
         LEFT JOIN "transactions" t
           ON DATE(t."createdAt") = d::date
          AND t."status" IN ('VERIFIED', 'COMPLETED')
         GROUP BY d
         ORDER BY d ASC`
      ),
      pool.query(
        `SELECT TO_CHAR(hour_slot, 'HH24:00') AS "name",
                COALESCE(SUM(t."totalPrice"), 0)::float8 AS "penjualan"
         FROM generate_series(
           date_trunc('day', NOW()),
           date_trunc('day', NOW()) + INTERVAL '23 hour',
           INTERVAL '1 hour'
         ) AS hour_slot
         LEFT JOIN "transactions" t
           ON date_trunc('hour', t."createdAt") = hour_slot
          AND t."status" IN ('VERIFIED', 'COMPLETED')
         GROUP BY hour_slot
         ORDER BY hour_slot ASC`
      ),
      pool.query(
        `SELECT COALESCE(NULLIF(TRIM("unit"), ''), 'Lainnya') AS "name",
                COUNT(*)::int AS "value"
         FROM "drugs"
         GROUP BY COALESCE(NULLIF(TRIM("unit"), ''), 'Lainnya')
         ORDER BY "value" DESC`
      ),
      pool.query(
        `SELECT "id", "name", COALESCE(NULLIF(TRIM("unit"), ''), 'Lainnya') AS "category", "stock"
         FROM "drugs"
         WHERE "stock" <= 10
           AND ($1::text IS NULL OR $1::text = '' OR COALESCE(NULLIF(TRIM("unit"), ''), 'Lainnya') = $1::text)
         ORDER BY "stock" ASC, "id" ASC
         LIMIT 20`,
        [category || null]
      ),
      pool.query(
        `SELECT "id", "name", "stock", "expiredDate"
         FROM "drugs"
         WHERE "expiredDate" IS NOT NULL
           AND DATE("expiredDate") BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 day'
         ORDER BY "expiredDate" ASC, "id" ASC
         LIMIT 20`
      ),
      pool.query(
        `SELECT t."id",
                t."createdAt",
                t."totalPrice",
                COALESCE(c."username", 'Umum') AS "customerName"
         FROM "transactions" t
         LEFT JOIN "users" c ON c."id" = t."customerId"
         WHERE ($1::date IS NULL OR DATE(t."createdAt") >= $1::date)
           AND ($2::date IS NULL OR DATE(t."createdAt") <= $2::date)
         ORDER BY t."id" ASC
         LIMIT 20`,
        [startDate || null, endDate || null]
      ),
      pool.query(
        `SELECT p."id", p."createdAt", p."totalPrice", s."name" AS "supplierName"
         FROM "purchases" p
         JOIN "suppliers" s ON s."id" = p."supplierId"
         WHERE ($1::date IS NULL OR DATE(p."createdAt") >= $1::date)
           AND ($2::date IS NULL OR DATE(p."createdAt") <= $2::date)
         ORDER BY p."id" ASC
         LIMIT 20`,
        [startDate || null, endDate || null]
      ),
    ]);

    const summary = summaryResult.rows[0] || {};
    const penjualanPeriode = Number(periodSalesResult.rows[0]?.penjualanPeriode || 0);
    const pembelianPeriode = Number(periodPurchaseResult.rows[0]?.pembelianPeriode || 0);

    res.status(200).json({
      message: 'Data analitik dashboard berhasil diambil.',
      data: {
        summary: {
          totalObat: Number(summary.totalObat || 0),
          transaksiHariIni: Number(summary.transaksiHariIni || 0),
          totalSupplier: Number(summary.totalSupplier || 0),
          totalPengguna: Number(summary.totalPengguna || 0),
          penjualanHariIni: Number(summary.penjualanHariIni || 0),
          penjualanPeriode,
          pendapatanPeriode: penjualanPeriode,
          pembelianPeriode,
          labaKotorPeriode: penjualanPeriode - pembelianPeriode,
          stokMenipis: lowStockResult.rowCount,
          obatMendekatiKedaluwarsa: expiringSoonResult.rowCount,
          totalPeringatan: Number(lowStockResult.rowCount || 0) + Number(expiringSoonResult.rowCount || 0),
          obatTerlaris: Number(summary.transaksiHariIni || 0),
        },
        weeklySales: weeklySalesResult.rows,
        hourlySales: hourlySalesResult.rows,
        categories: categoryResult.rows,
        lowStockProducts: lowStockResult.rows.map((item) => ({
          id: item.id,
          name: item.name,
          category: item.category,
          stock: Number(item.stock || 0),
          status: Number(item.stock || 0) <= 5 ? 'Kritis' : 'Menipis',
        })),
        expiringSoonProducts: expiringSoonResult.rows.map((item) => {
          const expiredDate = item.expiredDate ?? item.expireddate;
          return {
            id: item.id,
            name: item.name,
            stock: Number(item.stock || 0),
            expiredDate,
          };
        }),
        recentTransactions: recentTransactionsResult.rows.map((item) => ({
          id: item.id,
          customerName: item.customerName,
          totalPrice: Number(item.totalPrice || 0),
          createdAt: item.createdAt,
        })),
        recentPurchases: recentPurchasesResult.rows.map((item) => ({
          id: item.id,
          supplierName: item.supplierName,
          totalPrice: Number(item.totalPrice || 0),
          createdAt: item.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const getDashboardNotifications = async (req, res, next) => {
  try {
    const [lowStockResult, expiringSoonResult] = await Promise.all([
      pool.query(
        `SELECT "id", "name", "stock"
         FROM "drugs"
         WHERE "stock" <= 10
         ORDER BY "stock" ASC, "id" ASC
         LIMIT 20`
      ),
      pool.query(
        `SELECT "id", "name", "expiredDate"
         FROM "drugs"
         WHERE "expiredDate" IS NOT NULL
           AND DATE("expiredDate") BETWEEN CURRENT_DATE AND CURRENT_DATE + INTERVAL '30 day'
         ORDER BY "expiredDate" ASC, "id" ASC
         LIMIT 20`
      ),
    ]);

    const notifications = [
      ...lowStockResult.rows.map((item) => ({
        id: `stock-${item.id}`,
        type: 'LOW_STOCK',
        severity: Number(item.stock || 0) <= 5 ? 'HIGH' : 'MEDIUM',
        title: 'Stok obat menipis',
        message: `${item.name} tersisa ${item.stock}.`,
      })),
      ...expiringSoonResult.rows.map((item) => ({
        id: `expired-${item.id}`,
        type: 'EXPIRING_SOON',
        severity: 'MEDIUM',
        title: 'Obat mendekati kedaluwarsa',
        message: `${item.name} kedaluwarsa pada ${new Date(item.expiredDate).toLocaleDateString('id-ID')}.`,
      })),
    ];

    res.status(200).json({
      message: 'Notifikasi dashboard berhasil diambil.',
      data: {
        totalAlerts: notifications.length,
        highPriorityAlerts: notifications.filter((item) => item.severity === 'HIGH').length,
        notifications,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getDashboardAnalytics,
  getDashboardNotifications,
};
