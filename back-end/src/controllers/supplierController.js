const getAllSuppliers = async (req, res, next) => {
  try {
    // Mock data
    const mockSuppliers = [
      { id: 1, nama: 'PT. Bio Farma', alamat: 'Jl. Pasteur No.28, Bandung', telepon: '022-2033755', email: 'info@biofarma.co.id' },
      { id: 2, nama: 'PT. Kalbe Farma Tbk', alamat: 'Jl. Letjend Suprapto Kav.4, Jakarta', telepon: '021-42873888', email: 'customer_care@kalbe.co.id' },
    ];
    res.status(200).json({ message: 'Data semua supplier berhasil diambil.', data: mockSuppliers, query: req.query });
  } catch (error) {
    next(error);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    res.status(201).json({ message: 'Supplier baru berhasil ditambahkan.', body: req.body });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSuppliers,
  createSupplier,
};