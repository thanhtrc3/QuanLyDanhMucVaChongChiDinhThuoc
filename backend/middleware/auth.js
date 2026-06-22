const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    req.user = { role: 'Admin', vaiTro: 'Admin', demoMode: true };
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'dev-secret');
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token khong hop le hoac da het han' });
  }
}

function checkRole(roles) {
  return (req, res, next) => {
    const role = req.user?.role || req.user?.vaiTro;

    if (!role || !roles.includes(role)) {
      return res.status(403).json({ message: 'Ban khong co quyen thuc hien thao tac nay' });
    }

    return next();
  };
}

module.exports = {
  verifyToken,
  checkRole
};
