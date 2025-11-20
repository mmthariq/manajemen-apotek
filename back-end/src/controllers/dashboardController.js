const getDashboardSummary = async (req, res, next) => {
  try {
    res.status(200).json({
      message: 'Ringkasan dashboard berhasil diambil.',
      data: {
        totalObat: 125,
        transaksiHariIni: 15,
        totalSupplier: 20,
        totalPengguna: 2,
      },
    }); // Placeholder
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getDashboardSummary,
};