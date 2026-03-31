const jwt = require('jsonwebtoken');

const extractBearerToken = (authHeader = '') => {
  if (!authHeader || typeof authHeader !== 'string') {
    return null;
  }

  const [scheme, token] = authHeader.split(' ');
  if (scheme !== 'Bearer' || !token) {
    return null;
  }

  return token;
};

const normalizeRole = (role) => String(role || '').toUpperCase();

const protect = (req, res, next) => {
  try {
    const token = extractBearerToken(req.headers.authorization);
    if (!token) {
      return res.status(401).json({ message: 'Token autentikasi tidak ditemukan.' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      role: normalizeRole(decoded.role),
    };

    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token tidak valid atau sudah kedaluwarsa.' });
  }
};

const restrictTo = (...allowedRoles) => (req, res, next) => {
  const normalizedAllowed = allowedRoles.map(normalizeRole);
  const currentRole = normalizeRole(req.user?.role);

  if (!normalizedAllowed.includes(currentRole)) {
    return res.status(403).json({ message: 'Anda tidak memiliki akses ke resource ini.' });
  }

  return next();
};

module.exports = {
  protect,
  restrictTo,
};
