const express = require('express');
const router = express.Router();
const { poolPromise, sql } = require('../db');
const { verifyToken } = require('../middleware/auth');

router.get('/stats', verifyToken, async (req, res) => {
    try {
        const pool = await poolPromise;

        // Tổng bệnh nhân
        const patientsRes = await pool.request().query('SELECT COUNT(*) as count FROM BenhNhan');
        const totalPatients = patientsRes.recordset[0].count;

        // Đơn thuốc trong tháng hiện tại
        const prescriptionsRes = await pool.request().query(`
            SELECT COUNT(*) as count 
            FROM DonThuoc 
            WHERE MONTH(ngayLap) = MONTH(GETDATE()) AND YEAR(ngayLap) = YEAR(GETDATE())
        `);
        const totalPrescriptionsThisMonth = prescriptionsRes.recordset[0].count;

        // Lấy cấu hình nearExpiryDays từ SystemSettings
        const settingsRes = await pool.request().query("SELECT settingValue FROM SystemSettings WHERE settingKey = 'nearExpiryDays'");
        let nearExpiryDays = 30;
        if (settingsRes.recordset.length > 0) {
            nearExpiryDays = parseInt(settingsRes.recordset[0].settingValue, 10) || 30;
        }

        // Số thuốc sắp hết hạn (tính từ hôm nay đến nearExpiryDays ngày sau)
        const expiryRes = await pool.request()
            .input('days', sql.Int, nearExpiryDays)
            .query(`
                SELECT COUNT(*) as count 
                FROM Thuoc 
                WHERE ngayHetHan <= DATEADD(day, @days, GETDATE()) AND ngayHetHan >= GETDATE()
            `);
        const nearExpiry = expiryRes.recordset[0].count;

        // Cảnh báo (ví dụ lấy từ AuditLog các hành động có chứa chữ 'Cảnh báo' trong tháng)
        const warningsRes = await pool.request().query(`
            SELECT COUNT(*) as count 
            FROM AuditLog 
            WHERE (hanhDong LIKE N'%Cảnh báo%' OR giaTriMoi LIKE N'%Cảnh báo%')
              AND MONTH(thoiGian) = MONTH(GETDATE()) AND YEAR(thoiGian) = YEAR(GETDATE())
        `);
        const monthlyWarnings = warningsRes.recordset[0].count;

        // Dữ liệu biểu đồ: Số lượng đơn thuốc theo từng tháng trong năm nay
        const chartRes = await pool.request().query(`
            SELECT MONTH(ngayLap) as month, COUNT(*) as count 
            FROM DonThuoc 
            WHERE YEAR(ngayLap) = YEAR(GETDATE()) 
            GROUP BY MONTH(ngayLap)
        `);
        
        // Khởi tạo mảng 12 tháng với giá trị 0
        const chartData = Array(12).fill(0);
        chartRes.recordset.forEach(row => {
            // month trả về từ 1-12, mảng từ 0-11
            if (row.month >= 1 && row.month <= 12) {
                chartData[row.month - 1] = row.count;
            }
        });

        res.json({
            totalPatients,
            totalPrescriptionsThisMonth,
            nearExpiry,
            monthlyWarnings,
            chartData
        });

    } catch (error) {
        console.error('Error fetching dashboard stats:', error);
        res.status(500).json({ message: 'Lỗi server khi lấy dữ liệu thống kê.' });
    }
});

module.exports = router;
