const pool = require('../config/database');

const ORDER_STATUS = {
  PENDING: 'pending_payment',
  PAYMENT_UPLOADED: 'payment_uploaded',
  PAID: 'paid',
  PROCESSED: 'processed',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
};

const normalizeRole = (role) => String(role || '').toUpperCase();

const isCustomerRequest = (req) => normalizeRole(req.user?.role) === 'CUSTOMER';
const isStaffRequest = (req) => ['ADMIN', 'KASIR'].includes(normalizeRole(req.user?.role));

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
  order_status: row.order_status ?? null,
  total_amount: Number(row.total_amount ?? 0),
  order_time: row.order_time ?? null,
  payment_proof_image_url: row.payment_proof_image_url ?? row.paymentProofImageUrl ?? null,
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
    const resolvedCustomerId = isCustomerRequest(req)
      ? Number(req.user.id)
      : (customer_id ?? null);

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
      [resolvedCustomerId, resolvedCashierId, totalAmount, ORDER_STATUS.PENDING]
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

    if (isCustomerRequest(req)) {
      params.push(req.user.id);
      whereClause = 'WHERE "customerId" = $1';
    } else if (customerId) {
      params.push(customerId);
      whereClause = 'WHERE "customerId" = $1';
    }

    const ordersResult = await pool.query(
      `SELECT orders."id",
              orders."order_status",
              orders."total_amount",
              orders."order_time",
              orders."payment_proof_image_url",
              COUNT(items."id")::int AS "total_items"
       FROM online_orders AS orders
       LEFT JOIN online_order_items AS items
         ON items."online_order_id" = orders."id"
       ${whereClause}
       GROUP BY orders."id", orders."order_status", orders."total_amount", orders."order_time", orders."payment_proof_image_url"
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
      'SELECT id, "customerId", order_status, total_amount, order_time, payment_proof_image_url FROM online_orders WHERE id = $1',
      [id]
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
              items."online_order_id",
              items."product_id",
              items."quantity",
              items."price_per_unit",
              items."subtotal",
              products."name" AS "product_name",
              NULL::text AS "product_type"
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
      'SELECT id, "customerId", order_status FROM online_orders WHERE id = $1',
      [id]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const accessError = assertOrderAccessible(req, orderResult.rows[0]);
    if (accessError) {
      throw accessError;
    }

    const currentStatus = orderResult.rows[0].order_status ?? orderResult.rows[0].orderStatus;
    if (currentStatus && currentStatus !== ORDER_STATUS.PENDING) {
      return res.status(400).json({ message: 'Status pesanan tidak dapat dibayarkan.' });
    }

    const proofUrl = `/uploads/payment-proofs/${req.file.filename}`;

    const updateResult = await pool.query(
      'UPDATE online_orders SET payment_proof_image_url = $1, order_status = $2 WHERE id = $3 RETURNING *',
      [proofUrl, ORDER_STATUS.PAYMENT_UPLOADED, id]
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
      return res.status(403).json({ message: 'Hanya admin/kasir yang dapat memverifikasi pembayaran.' });
    }

    const orderResult = await pool.query(
      'SELECT id, order_status, payment_proof_image_url FROM online_orders WHERE id = $1',
      [id]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const order = orderResult.rows[0];
    const currentStatus = order.order_status ?? order.orderStatus;
    const proofUrl = order.payment_proof_image_url ?? order.paymentProofImageUrl;

    if (!proofUrl) {
      return res.status(400).json({ message: 'Pesanan belum memiliki bukti pembayaran untuk diverifikasi.' });
    }

    if (currentStatus !== ORDER_STATUS.PAYMENT_UPLOADED) {
      return res.status(400).json({ message: 'Status pesanan tidak dapat diverifikasi.' });
    }

    const updateResult = await pool.query(
      'UPDATE online_orders SET order_status = $1 WHERE id = $2 RETURNING *',
      [ORDER_STATUS.PAID, id]
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
  try {
    const { id } = req.params;
    const requestedStatus = String(req.body?.status || '').trim().toLowerCase();

    if (!isStaffRequest(req)) {
      return res.status(403).json({ message: 'Hanya admin/kasir yang dapat mengubah status pesanan.' });
    }

    if (![ORDER_STATUS.PROCESSED, ORDER_STATUS.COMPLETED].includes(requestedStatus)) {
      return res.status(400).json({
        message: 'Status tujuan tidak valid. Gunakan processed atau completed.',
      });
    }

    const orderResult = await pool.query(
      'SELECT id, order_status FROM online_orders WHERE id = $1',
      [id]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const currentStatus = orderResult.rows[0].order_status ?? orderResult.rows[0].orderStatus;

    if (requestedStatus === ORDER_STATUS.PROCESSED && currentStatus !== ORDER_STATUS.PAID) {
      return res.status(400).json({
        message: 'Pesanan hanya bisa diproses setelah pembayaran terverifikasi.',
      });
    }

    if (requestedStatus === ORDER_STATUS.COMPLETED && currentStatus !== ORDER_STATUS.PROCESSED) {
      return res.status(400).json({
        message: 'Pesanan hanya bisa diselesaikan setelah status diproses.',
      });
    }

    const updateResult = await pool.query(
      'UPDATE online_orders SET order_status = $1 WHERE id = $2 RETURNING *',
      [requestedStatus, id]
    );

    res.status(200).json({
      message: 'Status pesanan berhasil diperbarui.',
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
      'SELECT id, "customerId", order_status FROM online_orders WHERE id = $1',
      [id]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const accessError = assertOrderAccessible(req, orderResult.rows[0]);
    if (accessError) {
      throw accessError;
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

const deleteCancelledOrder = async (req, res, next) => {
  const client = await pool.connect();

  try {
    const { id } = req.params;

    const orderResult = await client.query(
      'SELECT id, "customerId", order_status FROM online_orders WHERE id = $1',
      [id]
    );

    if (orderResult.rowCount === 0) {
      return res.status(404).json({ message: `Pesanan dengan ID ${id} tidak ditemukan.` });
    }

    const accessError = assertOrderAccessible(req, orderResult.rows[0]);
    if (accessError) {
      throw accessError;
    }

    const currentStatus = orderResult.rows[0].order_status ?? orderResult.rows[0].orderStatus;
    if (currentStatus !== ORDER_STATUS.CANCELLED) {
      return res.status(400).json({ message: 'Hanya pesanan dengan status dibatalkan yang dapat dihapus.' });
    }

    await client.query('BEGIN');

    await client.query(
      'DELETE FROM online_order_items WHERE online_order_id = $1',
      [id]
    );

    await client.query(
      'DELETE FROM online_orders WHERE id = $1',
      [id]
    );

    await client.query('COMMIT');

    res.status(200).json({
      message: 'Pesanan dibatalkan berhasil dihapus.',
    });
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
