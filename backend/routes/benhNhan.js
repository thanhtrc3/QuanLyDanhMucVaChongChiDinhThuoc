const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { verifyToken } = require('../middleware/auth');

// Lấy danh sách bệnh nhân
router.get('/', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request().query('SELECT * FROM BenhNhan ORDER BY benhNhanID DESC');
        
        // Cần format lại response để có thêm tuoiHienTai
        const patients = result.recordset.map(p => {
            const birthDate = new Date(p.ngaySinh);
            const today = new Date();
            let age = today.getFullYear() - birthDate.getFullYear();
            const m = today.getMonth() - birthDate.getMonth();
            if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
                age--;
            }
            return {
                ...p,
                id: p.benhNhanID, // Frontend có thể dùng id thay vì benhNhanID
                maBenhNhan: `BN${String(p.benhNhanID).padStart(3, '0')}`,
                ngaySinh: p.ngaySinh ? new Date(p.ngaySinh).toISOString().split('T')[0] : null,
                tuoiHienTai: age
            };
        });

        res.json({ data: patients }); // Trả về dạng { data: [...] } để tương thích code cũ nếu có
    } catch (error) {
        console.error('Lỗi khi lấy danh sách bệnh nhân:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Thêm mới bệnh nhân
router.post('/', verifyToken, async (req, res) => {
    try {
        const { hoTen, ngaySinh, canNang, tienSuBenh, isMangThai } = req.body;
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('hoTen', sql.NVarChar(100), hoTen)
            .input('ngaySinh', sql.Date, ngaySinh)
            .input('canNang', sql.Float, canNang || null)
            .input('tienSuBenh', sql.NVarChar(500), tienSuBenh || '')
            .input('isMangThai', sql.Bit, isMangThai ? 1 : 0)
            .query(`
                INSERT INTO BenhNhan (hoTen, ngaySinh, canNang, tienSuBenh, isMangThai)
                OUTPUT INSERTED.*
                VALUES (@hoTen, @ngaySinh, @canNang, @tienSuBenh, @isMangThai)
            `);
            
        res.status(201).json(result.recordset[0]);
    } catch (error) {
        console.error('Lỗi khi thêm bệnh nhân:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Cập nhật bệnh nhân
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { hoTen, ngaySinh, canNang, tienSuBenh, isMangThai } = req.body;
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .input('hoTen', sql.NVarChar(100), hoTen)
            .input('ngaySinh', sql.Date, ngaySinh)
            .input('canNang', sql.Float, canNang || null)
            .input('tienSuBenh', sql.NVarChar(500), tienSuBenh || '')
            .input('isMangThai', sql.Bit, isMangThai ? 1 : 0)
            .query(`
                UPDATE BenhNhan
                SET hoTen = @hoTen,
                    ngaySinh = @ngaySinh,
                    canNang = @canNang,
                    tienSuBenh = @tienSuBenh,
                    isMangThai = @isMangThai
                OUTPUT INSERTED.*
                WHERE benhNhanID = @id
            `);
            
        if (result.recordset.length === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });
        }
            
        res.json(result.recordset[0]);
    } catch (error) {
        console.error('Lỗi khi cập nhật bệnh nhân:', error);
        res.status(500).json({ message: 'Lỗi server' });
    }
});

// Xóa bệnh nhân
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                DELETE FROM BenhNhan
                WHERE benhNhanID = @id
            `);
            
        if (result.rowsAffected[0] === 0) {
            return res.status(404).json({ message: 'Không tìm thấy bệnh nhân' });
        }
            
        res.json({ message: 'Đã xóa bệnh nhân' });
    } catch (error) {
        console.error('Lỗi khi xóa bệnh nhân:', error);
        res.status(500).json({ message: 'Không thể xóa bệnh nhân vì có dữ liệu ràng buộc (đơn thuốc, ...).' });
    }
});

// Lịch sử đơn thuốc của bệnh nhân
router.get('/:id/don-thuoc', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('id', sql.Int, req.params.id)
            .query(`
                SELECT d.donThuocID, d.ngayKeDon, d.trangThai, d.chanDoan,
                       n.hoTen AS tenBacSi,
                       (SELECT COUNT(*) FROM ChiTietDonThuoc c WHERE c.donThuocID = d.donThuocID) AS soLoaiThuoc
                FROM DonThuoc d
                LEFT JOIN NguoiDung n ON d.bacSiID = n.userID
                WHERE d.benhNhanID = @id
                ORDER BY d.ngayKeDon DESC
            `);
        res.json(result.recordset);
    } catch (error) {
        console.error('Lỗi khi lấy lịch sử đơn thuốc:', error);
        res.status(500).json({ message: error.message || 'Lỗi server' });
    }
});

module.exports = router;
