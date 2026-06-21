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
        await pool.request()
            .input('thuocID', sql.Int, thuocID)
            .input('loaiBenh', sql.NVarChar(150), loaiBenh)
            .input('mucDoCanhBao', sql.VarChar(20), mucDoCanhBao) // 'Đỏ' hoặc 'Vàng'
            .input('moTa', sql.NVarChar(500), moTa)
            .query(`
                IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='ChongChiDinh' and xtype='U')
                CREATE TABLE ChongChiDinh (
                    id INT IDENTITY(1,1) PRIMARY KEY,
                    thuocID INT,
                    loaiBenh NVARCHAR(150),
                    mucDoCanhBao VARCHAR(20),
                    moTa NVARCHAR(500)
                );
                
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
