-- ==============================================================================
-- KỊCH BẢN TẠO DB TRIGGERS CHO AUDIT LOG & BẢO VỆ DỮ LIỆU
-- DB: MySQL / SQL Server (Logic tương đương)
-- ==============================================================================

-- 1. TRIGGER BẢO VỆ BẢNG AUDIT LOG (NGĂN CHẶN UPDATE & DELETE)
-- Đảm bảo tính toàn vẹn của Audit Log, không ai (kể cả Admin) được sửa hay xoá vết.

DELIMITER //

-- Ngăn chặn thao tác UPDATE trên bảng AuditLog
CREATE TRIGGER trg_PreventUpdateAuditLog
BEFORE UPDATE ON AuditLog
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'HỆ THỐNG TỪ CHỐI: Không được phép sửa đổi (Update) dữ liệu trên bảng AuditLog để đảm bảo tính minh bạch.';
END;
//

-- Ngăn chặn thao tác DELETE trên bảng AuditLog
CREATE TRIGGER trg_PreventDeleteAuditLog
BEFORE DELETE ON AuditLog
FOR EACH ROW
BEGIN
    SIGNAL SQLSTATE '45000' 
    SET MESSAGE_TEXT = 'HỆ THỐNG TỪ CHỐI: Không được phép xóa (Delete) nhật ký thao tác trên bảng AuditLog.';
END;
//

-- ==============================================================================
-- 2. TRIGGER GHI NHẬN LƯU VẾT (AUDIT LOGGING) CHO BẢNG "NguoiDung"
-- Tự động ghi lại log khi có thao tác UPDATE trên bảng NguoiDung
-- ==============================================================================

CREATE TRIGGER trg_AuditLog_NguoiDung_Update
AFTER UPDATE ON NguoiDung
FOR EACH ROW
BEGIN
    DECLARE old_val VARCHAR(1000);
    DECLARE new_val VARCHAR(1000);
    
    -- Xây dựng chuỗi giá trị cũ
    SET old_val = CONCAT('vaiTro: ', OLD.vaiTro, ', trangThai: ', OLD.trangThai);
    -- Xây dựng chuỗi giá trị mới
    SET new_val = CONCAT('vaiTro: ', NEW.vaiTro, ', trangThai: ', NEW.trangThai);
    
    -- Nếu có sự thay đổi về vai trò hoặc trạng thái, mới tiến hành ghi log
    IF (OLD.vaiTro != NEW.vaiTro OR OLD.trangThai != NEW.trangThai) THEN
        INSERT INTO AuditLog (
            userID, 
            hanhDong, 
            tenBang, 
            thoiGian, 
            giaTriCu, 
            giaTriMoi, 
            lyDoOverride
        )
        VALUES (
            -- Trong thực tế hàm lấy ID user đang thực hiện query có thể được lấy qua @session_user_id
            -- Ở đây ta dùng ID của người bị sửa làm tham số ví dụ, hoặc @current_user_id
            IFNULL(@current_user_id, NEW.userId), 
            'Cập nhật', 
            'NguoiDung', 
            NOW(), 
            old_val, 
            new_val, 
            'Thay đổi phân quyền hoặc trạng thái tài khoản'
        );
    END IF;
END;
//

-- ==============================================================================
-- 3. TRIGGER GHI NHẬN LƯU VẾT CHO BẢNG "Thuoc" (VÍ DỤ THÊM MỚI)
-- ==============================================================================

CREATE TRIGGER trg_AuditLog_Thuoc_Insert
AFTER INSERT ON Thuoc
FOR EACH ROW
BEGIN
    DECLARE new_val VARCHAR(1000);
    
    -- Ghi nhận các thông tin thuốc vừa được tạo
    SET new_val = CONCAT('thuocID: ', NEW.thuocID, ', ten: ', NEW.tenThuongMai);
    
    INSERT INTO AuditLog (
        userID, 
        hanhDong, 
        tenBang, 
        thoiGian, 
        giaTriCu, 
        giaTriMoi, 
        lyDoOverride
    )
    VALUES (
        IFNULL(@current_user_id, 1), -- Mặc định là Admin (1) nếu không cấu hình session
        'Thêm mới', 
        'Thuoc', 
        NOW(), 
        '', 
        new_val, 
        ''
    );
END;
//

DELIMITER ;
