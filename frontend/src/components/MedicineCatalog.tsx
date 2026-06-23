import { useState } from 'react';
import { Search, Plus, Pencil, Trash2, X, AlertTriangle, CheckCircle, Download } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import type { Medicine, User } from '../types';

const HoverMarquee = ({ text, className = "", maxWidth = "max-w-[140px]" }: { text: string, className?: string, maxWidth?: string }) => (
  <div className={`group flex items-center overflow-hidden whitespace-nowrap ${maxWidth}`} title={text}>
    <div className={`truncate group-hover:hidden ${className}`}>{text}</div>
    <div className={`hidden group-hover:inline-block animate-marquee whitespace-nowrap ${className}`}>{text}</div>
  </div>
);

interface Props {
  medicines: Medicine[];
  setMedicines: (meds: Medicine[]) => void;
  currentUser: User;
  addAuditLog: (table: string, action: 'Them' | 'Sua' | 'Xoa', oldVal: string, newVal: string) => void;
}

const EMPTY_MED: Omit<Medicine, 'id'> = {
  tenThuong: '', maATC: '', hoatChat: '', nhomThuoc: 'Kháng sinh',
  donVi: 'Viên', doiTuong: 'Tất cả', // <--- Thêm đúng dòng này vào
  giaBan: 0, tonKho: 0, tonKhoToiThieu: 0,
  hanDung: '', moTa: '', trangThai: true,
};

const DON_VI_OPTIONS = ['Viên', 'Lọ', 'Ống', 'Gói', 'Hộp', 'Chai'];
export function MedicineCatalog({ medicines, setMedicines, currentUser, addAuditLog }: Props) {
  const [search, setSearch] = useState('');
  const [filterNhom, setFilterNhom] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editMed, setEditMed] = useState<Medicine | null>(null);
  const [form, setForm] = useState<Omit<Medicine, 'id'>>(EMPTY_MED);
  const [customNhom, setCustomNhom] = useState('');
  const [deleteConfirm, setDeleteConfirm] = useState<Medicine | null>(null);

  const dynamicNhomOptions = Array.from(new Set(medicines.map(m => m.nhomThuoc).filter(Boolean)));
  const NHOM_OPTIONS = dynamicNhomOptions.filter(n => n !== 'Khác').sort();
  NHOM_OPTIONS.push('Khác');

  const today = new Date();

  const filtered = medicines.filter(m => {
    const q = search.toLowerCase();
    const matchSearch = !q || m.tenThuong.toLowerCase().includes(q) || m.maATC.toLowerCase().includes(q) || m.hoatChat.toLowerCase().includes(q);
    const matchNhom = !filterNhom || m.nhomThuoc === filterNhom;
    return matchSearch && matchNhom;
  });

  const openAdd = () => { setEditMed(null); setForm(EMPTY_MED); setCustomNhom(''); setModalOpen(true); };
  const openEdit = (m: Medicine) => { 
    setEditMed(m); 
    if (!NHOM_OPTIONS.includes(m.nhomThuoc)) {
      setForm({ ...m, nhomThuoc: 'Khác' });
      setCustomNhom(m.nhomThuoc);
    } else {
      setForm({ ...m });
      setCustomNhom('');
    }
    setModalOpen(true); 
  };

  const handleSave = async () => {
    if (!form.tenThuong.trim() || !form.maATC.trim() || !form.hoatChat.trim() || !form.hanDung) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    if (form.tonKho < 0 || form.tonKhoToiThieu < 0) {
      toast.error('Tồn kho và tồn kho tối thiểu không được âm.');
      return;
    }
    if (form.giaBan < 0) {
      toast.error('Giá bán không được âm.');
      return;
    }

    let finalNhom = form.nhomThuoc;
    if (finalNhom === 'Khác') {
      if (!customNhom.trim()) {
        toast.error('Vui lòng nhập tên nhóm thuốc khác.');
        return;
      }
      finalNhom = customNhom.trim();
    }
    const payload = { ...form, nhomThuoc: finalNhom };

    try {
      const token = localStorage.getItem('token');
      const url = editMed ? `/api/thuoc/${editMed.id}` : '/api/thuoc';
      const method = editMed ? 'PUT' : 'POST';
      
      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || 'Lỗi khi lưu thuốc');
        return;
      }

      if (editMed) {
        setMedicines(medicines.map(m => m.id === editMed.id ? data : m));
        addAuditLog('Thuoc', 'Sua', editMed.tenThuong, form.tenThuong);
        toast.success('Cập nhật thuốc thành công.');
      } else {
        setMedicines([...medicines, data]);
        addAuditLog('Thuoc', 'Them', '', form.tenThuong);
        toast.success('Thêm thuốc thành công.');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ.');
    }
  };

  const handleDelete = async (med: Medicine) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/thuoc/${med.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const data = await res.json();
        toast.error(data.message || 'Lỗi khi xóa thuốc');
        return;
      }

      setMedicines(medicines.map(m => m.id === med.id ? { ...m, trangThai: false } : m));
      addAuditLog('Thuoc', 'Xoa', med.tenThuong, 'Đã xóa (ẩn)');
      toast.success('Đã xóa thuốc khỏi danh mục.');
      setDeleteConfirm(null);
    } catch (err) {
      toast.error('Lỗi kết nối máy chủ.');
    }
  };

  const isAdmin = currentUser.vaiTro === 'Admin';

  const exportCSV = () => {
    const headers = ['Mã ATC', 'Tên thuốc', 'Hoạt chất', 'Nhóm thuốc', 'Đơn vị', 'Giá bán', 'Tồn kho', 'Tồn kho tối thiểu', 'Hạn dùng', 'Trạng thái'];
    const rows = filtered.map(m => [
      m.maATC, m.tenThuong, m.hoatChat, m.nhomThuoc, m.donVi,
      m.giaBan, m.tonKho, m.tonKhoToiThieu, m.hanDung,
      m.trangThai ? 'Hoạt động' : 'Đã vô hiệu'
    ].map(v => `"${String(v ?? '').replace(/"/g, '""')}"`).join(','));
    const csv = '\uFEFF' + [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `danh-muc-thuoc-${new Date().toISOString().slice(0,10)}.csv`;
    a.click(); URL.revokeObjectURL(url);
  };

  const getStockStatus = (m: Medicine) => {
    if (new Date(m.hanDung) < today) return { label: 'Hết hạn', cls: 'bg-red-100 text-red-700' };
    if (m.tonKho < m.tonKhoToiThieu) return { label: 'Thiếu kho', cls: 'bg-orange-100 text-orange-700' };
    return { label: 'Bình thường', cls: 'bg-green-100 text-green-700' };
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên thuốc, mã ATC, hoạt chất..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        <select value={filterNhom} onChange={e => setFilterNhom(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Tất cả nhóm</option>
          {NHOM_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
        </select>
        {isAdmin && (
          <button onClick={openAdd} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Thêm thuốc
          </button>
        )}
        <button onClick={exportCSV} disabled={filtered.length === 0} className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed" title="Xuất Excel">
          <Download className="w-4 h-4" /> Xuất Excel
        </button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Tên thuốc', 'Mã ATC', 'Hoạt chất', 'Nhóm', 'Tồn kho', 'Hạn dùng', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.filter(m => m.trangThai).map(m => {
                const status = getStockStatus(m);
                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <HoverMarquee text={m.tenThuong} className="font-medium text-gray-800" maxWidth="max-w-[160px]" />
                      <div className="text-xs text-gray-400">{m.donVi} · {m.giaBan.toLocaleString()}đ</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 font-mono text-xs">{m.maATC}</td>
                    <td className="px-4 py-3 text-gray-600">
                      <HoverMarquee text={m.hoatChat} maxWidth="max-w-[140px]" />
                    </td>
                    <td className="px-4 py-3">
                      <div className="group flex items-center overflow-hidden whitespace-nowrap max-w-[120px]" title={m.nhomThuoc}>
                        <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs truncate group-hover:hidden">{m.nhomThuoc}</span>
                        <span className="hidden group-hover:inline-block animate-marquee whitespace-nowrap bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full text-xs">{m.nhomThuoc}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{m.tonKho}</div>
                      <div className="text-xs text-gray-400">Tối thiểu: {m.tonKhoToiThieu}</div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 text-xs">{m.hanDung}</td>
                    <td className="px-4 py-3">
                      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${status.cls}`}>{status.label}</span>
                    </td>
                    <td className="px-4 py-3">
                      {isAdmin && (
                        <div className="flex items-center gap-1">
                          <button onClick={() => openEdit(m)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                          <button onClick={() => setDeleteConfirm(m)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                        </div>
                      )}
                    </td>
                  </tr>
                );
              })}
              {filtered.filter(m => m.trangThai).length === 0 && (
                <tr><td colSpan={8} className="text-center py-8 text-gray-400">Không tìm thấy thuốc nào.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-50 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-lg font-semibold text-gray-800">{editMed ? 'Chỉnh sửa thuốc' : 'Thêm thuốc mới'}</Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên thuốc *</label>
                <input value={form.tenThuong} onChange={e => setForm({ ...form, tenThuong: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="VD: Amoxicillin 500mg" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mã ATC *</label>
                <input value={form.maATC} onChange={e => setForm({ ...form, maATC: e.target.value.toUpperCase() })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm font-mono focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="VD: J01CA04" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hoạt chất *</label>
                <input value={form.hoatChat} onChange={e => setForm({ ...form, hoatChat: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Nhóm thuốc</label>
                <div className="flex flex-col gap-2">
                  <select value={form.nhomThuoc} onChange={e => setForm({ ...form, nhomThuoc: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    {NHOM_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                  </select>
                  {form.nhomThuoc === 'Khác' && (
                    <input 
                      value={customNhom} 
                      onChange={e => setCustomNhom(e.target.value)} 
                      placeholder="Nhập tên nhóm thuốc..."
                      className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" 
                    />
                  )}
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Đối tượng sử dụng *</label>
                <input 
                  value={form.doiTuong} 
                  onChange={e => setForm({ ...form, doiTuong: e.target.value })} 
                  placeholder="VD: Nam > 12 tuổi, Phụ nữ có thai..."
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Đơn vị</label>
                <select value={form.donVi} onChange={e => setForm({ ...form, donVi: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  {DON_VI_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Giá bán (đồng)</label>
                <input type="number" value={form.giaBan} onChange={e => setForm({ ...form, giaBan: +e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" min={0} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tồn kho</label>
                <input type="number" value={form.tonKho} onChange={e => setForm({ ...form, tonKho: +e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" min={0} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tồn kho tối thiểu</label>
                <input type="number" value={form.tonKhoToiThieu} onChange={e => setForm({ ...form, tonKhoToiThieu: +e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" min={0} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hạn sử dụng *</label>
                <input type="date" value={form.hanDung} onChange={e => setForm({ ...form, hanDung: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={form.moTa} onChange={e => setForm({ ...form, moTa: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Dialog.Close className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Hủy</Dialog.Close>
              <button onClick={handleSave} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                {editMed ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete confirm */}
      <Dialog.Root open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-sm z-50 p-6">
            <div className="flex flex-col items-center text-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <Dialog.Title className="text-gray-800 font-semibold">Xác nhận xóa thuốc</Dialog.Title>
              <p className="text-gray-500 text-sm">Bạn có chắc muốn xóa <strong>{deleteConfirm?.tenThuong}</strong>? Thuốc sẽ bị ẩn khỏi danh mục.</p>
              <div className="flex gap-3 w-full mt-2">
                <Dialog.Close className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">Hủy</Dialog.Close>
                <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors">Xóa</button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
