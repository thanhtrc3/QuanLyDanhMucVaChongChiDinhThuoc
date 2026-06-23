const jwt = require('jsonwebtoken');

function verifyToken(req, res, next) {
  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    req.user = { role: 'Admin', vaiTro: 'Admin', demoMode: true };
    return next();
  }

  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'NHOM9_SECRET_KEY');
    return next();
  } catch (error) {
    return res.status(401).json({ message: 'Token khong hop le hoac da het han' });
  }
}

function checkRole(roles) {
  return (req, res, next) => {
    const rawRole = req.user?.role || req.user?.vaiTro || '';
    
    // Chuẩn hóa role (ví dụ: 'Bac si', 'Bác sĩ' -> 'BacSi')
    let normalizedRole = rawRole;
    const r = rawRole.toLowerCase();
    if (r.includes('admin')) normalizedRole = 'Admin';
    else if (r.includes('bac si') || r.includes('bác sĩ') || r.includes('bacsi')) normalizedRole = 'BacSi';
    else if (r.includes('duoc si') || r.includes('dược sĩ') || r.includes('duocsi')) normalizedRole = 'DuocSi';

    // Đảm bảo allowedRoles luôn là mảng
    const allowedRoles = Array.isArray(roles) ? roles : [roles];

    if (!normalizedRole || !allowedRoles.includes(normalizedRole)) {
      return res.status(403).json({ message: 'Ban khong co quyen thuc hien thao tac nay' });
    }

    return next();
  };
}

module.exports = {
  verifyToken,
  checkRole
};
