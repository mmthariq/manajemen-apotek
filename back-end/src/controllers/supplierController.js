const pool = require('../config/database');

const getAllSuppliers = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT "id", "name", "contactPerson", "phone", "email", "address", "createdAt", "updatedAt" FROM "suppliers" ORDER BY "id" ASC'
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
    const { name, contactPerson, phone, email, address } = req.body;

    if (!name || !String(name).trim()) {
      return res.status(400).json({ message: 'Nama supplier harus diisi.' });
    }

    const result = await pool.query(
      `INSERT INTO "suppliers" ("name", "contactPerson", "phone", "email", "address", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW())
       RETURNING "id", "name", "contactPerson", "phone", "email", "address", "createdAt", "updatedAt"`,
      [String(name).trim(), contactPerson || null, phone || null, email || null, address || null]
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
    const { name, contactPerson, phone, email, address } = req.body;

    const existingResult = await pool.query('SELECT * FROM "suppliers" WHERE "id" = $1', [idSupplier]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: `Supplier dengan ID ${idSupplier} tidak ditemukan.` });
    }

    const existing = existingResult.rows[0];
    const nextName = String(name ?? existing.name ?? '').trim();

    if (!nextName) {
      return res.status(400).json({ message: 'Nama supplier harus diisi.' });
    }

    const result = await pool.query(
        `UPDATE "suppliers"
       SET "name" = $1,
           "contactPerson" = $2,
           "phone" = $3,
           "email" = $4,
           "address" = $5,
           "updatedAt" = NOW()
       WHERE "id" = $6
       RETURNING "id", "name", "contactPerson", "phone", "email", "address", "createdAt", "updatedAt"`,
      [
        nextName,
        contactPerson === undefined ? existing.contactPerson : contactPerson,
        phone === undefined ? existing.phone : phone,
        email === undefined ? existing.email : email,
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
      'DELETE FROM "suppliers" WHERE "id" = $1 RETURNING "id"',
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
