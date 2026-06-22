const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');

// Lấy danh sách Audit Log
router.get('/', async (req, res) => {
  try {
    const pool = await poolPromise;
    const result = await pool.request().query(`
      SELECT 
        logID, userID, hanhDong, tenBang, banGhiID, thoiGian, giaTriCu, giaTriMoi, lyDoOverride 
      FROM AuditLog 
      ORDER BY thoiGian DESC
    `);
    
    res.json(result.recordset);
  } catch (error) {
    console.error('Lỗi khi lấy Audit Log:', error);
    res.status(500).json({ message: 'Lỗi server khi lấy Audit Log', error: error.message });
  }
});

module.exports = router;
