const pool = require('../config/database');

const getAllDrugs = async (req, res, next) => {
  try {
    // Ambil supplier terbaru per obat berdasarkan riwayat pengadaan (purchase_details → purchases → suppliers)
    const result = await pool.query(
      `SELECT
         d."id",
         d."name",
         d."description",
         d."stock",
         d."unit",
         d."price",
         d."expiredDate",
         d."createdAt",
         d."updatedAt",
         latest_supply."supplierId",
         latest_supply."supplierName"
       FROM "drugs" d
       LEFT JOIN LATERAL (
         SELECT
           s."id"   AS "supplierId",
           s."name" AS "supplierName"
         FROM "purchase_details" pd
         JOIN "purchases"  p ON p."id"  = pd."purchaseId"
         JOIN "suppliers"  s ON s."id"  = p."supplierId"
         WHERE pd."drugId" = d."id"
         ORDER BY p."createdAt" DESC
         LIMIT 1
       ) latest_supply ON true
       ORDER BY d."id" ASC`
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
    const { name, nama, description, deskripsi, stock, stok, unit, price, harga, expiredDate } = req.body;

    const resolvedName = String(name || nama || '').trim();
    const resolvedStock = Number(stock ?? stok);
    const resolvedPrice = Number(price ?? harga);

    if (!resolvedName || Number.isNaN(resolvedStock) || Number.isNaN(resolvedPrice) || !unit) {
      return res.status(400).json({
        message: 'Nama obat, stok, unit, dan harga harus diisi dengan format yang valid.',
      });
    }

    const result = await pool.query(
      `INSERT INTO "drugs" ("name", "description", "stock", "unit", "price", "expiredDate", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, $6, NOW())
       RETURNING "id", "name", "description", "stock", "unit", "price", "expiredDate", "createdAt", "updatedAt"`,
      [
        resolvedName,
        description ?? deskripsi ?? null,
        resolvedStock,
        String(unit).trim(),
        resolvedPrice,
        expiredDate || null,
      ]
    );

    res.status(201).json({
      message: 'Obat baru berhasil ditambahkan.',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const getDrugById = async (req, res, next) => {
  try {
    const { idObat } = req.params;

    const result = await pool.query(
      `SELECT "id", "name", "description", "stock", "unit", "price", "expiredDate", "createdAt", "updatedAt"
       FROM "drugs"
       WHERE "id" = $1`,
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
    const { idObat } = req.params;
    const { name, nama, description, deskripsi, stock, stok, unit, price, harga, expiredDate } = req.body;

    const existingResult = await pool.query('SELECT * FROM "drugs" WHERE "id" = $1', [idObat]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: `Obat dengan ID ${idObat} tidak ditemukan.` });
    }

    const existing = existingResult.rows[0];
    const nextName = name ?? nama ?? existing.name;
    const nextDescription = description ?? deskripsi ?? existing.description;
    const nextStock = stock ?? stok ?? existing.stock;
    const nextPrice = price ?? harga ?? existing.price;

    if (!nextName || (!unit && !existing.unit)) {
      return res.status(400).json({ message: 'Nama obat dan unit harus diisi.' });
    }

    const result = await pool.query(
        `UPDATE "drugs"
       SET "name" = $1,
           "description" = $2,
           "stock" = $3,
           "unit" = $4,
           "price" = $5,
           "expiredDate" = $6,
           "updatedAt" = NOW()
       WHERE "id" = $7
       RETURNING "id", "name", "description", "stock", "unit", "price", "expiredDate", "createdAt", "updatedAt"`,
      [
        String(nextName).trim(),
        nextDescription,
        Number(nextStock),
        String(unit ?? existing.unit).trim(),
        Number(nextPrice),
        expiredDate === undefined ? existing.expiredDate : expiredDate,
        idObat,
      ]
    );

    res.status(200).json({
      message: `Data obat dengan ID ${idObat} berhasil diperbarui.`,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

const deleteDrug = async (req, res, next) => {
  try {
    const { idObat } = req.params;

    const result = await pool.query('DELETE FROM "drugs" WHERE "id" = $1 RETURNING "id"', [idObat]);

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
