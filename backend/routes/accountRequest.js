const express = require('express');
const { poolPromise, sql } = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');
const bcrypt = require('bcryptjs');

const router = express.Router();

// 1. Gửi yêu cầu xin cấp tài khoản (Public API)
router.post('/', async (req, res) => {
  const { tenDangNhap, hoTen, emailOrPhone, vaiTro, lyDo } = req.body;
  if (!tenDangNhap || !hoTen || !emailOrPhone || !vaiTro) {
    return res.status(400).json({ message: 'Vui lòng điền đủ thông tin.' });
  }
  if (tenDangNhap.length < 4) {
    return res.status(400).json({ message: 'Tên đăng nhập phải có ít nhất 4 ký tự.' });
  }

  try {
    const pool = await poolPromise;
    // Kiểm tra xem tên đăng nhập đã tồn tại trong NguoiDung chưa
    const checkUser = await pool.request()
      .input('tenDangNhap', sql.NVarChar(50), tenDangNhap)
      .query('SELECT 1 FROM NguoiDung WHERE tenDangNhap = @tenDangNhap');
    
    if (checkUser.recordset.length > 0) {
      return res.status(400).json({ message: 'Tên đăng nhập đã tồn tại trong hệ thống.' });
    }

    // Kiểm tra xem đã có yêu cầu nào đang chờ cho tên đăng nhập này chưa
    const checkReq = await pool.request()
      .input('tenDangNhap', sql.NVarChar(50), tenDangNhap)
      .query('SELECT 1 FROM AccountRequests WHERE tenDangNhap = @tenDangNhap AND trangThai = \'ChoDuyet\'');

    if (checkReq.recordset.length > 0) {
      return res.status(400).json({ message: 'Đã có yêu cầu xin cấp tài khoản đang chờ duyệt cho tên đăng nhập này.' });
    }

    await pool.request()
      .input('tenDangNhap', sql.NVarChar(50), tenDangNhap)
      .input('hoTen', sql.NVarChar(100), hoTen)
      .input('emailOrPhone', sql.NVarChar(100), emailOrPhone)
      .input('vaiTro', sql.NVarChar(50), vaiTro)
      .input('lyDo', sql.NVarChar(255), lyDo || '')
      .query(`
        INSERT INTO AccountRequests (tenDangNhap, hoTen, emailOrPhone, vaiTro, lyDo)
        VALUES (@tenDangNhap, @hoTen, @emailOrPhone, @vaiTro, @lyDo)
      `);

    return res.json({ message: 'Đã gửi yêu cầu cấp tài khoản thành công. Vui lòng chờ Admin phê duyệt.' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Lỗi server.' });
  }
});

// 2. Xem danh sách yêu cầu (Chỉ Admin)
router.get('/', verifyToken, checkRole('Admin'), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .query('SELECT * FROM AccountRequests ORDER BY ngayYeuCau DESC');
    return res.json(result.recordset);
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Lỗi server.' });
  }
});

// 3. Phê duyệt yêu cầu (Chỉ Admin)
router.put('/:id/approve', verifyToken, checkRole('Admin'), async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.userId;
  
  try {
    const pool = await poolPromise;
    
    // Lấy thông tin yêu cầu
    const reqInfo = await pool.request()
      .input('id', sql.Int, id)
      .query('SELECT * FROM AccountRequests WHERE requestID = @id AND trangThai = \'ChoDuyet\'');
      
    if (reqInfo.recordset.length === 0) {
      return res.status(404).json({ message: 'Không tìm thấy yêu cầu hoặc yêu cầu đã được xử lý.' });
    }
    
    const accountReq = reqInfo.recordset[0];
    
    if (accountReq.tenDangNhap.length < 4) {
      return res.status(400).json({ message: 'Tên đăng nhập của yêu cầu này quá ngắn (yêu cầu ≥ 4 ký tự). Không thể duyệt, vui lòng Từ chối.' });
    }
    
    // Tạo user mới với password mặc định là 123456
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const transaction = new sql.Transaction(pool);
    await transaction.begin();
    
    try {
      // 1. Tạo user
      const userReq = new sql.Request(transaction);
      await userReq
        .input('tenDangNhap', sql.VarChar(50), accountReq.tenDangNhap)
        .input('matKhauHash', sql.VarChar(255), hashedPassword)
        .input('hoTen', sql.NVarChar(100), accountReq.hoTen)
        .input('vaiTro', sql.NVarChar(50), accountReq.vaiTro)
        .query(`
          INSERT INTO NguoiDung (tenDangNhap, matKhauHash, hoTen, vaiTro)
          VALUES (@tenDangNhap, @matKhauHash, @hoTen, @vaiTro)
        `);
        
      // 2. Cập nhật trạng thái request
      const updateReq = new sql.Request(transaction);
      await updateReq
        .input('id', sql.Int, id)
        .input('adminId', sql.Int, adminId)
        .query(`
          UPDATE AccountRequests 
          SET trangThai = 'DaDuyet', ngayXuLy = GETDATE(), nguoiXuLyID = @adminId
          WHERE requestID = @id
        `);
        
      await transaction.commit();
      return res.json({ message: 'Đã phê duyệt và tạo tài khoản thành công. Mật khẩu mặc định: 123456' });
    } catch (txErr) {
      await transaction.rollback();
      if (txErr.message && txErr.message.includes('CK_NguoiDung_TenDangNhap')) {
        return res.status(400).json({ message: 'Tên đăng nhập không hợp lệ (phải từ 4 ký tự). Vui lòng Từ chối.' });
      }
      throw txErr;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: error.message || 'Lỗi server.' });
  }
});

// 4. Từ chối yêu cầu (Chỉ Admin)
router.put('/:id/reject', verifyToken, checkRole('Admin'), async (req, res) => {
  const { id } = req.params;
  const adminId = req.user.userId;
  
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('id', sql.Int, id)
      .input('adminId', sql.Int, adminId)
      .query(`
        UPDATE AccountRequests 
        SET trangThai = 'TuChoi', ngayXuLy = GETDATE(), nguoiXuLyID = @adminId
        WHERE requestID = @id AND trangThai = 'ChoDuyet'
      `);
    return res.json({ message: 'Đã từ chối yêu cầu.' });
  } catch (error) {
    return res.status(500).json({ message: error.message || 'Lỗi server.' });
  }
});

module.exports = router;
