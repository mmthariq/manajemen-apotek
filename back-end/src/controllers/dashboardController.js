const pool = require('../config/database');

const resolveAnalyticsTables = async () => {
  const tableCheck = await pool.query(
    `SELECT
       to_regclass('public."Drug"') AS "drugTable",
       to_regclass('public.products') AS "legacyDrugTable",
       to_regclass('public."Transaction"') AS "transactionTable",
       to_regclass('public.online_orders') AS "legacyTransactionTable"`
  );

  const hasDrugTable = Boolean(tableCheck.rows[0]?.drugTable);
  const hasLegacyDrugTable = Boolean(tableCheck.rows[0]?.legacyDrugTable);
  const hasTransactionTable = Boolean(tableCheck.rows[0]?.transactionTable);
  const hasLegacyTransactionTable = Boolean(tableCheck.rows[0]?.legacyTransactionTable);

  return {
    drugTable: hasDrugTable ? '"Drug"' : (hasLegacyDrugTable ? 'products' : '"Drug"'),
    transactionTable: hasTransactionTable ? '"Transaction"' : (hasLegacyTransactionTable ? 'online_orders' : '"Transaction"'),
    transactionAmountExprNoAlias: hasTransactionTable ? '"totalPrice"' : 'total_amount',
    transactionAmountExprWithAlias: hasTransactionTable ? 't."totalPrice"' : 't.total_amount',
    transactionCreatedAtExprNoAlias: hasTransactionTable ? '"createdAt"' : 'COALESCE(order_time, "createdAt")',
    transactionCreatedAtExprWithAlias: hasTransactionTable ? 't."createdAt"' : 'COALESCE(t.order_time, t."createdAt")',
    transactionCustomerExprWithAlias: hasTransactionTable ? 't."customerId"' : 't."customerId"',
  };
};

const getDashboardSummary = async (req, res, next) => {
  try {
    const tables = await resolveAnalyticsTables();

    const [drugResult, transactionTodayResult, supplierResult, userResult] = await Promise.all([
      pool.query(`SELECT COUNT(*)::int AS total FROM ${tables.drugTable}`),
      pool.query(`SELECT COUNT(*)::int AS total FROM ${tables.transactionTable} WHERE DATE(${tables.transactionCreatedAtExprNoAlias}) = CURRENT_DATE`),
      pool.query('SELECT COUNT(*)::int AS total FROM "Supplier"'),
      pool.query('SELECT COUNT(*)::int AS total FROM "User"'),
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
    const tables = await resolveAnalyticsTables();

    const [
      summaryResult,
      weeklySalesResult,
      hourlySalesResult,
      categoryResult,
      lowStockResult,
      recentTransactionsResult,
    ] = await Promise.all([
      pool.query(
        `SELECT
           (SELECT COUNT(*)::int FROM ${tables.drugTable}) AS "totalObat",
           (SELECT COUNT(*)::int FROM "Supplier") AS "totalSupplier",
           (SELECT COUNT(*)::int FROM "User") AS "totalPengguna",
           (SELECT COUNT(*)::int FROM ${tables.transactionTable} WHERE DATE(${tables.transactionCreatedAtExprNoAlias}) = CURRENT_DATE) AS "transaksiHariIni",
           COALESCE((SELECT SUM(${tables.transactionAmountExprNoAlias}) FROM ${tables.transactionTable} WHERE DATE(${tables.transactionCreatedAtExprNoAlias}) = CURRENT_DATE), 0)::float8 AS "penjualanHariIni"
        `
      ),
      pool.query(
        `SELECT TO_CHAR(d::date, 'Dy') AS "name",
                COALESCE(SUM(${tables.transactionAmountExprWithAlias}), 0)::float8 AS "penjualan"
         FROM generate_series(CURRENT_DATE - INTERVAL '6 day', CURRENT_DATE, INTERVAL '1 day') AS d
         LEFT JOIN ${tables.transactionTable} t ON DATE(${tables.transactionCreatedAtExprWithAlias}) = d::date
         GROUP BY d
         ORDER BY d ASC`
      ),
      pool.query(
        `SELECT TO_CHAR(hour_slot, 'HH24:00') AS "name",
                COALESCE(SUM(${tables.transactionAmountExprWithAlias}), 0)::float8 AS "penjualan"
         FROM generate_series(
           date_trunc('day', NOW()),
           date_trunc('day', NOW()) + INTERVAL '23 hour',
           INTERVAL '1 hour'
         ) AS hour_slot
         LEFT JOIN ${tables.transactionTable} t
           ON date_trunc('hour', ${tables.transactionCreatedAtExprWithAlias}) = hour_slot
         GROUP BY hour_slot
         ORDER BY hour_slot ASC`
      ),
      pool.query(
        `SELECT COALESCE(NULLIF(TRIM("unit"), ''), 'Lainnya') AS "name",
                COUNT(*)::int AS "value"
         FROM ${tables.drugTable}
         GROUP BY COALESCE(NULLIF(TRIM("unit"), ''), 'Lainnya')
         ORDER BY "value" DESC`
      ),
      pool.query(
        `SELECT "id", "name", COALESCE(NULLIF(TRIM("unit"), ''), 'Lainnya') AS "category", "stock"
         FROM ${tables.drugTable}
         WHERE "stock" <= 10
         AND ($1::text IS NULL OR $1::text = '' OR COALESCE(NULLIF(TRIM("unit"), ''), 'Lainnya') = $1::text)
         ORDER BY "stock" ASC, "id" DESC
         LIMIT 20`,
        [category || null]
      ),
      pool.query(
        `SELECT t."id",
                ${tables.transactionCreatedAtExprWithAlias} AS "createdAt",
                ${tables.transactionAmountExprWithAlias} AS "totalPrice",
                COALESCE(c."username", 'Umum') AS "customerName"
         FROM ${tables.transactionTable} t
         LEFT JOIN "User" c ON c."id" = ${tables.transactionCustomerExprWithAlias}
         WHERE ($1::date IS NULL OR DATE(${tables.transactionCreatedAtExprWithAlias}) >= $1::date)
           AND ($2::date IS NULL OR DATE(${tables.transactionCreatedAtExprWithAlias}) <= $2::date)
         ORDER BY ${tables.transactionCreatedAtExprWithAlias} DESC
         LIMIT 20`,
        [startDate || null, endDate || null]
      ),
    ]);

    const summary = summaryResult.rows[0] || {};
    const totalPendapatan = recentTransactionsResult.rows.reduce(
      (sum, row) => sum + Number(row.totalPrice || 0),
      0
    );

    res.status(200).json({
      message: 'Data analitik dashboard berhasil diambil.',
      data: {
        summary: {
          totalObat: Number(summary.totalObat || 0),
          transaksiHariIni: Number(summary.transaksiHariIni || 0),
          totalSupplier: Number(summary.totalSupplier || 0),
          totalPengguna: Number(summary.totalPengguna || 0),
          penjualanHariIni: Number(summary.penjualanHariIni || 0),
          pendapatanPeriode: totalPendapatan,
          stokMenipis: lowStockResult.rowCount,
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
        recentTransactions: recentTransactionsResult.rows.map((item) => ({
          id: item.id,
          customerName: item.customerName,
          totalPrice: Number(item.totalPrice || 0),
          createdAt: item.createdAt,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
  getDashboardAnalytics,
};
