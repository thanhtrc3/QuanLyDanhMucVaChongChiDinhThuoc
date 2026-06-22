import type { User, Medicine, Patient, Prescription, ContraindicationRule, DrugInteraction, AuditLog } from './types';

export const mockUsers: User[] = [
  { id: 1, tenDangNhap: 'admin01', hoTen: 'Nguyễn Văn A', vaiTro: 'Admin', trangThai: true, email: 'admin@hayday.vn', ngayTao: '2024-01-01' },
  { id: 2, tenDangNhap: 'bs_nguyena', hoTen: 'BS. Nguyễn Văn An', vaiTro: 'Bac si', trangThai: true, email: 'nguyenan@hayday.vn', ngayTao: '2024-01-15' },
  { id: 3, tenDangNhap: 'bs_tranb', hoTen: 'BS. Trần Thị Bình', vaiTro: 'Bac si', trangThai: true, email: 'tranbinh@hayday.vn', ngayTao: '2024-02-01' },
  { id: 4, tenDangNhap: 'ds_lehoa', hoTen: 'DS. Lê Thị Hoa', vaiTro: 'Duoc si', trangThai: true, email: 'lehoa@hayday.vn', ngayTao: '2024-02-10' },
  { id: 5, tenDangNhap: 'ds_phamtung', hoTen: 'DS. Phạm Văn Tùng', vaiTro: 'Duoc si', trangThai: false, email: 'phamtung@hayday.vn', ngayTao: '2024-03-01' },
];

export const mockMedicines: Medicine[] = [
  { id: 1, tenThuong: 'Amoxicillin 500mg', maATC: 'J01CA04', hoatChat: 'Amoxicillin', nhomThuoc: 'Kháng sinh', donVi: 'Viên', giaBan: 2500, tonKho: 150, tonKhoToiThieu: 50, hanDung: '2026-12-31', moTa: 'Kháng sinh phổ rộng nhóm penicillin', trangThai: true },
  { id: 2, tenThuong: 'Aspirin 100mg', maATC: 'B01AC06', hoatChat: 'Acetylsalicylic acid', nhomThuoc: 'Chống đông máu', donVi: 'Viên', giaBan: 800, tonKho: 30, tonKhoToiThieu: 50, hanDung: '2026-08-31', moTa: 'Thuốc chống kết tập tiểu cầu', trangThai: true },
  { id: 3, tenThuong: 'Metformin 500mg', maATC: 'A10BA02', hoatChat: 'Metformin HCl', nhomThuoc: 'Đái tháo đường', donVi: 'Viên', giaBan: 1200, tonKho: 200, tonKhoToiThieu: 80, hanDung: '2027-03-31', moTa: 'Thuốc điều trị đái tháo đường type 2', trangThai: true },
  { id: 4, tenThuong: 'Atorvastatin 10mg', maATC: 'C10AA05', hoatChat: 'Atorvastatin', nhomThuoc: 'Tim mạch', donVi: 'Viên', giaBan: 3500, tonKho: 75, tonKhoToiThieu: 30, hanDung: '2026-11-30', moTa: 'Statin điều trị tăng mỡ máu', trangThai: true },
  { id: 5, tenThuong: 'Warfarin 5mg', maATC: 'B01AA03', hoatChat: 'Warfarin sodium', nhomThuoc: 'Chống đông máu', donVi: 'Viên', giaBan: 4500, tonKho: 45, tonKhoToiThieu: 20, hanDung: '2026-06-30', moTa: 'Thuốc chống đông máu uống', trangThai: true },
  { id: 6, tenThuong: 'Ibuprofen 400mg', maATC: 'M01AE01', hoatChat: 'Ibuprofen', nhomThuoc: 'Giảm đau - Kháng viêm', donVi: 'Viên', giaBan: 1500, tonKho: 18, tonKhoToiThieu: 40, hanDung: '2025-12-31', moTa: 'Thuốc kháng viêm không steroid', trangThai: true },
  { id: 7, tenThuong: 'Omeprazole 20mg', maATC: 'A02BC01', hoatChat: 'Omeprazole', nhomThuoc: 'Dạ dày', donVi: 'Viên', giaBan: 2000, tonKho: 120, tonKhoToiThieu: 50, hanDung: '2027-01-31', moTa: 'Ức chế bơm proton, điều trị loét dạ dày', trangThai: true },
  { id: 8, tenThuong: 'Ciprofloxacin 500mg', maATC: 'J01MA02', hoatChat: 'Ciprofloxacin HCl', nhomThuoc: 'Kháng sinh', donVi: 'Viên', giaBan: 3200, tonKho: 60, tonKhoToiThieu: 30, hanDung: '2026-09-30', moTa: 'Kháng sinh fluoroquinolone phổ rộng', trangThai: true },
  { id: 9, tenThuong: 'Amlodipine 5mg', maATC: 'C08CA01', hoatChat: 'Amlodipine besilate', nhomThuoc: 'Tim mạch', donVi: 'Viên', giaBan: 2800, tonKho: 90, tonKhoToiThieu: 40, hanDung: '2027-02-28', moTa: 'Chẹn kênh canxi, điều trị tăng huyết áp', trangThai: true },
  { id: 10, tenThuong: 'Paracetamol 500mg', maATC: 'N02BE01', hoatChat: 'Paracetamol', nhomThuoc: 'Giảm đau - Hạ sốt', donVi: 'Viên', giaBan: 500, tonKho: 500, tonKhoToiThieu: 100, hanDung: '2028-06-30', moTa: 'Thuốc giảm đau hạ sốt thông thường', trangThai: true },
  { id: 11, tenThuong: 'Clarithromycin 250mg', maATC: 'J01FA09', hoatChat: 'Clarithromycin', nhomThuoc: 'Kháng sinh', donVi: 'Viên', giaBan: 4800, tonKho: 5, tonKhoToiThieu: 20, hanDung: '2026-04-30', moTa: 'Kháng sinh macrolide', trangThai: true },
  { id: 12, tenThuong: 'Lisinopril 10mg', maATC: 'C09AA03', hoatChat: 'Lisinopril', nhomThuoc: 'Tim mạch', donVi: 'Viên', giaBan: 2200, tonKho: 110, tonKhoToiThieu: 40, hanDung: '2027-04-30', moTa: 'Ức chế ACE điều trị tăng huyết áp', trangThai: true },
  { id: 13, tenThuong: 'Cetirizine 10mg', maATC: 'R06AE07', hoatChat: 'Cetirizine HCl', nhomThuoc: 'Dị ứng', donVi: 'Viên', giaBan: 1800, tonKho: 85, tonKhoToiThieu: 30, hanDung: '2027-05-31', moTa: 'Kháng histamin thế hệ 2 điều trị dị ứng', trangThai: true },
  { id: 14, tenThuong: 'Sertraline 50mg', maATC: 'N06AB06', hoatChat: 'Sertraline HCl', nhomThuoc: 'Thần kinh - Tâm thần', donVi: 'Viên', giaBan: 5500, tonKho: 35, tonKhoToiThieu: 15, hanDung: '2026-10-31', moTa: 'SSRI điều trị trầm cảm và lo âu', trangThai: true },
  { id: 15, tenThuong: 'Insulin Glargine 100IU/mL', maATC: 'A10AE04', hoatChat: 'Insulin glargine', nhomThuoc: 'Đái tháo đường', donVi: 'Lọ', giaBan: 185000, tonKho: 25, tonKhoToiThieu: 10, hanDung: '2026-07-31', moTa: 'Insulin tác dụng kéo dài', trangThai: true },
];

export const mockPatients: Patient[] = [
  { id: 1, maBenhNhan: 'BN001', hoTen: 'Lê Văn Cường', ngaySinh: '1965-05-20', gioiTinh: 'Nam', dienThoai: '0912345678', diChi: '12 Lý Thường Kiệt, Q1, TP.HCM', tieuSuBenh: 'Tăng huyết áp, đái tháo đường type 2', diUng: 'Penicillin', canNang: 72, coThai: false },
  { id: 2, maBenhNhan: 'BN002', hoTen: 'Nguyễn Thị Dung', ngaySinh: '1990-08-14', gioiTinh: 'Nu', dienThoai: '0987654321', diChi: '45 Nguyễn Huệ, Q1, TP.HCM', tieuSuBenh: 'Hen suyễn', diUng: '', canNang: 52, coThai: true },
  { id: 3, maBenhNhan: 'BN003', hoTen: 'Trần Minh Hùng', ngaySinh: '1978-12-03', gioiTinh: 'Nam', dienThoai: '0935678901', diChi: '78 Đinh Tiên Hoàng, Q Bình Thạnh, TP.HCM', tieuSuBenh: 'Rung nhĩ, suy tim độ II', diUng: 'Sulfa', canNang: 68, coThai: false },
  { id: 4, maBenhNhan: 'BN004', hoTen: 'Phạm Thu Hương', ngaySinh: '1955-03-22', gioiTinh: 'Nu', dienThoai: '0923456789', diChi: '23 Cách Mạng Tháng 8, Q3, TP.HCM', tieuSuBenh: 'Loãng xương, viêm khớp', diUng: 'Ibuprofen', canNang: 58, coThai: false },
  { id: 5, maBenhNhan: 'BN005', hoTen: 'Võ Văn Khoa', ngaySinh: '1985-07-10', gioiTinh: 'Nam', dienThoai: '0945678123', diChi: '156 Lê Lợi, Q1, TP.HCM', tieuSuBenh: 'Viêm loét dạ dày tá tràng', diUng: '', canNang: 75, coThai: false },
  { id: 6, maBenhNhan: 'BN006', hoTen: 'Bùi Thị Lan', ngaySinh: '1998-01-30', gioiTinh: 'Nu', dienThoai: '0956781234', diChi: '89 Trần Phú, Q5, TP.HCM', tieuSuBenh: 'Trầm cảm, lo âu', diUng: '', canNang: 48, coThai: false },
  { id: 7, maBenhNhan: 'BN007', hoTen: 'Đinh Quốc Minh', ngaySinh: '1970-09-15', gioiTinh: 'Nam', dienThoai: '0901234567', diChi: '34 Bà Huyện Thanh Quan, Q3, TP.HCM', tieuSuBenh: 'Rối loạn mỡ máu, tăng huyết áp', diUng: 'Aspirin', canNang: 82, coThai: false },
  { id: 8, maBenhNhan: 'BN008', hoTen: 'Hoàng Thị Mai', ngaySinh: '2001-11-05', gioiTinh: 'Nu', dienThoai: '0912987654', diChi: '67 Phan Xích Long, Q Phú Nhuận, TP.HCM', tieuSuBenh: 'Viêm amidan mãn tính', diUng: '', canNang: 45, coThai: false },
];

export const mockContraindications: ContraindicationRule[] = [
  { id: 1, thuocID: 1, tenThuoc: 'Amoxicillin 500mg', maATC: 'J01CA04', dieuKien: 'Dị ứng Penicillin', mucDoNguyHiem: 'Tuyet doi', heuQua: 'Sốc phản vệ, tử vong', moTa: 'Chống chỉ định tuyệt đối với bệnh nhân có tiền sử dị ứng Penicillin' },
  { id: 2, thuocID: 5, tenThuoc: 'Warfarin 5mg', maATC: 'B01AA03', dieuKien: 'Có thai', mucDoNguyHiem: 'Tuyet doi', heuQua: 'Dị tật thai nhi, xuất huyết thai nhi', moTa: 'Warfarin chống chỉ định tuyệt đối trong thai kỳ' },
  { id: 3, thuocID: 6, tenThuoc: 'Ibuprofen 400mg', maATC: 'M01AE01', dieuKien: 'Dị ứng Ibuprofen', mucDoNguyHiem: 'Tuyet doi', heuQua: 'Phản ứng dị ứng nặng, sốc phản vệ', moTa: 'Chống chỉ định với bệnh nhân dị ứng Ibuprofen hoặc NSAID' },
  { id: 4, thuocID: 6, tenThuoc: 'Ibuprofen 400mg', maATC: 'M01AE01', dieuKien: 'Có thai (3 tháng cuối)', mucDoNguyHiem: 'Tuyet doi', heuQua: 'Đóng sớm ống động mạch thai nhi', moTa: 'Chống chỉ định trong 3 tháng cuối thai kỳ' },
  { id: 5, thuocID: 8, tenThuoc: 'Ciprofloxacin 500mg', maATC: 'J01MA02', dieuKien: 'Có thai', mucDoNguyHiem: 'Tuong doi', heuQua: 'Ảnh hưởng xương khớp thai nhi', moTa: 'Hạn chế fluoroquinolone trong thai kỳ' },
  { id: 6, thuocID: 2, tenThuoc: 'Aspirin 100mg', maATC: 'B01AC06', dieuKien: 'Dị ứng Aspirin', mucDoNguyHiem: 'Tuyet doi', heuQua: 'Hen phế quản do aspirin, sốc phản vệ', moTa: 'Chống chỉ định với bệnh nhân dị ứng aspirin hoặc NSAID' },
  { id: 7, thuocID: 15, tenThuoc: 'Insulin Glargine', maATC: 'A10AE04', dieuKien: 'Hạ đường huyết', mucDoNguyHiem: 'Tuong doi', heuQua: 'Hôn mê hạ đường huyết', moTa: 'Thận trọng ở bệnh nhân có hạ đường huyết' },
];

export const mockInteractions: DrugInteraction[] = [
  { id: 1, thuocID_1: 2, tenThuoc_1: 'Aspirin 100mg', maATC_1: 'B01AC06', thuocID_2: 5, tenThuoc_2: 'Warfarin 5mg', maATC_2: 'B01AA03', mucDo: 'Nghiem trong', coCheTacDung: 'Tăng nguy cơ xuất huyết do tác dụng chống đông cộng hợp', khuyen_cao: 'Tránh phối hợp. Nếu bắt buộc, theo dõi INR chặt chẽ và giảm liều Warfarin' },
  { id: 2, thuocID_1: 3, tenThuoc_1: 'Metformin 500mg', maATC_1: 'A10BA02', thuocID_2: 15, tenThuoc_2: 'Insulin Glargine', maATC_2: 'A10AE04', mucDo: 'Trung binh', coCheTacDung: 'Tăng nguy cơ hạ đường huyết khi phối hợp', khuyen_cao: 'Theo dõi đường huyết thường xuyên, điều chỉnh liều insulin' },
  { id: 3, thuocID_1: 4, tenThuoc_1: 'Atorvastatin 10mg', maATC_1: 'C10AA05', thuocID_2: 8, tenThuoc_2: 'Ciprofloxacin 500mg', maATC_2: 'J01MA02', mucDo: 'Trung binh', coCheTacDung: 'Ciprofloxacin ức chế CYP3A4, làm tăng nồng độ Atorvastatin', khuyen_cao: 'Theo dõi nguy cơ bệnh cơ, điều chỉnh liều Atorvastatin nếu cần' },
  { id: 4, thuocID_1: 5, tenThuoc_1: 'Warfarin 5mg', maATC_1: 'B01AA03', thuocID_2: 7, tenThuoc_2: 'Omeprazole 20mg', maATC_2: 'A02BC01', mucDo: 'Nhe', coCheTacDung: 'Omeprazole ức chế CYP2C19, có thể tăng tác dụng của Warfarin', khuyen_cao: 'Theo dõi INR sau khi thêm hoặc ngừng Omeprazole' },
  { id: 5, thuocID_1: 9, tenThuoc_1: 'Amlodipine 5mg', maATC_1: 'C08CA01', thuocID_2: 12, tenThuoc_2: 'Lisinopril 10mg', maATC_2: 'C09AA03', mucDo: 'Nhe', coCheTacDung: 'Tác dụng hạ áp cộng hợp', khuyen_cao: 'Phối hợp có lợi, theo dõi huyết áp thường xuyên' },
  { id: 6, thuocID_1: 1, tenThuoc_1: 'Amoxicillin 500mg', maATC_1: 'J01CA04', thuocID_2: 2, tenThuoc_2: 'Aspirin 100mg', maATC_2: 'B01AC06', mucDo: 'Nghiem trong', coCheTacDung: 'Aspirin làm giảm bài tiết Amoxicillin qua thận, tăng nồng độ trong máu', khuyen_cao: 'Tránh phối hợp. Nếu cần, điều chỉnh liều và theo dõi chức năng thận' },
];

export const mockPrescriptions: Prescription[] = [
  {
    id: 1, maDonThuoc: 'DT240115001', bacSiID: 2, tenBacSi: 'BS. Nguyễn Văn An',
    benhNhanID: 1, tenBenhNhan: 'Lê Văn Cường', chanDoan: 'Nhiễm khuẩn đường hô hấp trên',
    ngayKe: '2024-01-15', trangThai: 'Da cap', ghiChu: '',
    chiTiet: [
      { thuocID: 10, tenThuoc: 'Paracetamol 500mg', soLuong: 20, lieuMoiLan: 1, soLanDungNgay: 3, cachDung: 'Uống sau ăn' },
      { thuocID: 7, tenThuoc: 'Omeprazole 20mg', soLuong: 10, lieuMoiLan: 1, soLanDungNgay: 1, cachDung: 'Uống trước ăn sáng' },
    ], hasWarning: false,
  },
  {
    id: 2, maDonThuoc: 'DT240120002', bacSiID: 3, tenBacSi: 'BS. Trần Thị Bình',
    benhNhanID: 2, tenBenhNhan: 'Nguyễn Thị Dung', chanDoan: 'Viêm họng cấp',
    ngayKe: '2024-01-20', trangThai: 'Cho duyet', ghiChu: 'Bệnh nhân có thai, cần theo dõi',
    chiTiet: [
      { thuocID: 13, tenThuoc: 'Cetirizine 10mg', soLuong: 10, lieuMoiLan: 1, soLanDungNgay: 1, cachDung: 'Uống tối' },
    ], hasWarning: true,
  },
  {
    id: 3, maDonThuoc: 'DT240125003', bacSiID: 2, tenBacSi: 'BS. Nguyễn Văn An',
    benhNhanID: 3, tenBenhNhan: 'Trần Minh Hùng', chanDoan: 'Rung nhĩ, điều trị chống đông',
    ngayKe: '2024-01-25', trangThai: 'Da cap', ghiChu: 'Theo dõi INR mỗi tuần',
    chiTiet: [
      { thuocID: 5, tenThuoc: 'Warfarin 5mg', soLuong: 30, lieuMoiLan: 1, soLanDungNgay: 1, cachDung: 'Uống tối, cùng giờ' },
      { thuocID: 7, tenThuoc: 'Omeprazole 20mg', soLuong: 30, lieuMoiLan: 1, soLanDungNgay: 1, cachDung: 'Uống trước ăn sáng' },
    ], hasWarning: true, overrideReason: 'Bệnh nhân cần phối hợp thuốc, theo dõi INR chặt chẽ',
  },
  {
    id: 4, maDonThuoc: 'DT240201004', bacSiID: 3, tenBacSi: 'BS. Trần Thị Bình',
    benhNhanID: 5, tenBenhNhan: 'Võ Văn Khoa', chanDoan: 'Loét dạ dày H. pylori',
    ngayKe: '2024-02-01', trangThai: 'Da cap', ghiChu: 'Phác đồ diệt H. pylori',
    chiTiet: [
      { thuocID: 1, tenThuoc: 'Amoxicillin 500mg', soLuong: 28, lieuMoiLan: 2, soLanDungNgay: 2, cachDung: 'Uống sau ăn' },
      { thuocID: 8, tenThuoc: 'Ciprofloxacin 500mg', soLuong: 14, lieuMoiLan: 1, soLanDungNgay: 2, cachDung: 'Uống sau ăn' },
      { thuocID: 7, tenThuoc: 'Omeprazole 20mg', soLuong: 14, lieuMoiLan: 1, soLanDungNgay: 2, cachDung: 'Uống trước ăn' },
    ], hasWarning: false,
  },
  {
    id: 5, maDonThuoc: 'DT240210005', bacSiID: 2, tenBacSi: 'BS. Nguyễn Văn An',
    benhNhanID: 7, tenBenhNhan: 'Đinh Quốc Minh', chanDoan: 'Tăng mỡ máu, tăng huyết áp',
    ngayKe: '2024-02-10', trangThai: 'Da cap', ghiChu: '',
    chiTiet: [
      { thuocID: 4, tenThuoc: 'Atorvastatin 10mg', soLuong: 30, lieuMoiLan: 1, soLanDungNgay: 1, cachDung: 'Uống tối' },
      { thuocID: 9, tenThuoc: 'Amlodipine 5mg', soLuong: 30, lieuMoiLan: 1, soLanDungNgay: 1, cachDung: 'Uống sáng' },
      { thuocID: 12, tenThuoc: 'Lisinopril 10mg', soLuong: 30, lieuMoiLan: 1, soLanDungNgay: 1, cachDung: 'Uống sáng' },
    ], hasWarning: false,
  },
];

export const mockAuditLogs: AuditLog[] = [
  { id: 1, userID: 2, tenNguoiDung: 'BS. Nguyễn Văn An', bangDuLieu: 'DonThuoc', hanhDong: 'Them', thoiGian: '2024-01-15 09:30:00', giaTriCu: '', giaTriMoi: 'Tạo đơn thuốc DT240115001 cho BN Lê Văn Cường' },
  { id: 2, userID: 3, tenNguoiDung: 'BS. Trần Thị Bình', bangDuLieu: 'DonThuoc', hanhDong: 'Override', thoiGian: '2024-01-25 14:15:00', giaTriCu: 'Cảnh báo tương tác Warfarin - Omeprazole', giaTriMoi: 'Chấp nhận tương tác', lyDoOverride: 'Bệnh nhân cần phối hợp thuốc, theo dõi INR chặt chẽ' },
  { id: 3, userID: 1, tenNguoiDung: 'Nguyễn Văn A', bangDuLieu: 'NguoiDung', hanhDong: 'Sua', thoiGian: '2024-02-01 10:00:00', giaTriCu: 'trangThai: true', giaTriMoi: 'trangThai: false (Khóa tài khoản DS. Phạm Văn Tùng)' },
  { id: 4, userID: 4, tenNguoiDung: 'DS. Lê Thị Hoa', bangDuLieu: 'Thuoc', hanhDong: 'Sua', thoiGian: '2024-02-05 15:30:00', giaTriCu: 'tonKho: 25', giaTriMoi: 'tonKho: 30' },
  { id: 5, userID: 2, tenNguoiDung: 'BS. Nguyễn Văn An', bangDuLieu: 'DonThuoc', hanhDong: 'Them', thoiGian: '2024-02-01 11:00:00', giaTriCu: '', giaTriMoi: 'Tạo đơn thuốc DT240201004 cho BN Võ Văn Khoa' },
  { id: 6, userID: 1, tenNguoiDung: 'Nguyễn Văn A', bangDuLieu: 'ChongChiDinh', hanhDong: 'Them', thoiGian: '2024-02-10 09:00:00', giaTriCu: '', giaTriMoi: 'Thêm quy tắc CCĐ: Warfarin - Có thai (Tuyệt đối)' },
  { id: 7, userID: 3, tenNguoiDung: 'BS. Trần Thị Bình', bangDuLieu: 'DonThuoc', hanhDong: 'Them', thoiGian: '2024-01-20 13:00:00', giaTriCu: '', giaTriMoi: 'Tạo đơn thuốc DT240120002 cho BN Nguyễn Thị Dung' },
  { id: 8, userID: 4, tenNguoiDung: 'DS. Lê Thị Hoa', bangDuLieu: 'Thuoc', hanhDong: 'Them', thoiGian: '2024-03-01 08:00:00', giaTriCu: '', giaTriMoi: 'Thêm thuốc mới: Cetirizine 10mg (R06AE07)' },
  { id: 9, userID: 2, tenNguoiDung: 'BS. Nguyễn Văn An', bangDuLieu: 'BenhNhan', hanhDong: 'Them', thoiGian: '2024-03-05 10:20:00', giaTriCu: '', giaTriMoi: 'Thêm bệnh nhân mới: BN008 Hoàng Thị Mai' },
  { id: 10, userID: 1, tenNguoiDung: 'Nguyễn Văn A', bangDuLieu: 'TuongTacThuoc', hanhDong: 'Them', thoiGian: '2024-03-10 14:00:00', giaTriCu: '', giaTriMoi: 'Thêm tương tác: Aspirin + Warfarin (Nghiêm trọng)' },
];
