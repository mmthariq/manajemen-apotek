const login = async (req, res, next) => {
  try {
    const { email, password } = req.body; 
    res.status(200).json({ message: 'Login berhasil! Selamat datang.', email, password });
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

module.exports = {
  login,
  forgotPassword,
  resetPassword,
  logout,
};