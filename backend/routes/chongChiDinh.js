const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { verifyToken } = require('../middleware/auth');

// Lấy danh sách chống chỉ định
router.get('/', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT c.ruleID AS id, c.thuocID, t.tenThuongMai AS tenThuoc, t.maATC, c.dieuKien, c.mucDo AS mucDoNguyHiem, c.heuQua, c.moTa
            FROM ChongChiDinh c
            JOIN Thuoc t ON c.thuocID = t.thuocID
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách chống chỉ định' });
    }
});

// Thêm chống chỉ định mới
router.post('/', verifyToken, async (req, res) => {
    try {
        const { thuocID, dieuKien, mucDoNguyHiem, heuQua, moTa } = req.body;
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('thuocID', sql.Int, thuocID)
            .input('dieuKien', sql.NVarChar, dieuKien)
            .input('mucDo', sql.NVarChar, mucDoNguyHiem)
            .input('heuQua', sql.NVarChar, heuQua)
            .input('moTa', sql.NVarChar, moTa)
            .query(`
                INSERT INTO ChongChiDinh (thuocID, dieuKien, mucDo, heuQua, moTa)
                OUTPUT INSERTED.ruleID AS id
                VALUES (@thuocID, @dieuKien, @mucDo, @heuQua, @moTa)
            `);
            
        res.status(201).json({ message: 'Thêm thành công', data: result.recordset[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi thêm chống chỉ định' });
    }
});

// Cập nhật chống chỉ định
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { thuocID, dieuKien, mucDoNguyHiem, heuQua, moTa } = req.body;
        const pool = await poolPromise;
        
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('thuocID', sql.Int, thuocID)
            .input('dieuKien', sql.NVarChar, dieuKien)
            .input('mucDo', sql.NVarChar, mucDoNguyHiem)
            .input('heuQua', sql.NVarChar, heuQua)
            .input('moTa', sql.NVarChar, moTa)
            .query(`
                UPDATE ChongChiDinh 
                SET thuocID = @thuocID, dieuKien = @dieuKien, mucDo = @mucDo, heuQua = @heuQua, moTa = @moTa
                WHERE ruleID = @id
            `);
            
        res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi cập nhật chống chỉ định' });
    }
});

// Xóa chống chỉ định
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM ChongChiDinh WHERE ruleID = @id');
            
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi xóa chống chỉ định' });
    }
});

module.exports = router;