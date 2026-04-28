const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const toCustomerPayload = (row) => ({
  id: row.id,
  name: row.username,
  email: row.email,
  phone: row.phone,
  address: row.address,
  role: row.role,
  isMember: row.isMember ?? row.ismember,
  membershipStatus: row.membershipStatus ?? row.membershipstatus,
  createdAt: row.createdAt ?? row.createdat,
  updatedAt: row.updatedAt ?? row.updatedat,
});

const getCustomerSummary = async (customerId) => {
  const txSummaryResult = await pool.query(
    `SELECT COALESCE(SUM("totalPrice"), 0) AS "totalPurchase", COUNT(*)::int AS "totalTransaction"
    FROM "transactions"
     WHERE "customerId" = $1`,
    [customerId]
  );

  const historyResult = await pool.query(
    `SELECT t."id", t."createdAt", t."totalPrice", COALESCE(SUM(td."quantity"), 0)::int AS "items"
    FROM "transactions" t
    LEFT JOIN "transaction_details" td ON td."transactionId" = t."id"
     WHERE t."customerId" = $1
     GROUP BY t."id", t."createdAt", t."totalPrice"
     ORDER BY t."id" ASC
     LIMIT 20`,
    [customerId]
  );

  return {
    totalPurchase: Number(txSummaryResult.rows[0]?.totalPurchase || 0),
    totalTransaction: Number(txSummaryResult.rows[0]?.totalTransaction || 0),
    purchaseHistory: historyResult.rows,
  };
};

const getAllCustomersWithSummary = async () => pool.query(
  `SELECT u."id", u."username", u."email", u."phone", u."address", u."membershipStatus", u."isMember", u."createdAt",
          COALESCE(SUM(t."totalPrice"), 0) AS "totalPurchase"
  FROM "users" u
  LEFT JOIN "transactions" t ON t."customerId" = u."id"
   WHERE u."role" = 'CUSTOMER'
   GROUP BY u."id", u."username", u."email", u."phone", u."address", u."membershipStatus", u."isMember", u."createdAt"
   ORDER BY u."id" ASC`
);

const registerCustomer = async (req, res, next) => {
  try {
    const { name, email, password, phone, address } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Nama, email, dan password harus diisi.' });
    }

    const existingCustomer = await pool.query('SELECT "id" FROM "users" WHERE "email" = $1', [email]);
    if (existingCustomer.rowCount > 0) {
      return res.status(409).json({ message: 'Email sudah terdaftar. Silakan gunakan email lain.' });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const baseUsername = String(name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/^\.|\.$/g, '') || 'customer';
    let usernameCandidate = baseUsername;
    let suffix = 1;

    while (true) {
      const usernameCheck = await pool.query('SELECT "id" FROM "users" WHERE "username" = $1', [usernameCandidate]);
      if (usernameCheck.rowCount === 0) {
        break;
      }
      usernameCandidate = `${baseUsername}.${suffix}`;
      suffix += 1;
    }

    const newCustomerResult = await pool.query(
      `INSERT INTO "users" ("username", "email", "password", "role", "phone", "address", "isMember", "membershipStatus", "updatedAt")
       VALUES ($1, $2, $3, 'CUSTOMER', $4, $5, $6, $7, NOW())
       RETURNING "id", "username", "email", "role", "phone", "address", "isMember", "membershipStatus", "createdAt", "updatedAt"`,
      [usernameCandidate, email, passwordHash, phone || null, address || null, true, 'active']
    );

    const newCustomer = newCustomerResult.rows[0];

    res.status(201).json({
      message: 'Registrasi pelanggan berhasil! Silakan kembali ke halaman login.',
      data: {
        id: newCustomer.id,
        name,
        email: newCustomer.email,
        username: newCustomer.username,
        role: 'customer',
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email atau username sudah digunakan.' });
    }
    next(error);
  }
};

const getCustomerProfile = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const requestRole = String(req.user?.role || '').toUpperCase();
    const requestUserId = Number(req.user?.id || 0);

    if (requestRole === 'CUSTOMER' && requestUserId !== Number(customerId)) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses ke profil ini.' });
    }

    const customerResult = await pool.query(
      `SELECT "id", "username", "email", "phone", "address", "role", "isMember", "membershipStatus", "createdAt", "updatedAt"
      FROM "users"
       WHERE "id" = $1 AND "role" = 'CUSTOMER'`,
      [customerId]
    );

    if (customerResult.rowCount === 0) {
      return res.status(404).json({ message: `Pelanggan dengan ID ${customerId} tidak ditemukan.` });
    }

    const summary = await getCustomerSummary(customerId);
    const customer = customerResult.rows[0];

    res.status(200).json({
      message: 'Data profil pelanggan berhasil diambil.',
      data: {
        ...toCustomerPayload(customer),
        role: 'customer',
        totalPurchase: summary.totalPurchase,
        totalTransaction: summary.totalTransaction,
        purchaseHistory: summary.purchaseHistory,
      },
    });
  } catch (error) {
    next(error);
  }
};

const updateCustomerProfile = async (req, res, next) => {
  try {
    const { customerId } = req.params;
    const { name, phone, address, membershipStatus, isMember } = req.body;
    const requestRole = String(req.user?.role || '').toUpperCase();
    const requestUserId = Number(req.user?.id || 0);

    if (requestRole === 'CUSTOMER' && requestUserId !== Number(customerId)) {
      return res.status(403).json({ message: 'Anda tidak memiliki akses untuk memperbarui profil ini.' });
    }

    const existingResult = await pool.query(
      'SELECT * FROM "users" WHERE "id" = $1 AND "role" = $2::"Role"',
      [customerId, 'CUSTOMER']
    );

    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: `Pelanggan dengan ID ${customerId} tidak ditemukan.` });
    }

    const existing = existingResult.rows[0];

    const updatedResult = await pool.query(
        `UPDATE "users"
       SET "username" = $1,
           "phone" = $2,
           "address" = $3,
           "membershipStatus" = $4,
           "isMember" = $5,
           "updatedAt" = NOW()
       WHERE "id" = $6
       RETURNING "id", "username", "email", "phone", "address", "role", "isMember", "membershipStatus", "createdAt", "updatedAt"`,
      [
        name ? String(name).trim() : existing.username,
        phone === undefined ? existing.phone : phone,
        address === undefined ? existing.address : address,
        membershipStatus === undefined ? existing.membershipStatus : membershipStatus,
        isMember === undefined ? existing.isMember : Boolean(isMember),
        customerId,
      ]
    );

    res.status(200).json({
      message: 'Profil pelanggan berhasil diperbarui.',
      data: {
        ...toCustomerPayload(updatedResult.rows[0]),
        role: 'customer',
      },
    });
  } catch (error) {
    next(error);
  }
};

const getAllCustomers = async (req, res, next) => {
  try {
    const result = await getAllCustomersWithSummary();

    const data = result.rows.map((row) => ({
      id: row.id,
      name: row.username,
      email: row.email,
      phone: row.phone,
      address: row.address,
      membershipStatus: row.membershipStatus ?? row.membershipstatus,
      isMember: row.isMember ?? row.ismember,
      membershipDate: row.createdAt ?? row.createdat,
      totalPurchase: Number(row.totalPurchase ?? row.totalpurchase ?? 0),
    }));

    res.status(200).json({
      message: 'Data semua pelanggan berhasil diambil.',
      data,
      total: data.length,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  registerCustomer,
  getCustomerProfile,
  updateCustomerProfile,
  getAllCustomers,
};
