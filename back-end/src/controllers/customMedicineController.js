const pool = require('../config/database');

const mapCustomMedicineRow = (row) => ({
  id: row.id,
  nama: row.name,
  kategori: 'Racikan',
  deskripsi: row.description || '',
  harga: row.price,
  petunjuk: row.instruction || '',
  stok: row.stock,
  createdAt: row.createdAt ?? row.createdat,
  updatedAt: row.updatedAt ?? row.updatedat,
});

const getAllCustomMedicines = async (req, res, next) => {
  try {
    const medicinesResult = await pool.query(
      `SELECT cm."id", cm."name", cm."price", cm."stock", cm."createdAt", cm."updatedAt",
              ''::text AS "description", ''::text AS "instruction"
       FROM "CustomMedicine" cm
       ORDER BY cm."id" DESC`
    );

    const componentsResult = await pool.query(
      `SELECT c."id", c."customMedicineId", c."drugId", c."quantity", c."unit", d."name" AS "drugName"
       FROM "CustomMedicineComponent" c
       JOIN "Drug" d ON d."id" = c."drugId"
       ORDER BY c."id" ASC`
    );

    const componentMap = componentsResult.rows.reduce((acc, item) => {
      const customMedicineId = item.customMedicineId ?? item.custommedicineid;
      const drugId = item.drugId ?? item.drugid;
      const drugName = item.drugName ?? item.drugname;

      if (!acc[customMedicineId]) {
        acc[customMedicineId] = [];
      }

      acc[customMedicineId].push({
        id: item.id,
        drugId,
        bahan: drugName,
        jumlah: item.quantity,
        satuan: item.unit,
      });

      return acc;
    }, {});

    const data = medicinesResult.rows.map((medicine) => ({
      ...mapCustomMedicineRow(medicine),
      komposisi: componentMap[medicine.id] || [],
    }));

    res.status(200).json({
      message: 'Data semua obat racikan berhasil diambil.',
      data,
      total: data.length,
    });
  } catch (error) {
    next(error);
  }
};

const createCustomMedicine = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { nama, name, harga, price, komposisi = [], stok, stock } = req.body;
    const medicineName = String(nama || name || '').trim();

    if (!medicineName || !Array.isArray(komposisi) || komposisi.length === 0) {
      return res.status(400).json({
        message: 'Nama obat dan komposisi (minimal 1 bahan) harus diisi.',
      });
    }

    await client.query('BEGIN');

    const medicineResult = await client.query(
      `INSERT INTO "CustomMedicine" ("name", "price", "stock")
       VALUES ($1, $2, $3)
       RETURNING "id", "name", "price", "stock", "createdAt", "updatedAt"`,
      [medicineName, Number(price ?? harga ?? 0), Number(stock ?? stok ?? 0)]
    );

    const medicine = medicineResult.rows[0];

    for (const item of komposisi) {
      let drugId = item.drugId;

      if (!drugId && item.bahan) {
        const drugLookup = await client.query('SELECT "id" FROM "Drug" WHERE LOWER("name") = LOWER($1) LIMIT 1', [String(item.bahan).trim()]);
        drugId = drugLookup.rows[0]?.id;
      }

      if (!drugId) {
        throw new Error(`Bahan racikan tidak ditemukan: ${item.bahan || 'unknown'}`);
      }

      await client.query(
        `INSERT INTO "CustomMedicineComponent" ("customMedicineId", "drugId", "quantity", "unit")
         VALUES ($1, $2, $3, $4)`,
        [medicine.id, drugId, Number(item.jumlah ?? item.quantity ?? 0), String(item.satuan || item.unit || 'unit')]
      );
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Obat racikan baru berhasil ditambahkan.',
      data: {
        ...mapCustomMedicineRow({ ...medicine, description: '', instruction: '' }),
        komposisi,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Terdapat bahan racikan yang tidak valid.' });
    }
    next(error);
  } finally {
    client.release();
  }
};

const getCustomMedicineById = async (req, res, next) => {
  try {
    const { medicineId } = req.params;

    const medicineResult = await pool.query(
      `SELECT cm."id", cm."name", cm."price", cm."stock", cm."createdAt", cm."updatedAt",
              ''::text AS "description", ''::text AS "instruction"
       FROM "CustomMedicine" cm
       WHERE cm."id" = $1`,
      [medicineId]
    );

    if (medicineResult.rowCount === 0) {
      return res.status(404).json({ message: `Obat racikan dengan ID ${medicineId} tidak ditemukan.` });
    }

    const componentsResult = await pool.query(
      `SELECT c."id", c."drugId", c."quantity", c."unit", d."name" AS "drugName"
       FROM "CustomMedicineComponent" c
       JOIN "Drug" d ON d."id" = c."drugId"
       WHERE c."customMedicineId" = $1
       ORDER BY c."id" ASC`,
      [medicineId]
    );

    const data = {
      ...mapCustomMedicineRow(medicineResult.rows[0]),
      komposisi: componentsResult.rows.map((item) => ({
        id: item.id,
        drugId: item.drugId ?? item.drugid,
        bahan: item.drugName ?? item.drugname,
        jumlah: item.quantity,
        satuan: item.unit,
      })),
    };

    res.status(200).json({
      message: 'Data obat racikan berhasil diambil.',
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomMedicine = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { medicineId } = req.params;
    const { nama, name, harga, price, stok, stock, komposisi } = req.body;

    const existingResult = await client.query('SELECT * FROM "CustomMedicine" WHERE "id" = $1', [medicineId]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: `Obat racikan dengan ID ${medicineId} tidak ditemukan.` });
    }

    const existing = existingResult.rows[0];

    await client.query('BEGIN');

    const updatedResult = await client.query(
      `UPDATE "CustomMedicine"
       SET "name" = $1,
           "price" = $2,
           "stock" = $3,
           "updatedAt" = NOW()
       WHERE "id" = $4
       RETURNING "id", "name", "price", "stock", "createdAt", "updatedAt"`,
      [
        String(nama || name || existing.name).trim(),
        Number(price ?? harga ?? existing.price),
        Number(stock ?? stok ?? existing.stock),
        medicineId,
      ]
    );

    if (Array.isArray(komposisi)) {
      await client.query('DELETE FROM "CustomMedicineComponent" WHERE "customMedicineId" = $1', [medicineId]);

      for (const item of komposisi) {
        let drugId = item.drugId;

        if (!drugId && item.bahan) {
          const drugLookup = await client.query('SELECT "id" FROM "Drug" WHERE LOWER("name") = LOWER($1) LIMIT 1', [String(item.bahan).trim()]);
          drugId = drugLookup.rows[0]?.id;
        }

        if (!drugId) {
          throw new Error(`Bahan racikan tidak ditemukan: ${item.bahan || 'unknown'}`);
        }

        await client.query(
          `INSERT INTO "CustomMedicineComponent" ("customMedicineId", "drugId", "quantity", "unit")
           VALUES ($1, $2, $3, $4)`,
          [medicineId, drugId, Number(item.jumlah ?? item.quantity ?? 0), String(item.satuan || item.unit || 'unit')]
        );
      }
    }

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Obat racikan berhasil diperbarui.',
      data: {
        ...mapCustomMedicineRow({ ...updatedResult.rows[0], description: '', instruction: '' }),
        komposisi: Array.isArray(komposisi) ? komposisi : undefined,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    if (error.code === '23503') {
      return res.status(400).json({ message: 'Terdapat bahan racikan yang tidak valid.' });
    }
    next(error);
  } finally {
    client.release();
  }
};

const deleteCustomMedicine = async (req, res, next) => {
  try {
    const { medicineId } = req.params;

    const result = await pool.query('DELETE FROM "CustomMedicine" WHERE "id" = $1 RETURNING "id"', [medicineId]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Obat racikan dengan ID ${medicineId} tidak ditemukan.` });
    }

    res.status(200).json({
      message: `Obat racikan dengan ID ${medicineId} berhasil dihapus.`,
    });
  } catch (error) {
    next(error);
  }
};

const recordCustomMedicineTransaction = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { medicineId } = req.params;
    const { customerId, quantity, totalPrice, cashierId } = req.body;

    if (!quantity || Number(quantity) <= 0) {
      return res.status(400).json({ message: 'Jumlah transaksi harus lebih dari 0.' });
    }

    const medicineResult = await client.query('SELECT * FROM "CustomMedicine" WHERE "id" = $1', [medicineId]);
    if (medicineResult.rowCount === 0) {
      return res.status(404).json({ message: `Obat racikan dengan ID ${medicineId} tidak ditemukan.` });
    }

    const medicine = medicineResult.rows[0];

    if (medicine.stock < Number(quantity)) {
      return res.status(400).json({ message: 'Stok obat racikan tidak mencukupi.' });
    }

    let resolvedCashierId = cashierId;
    if (!resolvedCashierId) {
      const cashierResult = await client.query('SELECT "id" FROM "User" WHERE "role" = $1::"Role" ORDER BY "id" ASC LIMIT 1', ['KASIR']);
      resolvedCashierId = cashierResult.rows[0]?.id;
    }

    if (!resolvedCashierId) {
      return res.status(400).json({ message: 'Tidak ada kasir tersedia untuk mencatat transaksi.' });
    }

    await client.query('BEGIN');

    const computedTotal = Number(totalPrice ?? (Number(medicine.price) * Number(quantity)));

    const transactionResult = await client.query(
      `INSERT INTO "Transaction" ("totalPrice", "cashierId", "customerId")
       VALUES ($1, $2, $3)
       RETURNING "id", "totalPrice", "createdAt", "cashierId", "customerId"`,
      [computedTotal, resolvedCashierId, customerId || null]
    );

    const transaction = transactionResult.rows[0];

    await client.query(
      `INSERT INTO "TransactionDetail" ("transactionId", "customMedicineId", "quantity", "price")
       VALUES ($1, $2, $3, $4)`,
      [transaction.id, medicineId, Number(quantity), Number(medicine.price)]
    );

    await client.query(
      `UPDATE "CustomMedicine"
       SET "stock" = "stock" - $1,
           "updatedAt" = NOW()
       WHERE "id" = $2`,
      [Number(quantity), medicineId]
    );

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Transaksi obat racikan berhasil dicatat.',
      data: transaction,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

module.exports = {
  getAllCustomMedicines,
  createCustomMedicine,
  getCustomMedicineById,
  updateCustomMedicine,
  deleteCustomMedicine,
  recordCustomMedicineTransaction,
};
