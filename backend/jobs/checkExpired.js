const cron = require('node-cron');
const { poolPromise } = require('../db');

// Lập lịch chạy vào 00:00 mỗi ngày: '0 0 * * *'
// Để test nhanh, bạn có thể đổi thành '* * * * *' (chạy mỗi phút)
cron.schedule('0 0 * * *', async () => {
    console.log('🔄 Đang chạy Job tự động kiểm tra thuốc hết hạn...');
    try {
        const pool = await poolPromise;
        const result = await pool.request()
            .query(`
                UPDATE Thuoc 
                SET trangThai = 0 
                WHERE ngayHetHan < CAST(GETDATE() AS DATE) AND trangThai = 1
            `);
        const rowsAffected = result.rowsAffected[0] || 0;
        console.log(`✅ Job hoàn tất: Đã vô hiệu hóa ${rowsAffected} thuốc đã hết hạn.`);
        
        // Nâng cấp: Ghi lại hành động này vào Audit Log của hệ thống
        if (rowsAffected > 0) {
            await pool.request()
                .query(`
                    INSERT INTO AuditLog (userId, hanhDong, chiTiet, thoiGian, ketQua)
                    VALUES (NULL, 'SYSTEM BACKGROUND JOB', N'Tự động vô hiệu hóa ${rowsAffected} thuốc hết hạn', GETDATE(), N'Thành công')
                `);
        }
    } catch (error) {
        console.error('❌ Lỗi khi chạy Job kiểm tra thuốc hết hạn:', error);
        
        // Ghi log lỗi nếu cần
        try {
            const pool = await poolPromise;
            await pool.request()
                .query(`
                    INSERT INTO AuditLog (userId, hanhDong, chiTiet, thoiGian, ketQua)
                    VALUES (NULL, 'SYSTEM BACKGROUND JOB', N'Lỗi khi vô hiệu hóa thuốc hết hạn', GETDATE(), N'Thất bại')
                `);
        } catch(e) {}
    }
});

console.log('🕒 Cron Job Cảnh báo thuốc hết hạn đã được khởi chạy.');
