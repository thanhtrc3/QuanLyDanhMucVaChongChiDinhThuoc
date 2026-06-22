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
export const scanPatientContraindications = (benhNhan, danhSachThuoc) => {
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

// --- Đoạn code Test nhanh hiệu năng ---
const benhNhanDemo = {
    tuoi: 8,
    canNang: 25,
    tienSuBenh: ['Suy gan', 'Dị ứng Aspirin']
};

const donThuocDemo = [
    { ten: 'Vitamin C', ruleCCD: '' },
    { ten: 'Thuốc hạ sốt trẻ em A', ruleCCD: 'tuoi < 2' }, // An toàn vì em bé 8 tuổi
    { ten: 'Thuốc kháng viêm B', ruleCCD: "tuoi < 12 || tienSuBenh.includes('Suy gan')" } // Vi phạm cả tuổi lẫn gan!
];

console.log("=== KẾT QUẢ QUÉT BỆNH LÝ ===");
console.log(scanPatientContraindications(benhNhanDemo, donThuocDemo));