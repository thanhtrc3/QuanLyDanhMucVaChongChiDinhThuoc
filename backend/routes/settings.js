const express = require('express');
const { poolPromise, sql } = require('../db');
const { verifyToken, checkRole } = require('../middleware/auth');

const router = express.Router();

// GET /api/settings - Lấy danh sách cài đặt hệ thống (Ai cũng có thể xem để load config)
router.get('/', verifyToken, async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query('SELECT settingKey, settingValue, description FROM SystemSettings');
    
    // Convert array to object key-value
    const settings = {};
    result.recordset.forEach(row => {
      settings[row.settingKey] = row.settingValue;
    });
    
    return res.json(settings);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi khi lấy cài đặt hệ thống' });
  }
});

// PUT /api/settings - Cập nhật danh sách cài đặt hệ thống (Chỉ Admin)
router.put('/', verifyToken, checkRole('Admin'), async (req, res) => {
  const settingsToUpdate = req.body; // e.g. { nearExpiryDays: "30", lowStockMultiplier: "1" }
  const userId = req.user.userId;

  if (!settingsToUpdate || Object.keys(settingsToUpdate).length === 0) {
    return res.status(400).json({ message: 'Không có dữ liệu cài đặt để cập nhật.' });
  }

  try {
    const pool = await poolPromise;
    const transaction = new sql.Transaction(pool);
    await transaction.begin();

    try {
      for (const [key, value] of Object.entries(settingsToUpdate)) {
        // Kiểm tra xem key đã tồn tại chưa
        const check = new sql.Request(transaction);
        const checkRes = await check
          .input('key', sql.VarChar(50), key)
          .query('SELECT 1 FROM SystemSettings WHERE settingKey = @key');

        const updateReq = new sql.Request(transaction);
        if (checkRes.recordset.length > 0) {
          await updateReq
            .input('key', sql.VarChar(50), key)
            .input('val', sql.NVarChar(sql.MAX), String(value))
            .input('uid', sql.Int, userId)
            .query('UPDATE SystemSettings SET settingValue = @val, updatedAt = GETDATE(), updatedBy = @uid WHERE settingKey = @key');
        } else {
          await updateReq
            .input('key', sql.VarChar(50), key)
            .input('val', sql.NVarChar(sql.MAX), String(value))
            .input('uid', sql.Int, userId)
            .query('INSERT INTO SystemSettings (settingKey, settingValue, updatedBy) VALUES (@key, @val, @uid)');
        }
      }

      await transaction.commit();
      return res.json({ message: 'Cập nhật cài đặt hệ thống thành công.' });
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Lỗi server khi cập nhật cài đặt.' });
  }
});

module.exports = router;
