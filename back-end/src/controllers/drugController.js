const pool = require('../config/database');
const { calculateSellingPrice } = require('../config/pricing');

const getAllDrugs = async (req, res, next) => {
  try {
    // Cek peran pangguna (pastikan req.user sudah di-inject oleh authMiddleware)
    // Jika tidak login, atau role = 'CUSTOMER', sembunyikan purchasePrice (Harga Pokok)
    const isCustomer = !req.user || req.user.role === 'CUSTOMER';

    const selectFields = isCustomer
      ? `d."id", d."name", d."description", d."category", d."stock", d."unit", d."price", d."expiredDate"`
      : `d."id", d."name", d."description", d."category", d."stock", d."unit", d."price", d."purchasePrice", d."expiredDate"`;

    const query = `
      SELECT
         ${selectFields},
         d."supplierId"  AS "directSupplierId",
         d."createdAt",
         d."updatedAt",
         COALESCE(ds."id",   latest_supply."supplierId")   AS "supplierId",
         COALESCE(ds."name", latest_supply."supplierName") AS "supplierName"
       FROM "drugs" d
       LEFT JOIN "suppliers" ds ON ds."id" = d."supplierId"
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
       ) latest_supply ON d."supplierId" IS NULL
       ORDER BY d."id" ASC
    `;

    const result = await pool.query(query);

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
    const { name, nama, description, deskripsi, stock, stok, unit, price, harga, purchasePrice, hargaBeli, expiredDate, supplierId, category } = req.body;

    const resolvedName = String(name || nama || '').trim();
    const resolvedStock = Number(stock ?? stok);
    const resolvedSupplierId = supplierId ? Number(supplierId) : null;

    // Tentukan purchasePrice dan hitung harga jual otomatis (margin 15%)
    const resolvedPurchasePrice = Number(purchasePrice ?? hargaBeli ?? price ?? harga);
    const resolvedPrice = calculateSellingPrice(resolvedPurchasePrice);

    if (!resolvedName || Number.isNaN(resolvedStock) || Number.isNaN(resolvedPurchasePrice) || !unit) {
      return res.status(400).json({
        message: 'Nama obat, stok, unit, dan harga beli harus diisi dengan format yang valid.',
      });
    }

    const validCategories = ['BEBAS', 'BEBAS_TERBATAS', 'KERAS'];
    const resolvedCategory = validCategories.includes(String(category).toUpperCase())
      ? String(category).toUpperCase()
      : 'BEBAS';

    // Validasi supplierId jika diberikan
    if (resolvedSupplierId) {
      const supplierCheck = await pool.query('SELECT "id" FROM "suppliers" WHERE "id" = $1', [resolvedSupplierId]);
      if (supplierCheck.rowCount === 0) {
        return res.status(400).json({ message: `Supplier dengan ID ${resolvedSupplierId} tidak ditemukan.` });
      }
    }

    const result = await pool.query(
      `INSERT INTO "drugs" ("name", "description", "category", "stock", "unit", "price", "purchasePrice", "expiredDate", "supplierId", "updatedAt")
       VALUES ($1, $2, $3::"DrugCategory", $4, $5, $6, $7, $8, $9, NOW())
       RETURNING "id", "name", "description", "category", "stock", "unit", "price", "purchasePrice", "expiredDate", "supplierId", "createdAt", "updatedAt"`,
      [
        resolvedName,
        description ?? deskripsi ?? null,
        resolvedCategory,
        resolvedStock,
        String(unit).trim(),
        resolvedPrice,
        resolvedPurchasePrice,
        expiredDate || null,
        resolvedSupplierId,
      ]
    );

    // Ambil nama supplier jika ada
    const drug = result.rows[0];
    if (drug.supplierId) {
      const supResult = await pool.query('SELECT "name" FROM "suppliers" WHERE "id" = $1', [drug.supplierId]);
      drug.supplierName = supResult.rows[0]?.name || null;
    }

    res.status(201).json({
      message: 'Obat baru berhasil ditambahkan.',
      data: drug,
    });
  } catch (error) {
    next(error);
  }
};

const getDrugById = async (req, res, next) => {
  try {
    const { idObat } = req.params;

    const result = await pool.query(
      `SELECT "id", "name", "description", "category", "stock", "unit", "price", "purchasePrice", "expiredDate", "createdAt", "updatedAt"
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
    const { name, nama, description, deskripsi, stock, stok, unit, purchasePrice, hargaBeli, expiredDate, supplierId, category } = req.body;

    const existingResult = await pool.query('SELECT * FROM "drugs" WHERE "id" = $1', [idObat]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: `Obat dengan ID ${idObat} tidak ditemukan.` });
    }

    const existing = existingResult.rows[0];
    const nextName = name ?? nama ?? existing.name;
    const nextDescription = description ?? deskripsi ?? existing.description;
    const nextStock = stock ?? stok ?? existing.stock;
    const nextSupplierId = supplierId !== undefined ? (supplierId ? Number(supplierId) : null) : existing.supplierId;

    // Jika purchasePrice diubah, recalculate harga jual otomatis (margin 15%)
    // Jika tidak, pertahankan harga yang sudah ada
    const nextPurchasePrice = purchasePrice ?? hargaBeli ?? existing.purchasePrice;
    const nextPrice = (purchasePrice !== undefined || hargaBeli !== undefined)
      ? calculateSellingPrice(Number(nextPurchasePrice))
      : existing.price;

    const validCategories = ['BEBAS', 'BEBAS_TERBATAS', 'KERAS'];
    const nextCategory = category !== undefined
      ? (validCategories.includes(String(category).toUpperCase()) ? String(category).toUpperCase() : existing.category)
      : existing.category;

    if (!nextName || (!unit && !existing.unit)) {
      return res.status(400).json({ message: 'Nama obat dan unit harus diisi.' });
    }

    // Validasi supplierId jika diberikan
    if (nextSupplierId) {
      const supplierCheck = await pool.query('SELECT "id" FROM "suppliers" WHERE "id" = $1', [nextSupplierId]);
      if (supplierCheck.rowCount === 0) {
        return res.status(400).json({ message: `Supplier dengan ID ${nextSupplierId} tidak ditemukan.` });
      }
    }

    const result = await pool.query(
        `UPDATE "drugs"
       SET "name" = $1,
           "description" = $2,
           "category" = $3::"DrugCategory",
           "stock" = $4,
           "unit" = $5,
           "price" = $6,
           "purchasePrice" = $7,
           "expiredDate" = $8,
           "supplierId" = $9,
           "updatedAt" = NOW()
       WHERE "id" = $10
       RETURNING "id", "name", "description", "category", "stock", "unit", "price", "purchasePrice", "expiredDate", "supplierId", "createdAt", "updatedAt"`,
      [
        String(nextName).trim(),
        nextDescription,
        nextCategory,
        Number(nextStock),
        String(unit ?? existing.unit).trim(),
        Number(nextPrice),
        nextPurchasePrice != null ? Number(nextPurchasePrice) : null,
        expiredDate === undefined ? existing.expiredDate : expiredDate,
        nextSupplierId,
        idObat,
      ]
    );

    // Ambil nama supplier jika ada
    const drug = result.rows[0];
    if (drug.supplierId) {
      const supResult = await pool.query('SELECT "name" FROM "suppliers" WHERE "id" = $1', [drug.supplierId]);
      drug.supplierName = supResult.rows[0]?.name || null;
    }

    res.status(200).json({
      message: `Data obat dengan ID ${idObat} berhasil diperbarui.`,
      data: drug,
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
