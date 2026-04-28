const pool = require('../config/database');

const mapPurchaseRow = (row) => ({
  id: row.id,
  purchaseCode: row.purchaseCode ?? row.purchasecode,
  supplierId: row.supplierId ?? row.supplierid,
  supplierName: row.supplierName ?? row.suppliername,
  totalPrice: Number(row.totalPrice ?? row.totalprice ?? 0),
  createdAt: row.createdAt ?? row.createdat,
  updatedAt: row.updatedAt ?? row.updatedat,
});

const generatePurchaseCode = () => `PUR-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

const getPurchases = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT p."id", p."purchaseCode", p."supplierId", s."name" AS "supplierName",
              p."totalPrice", p."createdAt", p."updatedAt"
       FROM "purchases" p
       JOIN "suppliers" s ON s."id" = p."supplierId"
       ORDER BY p."id" ASC`
    );

    res.status(200).json({
      message: 'Data pengadaan berhasil diambil.',
      data: result.rows.map(mapPurchaseRow),
      total: result.rowCount,
    });
  } catch (error) {
    next(error);
  }
};

const getPurchaseById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const purchaseResult = await pool.query(
      `SELECT p."id", p."purchaseCode", p."supplierId", s."name" AS "supplierName",
              p."totalPrice", p."createdAt", p."updatedAt"
       FROM "purchases" p
       JOIN "suppliers" s ON s."id" = p."supplierId"
       WHERE p."id" = $1
       LIMIT 1`,
      [id]
    );

    if (purchaseResult.rowCount === 0) {
      return res.status(404).json({ message: `Data pengadaan dengan ID ${id} tidak ditemukan.` });
    }

    const detailsResult = await pool.query(
      `SELECT pd."id", pd."purchaseId", pd."drugId", d."name" AS "drugName",
              pd."quantity", pd."unitPrice", pd."subtotal"
       FROM "purchase_details" pd
       JOIN "drugs" d ON d."id" = pd."drugId"
       WHERE pd."purchaseId" = $1
       ORDER BY pd."id" ASC`,
      [id]
    );

    res.status(200).json({
      message: 'Detail pengadaan berhasil diambil.',
      data: {
        ...mapPurchaseRow(purchaseResult.rows[0]),
        items: detailsResult.rows.map((item) => ({
          id: item.id,
          purchaseId: item.purchaseId ?? item.purchaseid,
          drugId: item.drugId ?? item.drugid,
          drugName: item.drugName ?? item.drugname,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice ?? item.unitprice ?? 0),
          subtotal: Number(item.subtotal || 0),
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

const createPurchase = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { supplierId, items } = req.body;

    const resolvedSupplierId = Number(supplierId);
    if (Number.isNaN(resolvedSupplierId) || resolvedSupplierId <= 0) {
      return res.status(400).json({ message: 'Supplier harus dipilih.' });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Item pengadaan tidak boleh kosong.' });
    }

    const normalizedItems = items.map((item) => ({
      drugId: Number(item.drugId ?? item.idObat ?? item.productId),
      quantity: Number(item.quantity ?? item.jumlah ?? 0),
      unitPrice: Number(item.unitPrice ?? item.harga ?? item.price ?? 0),
    }));

    for (const item of normalizedItems) {
      if (Number.isNaN(item.drugId) || item.drugId <= 0) {
        return res.status(400).json({ message: 'Salah satu item pengadaan memiliki obat yang tidak valid.' });
      }
      if (Number.isNaN(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ message: 'Jumlah item pengadaan harus lebih dari 0.' });
      }
      if (Number.isNaN(item.unitPrice) || item.unitPrice < 0) {
        return res.status(400).json({ message: 'Harga item pengadaan tidak valid.' });
      }
    }

    const totalPrice = normalizedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    await client.query('BEGIN');

    const supplierCheck = await client.query('SELECT "id" FROM "suppliers" WHERE "id" = $1 LIMIT 1', [resolvedSupplierId]);
    if (supplierCheck.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(400).json({ message: 'Supplier tidak ditemukan.' });
    }

    const purchaseCode = generatePurchaseCode();

    const purchaseResult = await client.query(
      `INSERT INTO "purchases" ("purchaseCode", "supplierId", "totalPrice", "createdAt", "updatedAt")
       VALUES ($1, $2, $3, NOW(), NOW())
       RETURNING "id", "purchaseCode", "supplierId", "totalPrice", "createdAt", "updatedAt"`,
      [purchaseCode, resolvedSupplierId, totalPrice]
    );

    const purchase = purchaseResult.rows[0];
    const detailRows = [];

    for (const item of normalizedItems) {
      const drugResult = await client.query('SELECT "id" FROM "drugs" WHERE "id" = $1 LIMIT 1 FOR UPDATE', [item.drugId]);
      if (drugResult.rowCount === 0) {
        throw new Error(`Obat dengan ID ${item.drugId} tidak ditemukan.`);
      }

      const subtotal = item.quantity * item.unitPrice;

      const detailResult = await client.query(
        `INSERT INTO "purchase_details" ("purchaseId", "drugId", "quantity", "unitPrice", "subtotal")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING "id", "purchaseId", "drugId", "quantity", "unitPrice", "subtotal"`,
        [purchase.id, item.drugId, item.quantity, item.unitPrice, subtotal]
      );

      await client.query(
        `UPDATE "drugs"
         SET "stock" = "stock" + $1,
             "updatedAt" = NOW()
         WHERE "id" = $2`,
        [item.quantity, item.drugId]
      );

      detailRows.push(detailResult.rows[0]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Pengadaan berhasil dicatat dan stok obat telah diperbarui.',
      data: {
        ...mapPurchaseRow(purchase),
        items: detailRows.map((item) => ({
          id: item.id,
          purchaseId: item.purchaseId ?? item.purchaseid,
          drugId: item.drugId ?? item.drugid,
          quantity: Number(item.quantity || 0),
          unitPrice: Number(item.unitPrice ?? item.unitprice ?? 0),
          subtotal: Number(item.subtotal || 0),
        })),
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

module.exports = {
  getPurchases,
  getPurchaseById,
  createPurchase,
};
