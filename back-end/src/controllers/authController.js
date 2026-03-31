const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const ROLE_MAP = {
  admin: 'ADMIN',
  kasir: 'KASIR',
  customer: 'CUSTOMER',
};

const isMissingTableError = (error) => error && error.code === '42P01';

const verifyPassword = async (inputPassword, user) => {
  if (user.password_hash) {
    return bcrypt.compare(inputPassword, user.password_hash);
  }

  if (typeof user.password === 'string') {
    if (user.password.startsWith('$2a$') || user.password.startsWith('$2b$') || user.password.startsWith('$2y$')) {
      return bcrypt.compare(inputPassword, user.password);
    }

    return inputPassword === user.password;
  }

  return false;
};

const login = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;
    const normalizedRole = String(role || '').toLowerCase();
    const prismaRole = ROLE_MAP[normalizedRole];

    if (!email || !password || !normalizedRole) {
      return res.status(400).json({ message: 'Email, password, dan role harus diisi.' });
    }

    if (!prismaRole) {
      return res.status(400).json({ message: 'Role tidak valid.' });
    }

    let user;
    if (normalizedRole === 'customer') {
      try {
        const result = await pool.query('SELECT * FROM customers WHERE email = $1', [email]);
        user = result.rows[0];
      } catch (error) {
        if (!isMissingTableError(error)) {
          throw error;
        }
      }

      if (!user) {
        const result = await pool.query(
          'SELECT * FROM "User" WHERE role = $2 AND (email = $1 OR username = $1)',
          [email, prismaRole]
        );
        user = result.rows[0];
      }
    } else {
      try {
        const result = await pool.query('SELECT * FROM users WHERE username = $1 AND LOWER(role) = $2', [email, normalizedRole]);
        user = result.rows[0];
      } catch (error) {
        if (!isMissingTableError(error)) {
          throw error;
        }
      }

      if (!user) {
        const result = await pool.query('SELECT * FROM "User" WHERE username = $1 AND role = $2', [email, prismaRole]);
        user = result.rows[0];
      }
    }

    if (!user) {
      return res.status(401).json({ message: 'Kredensial tidak valid.' });
    }

    const isPasswordMatch = await verifyPassword(password, user);
    if (!isPasswordMatch) {
      return res.status(401).json({ message: 'Kredensial tidak valid.' });
    }

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.status(200).json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        name: user.name || user.username,
        username: user.username || null,
        email: user.email || null,
        role: String(user.role || '').toLowerCase(),
      },
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    res.status(200).json({ message: 'Link untuk reset password telah dikirim ke email Anda.', email });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body; // Token dari email, password baru
    res.status(200).json({ message: 'Password berhasil direset.', token });
  } catch (error) {
    next(error);
  }
};

const logout = async (req, res, next) => {
  try {
    // Di sini Anda akan menghapus sesi atau token pengguna
    res.status(200).json({ message: 'Logout berhasil!' });
  } catch (error) {
    next(error);
  }
};

const me = async (req, res, next) => {
  try {
    const userResult = await pool.query(
      'SELECT "id", "username", "email", "role" FROM "User" WHERE "id" = $1 LIMIT 1',
      [req.user.id]
    );

    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    const user = userResult.rows[0];
    return res.status(200).json({
      message: 'Sesi valid.',
      user: {
        id: user.id,
        name: user.username,
        username: user.username,
        email: user.email,
        role: String(user.role || '').toLowerCase(),
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  logout,
  me,
};