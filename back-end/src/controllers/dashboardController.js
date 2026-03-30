const pool = require('../config/database');

const getDashboardSummary = async (req, res, next) => {
  try {
    const [drugResult, transactionTodayResult, supplierResult, userResult] = await Promise.all([
      pool.query('SELECT COUNT(*)::int AS total FROM "Drug"'),
      pool.query('SELECT COUNT(*)::int AS total FROM "Transaction" WHERE DATE("createdAt") = CURRENT_DATE'),
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

module.exports = {
  getDashboardSummary,
};
