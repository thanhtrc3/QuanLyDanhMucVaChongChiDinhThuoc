const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { verifyToken } = require('../middleware/auth');

// Lấy danh sách tương tác thuốc
router.get('/', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query(`
            SELECT i.tuongTacID AS id, 
                   i.thuocID_1, t1.tenThuongMai AS tenThuoc_1, t1.maATC AS maATC_1,
                   i.thuocID_2, t2.tenThuongMai AS tenThuoc_2, t2.maATC AS maATC_2,
                   i.mucDo, i.coCheTacDung, i.khuyenCao AS khuyen_cao
            FROM TuongTacThuoc i
            JOIN Thuoc t1 ON i.thuocID_1 = t1.thuocID
            JOIN Thuoc t2 ON i.thuocID_2 = t2.thuocID
        `);
        res.json(result.recordset);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi lấy danh sách tương tác thuốc' });
    }
});

// Thêm tương tác thuốc mới
router.post('/', verifyToken, async (req, res) => {
    try {
        const { thuocID_1, thuocID_2, maATC_1, maATC_2, mucDo, coCheTacDung, khuyen_cao } = req.body;
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('thuocID_1', sql.Int, thuocID_1)
            .input('thuocID_2', sql.Int, thuocID_2)
            .input('maATC_1', sql.NVarChar, maATC_1 || '')
            .input('maATC_2', sql.NVarChar, maATC_2 || '')
            .input('mucDo', sql.NVarChar, mucDo)
            .input('coCheTacDung', sql.NVarChar, coCheTacDung)
            .input('khuyenCao', sql.NVarChar, khuyen_cao)
            .query(`
                INSERT INTO TuongTacThuoc (thuocID_1, thuocID_2, maATC_1, maATC_2, mucDo, coCheTacDung, khuyenCao)
                OUTPUT INSERTED.tuongTacID AS id
                VALUES (@thuocID_1, @thuocID_2, @maATC_1, @maATC_2, @mucDo, @coCheTacDung, @khuyenCao)
            `);
            
        res.status(201).json({ message: 'Thêm thành công', data: result.recordset[0] });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi thêm tương tác thuốc' });
    }
});

// Cập nhật tương tác thuốc
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { thuocID_1, thuocID_2, maATC_1, maATC_2, mucDo, coCheTacDung, khuyen_cao } = req.body;
        const pool = await poolPromise;
        
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('thuocID_1', sql.Int, thuocID_1)
            .input('thuocID_2', sql.Int, thuocID_2)
            .input('maATC_1', sql.NVarChar, maATC_1 || '')
            .input('maATC_2', sql.NVarChar, maATC_2 || '')
            .input('mucDo', sql.NVarChar, mucDo)
            .input('coCheTacDung', sql.NVarChar, coCheTacDung)
            .input('khuyenCao', sql.NVarChar, khuyen_cao)
            .query(`
                UPDATE TuongTacThuoc 
                SET thuocID_1 = @thuocID_1, thuocID_2 = @thuocID_2, maATC_1 = @maATC_1, maATC_2 = @maATC_2, mucDo = @mucDo, coCheTacDung = @coCheTacDung, khuyenCao = @khuyenCao
                WHERE tuongTacID = @id
            `);
            
        res.json({ message: 'Cập nhật thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi cập nhật tương tác thuốc' });
    }
});

// Xóa tương tác thuốc
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        await pool.request()
            .input('id', sql.Int, req.params.id)
            .query('DELETE FROM TuongTacThuoc WHERE tuongTacID = @id');
            
        res.json({ message: 'Xóa thành công' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Lỗi khi xóa tương tác thuốc' });
    }
});

module.exports = router;
