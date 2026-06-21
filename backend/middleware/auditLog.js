const { poolPromise, sql } = require('../db');

const auditLog = async (req, res, next) => {
    // Override lại hàm res.json để bắt sự kiện ngay sau khi API trả về kết quả
    const originalJson = res.json;
    
    res.json = async function (data) {
        // Gọi lại hàm json gốc để trả kết quả về cho Frontend
        originalJson.call(this, data);

        // Chỉ ghi log nếu đây là hành động thay đổi dữ liệu (Thêm/Sửa/Xóa)
        if (['POST', 'PUT', 'DELETE'].includes(req.method)) {
            try {
                // Nếu gọi API Login thì chưa có req.user, lúc này gán user = data.user.userId
                let userId = req.user ? req.user.userId : null;
                if (!userId && data.user && data.user.userId) userId = data.user.userId;

                const hanhDong = `${req.method} ${req.originalUrl}`;
                const chiTiet = JSON.stringify(req.body || {});
                const ketQua = res.statusCode >= 200 && res.statusCode < 300 ? 'Thành công' : 'Thất bại';
                
                const pool = await poolPromise;
                await pool.request()
                    .input('userId', sql.Int, userId || null)
                    .input('hanhDong', sql.NVarChar(200), hanhDong)
                    .input('chiTiet', sql.NVarChar(sql.MAX), chiTiet)
                    .input('thoiGian', sql.DateTime, new Date())
                    .input('ketQua', sql.NVarChar(50), ketQua)
                    .query(`
                        -- Mẹo nhỏ: Tự tạo bảng AuditLog nếu chưa có trong Database
                        IF NOT EXISTS (SELECT * FROM sysobjects WHERE name='AuditLog' and xtype='U')
                        CREATE TABLE AuditLog (
                            logId INT IDENTITY(1,1) PRIMARY KEY,
                            userId INT NULL,
                            hanhDong NVARCHAR(200),
                            chiTiet NVARCHAR(MAX),
                            thoiGian DATETIME,
                            ketQua NVARCHAR(50)
                        );
                        
                        INSERT INTO AuditLog (userId, hanhDong, chiTiet, thoiGian, ketQua)
                        VALUES (@userId, @hanhDong, @chiTiet, @thoiGian, @ketQua)
                    `);
            } catch (err) {
                console.error('Lỗi khi ghi Audit Log:', err);
            }
        }
    };
    next();
};

module.exports = auditLog;
