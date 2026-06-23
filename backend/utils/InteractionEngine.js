// File: InteractionEngine.js

// Hàm giả lập kiểm tra 2 thuốc có kỵ nhau không (Sau này ghép với Database)
const checkConflict = (thuocA, thuocB) => {
    // Demo: Cứ thấy Paracetamol và Ibuprofen đi chung là báo động
    if ((thuocA.ten === 'Paracetamol' && thuocB.ten === 'Ibuprofen') ||
        (thuocA.ten === 'Ibuprofen' && thuocB.ten === 'Paracetamol')) {
        return "Gây loét dạ dày nghiêm trọng";
    }
    return null;
};

// Core thuật toán quét n(n-1)/2
const scanDrugInteractions = (danhSachThuoc) => {
    const canhBao = [];
    const n = danhSachThuoc.length;

    // Vòng lặp n(n-1)/2 thần thánh: Bắt cặp không trùng lặp
    for (let i = 0; i < n - 1; i++) {
        for (let j = i + 1; j < n; j++) {
            const thuoc1 = danhSachThuoc[i];
            const thuoc2 = danhSachThuoc[j];

            const lyDoTuongTac = checkConflict(thuoc1, thuoc2);
            
            if (lyDoTuongTac) {
                canhBao.push({
                    capThuoc: `${thuoc1.ten} - ${thuoc2.ten}`,
                    mucDo: 'Nguy hiểm',
                    chiTiet: lyDoTuongTac
                });
            }
        }
    }

    return canhBao;
};

module.exports = { scanDrugInteractions };