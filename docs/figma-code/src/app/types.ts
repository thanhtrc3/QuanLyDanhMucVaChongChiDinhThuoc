export type Role = 'Admin' | 'Bac si' | 'Duoc si';

export type View =
  | 'dashboard'
  | 'medicines'
  | 'patients'
  | 'prescriptions'
  | 'contraindications'
  | 'interactions'
  | 'inventory'
  | 'users'
  | 'audit-logs'
  | 'settings';

export interface User {
  id: number;
  tenDangNhap: string;
  hoTen: string;
  vaiTro: Role;
  trangThai: boolean;
  email: string;
  ngayTao: string;
}

export interface Medicine {
  id: number;
  tenThuong: string;
  maATC: string;
  hoatChat: string;
  nhomThuoc: string;
  doiTuong: 'Người lớn' | 'Trẻ em' | 'Phụ nữ có thai' | 'Tất cả'; 
  donVi: string;
  giaBan: number;
  tonKho: number;
  tonKhoToiThieu: number;
  hanDung: string;
  moTa: string;
  trangThai: boolean;
}

export interface Patient {
  id: number;
  maBenhNhan: string;
  hoTen: string;
  ngaySinh: string;
  gioiTinh: 'Nam' | 'Nu';
  dienThoai: string;
  diChi: string;
  tieuSuBenh: string;
  diUng: string;
  canNang: number | null;
  coThai: boolean;
}

export interface PrescriptionDetail {
  thuocID: number;
  tenThuoc: string;
  soLuong: number;
  lieuMoiLan: number;
  soLanDungNgay: number;
  cachDung: string;
}

export interface Prescription {
  id: number;
  maDonThuoc: string;
  bacSiID: number;
  tenBacSi: string;
  benhNhanID: number;
  tenBenhNhan: string;
  chanDoan: string;
  ngayKe: string;
  trangThai: 'Cho duyet' | 'Da cap' | 'Huy';
  ghiChu: string;
  chiTiet: PrescriptionDetail[];
  hasWarning: boolean;
  overrideReason?: string;
}

export interface ContraindicationRule {
  id: number;
  thuocID: number;
  tenThuoc: string;
  maATC: string;
  dieuKien: string;
  mucDoNguyHiem: 'Tuyet doi' | 'Tuong doi' | 'Canh bao';
  heuQua: string;
  moTa: string;
}

export interface DrugInteraction {
  id: number;
  thuocID_1: number;
  tenThuoc_1: string;
  maATC_1: string;
  thuocID_2: number;
  tenThuoc_2: string;
  maATC_2: string;
  mucDo: 'Nghiem trong' | 'Trung binh' | 'Nhe';
  coCheTacDung: string;
  khuyen_cao: string;
}

export interface AuditLog {
  id: number;
  userID: number;
  tenNguoiDung: string;
  bangDuLieu: string;
  hanhDong: 'Them' | 'Sua' | 'Xoa' | 'Override';
  thoiGian: string;
  giaTriCu: string;
  giaTriMoi: string;
  lyDoOverride?: string;
}

export interface SafetyWarning {
  type: 'Chống chỉ định' | 'Tương tác thuốc';
  mucDo: string;
  medicine?: string;
  medicinePair?: string[];
  message: string;
  consequence?: string;
}
