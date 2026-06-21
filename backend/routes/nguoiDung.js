const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Lấy danh sách người dùng (Không lấy matKhauHash để bảo mật)
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT userId, tenDangNhap, hoTen, vaiTro, trangThai FROM NguoiDung');
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi lấy người dùng' });
  }
});

// API Đăng nhập
router.post('/login', async (req, res) => {
    const { tenDangNhap, matKhau } = req.body;
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('tenDangNhap', sql.VarChar(50), tenDangNhap)
            .query('SELECT * FROM NguoiDung WHERE tenDangNhap = @tenDangNhap');

        if (result.recordset.length === 0) {
            return res.status(401).json({ message: 'Tài khoản không tồn tại!' });
        }

        const user = result.recordset[0];

        // Kiểm tra mật khẩu: 
        // Nếu database chưa dùng bcrypt, so sánh chuỗi bằng (==). Đổi thành bcrypt.compare nếu sau này mã hóa.
        const isMatch = (matKhau === user.matKhauHash) || (await bcrypt.compare(matKhau, user.matKhauHash).catch(()=>false));

        if (!isMatch) {
            return res.status(401).json({ message: 'Sai mật khẩu!' });
        }

        if (user.trangThai === 0) {
            return res.status(403).json({ message: 'Tài khoản đã bị khóa!' });
        }

        // Ký token JWT
        const token = jwt.sign(
            { userId: user.userId, vaiTro: user.vaiTro },
            process.env.JWT_SECRET || 'NHOM9_SECRET_KEY',
            { expiresIn: '1d' }
        );

        res.json({
            message: 'Đăng nhập thành công',
            token,
            user: { userId: user.userId, tenDangNhap: user.tenDangNhap, hoTen: user.hoTen, vaiTro: user.vaiTro }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;
