const pool = require('../config/database');
const bcrypt = require('bcryptjs');
const { sendMail } = require('../config/mailer');
const {
  otpVerificationTemplate,
  emailChangedNotificationTemplate,
  passwordChangedNotificationTemplate,
} = require('../emails');

// ─── In-memory OTP store ────────────────────────────────────────
// Key  : `${userId}:${action}`   e.g.  "3:change-email"
// Value: { code, payload, expiresAt }
const otpStore = new Map();

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes
const OTP_LENGTH = 6;

const generateOtp = () => {
  let otp = '';
  for (let i = 0; i < OTP_LENGTH; i++) {
    otp += Math.floor(Math.random() * 10);
  }
  return otp;
};

const buildOtpKey = (userId, action) => `${userId}:${action}`;

const cleanExpiredOtps = () => {
  const now = Date.now();
  for (const [key, value] of otpStore.entries()) {
    if (value.expiresAt < now) {
      otpStore.delete(key);
    }
  }
};

// Run cleanup every 5 minutes
setInterval(cleanExpiredOtps, 5 * 60 * 1000);

// ─── 1. Request OTP for Email Change ────────────────────────────
const requestEmailChangeOtp = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const { newEmail } = req.body;

    if (!newEmail || !/^\S+@\S+\.\S+$/.test(newEmail)) {
      return res.status(400).json({ message: 'Email baru tidak valid.' });
    }

    // Get current user info
    const userResult = await pool.query(
      'SELECT "id", "email" FROM "users" WHERE "id" = $1',
      [userId]
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    const currentEmail = userResult.rows[0].email;
    if (newEmail.toLowerCase() === (currentEmail || '').toLowerCase()) {
      return res.status(400).json({ message: 'Email baru sama dengan email saat ini.' });
    }

    // Check if newEmail is already taken
    const emailExists = await pool.query(
      'SELECT "id" FROM "users" WHERE LOWER("email") = LOWER($1) AND "id" != $2',
      [newEmail, userId]
    );
    if (emailExists.rowCount > 0) {
      return res.status(409).json({ message: 'Email sudah digunakan oleh akun lain.' });
    }

    // Generate and store OTP
    const code = generateOtp();
    const key = buildOtpKey(userId, 'change-email');
    otpStore.set(key, {
      code,
      payload: { newEmail, oldEmail: currentEmail },
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    // Send OTP to current email
    const targetEmail = currentEmail || newEmail;
    try {
      await sendMail({
        to: targetEmail,
        subject: 'Kode Verifikasi - Perubahan Email',
        text: `Kode verifikasi Anda: ${code}. Berlaku 5 menit.`,
        html: otpVerificationTemplate(code, 'change-email'),
      });
    } catch (mailErr) {
      console.error('[VERIFY] SMTP send failed, OTP still stored:', mailErr.message);
      // Don't fail the request – user can still use the code (logged in console for dev)
      console.log(`[VERIFY][DEV] OTP for user ${userId} change-email: ${code}`);
    }

    res.status(200).json({
      message: `Kode verifikasi telah dikirim ke ${targetEmail}.`,
      // In development mode, also return the code for testing convenience
      ...(process.env.NODE_ENV === 'development' ? { _devCode: code } : {}),
    });
  } catch (error) {
    next(error);
  }
};

// ─── 2. Verify OTP & Change Email ───────────────────────────────
const verifyAndChangeEmail = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const { verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({ message: 'Kode verifikasi wajib diisi.' });
    }

    const key = buildOtpKey(userId, 'change-email');
    const stored = otpStore.get(key);

    if (!stored) {
      return res.status(400).json({ message: 'Belum ada permintaan perubahan email atau kode sudah kedaluwarsa. Silakan minta kode baru.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ message: 'Kode verifikasi sudah kedaluwarsa. Silakan minta kode baru.' });
    }

    if (stored.code !== String(verificationCode).trim()) {
      return res.status(400).json({ message: 'Kode verifikasi salah.' });
    }

    // Apply the email change
    const { newEmail, oldEmail } = stored.payload;
    const updateResult = await pool.query(
      `UPDATE "users" SET "email" = $1, "updatedAt" = NOW() WHERE "id" = $2
       RETURNING "id", "username", "email", "phone", "address", "role", "isMember", "membershipStatus", "createdAt", "updatedAt"`,
      [newEmail, userId]
    );

    otpStore.delete(key);

    // Send notification to OLD email (non-blocking)
    if (oldEmail) {
      sendMail({
        to: oldEmail,
        subject: 'Email Akun Anda Telah Diubah',
        text: `Email akun Anda telah diubah dari ${oldEmail} ke ${newEmail}. Jika bukan Anda, segera hubungi kami.`,
        html: emailChangedNotificationTemplate(oldEmail, newEmail),
      }).catch((err) => console.error('[VERIFY] Failed to send email-changed notification:', err.message));
    }

    const user = updateResult.rows[0];
    res.status(200).json({
      message: 'Email berhasil diperbarui!',
      data: {
        id: user.id,
        name: user.username,
        email: user.email,
        phone: user.phone,
        address: user.address,
        role: String(user.role || '').toLowerCase(),
        isMember: user.isMember,
        membershipStatus: user.membershipStatus,
      },
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ message: 'Email sudah digunakan oleh akun lain.' });
    }
    next(error);
  }
};

// ─── 3. Request OTP for Password Change ─────────────────────────
const requestPasswordChangeOtp = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: 'Password saat ini, password baru, dan konfirmasi harus diisi.' });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: 'Konfirmasi password tidak cocok.' });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: 'Password baru minimal 6 karakter.' });
    }

    // Get current user
    const userResult = await pool.query(
      'SELECT "id", "email", "password" FROM "users" WHERE "id" = $1',
      [userId]
    );
    if (userResult.rowCount === 0) {
      return res.status(404).json({ message: 'User tidak ditemukan.' });
    }

    const user = userResult.rows[0];

    // Verify current password
    const storedPassword = user.password;
    let isMatch = false;
    if (storedPassword.startsWith('$2a$') || storedPassword.startsWith('$2b$') || storedPassword.startsWith('$2y$')) {
      isMatch = await bcrypt.compare(currentPassword, storedPassword);
    } else {
      isMatch = currentPassword === storedPassword;
    }

    if (!isMatch) {
      return res.status(401).json({ message: 'Password saat ini salah.' });
    }

    // Hash new password ahead of time
    const newPasswordHash = await bcrypt.hash(newPassword, 10);

    // Generate and store OTP
    const code = generateOtp();
    const key = buildOtpKey(userId, 'change-password');
    otpStore.set(key, {
      code,
      payload: { newPasswordHash },
      expiresAt: Date.now() + OTP_EXPIRY_MS,
    });

    // Send OTP to user email
    const targetEmail = user.email;
    if (targetEmail) {
      try {
        await sendMail({
          to: targetEmail,
          subject: 'Kode Verifikasi - Perubahan Password',
          text: `Kode verifikasi Anda: ${code}. Berlaku 5 menit.`,
          html: otpVerificationTemplate(code, 'change-password'),
        });
      } catch (mailErr) {
        console.error('[VERIFY] SMTP send failed, OTP still stored:', mailErr.message);
        console.log(`[VERIFY][DEV] OTP for user ${userId} change-password: ${code}`);
      }
    } else {
      console.log(`[VERIFY][DEV] No email on file. OTP for user ${userId} change-password: ${code}`);
    }

    res.status(200).json({
      message: `Kode verifikasi telah dikirim ke ${targetEmail || 'email Anda'}.`,
      ...(process.env.NODE_ENV === 'development' ? { _devCode: code } : {}),
    });
  } catch (error) {
    next(error);
  }
};

// ─── 4. Verify OTP & Change Password ───────────────────────────
const verifyAndChangePassword = async (req, res, next) => {
  try {
    const userId = Number(req.user?.id);
    const { verificationCode } = req.body;

    if (!verificationCode) {
      return res.status(400).json({ message: 'Kode verifikasi wajib diisi.' });
    }

    const key = buildOtpKey(userId, 'change-password');
    const stored = otpStore.get(key);

    if (!stored) {
      return res.status(400).json({ message: 'Belum ada permintaan perubahan password atau kode sudah kedaluwarsa. Silakan minta kode baru.' });
    }

    if (Date.now() > stored.expiresAt) {
      otpStore.delete(key);
      return res.status(400).json({ message: 'Kode verifikasi sudah kedaluwarsa. Silakan minta kode baru.' });
    }

    if (stored.code !== String(verificationCode).trim()) {
      return res.status(400).json({ message: 'Kode verifikasi salah.' });
    }

    // Apply the password change
    const { newPasswordHash } = stored.payload;
    await pool.query(
      'UPDATE "users" SET "password" = $1, "updatedAt" = NOW() WHERE "id" = $2',
      [newPasswordHash, userId]
    );

    otpStore.delete(key);

    // Send notification email (non-blocking)
    const emailResult = await pool.query(
      'SELECT "email" FROM "users" WHERE "id" = $1',
      [userId]
    );
    const userEmail = emailResult.rows[0]?.email;
    if (userEmail) {
      sendMail({
        to: userEmail,
        subject: 'Password Akun Anda Telah Diubah',
        text: `Password akun ${userEmail} telah berhasil diubah. Jika bukan Anda, segera hubungi kami.`,
        html: passwordChangedNotificationTemplate(userEmail),
      }).catch((err) => console.error('[VERIFY] Failed to send password-changed notification:', err.message));
    }

    res.status(200).json({ message: 'Password berhasil diperbarui!' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestEmailChangeOtp,
  verifyAndChangeEmail,
  requestPasswordChangeOtp,
  verifyAndChangePassword,
};
