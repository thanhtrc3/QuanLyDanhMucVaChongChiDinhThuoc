import { useState } from 'react';
import { Search, Filter, Eye, X } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import type { AuditLog } from '../types';

interface Props {
  logs: AuditLog[];
}

const ACTION_COLORS: Record<string, string> = {
  Them: 'bg-green-100 text-green-700',
  Sua: 'bg-blue-100 text-blue-700',
  Xoa: 'bg-red-100 text-red-700',
  Override: 'bg-orange-100 text-orange-700',
};
const ACTION_LABELS: Record<string, string> = { Them: 'Thêm', Sua: 'Sửa', Xoa: 'Xóa', Override: 'Ghi đè' };

const TABLE_LABELS: Record<string, string> = {
  DonThuoc: 'Đơn thuốc', Thuoc: 'Thuốc', BenhNhan: 'Bệnh nhân',
  NguoiDung: 'Người dùng', ChongChiDinh: 'Chống chỉ định', TuongTacThuoc: 'Tương tác thuốc', Kho: 'Kho thuốc',
};

export function AuditLogs({ logs }: Props) {
  const [search, setSearch] = useState('');
  const [filterAction, setFilterAction] = useState('');
  const [filterTable, setFilterTable] = useState('');
  const [viewLog, setViewLog] = useState<AuditLog | null>(null);

  const sorted = [...logs].sort((a, b) => b.thoiGian.localeCompare(a.thoiGian));

  const filtered = sorted.filter(l => {
    const q = search.toLowerCase();
    const matchQ = !q || l.tenNguoiDung.toLowerCase().includes(q) || l.bangDuLieu.toLowerCase().includes(q) || l.giaTriMoi.toLowerCase().includes(q);
    const matchAction = !filterAction || l.hanhDong === filterAction;
    const matchTable = !filterTable || l.bangDuLieu === filterTable;
    return matchQ && matchAction && matchTable;
  });

  const tables = [...new Set(logs.map(l => l.bangDuLieu))];

  return (
    <div className="space-y-4">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Tổng thao tác', value: logs.length, cls: 'bg-gray-50' },
          { label: 'Thêm mới', value: logs.filter(l => l.hanhDong === 'Them').length, cls: 'bg-green-50 text-green-700' },
          { label: 'Cập nhật', value: logs.filter(l => l.hanhDong === 'Sua').length, cls: 'bg-blue-50 text-blue-700' },
          { label: 'Ghi đè cảnh báo', value: logs.filter(l => l.hanhDong === 'Override').length, cls: 'bg-orange-50 text-orange-700' },
        ].map(({ label, value, cls }) => (
          <div key={label} className={`${cls} rounded-xl border border-gray-200 p-4 bg-white`}>
            <div className="text-2xl font-bold text-gray-800">{value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{label}</div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo người dùng, nội dung..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <select value={filterAction} onChange={e => setFilterAction(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Tất cả hành động</option>
          <option value="Them">Thêm</option>
          <option value="Sua">Sửa</option>
          <option value="Xoa">Xóa</option>
          <option value="Override">Ghi đè</option>
        </select>
        <select value={filterTable} onChange={e => setFilterTable(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Tất cả bảng</option>
          {tables.map(t => <option key={t} value={t}>{TABLE_LABELS[t] || t}</option>)}
        </select>
        <div className="text-xs text-gray-400 flex items-center gap-1">
          <Filter className="w-3 h-3" /> {filtered.length} kết quả
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Thời gian', 'Người dùng', 'Bảng dữ liệu', 'Hành động', 'Nội dung', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(log => (
                <tr key={log.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs font-mono whitespace-nowrap">{log.thoiGian}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 text-sm">{log.tenNguoiDung}</div>
                    <div className="text-xs text-gray-400">ID: {log.userID}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full">{TABLE_LABELS[log.bangDuLieu] || log.bangDuLieu}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[log.hanhDong]}`}>{ACTION_LABELS[log.hanhDong]}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-600 max-w-64 truncate">{log.giaTriMoi || log.giaTriCu}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => setViewLog(log)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={6} className="text-center py-8 text-gray-400">Không có nhật ký nào.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail modal */}
      <Dialog.Root open={!!viewLog} onOpenChange={() => setViewLog(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-lg z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="font-semibold text-gray-800">Chi tiết nhật ký</Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            {viewLog && (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-3 bg-gray-50 rounded-xl p-4">
                  <div><span className="text-gray-400 text-xs block">Thời gian</span><span className="font-mono">{viewLog.thoiGian}</span></div>
                  <div><span className="text-gray-400 text-xs block">Người dùng</span><span>{viewLog.tenNguoiDung}</span></div>
                  <div><span className="text-gray-400 text-xs block">Bảng dữ liệu</span><span>{TABLE_LABELS[viewLog.bangDuLieu] || viewLog.bangDuLieu}</span></div>
                  <div><span className="text-gray-400 text-xs block">Hành động</span><span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ACTION_COLORS[viewLog.hanhDong]}`}>{ACTION_LABELS[viewLog.hanhDong]}</span></div>
                </div>
                {viewLog.giaTriCu && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Giá trị cũ</div>
                    <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-gray-700">{viewLog.giaTriCu}</div>
                  </div>
                )}
                {viewLog.giaTriMoi && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Giá trị mới</div>
                    <div className="bg-green-50 border border-green-100 rounded-lg p-3 text-gray-700">{viewLog.giaTriMoi}</div>
                  </div>
                )}
                {viewLog.lyDoOverride && (
                  <div>
                    <div className="text-xs text-gray-400 mb-1">Lý do ghi đè</div>
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-3 text-orange-800 italic">{viewLog.lyDoOverride}</div>
                  </div>
                )}
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
