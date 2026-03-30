const pool = require('../config/database');

const ORDER_STATUS = {
  PENDING: 'pending_payment',
  PAID: 'paid',
  PROCESSED: 'processed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const mapOrderRow = (row) => ({
  id: row.id,
  order_status: row.order_status ?? null,
  total_amount: Number(row.total_amount ?? 0),
  order_time: row.order_time ?? null,
});

const mapOrderSummaryRow = (row) => ({
  ...mapOrderRow(row),
  total_items: Number(row.total_items ?? 0),
});

const mapOrderItemRow = (row) => {
  const quantity = Number(row.quantity ?? 0);
  const pricePerUnit = Number(row.price_per_unit ?? row.pricePerUnit ?? row.priceperunit ?? 0);
  const subtotal = Number(row.subtotal ?? (quantity * pricePerUnit));
  return {
    id: row.id,
    online_order_id: row.online_order_id ?? null,
    product_id: row.product_id ?? null,
    product_name: row.product_name ?? null,
    product_type: row.product_type ?? null,
    quantity,
    price_per_unit: pricePerUnit,
    subtotal,
  };
};

const createOrder = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { customer_id, cashier_id, items } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: 'Item pesanan tidak boleh kosong.' });
    }

    const normalizedItems = items.map((item) => ({
      product_id: item.product_id === undefined || item.product_id === null
        ? null
        : Number(item.product_id),
      product_name: String(item.product_name || item.nama || '').trim(),
      product_type: String(item.product_type || item.type || 'regular').trim(),
      quantity: Number(item.quantity ?? 0),
      price_per_unit: Number(item.price_per_unit ?? 0),
    }));

    for (const item of normalizedItems) {
      if (Number.isNaN(item.quantity) || item.quantity <= 0 || Number.isNaN(item.price_per_unit) || item.price_per_unit <= 0) {
        return res.status(400).json({ message: 'Item pesanan tidak valid.' });
      }

      if ((item.product_id === null || Number.isNaN(item.product_id)) && !item.product_name) {
        return res.status(400).json({ message: 'Produk pada item pesanan tidak valid.' });
      }
    }

    const totalAmount = normalizedItems.reduce(
      (total, item) => total + (item.price_per_unit * item.quantity),
      0
    );

    let resolvedCashierId = cashier_id ?? null;
    if (!resolvedCashierId) {
      const cashierResult = await client.query(
        `SELECT "id" FROM "User"
         WHERE "role" IN ('KASIR', 'ADMIN')
         ORDER BY CASE WHEN "role" = 'KASIR' THEN 0 ELSE 1 END, "id" ASC
         LIMIT 1`
      );

      if (cashierResult.rowCount === 0) {
        return res.status(400).json({
          message: 'Tidak ada data kasir/admin untuk memproses checkout online.',
        });
      }

      resolvedCashierId = cashierResult.rows[0].id;
    }

    await client.query('BEGIN');

    const orderResult = await client.query(
      `INSERT INTO online_orders ("customerId", "cashierId", order_time, total_amount, order_status)
       VALUES ($1, $2, NOW(), $3, $4)
       RETURNING id, order_status, total_amount, order_time`,
      [customer_id ?? null, resolvedCashierId, totalAmount, ORDER_STATUS.PENDING]
    );

    const orderRow = orderResult.rows[0];

    const itemRows = [];
    for (const item of normalizedItems) {
      let resolvedProductId = Number.isNaN(item.product_id) ? null : item.product_id;

      if (resolvedProductId) {
        const productExists = await client.query(
          'SELECT id FROM products WHERE id = $1 LIMIT 1',
          [resolvedProductId]
        );

        if (productExists.rowCount === 0) {
          resolvedProductId = null;
        }
      }

      if (!resolvedProductId && item.product_name) {
        const lookupByName = await client.query(
          'SELECT id FROM products WHERE LOWER(name) = LOWER($1) LIMIT 1',
          [item.product_name]
        );

        if (lookupByName.rowCount > 0) {
          resolvedProductId = lookupByName.rows[0].id;
        }
      }

      if (!resolvedProductId && item.product_name) {
        const insertedProduct = await client.query(
          `INSERT INTO products (name, description, stock, unit, price, "expiredDate", "createdAt", "updatedAt", "supplierId")
           VALUES ($1, $2, $3, $4, $5, NULL, NOW(), NOW(), NULL)
           RETURNING id`,
          [item.product_name, `Auto-created from online checkout (${item.product_type || 'regular'})`, 0, 'pcs', item.price_per_unit]
        );

        resolvedProductId = insertedProduct.rows[0].id;
      }

      if (!resolvedProductId) {
        const productError = new Error('Produk tidak ditemukan untuk salah satu item checkout.');
        productError.status = 400;
        throw productError;
      }

      const subtotal = item.price_per_unit * item.quantity;
      const itemResult = await client.query(
        `INSERT INTO online_order_items (online_order_id, product_id, quantity, price_per_unit, subtotal)
         VALUES ($1, $2, $3, $4, $5)
         RETURNING id, online_order_id, product_id, quantity, price_per_unit, subtotal`,
        [orderRow.id, resolvedProductId, item.quantity, item.price_per_unit, subtotal]
      );
      itemRows.push(itemResult.rows[0]);
    }

    await client.query('COMMIT');

    res.status(201).json({
      message: 'Pesanan online berhasil dibuat.',
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
    const params = [];
    let whereClause = '';

    if (customerId) {
      params.push(customerId);
      whereClause = 'WHERE "customerId" = $1';
    }

    const ordersResult = await pool.query(
      `SELECT orders."id",
              orders."order_status",
              orders."total_amount",
              orders."order_time",
              COUNT(items."id")::int AS "total_items"
       FROM online_orders AS orders
       LEFT JOIN online_order_items AS items
         ON items."online_order_id" = orders."id"
       ${whereClause}
       GROUP BY orders."id", orders."order_status", orders."total_amount", orders."order_time"
       ORDER BY orders."id" DESC`,
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

    const orderResult = await pool.query(
      'SELECT * FROM online_orders WHERE id = $1',
      [id]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const itemsResult = await pool.query(
      `SELECT items."id",
              items."online_order_id",
              items."product_id",
              items."quantity",
              items."price_per_unit",
              items."subtotal",
              products."name" AS "product_name",
              products."product_type" AS "product_type"
       FROM online_order_items AS items
       LEFT JOIN products ON products."id" = items."product_id"
       WHERE items."online_order_id" = $1
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
      'SELECT id, order_status FROM online_orders WHERE id = $1',
      [id]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const currentStatus = orderResult.rows[0].order_status ?? orderResult.rows[0].orderStatus;
    if (currentStatus && currentStatus !== ORDER_STATUS.PENDING) {
      return res.status(400).json({ message: 'Status pesanan tidak dapat dibayarkan.' });
    }

    const proofUrl = `/uploads/payment-proofs/${req.file.filename}`;

    const updateResult = await pool.query(
      'UPDATE online_orders SET payment_proof_image_url = $1, order_status = $2 WHERE id = $3 RETURNING *',
      [proofUrl, ORDER_STATUS.PAID, id]
    );

    res.status(200).json({
      message: 'Bukti pembayaran berhasil diunggah.',
      data: mapOrderRow(updateResult.rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

const cancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    const orderResult = await pool.query(
      'SELECT id, order_status FROM online_orders WHERE id = $1',
      [id]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const currentStatus = orderResult.rows[0].order_status ?? orderResult.rows[0].orderStatus;
    if (currentStatus && currentStatus !== ORDER_STATUS.PENDING) {
      return res.status(400).json({ message: 'Pesanan tidak dapat dibatalkan karena sudah diproses.' });
    }

    const updateResult = await pool.query(
      'UPDATE online_orders SET order_status = $1 WHERE id = $2 RETURNING *',
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

module.exports = {
  createOrder,
  getOrders,
  getOrderById,
  payOrder,
  cancelOrder,
};
