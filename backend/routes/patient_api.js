const express = require('express');
const app = express();
app.use(express.json()); // Hỗ trợ nhận dữ liệu dạng JSON từ giao diện React

// Giả lập cơ sở dữ liệu (Bảng BenhNhan)
let db_benh_nhan = [
    {
        benhNhanID: 1,
        hoTen: "Nguyễn Văn A",
        ngaySinh: "1990-05-15",
        canNang: 65.5,
        tienSuBenh: "Dị ứng Penicillin",
        isMangThai: false
    }
];
let current_id = 2;

// Hàm tính tuổi (Tương đương tinhTuoi() trong UML)
function tinhTuoi(ngaySinh) {
    const birthDate = new Date(ngaySinh);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const m = today.getMonth() - birthDate.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
    }
    return age;
}

// ==========================================
// 1. CREATE (Tạo mới hồ sơ bệnh nhân)
// ==========================================
app.post('/api/benh-nhan', (req, res) => {
    const { hoTen, ngaySinh, canNang, tienSuBenh, isMangThai } = req.body;

    // Validate dữ liệu cơ bản ở Backend
    if (!hoTen || !ngaySinh || !canNang) {
        return res.status(400).json({ error: "Vui lòng cung cấp đầy đủ: hoTen, ngaySinh, canNang" });
    }

    const newPatient = {
        benhNhanID: current_id++,
        hoTen,
        ngaySinh,
        canNang: parseFloat(canNang),
        tienSuBenh: tienSuBenh || "",
        isMangThai: isMangThai || false
    };

    // Lưu vào bảng bệnh nhân
    db_benh_nhan.push(newPatient);

    // Tính toán thêm số tuổi trả về cho Giao diện
    res.status(201).json({
        message: "Lưu thông tin bệnh nhân thành công",
        data: {
            ...newPatient,
            tuoiHienTai: tinhTuoi(newPatient.ngaySinh)
        }
    });
});

// ==========================================
// 2. READ (Lấy danh sách tất cả bệnh nhân)
// ==========================================
app.get('/api/benh-nhan', (req, res) => {
    // Kèm thêm thuộc tính tuổi khi trả về danh sách
    const dataWithAge = db_benh_nhan.map(p => ({
        ...p,
        tuoiHienTai: tinhTuoi(p.ngaySinh)
    }));
    res.status(200).json({ data: dataWithAge });
});

// ==========================================
// 3. READ DETAIL (Lấy thông tin 1 bệnh nhân)
// ==========================================
app.get('/api/benh-nhan/:id', (req, res) => {
    const patientId = parseInt(req.params.id);
    const patient = db_benh_nhan.find(p => p.benhNhanID === patientId);

    if (!patient) {
        return res.status(404).json({ error: "Không tìm thấy bệnh nhân" });
    }

    res.status(200).json({
        data: {
            ...patient,
            tuoiHienTai: tinhTuoi(patient.ngaySinh)
        }
    });
});

// ==========================================
// 4. UPDATE (Cập nhật thông tin bệnh nhân)
// ==========================================
app.put('/api/benh-nhan/:id', (req, res) => {
    const patientId = parseInt(req.params.id);
    const index = db_benh_nhan.findIndex(p => p.benhNhanID === patientId);

    if (index === -1) {
        return res.status(404).json({ error: "Không tìm thấy bệnh nhân để cập nhật" });
    }

    const { hoTen, ngaySinh, canNang, tienSuBenh, isMangThai } = req.body;

    // Tiến hành Cập nhật các trường được gửi lên
    const updatedPatient = {
        ...db_benh_nhan[index],
        hoTen: hoTen !== undefined ? hoTen : db_benh_nhan[index].hoTen,
        ngaySinh: ngaySinh !== undefined ? ngaySinh : db_benh_nhan[index].ngaySinh,
        canNang: canNang !== undefined ? parseFloat(canNang) : db_benh_nhan[index].canNang,
        tienSuBenh: tienSuBenh !== undefined ? tienSuBenh : db_benh_nhan[index].tienSuBenh,
        isMangThai: isMangThai !== undefined ? isMangThai : db_benh_nhan[index].isMangThai,
    };

    db_benh_nhan[index] = updatedPatient;

    res.status(200).json({
        message: "Cập nhật thành công",
        data: {
            ...updatedPatient,
            tuoiHienTai: tinhTuoi(updatedPatient.ngaySinh)
        }
    });
});

// ==========================================
// 5. DELETE (Xoá hồ sơ bệnh nhân)
// ==========================================
app.delete('/api/benh-nhan/:id', (req, res) => {
    const patientId = parseInt(req.params.id);
    const index = db_benh_nhan.findIndex(p => p.benhNhanID === patientId);

    if (index === -1) {
        return res.status(404).json({ error: "Không tìm thấy bệnh nhân để xóa" });
    }

    // Xoá khỏi mảng (Trong thực tế là DELETE FROM BenhNhan WHERE benhNhanID = ?)
    db_benh_nhan.splice(index, 1);

    res.status(200).json({ message: "Xóa bệnh nhân thành công" });
});

// Khởi chạy server API (Thực tế sẽ chạy bằng lệnh: node patient_api.js)
const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Backend API đang chạy tại http://localhost:${PORT}`);
});
