const express = require('express');
const { poolPromise, sql } = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');
const thuocService = require('../services/thuocService');
const { MEDICINE_CATEGORIES, MEDICINE_UNITS } = require('../constants/medicineCatalog');

const router = express.Router();

function toInt(value, fallback = 0) {
  const parsed = Number.parseInt(value, 10);
  return Number.isNaN(parsed) ? fallback : parsed;
}

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
    if (error.number === 547 || (error.originalError && error.originalError.info && error.originalError.info.number === 547)) {
       return res.status(400).json({ message: 'Thuốc này đã được sử dụng trong Đơn thuốc, không thể xóa' });
    }
    return handleRouteError(res, error, 'Khong the xoa thuoc dang co rang buoc du lieu');
  }
});

router.post('/:id/convert', verifyToken, checkRole(['Admin', 'BacSi', 'DuocSi']), async (req, res) => {
    const thuocID = req.params.id;
    const { toUnit, ratio } = req.body;
    
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('thuocID', sql.Int, thuocID)
            .input('donViTinh', sql.NVarChar(20), toUnit)
            .input('ratio', sql.Int, ratio)
            .query(`
                UPDATE Thuoc 
                SET donViTinh = @donViTinh, 
                    tonKhoHienTai = tonKhoHienTai * @ratio,
                    tonToiThieu = tonToiThieu * @ratio
                WHERE thuocID = @thuocID;
                SELECT * FROM Thuoc WHERE thuocID = @thuocID;
            `);

        if (result.rowsAffected[0] === 0) {
            return res.status(400).json({ message: 'Không thể quy đổi đơn vị.' });
        }
        res.json({ message: 'Quy đổi đơn vị thành công', data: result.recordset[0] });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Lỗi server khi quy đổi đơn vị' });
    }
});

module.exports = router;
