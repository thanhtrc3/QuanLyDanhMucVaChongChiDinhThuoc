// File: backend/util/LogicParser.js

/**
 * Hàm phân tích và đánh giá điều kiện bệnh lý/thể trạng
 * @param {Object} benhNhan - Thông tin bệnh nhân (VD: { tuoi: 10, canNang: 35 })
 * @param {String} chuoiDieuKien - Biểu thức logic (VD: "tuoi < 12 || canNang < 40")
 * @returns {Boolean} - Bệnh nhân có vi phạm chống chỉ định hay không
 */
export const checkCondition = (benhNhan, chuoiDieuKien) => {
    // Nếu không có điều kiện gì đặc biệt thì an toàn
    if (!chuoiDieuKien || chuoiDieuKien.trim() === '') return false;

    try {
        // Biến chuỗi text thành một hàm logic có thể chạy được
        const parser = new Function('benhNhan', `
            const { tuoi, canNang } = benhNhan;
            return ${chuoiDieuKien};
        `);
        
        return parser(benhNhan);
    } catch (error) {
        console.error("Lỗi cú pháp khi đọc biểu thức Rule CCĐ:", error);
        // Trả về false (hoặc true tùy cấu hình) nếu rule bị viết sai cú pháp
        return false; 
    }
};

// --- Phần Test nhanh (Bạn có thể bỏ đi khi ghép code chính thức) ---
const thongTinBN = { tuoi: 15, canNang: 38 };
const luatChongChiDinh = "tuoi < 12 || (tuoi < 18 && canNang < 40)";

console.log("Bệnh nhân có vi phạm rule không?", checkCondition(thongTinBN, luatChongChiDinh)); // Kết quả sẽ in ra true