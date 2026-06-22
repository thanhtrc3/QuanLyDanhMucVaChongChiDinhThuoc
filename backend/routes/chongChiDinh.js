const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');

// Lấy danh sách quy tắc chống chỉ định
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT ccd.id, t.tenThuongMai, ccd.loaiBenh, ccd.mucDoCanhBao, ccd.moTa 
      FROM ChongChiDinh ccd
      JOIN Thuoc t ON ccd.thuocID = t.thuocID
    `);
    res.json(result.recordset);
  } catch (error) {
    // Nếu bảng chưa tồn tại thì trả về rỗng
    res.json([]); 
  }
});

// Thêm mới quy tắc CCĐ (Chỉ Admin hoặc Bác sĩ được thêm)
router.post('/', verifyToken, checkRole(['Admin', 'BacSi']), async (req, res) => {
    const { thuocID, loaiBenh, mucDoCanhBao, moTa } = req.body;
    try {
        const pool = await poolPromise;
        
        // 1. Đảm bảo bảng đã tồn tại (Giữ nguyên logic cũ)
        await pool.request().query(`
            IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChongChiDinh' and xtype='U')
            CREATE TABLE ChongChiDinh (
                id INT IDENTITY(1,1) PRIMARY KEY,
                thuocID INT,
                loaiBenh NVARCHAR(150),
                mucDoCanhBao VARCHAR(20),
                moTa NVARCHAR(500)
            );
        `);

        // 2. TÍCH HỢP QCD-62: Logic chặn nhập trùng Rule
        const checkDuplicate = await pool.request()
            .input('thuocID', sql.Int, thuocID)
            .input('loaiBenh', sql.NVarChar(150), loaiBenh)
            .query(`
                SELECT COUNT(*) as count 
                FROM ChongChiDinh 
                WHERE thuocID = @thuocID AND loaiBenh = @loaiBenh
            `);

        if (checkDuplicate.recordset[0].count > 0) {
            // Chặn ngay lập tức nếu phát hiện mâu thuẫn/trùng lặp
            return res.status(400).json({ 
                message: 'Lỗi: Quy tắc chống chỉ định cho bệnh này đã tồn tại trên thuốc này! Vui lòng kiểm tra lại.' 
            });
        }

        // 3. TÍCH HỢP QCD-63: Insert data bao gồm cả Mức độ cảnh báo (Đỏ/Vàng)
        await pool.request()
            .input('thuocID', sql.Int, thuocID)
            .input('loaiBenh', sql.NVarChar(150), loaiBenh)
            .input('mucDoCanhBao', sql.VarChar(20), mucDoCanhBao) 
            .input('moTa', sql.NVarChar(500), moTa)
            .query(`
                INSERT INTO ChongChiDinh (thuocID, loaiBenh, mucDoCanhBao, moTa)
                VALUES (@thuocID, @loaiBenh, @mucDoCanhBao, @moTa)
            `);

        res.status(201).json({ message: 'Thêm Chống chỉ định thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

module.exports = router;