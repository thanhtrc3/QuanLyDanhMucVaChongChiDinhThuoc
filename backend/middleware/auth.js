const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    if (!authHeader) return res.status(401).json({ message: 'Không tìm thấy Token xác thực' });

    const token = authHeader.split(' ')[1]; // Format: Bearer <token>
    if (!token) return res.status(401).json({ message: 'Token không hợp lệ' });

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'NHOM9_SECRET_KEY');
        req.user = decoded; // Gắn userId và vaiTro vào req để các API sau sử dụng
        next();
    } catch (err) {
        res.status(403).json({ message: 'Token đã hết hạn hoặc bị sai lệch' });
    }
};

const checkRole = (roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.vaiTro)) {
            return res.status(403).json({ message: 'Bạn không có quyền (Role) để thực hiện thao tác này' });
        }
        next();
    };
};

module.exports = { verifyToken, checkRole };
