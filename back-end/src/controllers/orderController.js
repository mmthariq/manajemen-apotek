const pool = require('../config/database');

const ORDER_STATUS = {
  PENDING: 'PENDING',
  VERIFIED: 'VERIFIED',
  COMPLETED: 'COMPLETED',
  CANCELLED: 'CANCELLED',
};

const ORDER_TYPE = {
  ONLINE: 'ONLINE',
  OFFLINE: 'OFFLINE',
};

const generateOrderCode = () => `ORD-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

let transactionHasPrescriptionColumnCache = null;
let transactionHasUsageInstructionsColumnCache = null;

const normalizeRole = (role) => String(role || '').toUpperCase();

const isCustomerRequest = (req) => normalizeRole(req.user?.role) === 'CUSTOMER';
const isStaffRequest = (req) => ['ADMIN', 'KASIR'].includes(normalizeRole(req.user?.role));

const normalizeProductType = (value) => {
  const normalized = String(value || '').trim().toLowerCase();
  return normalized === 'custom' ? 'custom' : 'regular';
};

const toNullableNumber = (value) => {
  if (value === undefined || value === null || value === '') {
    return null;
  }

  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const deductInventoryForTransaction = async (db, transactionId) => {
  // --- 1. Obat reguler yang dibeli langsung ---
  const drugStockResult = await db.query(
    `WITH required_stock AS (
        SELECT td."drugId", SUM(td."quantity")::int AS "requiredQty"
        FROM "transaction_details" td
        WHERE td."transactionId" = $1
          AND td."drugId" IS NOT NULL
        GROUP BY td."drugId"
      )
      SELECT d."id", d."name", d."stock", rs."requiredQty"
      FROM required_stock rs
      JOIN "drugs" d ON d."id" = rs."drugId"
      FOR UPDATE OF d`,
    [transactionId]
  );

  // --- 2. Obat racikan yang dibeli ---
  const customMedicineStockResult = await db.query(
    `WITH required_stock AS (
        SELECT td."customMedicineId", SUM(td."quantity")::int AS "requiredQty"
        FROM "transaction_details" td
        WHERE td."transactionId" = $1
          AND td."customMedicineId" IS NOT NULL
        GROUP BY td."customMedicineId"
      )
      SELECT cm."id", cm."name", cm."stock", rs."requiredQty"
      FROM required_stock rs
      JOIN "custom_medicines" cm ON cm."id" = rs."customMedicineId"
      FOR UPDATE OF cm`,
    [transactionId]
  );

  // --- 3. Hitung kebutuhan bahan baku (drugs) dari racikan ---
  //    Misal beli 2 "Racikan Batuk" yg isinya Amoxicillin 2 tab + Paracetamol 1 tab
  //    → Amoxicillin perlu 2*2=4 tab, Paracetamol perlu 2*1=2 tab
  const componentDrugNeeds = {}; // { drugId: { name, totalQty } }

  for (const row of customMedicineStockResult.rows) {
    const purchaseQty = Number(row.requiredQty ?? row.requiredqty ?? 0);
    if (purchaseQty <= 0) continue;

    const componentsResult = await db.query(
      `SELECT c."drugId", c."quantity", d."name"
       FROM "custom_medicine_components" c
       JOIN "drugs" d ON d."id" = c."drugId"
       WHERE c."customMedicineId" = $1`,
      [row.id]
    );

    for (const comp of componentsResult.rows) {
      const drugId = comp.drugId ?? comp.drugid;
      const compQty = Number(comp.quantity ?? 0);
      const needed = compQty * purchaseQty;

      if (!componentDrugNeeds[drugId]) {
        componentDrugNeeds[drugId] = { name: comp.name, totalQty: 0 };
      }
      componentDrugNeeds[drugId].totalQty += needed;
    }
  }

  // --- 4. Gabungkan kebutuhan obat langsung + bahan racikan ---
  const combinedDrugNeeds = {}; // { drugId: { name, totalQty } }

  for (const row of drugStockResult.rows) {
    const qty = Number(row.requiredQty ?? row.requiredqty ?? 0);
    if (qty <= 0) continue;
    combinedDrugNeeds[row.id] = { name: row.name, totalQty: qty };
  }

  for (const [drugId, need] of Object.entries(componentDrugNeeds)) {
    if (combinedDrugNeeds[drugId]) {
      combinedDrugNeeds[drugId].totalQty += need.totalQty;
    } else {
      combinedDrugNeeds[drugId] = { ...need };
    }
  }

  // --- 5. Validasi stok obat (langsung + bahan racikan) ---
  for (const [drugId, need] of Object.entries(combinedDrugNeeds)) {
    const stockResult = await db.query(
      'SELECT "id", "name", "stock" FROM "drugs" WHERE "id" = $1 FOR UPDATE',
      [drugId]
    );

    if (stockResult.rowCount === 0) continue;

    const currentStock = Number(stockResult.rows[0].stock ?? 0);
    if (currentStock < need.totalQty) {
      const stockError = new Error(
        `Stok obat ${need.name} tidak mencukupi (tersedia: ${currentStock}, dibutuhkan: ${need.totalQty}).`
      );
      stockError.status = 400;
      throw stockError;
    }
  }

  // --- 6. Validasi stok racikan ---
  for (const row of customMedicineStockResult.rows) {
    const currentStock = Number(row.stock ?? 0);
    const requiredQty = Number(row.requiredQty ?? row.requiredqty ?? 0);

    if (currentStock < requiredQty) {
      const stockError = new Error(`Stok obat racikan ${row.name} tidak mencukupi untuk menyelesaikan transaksi.`);
      stockError.status = 400;
      throw stockError;
    }
  }

  // --- 7. Kurangi stok obat (langsung + bahan racikan) ---
  for (const [drugId, need] of Object.entries(combinedDrugNeeds)) {
    if (need.totalQty <= 0) continue;

    await db.query(
      `UPDATE "drugs"
       SET "stock" = "stock" - $1,
           "updatedAt" = NOW()
       WHERE "id" = $2`,
      [need.totalQty, drugId]
    );
  }

  // --- 8. Kurangi stok racikan ---
  for (const row of customMedicineStockResult.rows) {
    const requiredQty = Number(row.requiredQty ?? row.requiredqty ?? 0);
    if (requiredQty <= 0) continue;

    await db.query(
      `UPDATE "custom_medicines"
       SET "stock" = "stock" - $1,
           "updatedAt" = NOW()
       WHERE "id" = $2`,
      [requiredQty, row.id]
    );
  }
};

const assertOrderAccessible = (req, orderRow) => {
  if (!isCustomerRequest(req)) {
    return null;
  }

  const ownerCustomerId = Number(orderRow.customerId ?? orderRow.customerid ?? 0);
  if (!ownerCustomerId || ownerCustomerId !== Number(req.user?.id)) {
    const accessError = new Error('Anda tidak memiliki akses ke pesanan ini.');
    accessError.status = 403;
    return accessError;
  }

  return null;
};

const mapOrderRow = (row) => ({
  id: row.id,
  type: row.type ?? ORDER_TYPE.ONLINE,
  orderStatus: row.status ?? null,
  totalPrice: Number(row.totalPrice ?? row.totalprice ?? 0),
  createdAt: row.createdAt ?? row.createdat ?? null,
  paymentProofImageUrl: row.paymentProofImageUrl ?? row.paymentproofimageurl ?? null,
  prescriptionImageUrl: row.prescriptionImageUrl ?? row.prescriptionimageurl ?? null,
  usageInstructions: row.usageInstructions ?? row.usageinstructions ?? null,
});

const mapOrderSummaryRow = (row) => ({
  ...mapOrderRow(row),
  totalItems: Number(row.totalItems ?? row.totalitems ?? 0),
});

const mapOrderItemRow = (row) => {
  const quantity = Number(row.quantity ?? 0);
  const unitPrice = Number(row.unitPrice ?? row.unitprice ?? 0);
  const subtotal = Number(row.subtotal ?? (quantity * unitPrice));
  const customMedicineId = row.customMedicineId ?? row.custommedicineid ?? null;
  const rawSnapshot = row.componentsSnapshot ?? row.componentssnapshot ?? null;

  let componentsSnapshot = null;
  if (rawSnapshot) {
    try {
      componentsSnapshot = typeof rawSnapshot === 'string' ? JSON.parse(rawSnapshot) : rawSnapshot;
    } catch (_) {
      componentsSnapshot = null;
    }
  }

  return {
    id: row.id,
    transactionId: row.transactionId ?? row.transactionid ?? null,
    drugId: row.drugId ?? row.drugid ?? null,
    customMedicineId,
    productType: customMedicineId ? 'custom' : 'regular',
    drugName: row.drugName ?? row.drugname ?? null,
    quantity,
    unitPrice,
    subtotal,
    componentsSnapshot,
  };
};

const hasTransactionPrescriptionColumn = async (db = pool) => {
  if (transactionHasPrescriptionColumnCache !== null) {
    return transactionHasPrescriptionColumnCache;
  }

  const result = await db.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND LOWER(table_name) = LOWER($1)
       AND LOWER(column_name) = LOWER($2)
     LIMIT 1`,
    ['Transaction', 'prescriptionImageUrl']
  );

  transactionHasPrescriptionColumnCache = result.rowCount > 0;
  return transactionHasPrescriptionColumnCache;
};

const hasTransactionUsageInstructionsColumn = async (db = pool) => {
  if (transactionHasUsageInstructionsColumnCache !== null) {
    return transactionHasUsageInstructionsColumnCache;
  }

  const result = await db.query(
    `SELECT 1
     FROM information_schema.columns
     WHERE table_schema = 'public'
       AND LOWER(table_name) = LOWER($1)
       AND LOWER(column_name) = LOWER($2)
     LIMIT 1`,
    ['Transaction', 'usageInstructions']
  );

  transactionHasUsageInstructionsColumnCache = result.rowCount > 0;
  return transactionHasUsageInstructionsColumnCache;
};

const createOrder = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { customerId, customer_id, cashierId, cashier_id, items } = req.body;

    let parsedItems = items;
    if (typeof parsedItems === 'string') {
      try {
        parsedItems = JSON.parse(parsedItems);
      } catch (parseError) {
        return res.status(400).json({ message: 'Format item pesanan tidak valid.' });
      }
    }

    const prescriptionFile = req.files?.prescriptionImage?.[0] || null;

    const resolvedCustomerId = isCustomerRequest(req)
      ? Number(req.user.id)
      : (customerId ?? customer_id ?? null);

    if (!Array.isArray(parsedItems) || parsedItems.length === 0) {
      return res.status(400).json({ message: 'Item pesanan tidak boleh kosong.' });
    }

    const normalizedItems = parsedItems.map((item) => ({
      productType: normalizeProductType(item.productType ?? item.product_type),
      productId: toNullableNumber(item.productId ?? item.product_id ?? item.drugId),
      productName: String(item.drugName || item.productName || item.product_name || item.nama || '').trim(),
      quantity: Number(item.quantity ?? 0),
    }));

    for (const item of normalizedItems) {
      if (Number.isNaN(item.quantity) || item.quantity <= 0) {
        return res.status(400).json({ message: 'Item pesanan tidak valid.' });
      }

      if (!['regular', 'custom'].includes(item.productType)) {
        return res.status(400).json({ message: 'Jenis item pesanan tidak valid.' });
      }

      if (item.productId === null && !item.productName) {
        return res.status(400).json({ message: 'Obat pada item pesanan tidak valid.' });
      }
    }

    const resolvedOrderType = isCustomerRequest(req) ? ORDER_TYPE.ONLINE : ORDER_TYPE.OFFLINE;
    const initialOrderStatus = resolvedOrderType === ORDER_TYPE.ONLINE ? ORDER_STATUS.PENDING : ORDER_STATUS.COMPLETED;

    const hasPrescriptionColumn = await hasTransactionPrescriptionColumn(client);
    const hasUsageInstructionsColumn = await hasTransactionUsageInstructionsColumn(client);
    const prescriptionImageUrl = resolvedOrderType === ORDER_TYPE.ONLINE && prescriptionFile
      ? `/uploads/prescriptions/${prescriptionFile.filename}`
      : null;

    let resolvedCashierId = cashierId ?? cashier_id ?? null;
    if (!resolvedCashierId && normalizeRole(req.user?.role) === 'KASIR') {
      resolvedCashierId = Number(req.user.id);
    }

    if (!resolvedCashierId) {
      const cashierResult = await client.query(
        `SELECT "id" FROM "users"
         WHERE "role" = 'KASIR'
         ORDER BY "id" ASC
         LIMIT 1`
      );

      if (cashierResult.rowCount === 0) {
        return res.status(400).json({
          message: 'Tidak ada data kasir untuk memproses transaksi.',
        });
      }

      resolvedCashierId = cashierResult.rows[0].id;
    }

    await client.query('BEGIN');

    const orderCode = generateOrderCode();

    const orderResult = (hasPrescriptionColumn && hasUsageInstructionsColumn)
      ? await client.query(
        `INSERT INTO "transactions" ("orderCode", "customerId", "cashierId", "totalPrice", "type", "status", "prescriptionImageUrl", "usageInstructions", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW(), NOW())
         RETURNING "id", "type", "status", "totalPrice", "createdAt", "paymentProofImageUrl", "prescriptionImageUrl", "usageInstructions"`,
        [orderCode, resolvedCustomerId, resolvedCashierId, 0, resolvedOrderType, initialOrderStatus, prescriptionImageUrl, null]
      )
      : hasPrescriptionColumn
      ? await client.query(
        `INSERT INTO "transactions" ("orderCode", "customerId", "cashierId", "totalPrice", "type", "status", "prescriptionImageUrl", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, $7, NOW(), NOW())
         RETURNING "id", "type", "status", "totalPrice", "createdAt", "paymentProofImageUrl", "prescriptionImageUrl"`,
        [orderCode, resolvedCustomerId, resolvedCashierId, 0, resolvedOrderType, initialOrderStatus, prescriptionImageUrl]
      )
      : await client.query(
        `INSERT INTO "transactions" ("orderCode", "customerId", "cashierId", "totalPrice", "type", "status", "createdAt", "updatedAt")
         VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
         RETURNING "id", "type", "status", "totalPrice", "createdAt", "paymentProofImageUrl"`,
        [orderCode, resolvedCustomerId, resolvedCashierId, 0, resolvedOrderType, initialOrderStatus]
      );

    let orderRow = orderResult.rows[0];
    const itemRows = [];
    let computedTotalPrice = 0;

    for (const item of normalizedItems) {
      if (item.productType === 'custom') {
        let customMedicineRow = null;

        if (item.productId !== null) {
          const customByIdResult = await client.query(
            'SELECT "id", "name", "price" FROM "custom_medicines" WHERE "id" = $1 LIMIT 1',
            [item.productId]
          );
          customMedicineRow = customByIdResult.rows[0] || null;
        }

        if (!customMedicineRow && item.productName) {
          const customByNameResult = await client.query(
            'SELECT "id", "name", "price" FROM "custom_medicines" WHERE LOWER("name") = LOWER($1) LIMIT 1',
            [item.productName]
          );
          customMedicineRow = customByNameResult.rows[0] || null;
        }

        if (!customMedicineRow) {
          const customError = new Error('Obat racikan tidak ditemukan untuk salah satu item checkout.');
          customError.status = 400;
          throw customError;
        }

        const unitPrice = Number(customMedicineRow.price ?? 0);
        const subtotal = unitPrice * item.quantity;
        computedTotalPrice += subtotal;

        // Snapshot komposisi racikan saat ini agar riwayat transaksi tidak berubah
        const componentsResult = await client.query(
          `SELECT c."drugId", c."quantity", c."unit", d."name" AS "drugName"
           FROM "custom_medicine_components" c
           JOIN "drugs" d ON d."id" = c."drugId"
           WHERE c."customMedicineId" = $1
           ORDER BY c."id" ASC`,
          [customMedicineRow.id]
        );

        const componentsSnapshot = JSON.stringify(
          componentsResult.rows.map((comp) => ({
            drugId: comp.drugId ?? comp.drugid,
            drugName: comp.drugName ?? comp.drugname,
            quantity: Number(comp.quantity ?? 0),
            unit: comp.unit,
          }))
        );

        const itemResult = await client.query(
          `INSERT INTO "transaction_details" ("transactionId", "customMedicineId", "quantity", "unitPrice", "subtotal", "componentsSnapshot")
           VALUES ($1, $2, $3, $4, $5, $6)
           RETURNING "id", "transactionId", "drugId", "customMedicineId", "quantity", "unitPrice", "subtotal", "componentsSnapshot"`,
          [orderRow.id, customMedicineRow.id, item.quantity, unitPrice, subtotal, componentsSnapshot]
        );

        itemRows.push({
          ...itemResult.rows[0],
          drugName: customMedicineRow.name,
        });

        continue;
      }

      let drugRow = null;

      if (item.productId !== null) {
        const drugByIdResult = await client.query(
          'SELECT "id", "name", "price" FROM "drugs" WHERE "id" = $1 LIMIT 1',
          [item.productId]
        );
        drugRow = drugByIdResult.rows[0] || null;
      }

      if (!drugRow && item.productName) {
        const drugByNameResult = await client.query(
          'SELECT "id", "name", "price" FROM "drugs" WHERE LOWER("name") = LOWER($1) LIMIT 1',
          [item.productName]
        );
        drugRow = drugByNameResult.rows[0] || null;
      }

      if (!drugRow) {
        const drugError = new Error('Obat tidak ditemukan untuk salah satu item checkout.');
        drugError.status = 400;
        throw drugError;
      }

      const unitPrice = Number(drugRow.price ?? 0);
      const subtotal = unitPrice * item.quantity;
      computedTotalPrice += subtotal;

      const itemResult = await client.query(
        `INSERT INTO "transaction_details" ("transactionId", "drugId", "quantity", "unitPrice", "subtotal")
         VALUES ($1, $2, $3, $4, $5)
         RETURNING "id", "transactionId", "drugId", "customMedicineId", "quantity", "unitPrice", "subtotal"`,
        [orderRow.id, drugRow.id, item.quantity, unitPrice, subtotal]
      );

      itemRows.push({
        ...itemResult.rows[0],
        drugName: drugRow.name,
      });
    }

    const updatedOrderResult = (hasPrescriptionColumn && hasUsageInstructionsColumn)
      ? await client.query(
        `UPDATE "transactions"
         SET "totalPrice" = $1,
             "updatedAt" = NOW()
         WHERE "id" = $2
         RETURNING "id", "type", "status", "totalPrice", "createdAt", "paymentProofImageUrl", "prescriptionImageUrl", "usageInstructions"`,
        [computedTotalPrice, orderRow.id]
      )
      : hasPrescriptionColumn
      ? await client.query(
        `UPDATE "transactions"
         SET "totalPrice" = $1,
             "updatedAt" = NOW()
         WHERE "id" = $2
         RETURNING "id", "type", "status", "totalPrice", "createdAt", "paymentProofImageUrl", "prescriptionImageUrl"`,
        [computedTotalPrice, orderRow.id]
      )
      : await client.query(
        `UPDATE "transactions"
         SET "totalPrice" = $1,
             "updatedAt" = NOW()
         WHERE "id" = $2
         RETURNING "id", "type", "status", "totalPrice", "createdAt", "paymentProofImageUrl"`,
        [computedTotalPrice, orderRow.id]
      );

    if (updatedOrderResult.rowCount > 0) {
      orderRow = updatedOrderResult.rows[0];
    }

    if (resolvedOrderType === ORDER_TYPE.OFFLINE) {
      await deductInventoryForTransaction(client, orderRow.id);
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: resolvedOrderType === ORDER_TYPE.ONLINE
        ? 'Pesanan online berhasil dibuat.'
        : 'Transaksi offline berhasil dibuat.',
      data: {
        ...mapOrderRow(orderRow),
        items: itemRows.map(mapOrderItemRow),
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const getOrders = async (req, res, next) => {
  try {
    const { customerId } = req.query;
    const hasPrescriptionColumn = await hasTransactionPrescriptionColumn(pool);
    const hasUsageInstructionsColumn = await hasTransactionUsageInstructionsColumn(pool);

    const params = [ORDER_TYPE.ONLINE];
    let whereClause = 'WHERE orders."type" = $1';

    if (isCustomerRequest(req)) {
      params.push(req.user.id);
      whereClause += ` AND orders."customerId" = $${params.length}`;
    } else if (customerId) {
      params.push(customerId);
      whereClause += ` AND orders."customerId" = $${params.length}`;
    }

    const prescriptionSelect = hasPrescriptionColumn
      ? 'orders."prescriptionImageUrl"'
      : 'NULL::text AS "prescriptionImageUrl"';
    const usageInstructionsSelect = hasUsageInstructionsColumn
      ? 'orders."usageInstructions"'
      : 'NULL::text AS "usageInstructions"';

    const ordersResult = await pool.query(
      `SELECT orders."id",
              orders."type",
              orders."status",
              orders."totalPrice",
              orders."createdAt",
              orders."paymentProofImageUrl",
              ${prescriptionSelect},
              ${usageInstructionsSelect},
              COUNT(items."id")::int AS "totalItems"
       FROM "transactions" AS orders
       LEFT JOIN "transaction_details" AS items
         ON items."transactionId" = orders."id"
       ${whereClause}
       GROUP BY orders."id", orders."type", orders."status", orders."totalPrice", orders."createdAt", orders."paymentProofImageUrl"${hasPrescriptionColumn ? ', orders."prescriptionImageUrl"' : ''}${hasUsageInstructionsColumn ? ', orders."usageInstructions"' : ''}
       ORDER BY orders."id" ASC`,
      params
    );

    res.status(200).json({
      message: 'Data pesanan online berhasil diambil.',
      data: ordersResult.rows.map(mapOrderSummaryRow),
      total: ordersResult.rowCount,
    });
  } catch (error) {
    next(error);
  }
};

const getOrderById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const hasPrescriptionColumn = await hasTransactionPrescriptionColumn(pool);
    const hasUsageInstructionsColumn = await hasTransactionUsageInstructionsColumn(pool);

    const prescriptionSelect = hasPrescriptionColumn
      ? '"prescriptionImageUrl"'
      : 'NULL::text AS "prescriptionImageUrl"';
    const usageInstructionsSelect = hasUsageInstructionsColumn
      ? '"usageInstructions"'
      : 'NULL::text AS "usageInstructions"';

    const orderResult = await pool.query(
      `SELECT "id", "customerId", "type", "status", "totalPrice", "createdAt", "paymentProofImageUrl", ${prescriptionSelect}, ${usageInstructionsSelect}
       FROM "transactions"
       WHERE "id" = $1 AND "type" = $2`,
      [id, ORDER_TYPE.ONLINE]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const accessError = assertOrderAccessible(req, orderResult.rows[0]);
    if (accessError) {
      throw accessError;
    }

    const itemsResult = await pool.query(
            `SELECT items."id",
              items."transactionId",
              items."drugId",
              items."customMedicineId",
              items."quantity",
              items."unitPrice",
              items."subtotal",
              items."componentsSnapshot",
              COALESCE("drugs"."name", "custom_medicines"."name") AS "drugName"
      FROM "transaction_details" AS items
      LEFT JOIN "drugs" ON "drugs"."id" = items."drugId"
            LEFT JOIN "custom_medicines" ON "custom_medicines"."id" = items."customMedicineId"
       WHERE items."transactionId" = $1
       ORDER BY items."id" ASC`,
      [id]
    );

    res.status(200).json({
      message: 'Detail pesanan online berhasil diambil.',
      data: {
        ...mapOrderRow(orderResult.rows[0]),
        items: itemsResult.rows.map(mapOrderItemRow),
      },
    });
  } catch (error) {
    next(error);
  }
};

const payOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: 'Bukti pembayaran wajib diunggah.' });
    }

    const orderResult = await pool.query(
      'SELECT "id", "customerId", "status" FROM "transactions" WHERE "id" = $1 AND "type" = $2',
      [id, ORDER_TYPE.ONLINE]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const accessError = assertOrderAccessible(req, orderResult.rows[0]);
    if (accessError) {
      throw accessError;
    }

    if (orderResult.rows[0].status !== ORDER_STATUS.PENDING) {
      return res.status(400).json({ message: 'Status pesanan tidak dapat dibayarkan.' });
    }

    const proofUrl = `/uploads/payment-proofs/${req.file.filename}`;

    const updateResult = await pool.query(
      'UPDATE "transactions" SET "paymentProofImageUrl" = $1, "updatedAt" = NOW() WHERE "id" = $2 RETURNING *',
      [proofUrl, id]
    );

    res.status(200).json({
      message: 'Bukti pembayaran berhasil diunggah.',
      data: mapOrderRow(updateResult.rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

const verifyPayment = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!isStaffRequest(req)) {
      return res.status(403).json({ message: 'Hanya kasir yang dapat memverifikasi pembayaran.' });
    }

    const orderResult = await pool.query(
      'SELECT "id", "status", "paymentProofImageUrl" FROM "transactions" WHERE "id" = $1 AND "type" = $2',
      [id, ORDER_TYPE.ONLINE]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    if (!orderResult.rows[0].paymentProofImageUrl) {
      return res.status(400).json({ message: 'Pesanan belum memiliki bukti pembayaran untuk diverifikasi.' });
    }

    if (orderResult.rows[0].status !== ORDER_STATUS.PENDING) {
      return res.status(400).json({ message: 'Status pesanan tidak dapat diverifikasi.' });
    }

    const updateResult = await pool.query(
      'UPDATE "transactions" SET "status" = $1, "updatedAt" = NOW() WHERE "id" = $2 RETURNING *',
      [ORDER_STATUS.VERIFIED, id]
    );

    res.status(200).json({
      message: 'Pembayaran berhasil diverifikasi.',
      data: mapOrderRow(updateResult.rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

const updateOrderStatus = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;
    const requestedStatus = String(req.body?.orderStatus || req.body?.status || '').trim().toUpperCase();
    const usageInstructionsRaw = req.body?.usageInstructions;
    const usageInstructions = typeof usageInstructionsRaw === 'string'
      ? usageInstructionsRaw.trim()
      : '';

    if (!isStaffRequest(req)) {
      return res.status(403).json({ message: 'Hanya kasir yang dapat mengubah status pesanan.' });
    }

    if (requestedStatus !== ORDER_STATUS.COMPLETED) {
      return res.status(400).json({ message: 'Status tujuan tidak valid. Gunakan COMPLETED.' });
    }

    if (!usageInstructions) {
      return res.status(400).json({ message: 'Aturan pakai wajib diisi saat menyelesaikan pesanan.' });
    }

    const hasUsageInstructionsColumn = await hasTransactionUsageInstructionsColumn(pool);

    await client.query('BEGIN');

    const orderResult = await client.query(
      'SELECT "id", "status" FROM "transactions" WHERE "id" = $1 AND "type" = $2 FOR UPDATE',
      [id, ORDER_TYPE.ONLINE]
    );

    if (orderResult.rowCount === 0) {
      await client.query('ROLLBACK');
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    if (orderResult.rows[0].status !== ORDER_STATUS.VERIFIED) {
      await client.query('ROLLBACK');
      return res.status(400).json({
        message: 'Pesanan hanya bisa diselesaikan setelah pembayaran terverifikasi.',
      });
    }

    const updateResult = hasUsageInstructionsColumn
      ? await client.query(
        'UPDATE "transactions" SET "status" = $1, "usageInstructions" = $2, "updatedAt" = NOW() WHERE "id" = $3 RETURNING *',
        [requestedStatus, usageInstructions, id]
      )
      : await client.query(
        'UPDATE "transactions" SET "status" = $1, "updatedAt" = NOW() WHERE "id" = $2 RETURNING *',
        [requestedStatus, id]
      );

    await deductInventoryForTransaction(client, id);
    await client.query('COMMIT');

    res.status(200).json({
      message: 'Status pesanan berhasil diperbarui.',
      data: mapOrderRow(updateResult.rows[0]),
    });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      'SELECT "id", "customerId", "status" FROM "transactions" WHERE "id" = $1 AND "type" = $2',
      [id, ORDER_TYPE.ONLINE]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const accessError = assertOrderAccessible(req, orderResult.rows[0]);
    if (accessError) {
      throw accessError;
    }

    if (orderResult.rows[0].status !== ORDER_STATUS.PENDING) {
      return res.status(400).json({ message: 'Pesanan tidak dapat dibatalkan karena sudah diproses.' });
    }

    const updateResult = await pool.query(
      'UPDATE "transactions" SET "status" = $1, "updatedAt" = NOW() WHERE "id" = $2 RETURNING *',
      [ORDER_STATUS.CANCELLED, id]
    );

    res.status(200).json({
      message: 'Pesanan berhasil dibatalkan.',
      data: mapOrderRow(updateResult.rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

const deleteCancelledOrder = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const orderResult = await client.query(
      'SELECT "id", "customerId", "status" FROM "transactions" WHERE "id" = $1 AND "type" = $2',
      [id, ORDER_TYPE.ONLINE]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const accessError = assertOrderAccessible(req, orderResult.rows[0]);
    if (accessError) {
      throw accessError;
    }

    if (orderResult.rows[0].status !== ORDER_STATUS.CANCELLED) {
      return res.status(400).json({ message: 'Hanya pesanan dengan status dibatalkan yang dapat dihapus.' });
    }

    await client.query('BEGIN');
    await client.query('DELETE FROM "transaction_details" WHERE "transactionId" = $1', [id]);
    await client.query('DELETE FROM "transactions" WHERE "id" = $1', [id]);
    await client.query('COMMIT');

    res.status(200).json({ message: 'Pesanan dibatalkan berhasil dihapus.' });
  } catch (error) {
    await client.query('ROLLBACK');
    next(error);
  } finally {
    client.release();
  }
};

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  payOrder,
  verifyPayment,
  updateOrderStatus,
  cancelOrder,
  deleteCancelledOrder,
};
