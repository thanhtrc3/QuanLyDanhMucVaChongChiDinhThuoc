const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Lấy danh sách người dùng (Không lấy matKhauHash để bảo mật)
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT userId AS id, tenDangNhap, hoTen, vaiTro, trangThai, email, ngayTao FROM NguoiDung WHERE isDeleted = 0');
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
            .query('SELECT * FROM NguoiDung WHERE tenDangNhap = @tenDangNhap AND isDeleted = 0');

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

        if (user.trangThai === 0 || user.trangThai === false) {
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
            user: { id: user.userId, tenDangNhap: user.tenDangNhap, hoTen: user.hoTen, vaiTro: user.vaiTro, email: user.email }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// API Đăng ký người dùng mới (Hash mật khẩu)
router.post('/register', async (req, res) => {
    const { tenDangNhap, matKhau, hoTen, vaiTro } = req.body;
    
    if (!tenDangNhap || !matKhau) {
        return res.status(400).json({ message: 'Vui lòng cung cấp tên đăng nhập và mật khẩu!' });
    }

    try {
        const pool = await poolPromise;
        
        // 1. Kiểm tra tài khoản đã tồn tại chưa
        const checkUser = await pool.request()
            .input('tenDangNhap', sql.VarChar(50), tenDangNhap)
            .query('SELECT userId FROM NguoiDung WHERE tenDangNhap = @tenDangNhap');
            
        if (checkUser.recordset.length > 0) {
            return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại!' });
        }

        // 2. Mã hóa (Hash) mật khẩu bằng bcrypt
        const salt = await bcrypt.genSalt(10);
        const matKhauHash = await bcrypt.hash(matKhau, salt);

        // 3. Lưu vào Cơ sở dữ liệu
        await pool.request()
            .input('tenDangNhap', sql.VarChar(50), tenDangNhap)
            .input('matKhauHash', sql.VarChar(255), matKhauHash)
            .input('hoTen', sql.NVarChar(100), hoTen || '')
            .input('vaiTro', sql.NVarChar(50), vaiTro || 'Bac si')
            .input('trangThai', sql.Int, 1) // 1 là đang hoạt động
            .query(`
                INSERT INTO NguoiDung (tenDangNhap, matKhauHash, hoTen, vaiTro, trangThai)
                VALUES (@tenDangNhap, @matKhauHash, @hoTen, @vaiTro, @trangThai)
            `);

        res.status(201).json({ message: 'Tạo tài khoản thành công! Mật khẩu đã được mã hóa an toàn.' });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi tạo tài khoản' });
    }
});

const { verifyToken } = require('../middleware/auth');

// API Cập nhật profile cá nhân
router.put('/profile', verifyToken, async (req, res) => {
    const { hoTen, email, matKhauMoi } = req.body;
    const userId = req.user.userId;

    if (!hoTen) {
        return res.status(400).json({ message: 'Họ tên không được để trống.' });
    }

    try {
        const pool = await poolPromise;
        let query = 'UPDATE NguoiDung SET hoTen = @hoTen, email = @email';
        
        const request = pool.request()
            .input('userId', sql.Int, userId)
            .input('hoTen', sql.NVarChar(100), hoTen)
            .input('email', sql.NVarChar(100), email || null);

        if (matKhauMoi) {
            const salt = await bcrypt.genSalt(10);
            const matKhauHash = await bcrypt.hash(matKhauMoi, salt);
            query += ', matKhauHash = @matKhauHash';
            request.input('matKhauHash', sql.VarChar(255), matKhauHash);
        }

        query += ' WHERE userId = @userId';

        await request.query(query);

        res.json({ message: 'Cập nhật thông tin thành công.', user: { hoTen, email } });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi cập nhật profile' });
    }
});

// Thêm người dùng (Admin)
router.post('/', verifyToken, async (req, res) => {
    const { tenDangNhap, matKhau, hoTen, vaiTro, email } = req.body;
    if (!tenDangNhap || !matKhau || !hoTen) return res.status(400).json({ message: 'Thiếu thông tin bắt buộc' });
    try {
        const pool = await poolPromise;
        const check = await pool.request().input('tdn', sql.VarChar(50), tenDangNhap).query('SELECT userId FROM NguoiDung WHERE tenDangNhap = @tdn');
        if (check.recordset.length > 0) return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại' });
        
        const salt = await bcrypt.genSalt(10);
        const hash = await bcrypt.hash(matKhau, salt);
        await pool.request()
            .input('tdn', sql.VarChar(50), tenDangNhap).input('mk', sql.VarChar(255), hash)
            .input('ht', sql.NVarChar(100), hoTen).input('vt', sql.NVarChar(50), vaiTro || 'Bac si')
            .input('em', sql.NVarChar(100), email || '').input('tt', sql.Int, 1)
            .query('INSERT INTO NguoiDung (tenDangNhap, matKhauHash, hoTen, vaiTro, email, trangThai) VALUES (@tdn, @mk, @ht, @vt, @em, @tt)');
        res.status(201).json({ message: 'Thêm người dùng thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi thêm người dùng' });
    }
});

// Cập nhật người dùng (Admin)
router.put('/:id', verifyToken, async (req, res) => {
    const { hoTen, vaiTro, email } = req.body;
    if (!hoTen) return res.status(400).json({ message: 'Họ tên không được rỗng' });
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id).input('ht', sql.NVarChar(100), hoTen)
            .input('vt', sql.NVarChar(50), vaiTro || 'Bac si').input('em', sql.NVarChar(100), email || '')
            .query('UPDATE NguoiDung SET hoTen=@ht, vaiTro=@vt, email=@em WHERE userId=@id');
        res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi cập nhật người dùng' });
    }
});

// Khóa/Mở khóa người dùng (Admin)
router.put('/:id/status', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id).input('tt', sql.Int, req.body.trangThai ? 1 : 0)
            .query('UPDATE NguoiDung SET trangThai=@tt WHERE userId=@id');
        res.json({ message: 'Cập nhật trạng thái thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi cập nhật trạng thái' });
    }
});

// Xóa người dùng (Admin) - Soft Delete
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('UPDATE NguoiDung SET isDeleted = 1 WHERE userId=@id');
        res.json({ message: 'Xóa người dùng thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi xóa người dùng.' });
    }
});

module.exports = router;
