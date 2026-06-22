-- ==============================================================================
-- TRUY VẤN LỊCH SỬ KHÁM BỆNH & ĐƠN THUỐC CỦA BỆNH NHÂN
-- ==============================================================================

-- 1. TRUY VẤN CƠ BẢN: Lấy danh sách Đơn Thuốc của một bệnh nhân cụ thể
-- (Join bảng BenhNhan và DonThuoc)
SELECT 
    BN.benhNhanID,
    BN.hoTen AS TenBenhNhan,
    BN.tienSuBenh,
    DT.donThuocID,
    DT.ngayLap,
    DT.chanDoan,
    DT.trangThai,
    DT.bacSiID
FROM 
    BenhNhan BN
INNER JOIN 
    DonThuoc DT ON BN.benhNhanID = DT.benhNhanID
WHERE 
    BN.benhNhanID = 1 -- Thay đổi ID Bệnh nhân tại đây
ORDER BY 
    DT.ngayLap DESC;


-- ==============================================================================
-- 2. TRUY VẤN NÂNG CAO: Lấy TOÀN BỘ chi tiết lịch sử (Phục vụ cho Giao diện UI)
-- (Join 4 bảng: BenhNhan -> DonThuoc -> ChiTietDonThuoc -> Thuoc)
-- Truy vấn này sẽ lấy ra chi tiết toa thuốc gồm tên thuốc, liều lượng cụ thể.
SELECT 
    -- Thông tin Bệnh nhân
    BN.benhNhanID,
    BN.hoTen AS TenBenhNhan,
    
    -- Thông tin Đơn thuốc (Khám bệnh)
    DT.donThuocID,
    DT.ngayLap,
    DT.chanDoan,
    DT.trangThai,
    
    -- Thông tin Chi tiết đơn thuốc (Thuốc được kê)
    T.thuocID,
    T.tenThuongMai AS TenThuoc,
    T.maATC,
    CT.lieuMoiLan,
    CT.soLanDungNgay,
    CT.soLuong AS TongSoLuong
FROM 
    BenhNhan BN
INNER JOIN 
    DonThuoc DT ON BN.benhNhanID = DT.benhNhanID
INNER JOIN 
    ChiTietDonThuoc CT ON DT.donThuocID = CT.donThuocID
INNER JOIN 
    Thuoc T ON CT.thuocID = T.thuocID
WHERE 
    BN.benhNhanID = 1 -- Thay đổi ID Bệnh nhân tại đây
ORDER BY 
    DT.ngayLap DESC, 
    T.tenThuongMai ASC;


-- ==============================================================================
-- 3. VÍ DỤ TÍCH HỢP VÀO NODEJS API (Sử dụng MySQL / mysql2)
-- ==============================================================================
/*
app.get('/api/benh-nhan/:id/lich-su-kham', async (req, res) => {
    const benhNhanID = req.params.id;
    
    const query = `
        SELECT BN.hoTen, DT.donThuocID, DT.ngayLap, DT.chanDoan, DT.trangThai 
        FROM BenhNhan BN
        INNER JOIN DonThuoc DT ON BN.benhNhanID = DT.benhNhanID
        WHERE BN.benhNhanID = ?
        ORDER BY DT.ngayLap DESC
    `;
    
    db.query(query, [benhNhanID], (err, results) => {
        if (err) return res.status(500).json({ error: "Lỗi Server" });
        res.json({ data: results });
    });
});
*/
