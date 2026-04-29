const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sendMail } = require('../config/mailer');

const ROLE_MAP = {
  admin: 'ADMIN',
  kasir: 'KASIR',
  customer: 'CUSTOMER',
  owner: 'OWNER',
};

// ─── In-memory OTP store for password resets ────────────────────
const resetOtpStore = new Map();
const RESET_OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const RESET_OTP_LENGTH = 6;

const generateResetOtp = () => {
  let otp = '';
  for (let i = 0; i < RESET_OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

// Cleanup expired reset OTPs every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of resetOtpStore.entries()) {
    if (value.expiresAt < now) resetOtpStore.delete(key);
  }
}, 5 * 60 * 1000);

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
    const mappedRole = ROLE_MAP[normalizedRole];

    if (!email || !password || !normalizedRole) {
      return res.status(400).json({ message: 'Email, password, dan role harus diisi.' });
    }

    if (!mappedRole) {
      return res.status(400).json({ message: 'Role tidak valid.' });
    }

    let user;
    if (normalizedRole === 'customer') {
      const result = await pool.query(
        'SELECT * FROM "users" WHERE LOWER(CAST("role" AS text)) = $2 AND ("email" = $1 OR "username" = $1)',
        [email, normalizedRole]
      );
      user = result.rows[0];
    } else {
      const result = await pool.query(
        'SELECT * FROM "users" WHERE "username" = $1 AND LOWER(CAST("role" AS text)) = $2',
        [email, normalizedRole]
      );
      user = result.rows[0];
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

    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      return res.status(400).json({ message: 'Alamat email tidak valid.' });
    }

    // Find user by email (customer only for this flow)
    const result = await pool.query(
      'SELECT "id", "email" FROM "users" WHERE LOWER("email") = LOWER($1) AND LOWER(CAST("role" AS text)) = $2',
      [email, 'customer']
    );

    // Always return success to prevent email enumeration
    if (result.rowCount === 0) {
      return res.status(200).json({
        message: 'Jika email terdaftar, kode verifikasi telah dikirim.',
      });
    }

    const user = result.rows[0];

    // Generate OTP
    const code = generateResetOtp();
    const key = `reset:${user.id}`;
    resetOtpStore.set(key, {
      code,
      email: user.email,
      expiresAt: Date.now() + RESET_OTP_EXPIRY_MS,
    });

    // Send OTP email
    try {
      const { passwordResetOtpTemplate } = require('../emails');
      await sendMail({
        to: user.email,
        subject: 'Kode Reset Password - Apotek Pemuda Farma',
        text: `Kode verifikasi untuk reset password Anda: ${code}. Berlaku 5 menit.`,
        html: passwordResetOtpTemplate(code),
      });
    } catch (mailErr) {
      console.error('[AUTH] SMTP send failed for reset OTP:', mailErr.message);
      console.log(`[AUTH][DEV] Reset OTP for user ${user.id}: ${code}`);
    }

    res.status(200).json({
      message: 'Jika email terdaftar, kode verifikasi telah dikirim.',
      ...(process.env.NODE_ENV === 'development' ? { _devCode: code, _userId: user.id } : {}),
    });
  } catch (error) {
    next(error);
  }
};

const verifyResetOtp = async (req, res, next) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({ message: 'Email dan kode verifikasi wajib diisi.' });
    }

    // Find user
    const result = await pool.query(
      'SELECT "id" FROM "users" WHERE LOWER("email") = LOWER($1) AND LOWER(CAST("role" AS text)) = $2',
      [email, 'customer']
    );
    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Kode verifikasi tidak valid.' });
    }

    const userId = result.rows[0].id;
    const key = `reset:${userId}`;
    const stored = resetOtpStore.get(key);

    if (!stored) {
      return res.status(400).json({ message: 'Kode verifikasi sudah kedaluwarsa atau belum diminta. Silakan minta kode baru.' });
    }
    if (Date.now() > stored.expiresAt) {
      resetOtpStore.delete(key);
      return res.status(400).json({ message: 'Kode verifikasi sudah kedaluwarsa. Silakan minta kode baru.' });
    }
    if (stored.code !== String(code).trim()) {
      return res.status(400).json({ message: 'Kode verifikasi salah.' });
    }

    // Mark OTP as verified (allow password reset within 10 minutes)
    stored.verified = true;
    stored.verifiedAt = Date.now();

    res.status(200).json({ message: 'Kode verifikasi valid. Silakan masukkan password baru.' });
  } catch (error) {
    next(error);
  }
};

const resetPassword = async (req, res, next) => {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;

    if (!email || !code || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Semua field wajib diisi.' });
    }
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Konfirmasi password tidak cocok.' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
    }

    // Find user
    const result = await pool.query(
      'SELECT "id", "email" FROM "users" WHERE LOWER("email") = LOWER($1) AND LOWER(CAST("role" AS text)) = $2',
      [email, 'customer']
    );
    if (result.rowCount === 0) {
      return res.status(400).json({ message: 'Permintaan tidak valid.' });
    }

    const userId = result.rows[0].id;
    const key = `reset:${userId}`;
    const stored = resetOtpStore.get(key);

    if (!stored || !stored.verified) {
      return res.status(400).json({ message: 'Kode verifikasi belum diverifikasi. Silakan verifikasi kode terlebih dahulu.' });
    }
    if (stored.code !== String(code).trim()) {
      return res.status(400).json({ message: 'Kode verifikasi tidak valid.' });
    }
    // Check verified window (10 minutes)
    if (Date.now() - stored.verifiedAt > 10 * 60 * 1000) {
      resetOtpStore.delete(key);
      return res.status(400).json({ message: 'Sesi reset password sudah kedaluwarsa. Silakan mulai ulang.' });
    }

    // Hash and save new password
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    await pool.query(
      'UPDATE "users" SET "password" = $1, "updatedAt" = NOW() WHERE "id" = $2',
      [newPasswordHash, userId]
    );

    resetOtpStore.delete(key);

    // Send notification (non-blocking)
    const { passwordChangedNotificationTemplate } = require('../emails');
    sendMail({
      to: result.rows[0].email,
      subject: 'Password Akun Anda Telah Diubah',
      text: `Password akun ${result.rows[0].email} telah berhasil diubah. Jika bukan Anda, segera hubungi kami.`,
      html: passwordChangedNotificationTemplate(result.rows[0].email),
    }).catch((err) => console.error('[AUTH] Failed to send password-changed notification:', err.message));

    res.status(200).json({ message: 'Password berhasil direset! Silakan login dengan password baru Anda.' });
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
      'SELECT "id", "username", "email", "role" FROM "users" WHERE "id" = $1 LIMIT 1',
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
  verifyResetOtp,
  resetPassword,
  logout,
  me,
};