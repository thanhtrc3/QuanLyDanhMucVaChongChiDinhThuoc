const express = require('express');
const { poolPromise, sql } = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

const { verifyToken, checkRole } = require('../middleware/auth');
const thuocService = require('../services/thuocService');
const { MEDICINE_CATEGORIES, MEDICINE_UNITS } = require('../constants/medicineCatalog');

const router = express.Router();

function handleRouteError(res, error, fallbackMessage) {
  console.error(error);
  return res.status(error.statusCode || 500).json({
    message: error.statusCode ? error.message : fallbackMessage,
    details: error.details || undefined
  });
}

router.get('/meta/options', (_req, res) => {
  return res.json({
    categories: MEDICINE_CATEGORIES,
    units: MEDICINE_UNITS
  });
});

router.get('/search', async (req, res) => {
  try {
    const items = await thuocService.searchThuoc({
      keyword: req.query.q || '',
      limit: req.query.limit
    });
    return res.json(items);
  } catch (error) {
    return handleRouteError(res, error, 'Loi tim kiem thuoc');
  }
});

router.get('/low-inventory', async (_req, res) => {
  try {
    const items = await thuocService.listThuoc({ keyword: '' });
    const lowInventory = items.filter((item) => (
      Number(item.tonKhoHienTai || 0) < Number(item.tonToiThieu || 0)
    ));

    return res.json({
      count: lowInventory.length,
      data: lowInventory
    });
  } catch (error) {
    return handleRouteError(res, error, 'Loi tinh toan ton toi thieu');
  }
});

router.get('/', async (req, res) => {
  const keyword = (req.query.q || '').trim();

  try {
    const pool = await poolPromise;
    const request = pool.request();
    let query = 'SELECT * FROM Thuoc ORDER BY tenThuongMai ASC';

    if (keyword) {
      request.input('keyword', sql.NVarChar(150), `%${keyword}%`);
      query = `
        SELECT *
        FROM Thuoc
        WHERE tenThuongMai LIKE @keyword
          OR maATC LIKE @keyword
          OR hoatChat LIKE @keyword
        ORDER BY tenThuongMai ASC
      `;
    }

    const result = await request.query(query);
    return res.json(result.recordset);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Loi lay danh sach thuoc' });
    const items = await thuocService.listThuoc({ keyword });
    return res.json(items);
  } catch (error) {
    return handleRouteError(res, error, 'Loi lay danh sach thuoc');
  }
});

router.get('/search', async (req, res) => {
  try {
    const items = await thuocService.searchThuoc({
      keyword: req.query.q || '',
      limit: req.query.limit
    });
    return res.json(items);
  } catch (error) {
    return handleRouteError(res, error, 'Loi tim kiem thuoc');
  }
});

router.get('/:id', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('thuocID', sql.Int, req.params.id)
      .query('SELECT * FROM Thuoc WHERE thuocID = @thuocID');

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Khong tim thay thuoc' });
    }

    return res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Loi lay chi tiet thuoc' });
    const medicine = await thuocService.getThuoc(req.params.id);

    if (!medicine) {
      return res.status(404).json({ message: 'Khong tim thay thuoc' });
    }

    return res.json(medicine);
  } catch (error) {
    return handleRouteError(res, error, 'Loi lay chi tiet thuoc');
  }
});

router.post('/', verifyToken, checkRole(['Admin', 'BacSi', 'DuocSi']), async (req, res) => {
  const {
    maATC,
    tenThuongMai,
    hoatChat,
    hamLuong,
    donViTinh,
    tonKhoHienTai,
    tonToiThieu,
    ngaySanXuat,
    ngayHetHan
  } = req.body;

  if (!maATC || !tenThuongMai || !hoatChat || !donViTinh) {
    return res.status(400).json({ message: 'Ma ATC, ten thuoc, hoat chat va don vi tinh la bat buoc' });
  }

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('maATC', sql.VarChar(20), maATC.trim().toUpperCase())
      .input('tenThuongMai', sql.NVarChar(150), tenThuongMai.trim())
      .input('hoatChat', sql.NVarChar(150), hoatChat.trim())
      .input('hamLuong', sql.NVarChar(50), hamLuong || null)
      .input('donViTinh', sql.NVarChar(20), donViTinh.trim())
      .input('tonKhoHienTai', sql.Int, toInt(tonKhoHienTai))
      .input('tonToiThieu', sql.Int, toInt(tonToiThieu))
      .input('ngaySanXuat', sql.Date, ngaySanXuat || null)
      .input('ngayHetHan', sql.Date, ngayHetHan || null)
      .query(`
        INSERT INTO Thuoc (
          maATC, tenThuongMai, hoatChat, hamLuong, donViTinh,
          tonKhoHienTai, tonToiThieu, ngaySanXuat, ngayHetHan
        )
        OUTPUT INSERTED.*
        VALUES (
          @maATC, @tenThuongMai, @hoatChat, @hamLuong, @donViTinh,
          @tonKhoHienTai, @tonToiThieu, @ngaySanXuat, @ngayHetHan
        )
      `);

    return res.status(201).json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Loi them thuoc hoac trung ma ATC' });
  }
});

router.put('/:id', verifyToken, checkRole(['Admin', 'BacSi', 'DuocSi']), async (req, res) => {
  const {
    maATC,
    tenThuongMai,
    hoatChat,
    hamLuong,
    donViTinh,
    tonKhoHienTai,
    tonToiThieu,
    ngaySanXuat,
    ngayHetHan
  } = req.body;
  try {
    const medicine = await thuocService.createThuoc(req.body);
    return res.status(201).json(medicine);
  } catch (error) {
    return handleRouteError(res, error, 'Loi them thuoc hoac trung ma ATC');
  }
});

router.put('/:id', verifyToken, checkRole(['Admin', 'BacSi', 'DuocSi']), async (req, res) => {
  try {
    const medicine = await thuocService.updateThuoc(req.params.id, req.body);

    if (!medicine) {
      return res.status(404).json({ message: 'Khong tim thay thuoc' });
    }

    return res.json(medicine);
  } catch (error) {
    return handleRouteError(res, error, 'Loi cap nhat thuoc');
  }
});

router.delete('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const deleted = await thuocService.deleteThuoc(req.params.id);

    if (!deleted) {
      return res.status(404).json({ message: 'Khong tim thay thuoc de xoa' });
    }

    return res.json({ message: 'Da xoa thuoc thanh cong' });
  } catch (error) {
    return handleRouteError(res, error, 'Khong the xoa thuoc dang co rang buoc du lieu');
  }
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');

// Lấy danh sách thuốc
router.get('/', async (req, res) => {
  const showAll = req.query.all === 'true';
  try {
    const pool = await poolPromise;
    const queryStr = showAll ? 'SELECT * FROM Thuoc' : 'SELECT * FROM Thuoc WHERE trangThai = 1';
    const result = await pool.request().query(queryStr);
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server' });
  }
});

// Tìm kiếm thuốc theo từ khóa
router.get('/search', async (req, res) => {
  const keyword = req.query.q || '';
  const showAll = req.query.all === 'true';
  try {
    const pool = await poolPromise;
    const queryStr = showAll 
        ? 'SELECT * FROM Thuoc WHERE tenThuongMai LIKE @keyword OR maATC LIKE @keyword'
        : 'SELECT * FROM Thuoc WHERE (tenThuongMai LIKE @keyword OR maATC LIKE @keyword) AND trangThai = 1';
    const result = await pool.request()
        .input('keyword', sql.NVarChar(150), `%${keyword}%`)
        .query(queryStr);
    res.json(result.recordset);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi tìm kiếm' });
  }
});

// Lấy danh sách thuốc sắp hết hàng (tồn hiện tại < tồn tối thiểu)
router.get('/low-inventory', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT * FROM Thuoc 
      WHERE tonKhoHienTai < tonToiThieu AND trangThai = 1
    `);
    
    res.json({
      count: result.recordset.length,
      data: result.recordset
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Lỗi server khi tính toán tồn tối thiểu' });
  }
});

// Thêm thuốc mới (Chỉ Admin hoặc Bác sĩ)
router.post('/', verifyToken, checkRole(['Admin', 'BacSi']), async (req, res) => {
  const { maATC, tenThuongMai, hoatChat, hamLuong, donViTinh, tonKhoHienTai, tonToiThieu, ngaySanXuat, ngayHetHan } = req.body;

  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('thuocID', sql.Int, req.params.id)
      .input('maATC', sql.VarChar(20), maATC ? maATC.trim().toUpperCase() : null)
      .input('tenThuongMai', sql.NVarChar(150), tenThuongMai ? tenThuongMai.trim() : null)
      .input('hoatChat', sql.NVarChar(150), hoatChat ? hoatChat.trim() : null)
      .input('hamLuong', sql.NVarChar(50), hamLuong || null)
      .input('donViTinh', sql.NVarChar(20), donViTinh ? donViTinh.trim() : null)
      .input('tonKhoHienTai', sql.Int, toInt(tonKhoHienTai))
      .input('tonToiThieu', sql.Int, toInt(tonToiThieu))
      .input('ngaySanXuat', sql.Date, ngaySanXuat || null)
      .input('ngayHetHan', sql.Date, ngayHetHan || null)
      .query(`
        UPDATE Thuoc
        SET maATC = @maATC,
            tenThuongMai = @tenThuongMai,
            hoatChat = @hoatChat,
            hamLuong = @hamLuong,
            donViTinh = @donViTinh,
            tonKhoHienTai = @tonKhoHienTai,
            tonToiThieu = @tonToiThieu,
            ngaySanXuat = @ngaySanXuat,
            ngayHetHan = @ngayHetHan
        OUTPUT INSERTED.*
        WHERE thuocID = @thuocID
      `);

    if (result.recordset.length === 0) {
      return res.status(404).json({ message: 'Khong tim thay thuoc' });
    }

    return res.json(result.recordset[0]);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Loi cap nhat thuoc' });
  }
});

router.delete('/:id', verifyToken, checkRole(['Admin']), async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request()
      .input('thuocID', sql.Int, req.params.id)
      .query('DELETE FROM Thuoc WHERE thuocID = @thuocID');

    if (result.rowsAffected[0] === 0) {
      return res.status(404).json({ message: 'Khong tim thay thuoc de xoa' });
    }

    return res.json({ message: 'Da xoa thuoc thanh cong' });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Khong the xoa thuoc dang co rang buoc du lieu' });
  }
      .input('maATC', sql.VarChar(20), maATC)
      .input('tenThuongMai', sql.NVarChar(150), tenThuongMai)
      .input('hoatChat', sql.NVarChar(150), hoatChat)
      .input('hamLuong', sql.NVarChar(50), hamLuong)
      .input('donViTinh', sql.NVarChar(20), donViTinh)
      .input('tonKhoHienTai', sql.Int, tonKhoHienTai || 0)
      .input('tonToiThieu', sql.Int, tonToiThieu || 0)
      .input('ngaySanXuat', sql.Date, ngaySanXuat || null)
      .input('ngayHetHan', sql.Date, ngayHetHan)
      .input('trangThai', sql.Int, 1) // Mặc định trạng thái là 1 (Còn hạn)
      .query(`
        INSERT INTO Thuoc (maATC, tenThuongMai, hoatChat, hamLuong, donViTinh, tonKhoHienTai, tonToiThieu, ngaySanXuat, ngayHetHan, trangThai) 
        OUTPUT INSERTED.thuocID
        VALUES (@maATC, @tenThuongMai, @hoatChat, @hamLuong, @donViTinh, @tonKhoHienTai, @tonToiThieu, @ngaySanXuat, @ngayHetHan, @trangThai)
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
