import React, { useState } from 'react';
import { Search, FileText, Calendar, Pill, User, Stethoscope, ChevronDown, ChevronUp } from 'lucide-react';

// MOCK DATA: Bệnh nhân
const mockPatients = [
  { benhNhanID: 1, hoTen: 'Nguyễn Văn A', ngaySinh: '1990-05-15', tienSuBenh: 'Dị ứng Penicillin' },
  { benhNhanID: 2, hoTen: 'Trần Thị B', ngaySinh: '1985-10-20', tienSuBenh: 'Không' }
];

// MOCK DATA: Đơn thuốc
const mockDonThuoc = [
  { donThuocID: 101, benhNhanID: 1, bacSiID: 2, bacSiTen: 'BS. Lê C', ngayLap: '2026-06-15', chanDoan: 'Viêm họng cấp', trangThai: 'Đã hoàn tất' },
  { donThuocID: 102, benhNhanID: 1, bacSiID: 2, bacSiTen: 'BS. Lê C', ngayLap: '2026-05-01', chanDoan: 'Sốt siêu vi', trangThai: 'Đã hoàn tất' },
  { donThuocID: 103, benhNhanID: 2, bacSiID: 3, bacSiTen: 'BS. Phạm D', ngayLap: '2026-06-20', chanDoan: 'Viêm phế quản', trangThai: 'Đang điều trị' }
];

// MOCK DATA: Chi tiết đơn thuốc (Có join tên thuốc)
const mockChiTiet = [
  { chiTietID: 1, donThuocID: 101, thuocTen: 'Amoxicillin 500mg', soLuong: 14, lieuMoiLan: 1, soLanDungNgay: 2, tongLieuNgay: 2 },
  { chiTietID: 2, donThuocID: 101, thuocTen: 'Paracetamol 500mg', soLuong: 10, lieuMoiLan: 1, soLanDungNgay: 2, tongLieuNgay: 2 },
  { chiTietID: 3, donThuocID: 102, thuocTen: 'Ibuprofen 400mg', soLuong: 15, lieuMoiLan: 1, soLanDungNgay: 3, tongLieuNgay: 3 },
  { chiTietID: 4, donThuocID: 103, thuocTen: 'Cefuroxime 500mg', soLuong: 10, lieuMoiLan: 1, soLanDungNgay: 2, tongLieuNgay: 2 },
  { chiTietID: 5, donThuocID: 103, thuocTen: 'Bromhexin 8mg', soLuong: 20, lieuMoiLan: 1, soLanDungNgay: 3, tongLieuNgay: 3 }
];

export default function LichSuKhamBenh() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [expandedDonThuoc, setExpandedDonThuoc] = useState(null);

  // Lọc bệnh nhân
  const filteredPatients = mockPatients.filter(p => 
    p.hoTen.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.benhNhanID.toString().includes(searchTerm)
  );

  // Lọc đơn thuốc theo bệnh nhân đã chọn
  const patientDonThuoc = selectedPatient 
    ? mockDonThuoc.filter(d => d.benhNhanID === selectedPatient.benhNhanID).sort((a, b) => new Date(b.ngayLap) - new Date(a.ngayLap))
    : [];

  const toggleExpand = (donThuocID) => {
    setExpandedDonThuoc(prev => prev === donThuocID ? null : donThuocID);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <FileText className="w-8 h-8 text-blue-600" />
          Lịch Sử Khám Bệnh & Đơn Thuốc
        </h1>
        <p className="text-gray-500 mt-2">Tra cứu lại các chẩn đoán và toa thuốc đã từng kê cho bệnh nhân.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PANEL TRÁI: Tìm kiếm và chọn bệnh nhân */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 lg:col-span-1 h-fit">
          <h2 className="font-semibold text-gray-700 mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-blue-500" /> Chọn Bệnh Nhân
          </h2>
          <div className="relative mb-4">
            <input
              type="text"
              placeholder="Nhập tên hoặc ID..."
              className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
          </div>

          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {filteredPatients.map(patient => (
              <div 
                key={patient.benhNhanID}
                onClick={() => { setSelectedPatient(patient); setExpandedDonThuoc(null); }}
                className={`p-3 rounded-lg border cursor-pointer transition-all ${selectedPatient?.benhNhanID === patient.benhNhanID ? 'border-blue-500 bg-blue-50' : 'border-gray-100 hover:border-blue-300 hover:bg-gray-50'}`}
              >
                <div className="font-semibold text-gray-800">{patient.hoTen} <span className="text-xs text-gray-500 font-normal ml-1">(#{patient.benhNhanID})</span></div>
                <div className="text-sm text-gray-600 mt-1 flex items-center gap-1"><Calendar className="w-3 h-3"/> Sinh năm: {patient.ngaySinh.split('-')[0]}</div>
              </div>
            ))}
            {filteredPatients.length === 0 && <p className="text-sm text-gray-500 text-center py-4">Không tìm thấy bệnh nhân.</p>}
          </div>
        </div>

        {/* PANEL PHẢI: Lịch sử đơn thuốc của bệnh nhân được chọn */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 lg:col-span-2">
          {!selectedPatient ? (
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center text-gray-400">
              <FileText className="w-16 h-16 mb-4 opacity-20" />
              <p>Vui lòng chọn một bệnh nhân để xem lịch sử khám bệnh.</p>
            </div>
          ) : (
            <>
              <div className="border-b border-gray-100 pb-4 mb-6 flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">{selectedPatient.hoTen}</h2>
                  <p className="text-sm text-gray-500 mt-1">
                    Ngày sinh: {selectedPatient.ngaySinh} | Tiền sử bệnh: <span className="font-medium text-red-500">{selectedPatient.tienSuBenh}</span>
                  </p>
                </div>
                <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm font-semibold">
                  {patientDonThuoc.length} Đơn thuốc
                </div>
              </div>

              {patientDonThuoc.length === 0 ? (
                <p className="text-center text-gray-500 py-10">Bệnh nhân này chưa có lịch sử khám bệnh.</p>
              ) : (
                <div className="space-y-4">
                  {patientDonThuoc.map(don => (
                    <div key={don.donThuocID} className="border border-gray-200 rounded-lg overflow-hidden">
                      {/* HEADER ĐƠN THUỐC */}
                      <div 
                        className="bg-gray-50 p-4 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                        onClick={() => toggleExpand(don.donThuocID)}
                      >
                        <div className="flex gap-4 items-center">
                          <div className="bg-white p-2 rounded-lg border border-gray-200 shadow-sm text-center min-w-[70px]">
                            <div className="text-xs text-gray-500 uppercase">{new Date(don.ngayLap).toLocaleString('default', { month: 'short' })}</div>
                            <div className="text-lg font-bold text-blue-600">{new Date(don.ngayLap).getDate()}</div>
                            <div className="text-xs text-gray-500">{new Date(don.ngayLap).getFullYear()}</div>
                          </div>
                          <div>
                            <h3 className="font-bold text-gray-800 text-lg">{don.chanDoan}</h3>
                            <div className="text-sm text-gray-600 flex items-center gap-4 mt-1">
                              <span className="flex items-center gap-1"><Stethoscope className="w-4 h-4"/> {don.bacSiTen}</span>
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${don.trangThai === 'Đã hoàn tất' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'}`}>
                                {don.trangThai}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-gray-400">
                          {expandedDonThuoc === don.donThuocID ? <ChevronUp className="w-6 h-6" /> : <ChevronDown className="w-6 h-6" />}
                        </div>
                      </div>

                      {/* CHI TIẾT ĐƠN THUỐC (Expandable) */}
                      {expandedDonThuoc === don.donThuocID && (
                        <div className="p-4 border-t border-gray-200 bg-white">
                          <h4 className="font-semibold text-gray-700 mb-3 flex items-center gap-2">
                            <Pill className="w-4 h-4 text-blue-500" /> Chi tiết thuốc kê đơn
                          </h4>
                          <div className="overflow-x-auto">
                            <table className="w-full text-left text-sm">
                              <thead>
                                <tr className="text-gray-500 border-b border-gray-100">
                                  <th className="py-2 px-3 font-medium">Tên thuốc</th>
                                  <th className="py-2 px-3 font-medium text-center">Liều 1 lần</th>
                                  <th className="py-2 px-3 font-medium text-center">Số lần/ngày</th>
                                  <th className="py-2 px-3 font-medium text-center">Tổng số lượng</th>
                                </tr>
                              </thead>
                              <tbody>
                                {mockChiTiet.filter(c => c.donThuocID === don.donThuocID).map((chitiet, idx) => (
                                  <tr key={idx} className="border-b border-gray-50 last:border-0 hover:bg-gray-50">
                                    <td className="py-3 px-3 font-medium text-gray-800">{chitiet.thuocTen}</td>
                                    <td className="py-3 px-3 text-center">{chitiet.lieuMoiLan} viên</td>
                                    <td className="py-3 px-3 text-center">{chitiet.soLanDungNgay} lần</td>
                                    <td className="py-3 px-3 text-center font-semibold text-blue-600">{chitiet.soLuong} viên</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
