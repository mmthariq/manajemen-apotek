const pool = require('../config/database');
const bcrypt = require('bcryptjs');

const ROLE_MAP = {
  admin: 'ADMIN',
  kasir: 'KASIR',
  customer: 'CUSTOMER',
  staff: 'KASIR',
  owner: 'ADMIN',
};

const normalizeRole = (role) => ROLE_MAP[String(role || '').toLowerCase()] || null;

const mapUser = (row) => ({
  id: row.id,
  username: row.username,
  email: row.email,
  role: row.role,
  phone: row.phone,
  address: row.address,
  isMember: row.isMember ?? row.ismember,
  membershipStatus: row.membershipStatus ?? row.membershipstatus,
  createdAt: row.createdAt ?? row.createdat,
  updatedAt: row.updatedAt ?? row.updatedat,
});

const getAllUsers = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT "id", "username", "email", "role", "phone", "address", "isMember", "membershipStatus", "createdAt", "updatedAt" FROM "User" ORDER BY "id" DESC'
    );

    res.status(200).json({
      message: 'Data semua pengguna berhasil diambil.',
      data: result.rows.map(mapUser),
      total: result.rowCount,
    });
  } catch (error) {
    next(error);
  }
};

const createUser = async (req, res, next) => {
  try {
    const { name, username, email, password, role, phone, address, isMember, membershipStatus } = req.body;

    const resolvedUsername = (username || name || '').trim();
    const resolvedEmail = (email || '').trim() || null;
    const resolvedRole = normalizeRole(role || 'customer');

    if (!resolvedUsername || !password || !resolvedRole) {
      return res.status(400).json({
        message: 'Username/nama, password, dan role valid harus diisi.',
      });
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO "User" ("username", "email", "password", "role", "phone", "address", "isMember", "membershipStatus", "updatedAt")
       VALUES ($1, $2, $3, $4::"Role", $5, $6, $7, $8, NOW())
       RETURNING "id", "username", "email", "role", "phone", "address", "isMember", "membershipStatus", "createdAt", "updatedAt"`,
      [
        resolvedUsername,
        resolvedEmail,
        passwordHash,
        resolvedRole,
        phone || null,
        address || null,
        Boolean(isMember),
        membershipStatus || null,
      ]
    );

    res.status(201).json({
      message: 'Pengguna baru berhasil ditambahkan.',
      data: mapUser(result.rows[0]),
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Username atau email sudah digunakan.' });
    }
    if (error.code === '22P02') {
      return res.status(400).json({ message: 'Role tidak valid.' });
    }
    next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    const { idUser } = req.params;

    const result = await pool.query(
      'SELECT "id", "username", "email", "role", "phone", "address", "isMember", "membershipStatus", "createdAt", "updatedAt" FROM "User" WHERE "id" = $1',
      [idUser]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Pengguna dengan ID ${idUser} tidak ditemukan.` });
    }

    res.status(200).json({
      message: `Data pengguna dengan ID ${idUser} berhasil diambil.`,
      data: mapUser(result.rows[0]),
    });
  } catch (error) {
    next(error);
  }
};

const updateUser = async (req, res, next) => {
  try {
    const { idUser } = req.params;
    const { name, username, email, role, phone, address, isMember, membershipStatus, password } = req.body;

    const existingResult = await pool.query('SELECT * FROM "User" WHERE "id" = $1', [idUser]);
    if (existingResult.rowCount === 0) {
      return res.status(404).json({ message: `Pengguna dengan ID ${idUser} tidak ditemukan.` });
    }

    const existingUser = existingResult.rows[0];
    const nextRole = role ? normalizeRole(role) : existingUser.role;
    if (!nextRole) {
      return res.status(400).json({ message: 'Role tidak valid.' });
    }

    const nextPassword = password
      ? await bcrypt.hash(password, 10)
      : existingUser.password;

    const updatedResult = await pool.query(
      `UPDATE "User"
       SET "username" = $1,
           "email" = $2,
           "password" = $3,
           "role" = $4::"Role",
           "phone" = $5,
           "address" = $6,
           "isMember" = $7,
           "membershipStatus" = $8,
           "updatedAt" = NOW()
       WHERE "id" = $9
       RETURNING "id", "username", "email", "role", "phone", "address", "isMember", "membershipStatus", "createdAt", "updatedAt"`,
      [
        (username || name || existingUser.username || '').trim(),
        email === undefined ? existingUser.email : email,
        nextPassword,
        nextRole,
        phone === undefined ? existingUser.phone : phone,
        address === undefined ? existingUser.address : address,
        isMember === undefined ? (existingUser.isMember ?? existingUser.ismember) : Boolean(isMember),
        membershipStatus === undefined ? (existingUser.membershipStatus ?? existingUser.membershipstatus) : membershipStatus,
        idUser,
      ]
    );

    res.status(200).json({
      message: `Data pengguna dengan ID ${idUser} berhasil diperbarui.`,
      data: mapUser(updatedResult.rows[0]),
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Username atau email sudah digunakan.' });
    }
    if (error.code === '22P02') {
      return res.status(400).json({ message: 'Role tidak valid.' });
    }
    next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    const { idUser } = req.params;

    const result = await pool.query(
      'DELETE FROM "User" WHERE "id" = $1 RETURNING "id"',
      [idUser]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({ message: `Pengguna dengan ID ${idUser} tidak ditemukan.` });
    }

    res.status(200).json({ message: `Pengguna dengan ID ${idUser} berhasil dihapus.` });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllUsers,
  createUser,
  getUserById,
  updateUser,
  deleteUser,
};
