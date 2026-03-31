const pool = require('../config/database');

const resolveDrugTable = async () => {
  const tableCheck = await pool.query(
    `SELECT
       to_regclass('public."Drug"') AS "drugTable",
       to_regclass('public.products') AS "legacyDrugTable"`
  );

  if (tableCheck.rows[0]?.drugTable) {
    return '"Drug"';
  }

  if (tableCheck.rows[0]?.legacyDrugTable) {
    return 'products';
  }

  return '"Drug"';
};

const getAllDrugs = async (req, res, next) => {
  try {
    const drugTable = await resolveDrugTable();

    const result = await pool.query(
      `SELECT d."id", d."name", d."description", d."stock", d."unit", d."price", d."expiredDate", d."supplierId", s."name" AS "supplierName", d."createdAt", d."updatedAt"
       FROM ${drugTable} d
       LEFT JOIN "Supplier" s ON s."id" = d."supplierId"
       ORDER BY d."id" DESC`
    );

    res.status(200).json({
      message: 'Data semua obat berhasil diambil.',
      data: result.rows,
      total: result.rowCount,
    });
  } catch (error) {
    next(error);
  }
};

const createDrug = async (req, res, next) => {
  try {
    const drugTable = await resolveDrugTable();
    const { name, nama, description, deskripsi, stock, stok, unit, price, harga, expiredDate, supplierId } = req.body;

    const resolvedName = String(name || nama || '').trim();
    const resolvedStock = Number(stock ?? stok);
    const resolvedPrice = Number(price ?? harga);

    if (!resolvedName || Number.isNaN(resolvedStock) || Number.isNaN(resolvedPrice) || !unit) {
      return res.status(400).json({
        message: 'Nama obat, stok, unit, dan harga harus diisi dengan format yang valid.',
      });
    }

    const result = await pool.query(
      `INSERT INTO ${drugTable} ("name", "description", "stock", "unit", "price", "expiredDate", "supplierId")
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING "id", "name", "description", "stock", "unit", "price", "expiredDate", "supplierId", "createdAt", "updatedAt"`,
      [
        resolvedName,
        description ?? deskripsi ?? null,
        resolvedStock,
        String(unit).trim(),
        resolvedPrice,
        expiredDate || null,
        supplierId || null,
      ]
    );

    res.status(201).json({
      message: 'Obat baru berhasil ditambahkan.',
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Supplier tidak ditemukan.' });
    }
    next(error);
  }
};

const getDrugById = async (req, res, next) => {
  try {
    const drugTable = await resolveDrugTable();
    const { idObat } = req.params;

    const result = await pool.query(
      `SELECT d."id", d."name", d."description", d."stock", d."unit", d."price", d."expiredDate", d."supplierId", s."name" AS "supplierName", d."createdAt", d."updatedAt"
       FROM ${drugTable} d
       LEFT JOIN "Supplier" s ON s."id" = d."supplierId"
       WHERE d."id" = $1`,
      [idObat]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Obat dengan ID ${idObat} tidak ditemukan.` });
    }

    res.status(200).json({
      message: `Data obat dengan ID ${idObat} berhasil diambil.`,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const updateDrug = async (req, res, next) => {
  try {
    const drugTable = await resolveDrugTable();
    const { idObat } = req.params;
    const { name, nama, description, deskripsi, stock, stok, unit, price, harga, expiredDate, supplierId } = req.body;

    const existingResult = await pool.query(`SELECT * FROM ${drugTable} WHERE "id" = $1`, [idObat]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: `Obat dengan ID ${idObat} tidak ditemukan.` });
    }

    const existing = existingResult.rows[0];
    const nextName = name ?? nama ?? existing.name;
    const nextDescription = description ?? deskripsi ?? existing.description;
    const nextStock = stock ?? stok ?? existing.stock;
    const nextPrice = price ?? harga ?? existing.price;

    if (!nextName || !unit && !existing.unit) {
      return res.status(400).json({ message: 'Nama obat dan unit harus diisi.' });
    }

    const result = await pool.query(
      `UPDATE ${drugTable}
       SET "name" = $1,
           "description" = $2,
           "stock" = $3,
           "unit" = $4,
           "price" = $5,
           "expiredDate" = $6,
           "supplierId" = $7,
           "updatedAt" = NOW()
       WHERE "id" = $8
       RETURNING "id", "name", "description", "stock", "unit", "price", "expiredDate", "supplierId", "createdAt", "updatedAt"`,
      [
        String(nextName).trim(),
        nextDescription,
        Number(nextStock),
        String(unit ?? existing.unit).trim(),
        Number(nextPrice),
        expiredDate === undefined ? existing.expiredDate : expiredDate,
        supplierId === undefined ? existing.supplierId : supplierId,
        idObat,
      ]
    );

    res.status(200).json({
      message: `Data obat dengan ID ${idObat} berhasil diperbarui.`,
      data: result.rows[0],
    });
  } catch (error) {
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Supplier tidak ditemukan.' });
    }
    next(error);
  }
};

const deleteDrug = async (req, res, next) => {
  try {
    const drugTable = await resolveDrugTable();
    const { idObat } = req.params;

    const result = await pool.query(
      `DELETE FROM ${drugTable} WHERE "id" = $1 RETURNING "id"`,
      [idObat]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Obat dengan ID ${idObat} tidak ditemukan.` });
    }

    res.status(200).json({ message: `Obat dengan ID ${idObat} berhasil dihapus.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllDrugs,
  createDrug,
  getDrugById,
  updateDrug,
  deleteDrug,
};
