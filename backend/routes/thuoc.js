const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');

// Lấy danh sách thuốc
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT * FROM Thuoc');
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tìm kiếm thuốc theo từ khóa
router.get('/search', async (req, res) => {
  const keyword = req.query.q || '';
  try {
    const pool = await poolPromise;
    const result = await pool.request()
        .input('keyword', sql.NVarChar(150), `%${keyword}%`)
        .query('SELECT * FROM Thuoc WHERE tenThuongMai LIKE @keyword OR maATC LIKE @keyword');
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tìm kiếm' });
  }
});

// Thêm thuốc mới (Chỉ Admin hoặc Bác sĩ)
router.post('/', verifyToken, checkRole(['Admin', 'BacSi']), async (req, res) => {
  const { maATC, tenThuongMai, hoatChat, hamLuong, donViTinh, tonKhoHienTai, tonToiThieu, ngaySanXuat, ngayHetHan } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('maATC', sql.VarChar(20), maATC)
      .input('tenThuongMai', sql.NVarChar(150), tenThuongMai)
      .input('hoatChat', sql.NVarChar(150), hoatChat)
      .input('hamLuong', sql.NVarChar(50), hamLuong)
      .input('donViTinh', sql.NVarChar(20), donViTinh)
      .input('tonKhoHienTai', sql.Int, tonKhoHienTai || 0)
      .input('tonToiThieu', sql.Int, tonToiThieu || 0)
      .input('ngaySanXuat', sql.Date, ngaySanXuat || null)
      .input('ngayHetHan', sql.Date, ngayHetHan)
      .query(`
        INSERT INTO Thuoc (maATC, tenThuongMai, hoatChat, hamLuong, donViTinh, tonKhoHienTai, tonToiThieu, ngaySanXuat, ngayHetHan) 
        OUTPUT INSERTED.thuocID
        VALUES (@maATC, @tenThuongMai, @hoatChat, @hamLuong, @donViTinh, @tonKhoHienTai, @tonToiThieu, @ngaySanXuat, @ngayHetHan)
      `);
    
    res.status(201).json({ id: result.recordset[0].thuocID, message: 'Thêm thuốc thành công' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server hoặc trùng mã ATC' });
  }
});

// Cập nhật thuốc (Chỉ Admin hoặc Bác sĩ)
router.put('/:id', verifyToken, checkRole(['Admin', 'BacSi']), async (req, res) => {
    const thuocID = req.params.id;

    const { tenThuongMai, hoatChat, hamLuong, donViTinh, tonKhoHienTai, ngayHetHan } = req.body;
    
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('thuocID', sql.Int, thuocID)
            .input('tenThuongMai', sql.NVarChar(150), tenThuongMai)
            .input('hoatChat', sql.NVarChar(150), hoatChat)
            .input('hamLuong', sql.NVarChar(50), hamLuong)
            .input('donViTinh', sql.NVarChar(20), donViTinh)
            .input('tonKhoHienTai', sql.Int, tonKhoHienTai)
            .input('ngayHetHan', sql.Date, ngayHetHan)
            .query(`
                UPDATE Thuoc 
                SET tenThuongMai = @tenThuongMai, hoatChat = @hoatChat, hamLuong = @hamLuong, 
                    donViTinh = @donViTinh, tonKhoHienTai = @tonKhoHienTai, ngayHetHan = @ngayHetHan
                WHERE thuocID = @thuocID
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thuốc' });
        }
        res.json({ message: 'Cập nhật thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Xóa thuốc (Chỉ dành cho Admin)
router.delete('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
    const thuocID = req.params.id;

    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('thuocID', sql.Int, thuocID)
            .query('DELETE FROM Thuoc WHERE thuocID = @thuocID');

        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy thuốc để xóa' });
        }
        res.json({ message: 'Đã xóa thuốc thành công' });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Không thể xóa do thuốc đang bị ràng buộc (đã bán hoặc nằm trong chống chỉ định)' });
    }
});

module.exports = router;
