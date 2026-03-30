const pool = require('../config/database');

const getAllSuppliers = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT "id", "name", "contactPerson", "phone", "address", "createdAt", "updatedAt" FROM "Supplier" ORDER BY "id" DESC'
    );

    res.status(200).json({
      message: 'Data semua supplier berhasil diambil.',
      data: result.rows,
      total: result.rowCount,
    });
  } catch (error) {
    next(error);
  }
};

const createSupplier = async (req, res, next) => {
  try {
    const { name, contactPerson, phone, address } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Nama supplier harus diisi.' });
    }

    const result = await pool.query(
      `INSERT INTO "Supplier" ("name", "contactPerson", "phone", "address")
       VALUES ($1, $2, $3, $4)
       RETURNING "id", "name", "contactPerson", "phone", "address", "createdAt", "updatedAt"`,
      [String(name).trim(), contactPerson || null, phone || null, address || null]
    );

    res.status(201).json({
      message: 'Supplier baru berhasil ditambahkan.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSuppliers,
  createSupplier,
};
