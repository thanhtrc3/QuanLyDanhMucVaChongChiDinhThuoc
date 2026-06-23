import { useState, useEffect } from 'react';
import { Search, Clock, History, FileText, User, Download } from 'lucide-react'; // Đã thêm icon Download
import * as XLSX from 'xlsx'; // Import thư viện xuất Excel

const mockLogs = [
  {
    logID: 1,
    userID: 1,
    hanhDong: 'Cập nhật',
    tenBang: 'NguoiDung',
    thoiGian: '2026-06-21 10:30:00',
    giaTriCu: 'vaiTro: Bác sĩ',
    giaTriMoi: 'vaiTro: Quản trị viên',
    lyDoOverride: '',
  },
  {
    logID: 2,
    userID: 2,
    hanhDong: 'Bỏ qua cảnh báo',
    tenBang: 'ChiTietDonThuoc',
    thoiGian: '2026-06-21 11:15:20',
    giaTriCu: '',
    giaTriMoi: 'thuocID: 45, lieu: 2',
    lyDoOverride: 'Bệnh nhân có tiền sử đáp ứng tốt',
  },
  {
    logID: 3,
    userID: 1,
    hanhDong: 'Thêm mới',
    tenBang: 'Thuoc',
    thoiGian: '2026-06-21 14:05:10',
    giaTriCu: '',
    giaTriMoi: 'ten: Paracetamol 500mg',
    lyDoOverride: '',
  }
];

export default function AuditLogUI() {
  const [logs, setLogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    async function fetchLogs() {
      try {
        const res = await fetch('/api/audit-log');
        if (!res.ok) throw new Error('Không thể tải dữ liệu nhật ký');
        const data = await res.json();
        setLogs(data);
      } catch (err) {
        console.error(err);
        // Fallback to mock data on error (for demo purposes)
        setLogs(mockLogs);
      } finally {
        // no op
      }
    }
    fetchLogs();
  }, []);

  const filteredLogs = logs.filter((log) =>
    log.hanhDong.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.tenBang.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Hàm xử lý xuất file Excel
  const handleExport = () => {
    // 1. Tạo một worksheet từ dữ liệu đã lọc (filteredLogs)
    const worksheet = XLSX.utils.json_to_sheet(filteredLogs);
    
    // 2. Tạo một workbook mới và gắn worksheet vào
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "NhatKyHeThong");
    
    // 3. Tải file xuống máy người dùng
    XLSX.writeFile(workbook, "AuditLog_Export.xlsx");
  };

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <History className="w-8 h-8 text-blue-600" />
          Nhật Ký Hệ Thống (Audit Log)
        </h1>
        <p className="text-gray-500 mt-2">Theo dõi và lưu vết mọi thao tác thay đổi dữ liệu trong hệ thống.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Tìm kiếm hành động, tên bảng..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          
          {/* Nút Xuất Excel được thêm vào đây */}
          <button 
            onClick={handleExport}
            className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded-lg font-medium transition-colors shadow-sm"
          >
            <Download className="w-5 h-5" />
            Xuất Excel
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <th className="py-3 px-4 font-semibold">Log ID</th>
                <th className="py-3 px-4 font-semibold">Thời gian</th>
                <th className="py-3 px-4 font-semibold">User ID</th>
                <th className="py-3 px-4 font-semibold">Hành động</th>
                <th className="py-3 px-4 font-semibold">Bảng dữ liệu</th>
                <th className="py-3 px-4 font-semibold">Chi tiết thay đổi</th>
                <th className="py-3 px-4 font-semibold">Lý do Override</th>
              </tr>
            </thead>
            <tbody>
              {filteredLogs.map((log) => (
                <tr key={log.logID} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-600">#{log.logID}</td>
                  <td className="py-3 px-4 text-gray-600 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-400" />
                      {log.thoiGian}
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-gray-100 text-gray-700 text-xs font-medium">
                      <User className="w-3 h-3" /> UID:{log.userID}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${log.hanhDong === 'Thêm mới' ? 'bg-green-100 text-green-700' :
                        log.hanhDong === 'Cập nhật' ? 'bg-blue-100 text-blue-700' :
                        log.hanhDong === 'Bỏ qua cảnh báo' ? 'bg-orange-100 text-orange-700' :
                        'bg-red-100 text-red-700'}`}>
                      {log.hanhDong}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-medium text-gray-700">
                    <div className="flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-gray-400" />
                      {log.tenBang}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm">
                    {log.giaTriCu && <div className="text-red-500 line-through mb-1">- {log.giaTriCu}</div>}
                    {log.giaTriMoi && <div className="text-green-600">+ {log.giaTriMoi}</div>}
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600 italic">
                    {log.lyDoOverride || '-'}
                  </td>
                </tr>
              ))}
              {filteredLogs.length === 0 && (
                <tr>
                  <td colSpan="7" className="py-8 text-center text-gray-500">
                    Không tìm thấy bản ghi nhật ký nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}