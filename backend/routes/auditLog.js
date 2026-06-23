const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { verifyToken } = require('../middleware/auth');

// Lấy danh sách Audit Log (kèm tên người dùng)
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        a.logID, a.userID, ISNULL(n.hoTen, N'Hệ thống') AS tenNguoiDung,
        a.hanhDong, a.tenBang AS bangDuLieu, a.thoiGian,
        a.giaTriCu, a.giaTriMoi, a.lyDoOverride
      FROM AuditLog a
      LEFT JOIN NguoiDung n ON a.userID = n.userID
      ORDER BY a.thoiGian DESC
    `);
    res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi khi lấy Audit Log:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy Audit Log', error: error.message });
  }
});

// Ghi một mục Audit Log mới
router.post('/', verifyToken, async (req, res) => {
  const { bangDuLieu, hanhDong, giaTriCu, giaTriMoi, lyDoOverride } = req.body;
  const userID = req.user?.userId;
  if (!bangDuLieu || !hanhDong) {
    return res.status(400).json({ message: 'Thiếu thông tin log.' });
  }
  try {
    const pool = await poolPromise;
    await pool.request()
      .input('userID', sql.Int, userID || null)
      .input('tenBang', sql.NVarChar(100), bangDuLieu)
      .input('hanhDong', sql.NVarChar(50), hanhDong)
      .input('giaTriCu', sql.NVarChar(sql.MAX), giaTriCu || '')
      .input('giaTriMoi', sql.NVarChar(sql.MAX), giaTriMoi || '')
      .input('lyDoOverride', sql.NVarChar(500), lyDoOverride || '')
      .query(`
        INSERT INTO AuditLog (userID, tenBang, hanhDong, giaTriCu, giaTriMoi, lyDoOverride)
        VALUES (@userID, @tenBang, @hanhDong, @giaTriCu, @giaTriMoi, @lyDoOverride)
      `);
    res.json({ message: 'Đã ghi log.' });
  } catch (error) {
    console.error('Lỗi khi ghi Audit Log:', error);
    res.status(500).json({ message: error.message || 'Lỗi server khi ghi Audit Log.' });
  }
});

module.exports = router;
