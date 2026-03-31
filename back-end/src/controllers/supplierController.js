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

const updateSupplier = async (req, res, next) => {
  try {
    const { idSupplier } = req.params;
    const { name, contactPerson, phone, address } = req.body;

    const existingResult = await pool.query('SELECT * FROM "Supplier" WHERE "id" = $1', [idSupplier]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: `Supplier dengan ID ${idSupplier} tidak ditemukan.` });
    }

    const existing = existingResult.rows[0];
    const nextName = String(name ?? existing.name ?? '').trim();

    if (!nextName) {
      return res.status(400).json({ message: 'Nama supplier harus diisi.' });
    }

    const result = await pool.query(
      `UPDATE "Supplier"
       SET "name" = $1,
           "contactPerson" = $2,
           "phone" = $3,
           "address" = $4,
           "updatedAt" = NOW()
       WHERE "id" = $5
       RETURNING "id", "name", "contactPerson", "phone", "address", "createdAt", "updatedAt"`,
      [
        nextName,
        contactPerson === undefined ? existing.contactPerson : contactPerson,
        phone === undefined ? existing.phone : phone,
        address === undefined ? existing.address : address,
        idSupplier,
      ]
    );

    res.status(200).json({
      message: `Supplier dengan ID ${idSupplier} berhasil diperbarui.`,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const deleteSupplier = async (req, res, next) => {
  try {
    const { idSupplier } = req.params;

    const result = await pool.query(
      'DELETE FROM "Supplier" WHERE "id" = $1 RETURNING "id"',
      [idSupplier]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Supplier dengan ID ${idSupplier} tidak ditemukan.` });
    }

    res.status(200).json({ message: `Supplier dengan ID ${idSupplier} berhasil dihapus.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllSuppliers,
  createSupplier,
  updateSupplier,
  deleteSupplier,
};
