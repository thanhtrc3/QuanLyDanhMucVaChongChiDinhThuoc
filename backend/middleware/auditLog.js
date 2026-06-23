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
                let userId = req.user?.userId || data?.user?.userId || null;

                const hanhDong = req.method;
                const tenBang = req.originalUrl.split('/')[2] || 'System'; // /api/thuoc => thuoc
                const giaTriMoi = JSON.stringify(req.body || {});
                const ketQua = res.statusCode >= 200 && res.statusCode < 300 ? 'Thành công' : 'Thất bại';
                const actionDesc = `${hanhDong} [${ketQua}]`;
                
                const pool = await poolPromise;
                await pool.request()
                    .input('userID', sql.Int, userId)
                    .input('tenBang', sql.VarChar(50), tenBang)
                    .input('hanhDong', sql.NVarChar(50), actionDesc)
                    .input('thoiGian', sql.DateTime, new Date())
                    .input('giaTriCu', sql.NVarChar(sql.MAX), null)
                    .input('giaTriMoi', sql.NVarChar(sql.MAX), giaTriMoi)
                    .input('lyDoOverride', sql.NVarChar(500), null)
                    .query(`
                        INSERT INTO AuditLog (userID, tenBang, hanhDong, thoiGian, giaTriCu, giaTriMoi, lyDoOverride)
                        VALUES (@userID, @tenBang, @hanhDong, @thoiGian, @giaTriCu, @giaTriMoi, @lyDoOverride)
                    `);
            } catch (err) {
                console.error('Lỗi khi ghi Audit Log:', err);
            }
        }
    };
    next();
};

module.exports = auditLog;
