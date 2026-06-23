// File: backend/util/ContraindicationScanner.js

// Hàm helper để đọc và chạy biểu thức điều kiện (tương tự LogicParser)
const evaluateRule = (benhNhan, chuoiDieuKien) => {
    if (!chuoiDieuKien || chuoiDieuKien.trim() === '') return false;
    try {
        const parser = new Function('benhNhan', `
            const { tuoi, canNang, tienSuBenh } = benhNhan;
            return ${chuoiDieuKien};
        `);
        return parser(benhNhan);
    } catch (error) {
        console.error("Lỗi cú pháp Rule:", error);
        return false;
    }
};

/**
 * Hàm core quét danh sách thuốc xem có loại nào chống chỉ định với bệnh nhân không
 * @param {Object} benhNhan - { tuoi: number, canNang: number, tienSuBenh: string[] }
 * @param {Array} danhSachThuoc - Mảng các thuốc được kê [{ ten: string, ruleCCD: string }]
 * @returns {Array} - Danh sách các cảnh báo vi phạm
 */
const scanPatientContraindications = (benhNhan, danhSachThuoc) => {
    const danhSachCanhBao = [];

    danhSachThuoc.forEach((thuoc) => {
        // Nếu thuốc có cấu hình luật chống chỉ định
        if (thuoc.ruleCCD) {
            const isViPham = evaluateRule(benhNhan, thuoc.ruleCCD);
            
            if (isViPham) {
                danhSachCanhBao.push({
                    tenThuoc: thuoc.ten,
                    loaiCanhBao: 'Chống chỉ định thâm niên/Thể trạng',
                    chiTiet: `Thuốc ${thuoc.ten} không phù hợp với thông tin bệnh nhân (Rule vi phạm: ${thuoc.ruleCCD})`,
                    mucDo: 'Nguy hiểm tính mạng'
                });
            }
        }
    });

    return danhSachCanhBao;
};

module.exports = { scanPatientContraindications };