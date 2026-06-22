import React from 'react';
import { FileText, Calendar, Stethoscope } from 'lucide-react';

export default function DanhSachKhamTruoc({ lichSuKham }) {
  // Nếu không có dữ liệu truyền vào hoặc mảng rỗng
  if (!lichSuKham || lichSuKham.length === 0) {
    return (
      <div className="p-6 border border-gray-200 rounded-xl text-center text-gray-500 bg-gray-50">
        Bệnh nhân này chưa có lịch sử khám bệnh.
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <div className="bg-blue-50 px-5 py-3 border-b border-blue-100 flex items-center gap-2">
        <FileText className="w-5 h-5 text-blue-600" />
        <h3 className="font-bold text-blue-800">Lịch sử các lần khám trước</h3>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="bg-gray-50 text-gray-600 border-b border-gray-200">
              <th className="py-3 px-4 font-semibold">Mã Đơn</th>
              <th className="py-3 px-4 font-semibold">Ngày khám</th>
              <th className="py-3 px-4 font-semibold">Bác sĩ khám</th>
              <th className="py-3 px-4 font-semibold">Chẩn đoán</th>
              <th className="py-3 px-4 font-semibold">Trạng thái</th>
            </tr>
          </thead>
          <tbody>
            {lichSuKham.map((lanKham) => (
              <tr key={lanKham.donThuocID} className="border-b border-gray-100 hover:bg-blue-50/50 transition-colors cursor-pointer">
                <td className="py-3 px-4 font-medium text-blue-600">#{lanKham.donThuocID}</td>
                <td className="py-3 px-4">
                  <span className="flex items-center gap-1.5 text-gray-700">
                    <Calendar className="w-4 h-4 text-gray-400" />
                    {lanKham.ngayLap}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className="flex items-center gap-1.5 text-gray-700">
                    <Stethoscope className="w-4 h-4 text-gray-400" />
                    {lanKham.bacSiTen}
                  </span>
                </td>
                <td className="py-3 px-4 text-gray-800 font-medium">{lanKham.chanDoan}</td>
                <td className="py-3 px-4">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                    lanKham.trangThai === 'Đã hoàn tất' ? 'bg-green-100 text-green-700' : 'bg-orange-100 text-orange-700'
                  }`}>
                    {lanKham.trangThai}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
