import { useState } from 'react';
import { Search, Plus, Pencil, Eye, X, Baby, AlertTriangle, Trash2 } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import type { Patient, User } from '../types';

interface Props {
  patients: Patient[];
  setPatients: (pts: Patient[]) => void;
  currentUser: User;
  addAuditLog: (table: string, action: 'Them' | 'Sua' | 'Xoa', oldVal: string, newVal: string) => void;
}

const EMPTY: Omit<Patient, 'id' | 'maBenhNhan'> = {
  hoTen: '', ngaySinh: '', gioiTinh: 'Nam', dienThoai: '', diChi: '',
  tieuSuBenh: '', diUng: '', canNang: null, coThai: false,
};

function getAge(dob: string) {
  if (!dob) return '';
  const diff = Date.now() - new Date(dob).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)) + ' tuổi';
}

export function PatientManagement({ patients, setPatients, currentUser, addAuditLog }: Props) {
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [viewOpen, setViewOpen] = useState(false);
  const [editPt, setEditPt] = useState<Patient | null>(null);
  const [viewPt, setViewPt] = useState<Patient | null>(null);
  const [form, setForm] = useState<Omit<Patient, 'id' | 'maBenhNhan'>>(EMPTY);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return !q || p.hoTen.toLowerCase().includes(q) || p.maBenhNhan.toLowerCase().includes(q) || p.dienThoai.includes(q);
  });

  const openAdd = () => { setEditPt(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (p: Patient) => { setEditPt(p); setForm({ ...p }); setModalOpen(true); };
  const openView = (p: Patient) => { setViewPt(p); setViewOpen(true); };

  const handleSave = () => {
    if (!form.hoTen.trim() || !form.ngaySinh || !form.dienThoai.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    if (form.canNang !== null && form.canNang <= 0) {
      toast.error('Cân nặng phải lớn hơn 0 nếu được nhập.');
      return;
    }
    if (editPt) {
      setPatients(patients.map(p => p.id === editPt.id ? { ...form, id: editPt.id, maBenhNhan: editPt.maBenhNhan } : p));
      addAuditLog('BenhNhan', 'Sua', editPt.hoTen, form.hoTen);
      toast.success('Cập nhật bệnh nhân thành công.');
    } else {
      const newId = Math.max(...patients.map(p => p.id)) + 1;
      const maBN = `BN${String(newId).padStart(3, '0')}`;
      setPatients([...patients, { ...form, id: newId, maBenhNhan: maBN }]);
      addAuditLog('BenhNhan', 'Them', '', form.hoTen);
      toast.success('Thêm bệnh nhân thành công.');
    }
    setModalOpen(false);
  };

  const handleDelete = (p: Patient) => {
    if (!confirm(`Xóa bệnh nhân "${p.hoTen}"? Hành động này không thể hoàn tác.`)) return;
    setPatients(patients.filter(pt => pt.id !== p.id));
    addAuditLog('BenhNhan', 'Xoa', p.hoTen, '');
    toast.success('Đã xóa bệnh nhân.');
  };

  const canEdit = ['Admin', 'Bac si'].includes(currentUser.vaiTro);

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Tìm theo tên, mã BN, điện thoại..."
            className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
        </div>
        {canEdit && (
          <button onClick={openAdd} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Thêm bệnh nhân
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Mã BN', 'Họ tên', 'Ngày sinh / Tuổi', 'Giới tính', 'Điện thoại', 'Dị ứng', 'Đặc biệt', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.maBenhNhan}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800">{p.hoTen}</div>
                    <div className="text-xs text-gray-400 truncate max-w-40">{p.diChi}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{p.ngaySinh}</div>
                    <div className="text-xs text-gray-400">{getAge(p.ngaySinh)}</div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full ${p.gioiTinh === 'Nam' ? 'bg-blue-50 text-blue-700' : 'bg-pink-50 text-pink-700'}`}>
                      {p.gioiTinh === 'Nam' ? 'Nam' : 'Nữ'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.dienThoai}</td>
                  <td className="px-4 py-3">
                    {p.diUng ? (
                      <span className="flex items-center gap-1 text-xs text-red-600">
                        <AlertTriangle className="w-3 h-3" /> {p.diUng}
                      </span>
                    ) : <span className="text-gray-400 text-xs">Không có</span>}
                  </td>
                  <td className="px-4 py-3">
                    {p.coThai && (
                      <span className="flex items-center gap-1 text-xs text-pink-600 bg-pink-50 px-2 py-0.5 rounded-full">
                        <Baby className="w-3 h-3" /> Có thai
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                      {canEdit && <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>}
                      {canEdit && <button onClick={() => handleDelete(p)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={8} className="text-center py-8 text-gray-400">Không tìm thấy bệnh nhân nào.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <Dialog.Root open={viewOpen} onOpenChange={setViewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-lg z-50 p-6">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-lg font-semibold text-gray-800">Hồ sơ bệnh nhân</Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            {viewPt && (
              <div className="space-y-4">
                <div className="flex items-center gap-4 p-4 bg-teal-50 rounded-xl">
                  <div className="w-14 h-14 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {viewPt.hoTen.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-gray-800 text-lg">{viewPt.hoTen}</div>
                    <div className="text-sm text-gray-500">{viewPt.maBenhNhan} · {getAge(viewPt.ngaySinh)} · {viewPt.gioiTinh === 'Nam' ? 'Nam' : 'Nữ'}</div>
                    {viewPt.coThai && <span className="inline-flex items-center gap-1 text-xs text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full mt-1"><Baby className="w-3 h-3" /> Đang mang thai</span>}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <InfoRow label="Ngày sinh" value={viewPt.ngaySinh} />
                  <InfoRow label="Điện thoại" value={viewPt.dienThoai} />
                  <InfoRow label="Cân nặng" value={viewPt.canNang ? `${viewPt.canNang} kg` : 'Chưa ghi nhận'} />
                  <InfoRow label="Địa chỉ" value={viewPt.diChi} />
                  <div className="col-span-2">
                    <InfoRow label="Tiền sử bệnh" value={viewPt.tieuSuBenh || 'Không có'} />
                  </div>
                  <div className="col-span-2">
                    <InfoRow label="Dị ứng" value={viewPt.diUng || 'Không có'} highlight={!!viewPt.diUng} />
                  </div>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Add/Edit Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-xl z-50 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-lg font-semibold text-gray-800">{editPt ? 'Chỉnh sửa bệnh nhân' : 'Thêm bệnh nhân mới'}</Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input value={form.hoTen} onChange={e => setForm({ ...form, hoTen: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Ngày sinh *</label>
                <input type="date" value={form.ngaySinh} onChange={e => setForm({ ...form, ngaySinh: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Giới tính</label>
                <select value={form.gioiTinh} onChange={e => setForm({ ...form, gioiTinh: e.target.value as 'Nam' | 'Nu' })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="Nam">Nam</option>
                  <option value="Nu">Nữ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Điện thoại *</label>
                <input value={form.dienThoai} onChange={e => setForm({ ...form, dienThoai: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cân nặng (kg)</label>
                <input type="number" value={form.canNang ?? ''} onChange={e => setForm({ ...form, canNang: e.target.value ? +e.target.value : null })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" min={1} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Địa chỉ</label>
                <input value={form.diChi} onChange={e => setForm({ ...form, diChi: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tiền sử bệnh</label>
                <textarea value={form.tieuSuBenh} onChange={e => setForm({ ...form, tieuSuBenh: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Dị ứng thuốc</label>
                <input value={form.diUng} onChange={e => setForm({ ...form, diUng: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="VD: Penicillin, Sulfa" />
              </div>
              {form.gioiTinh === 'Nu' && (
                <div className="col-span-2 flex items-center gap-3">
                  <input type="checkbox" id="coThai" checked={form.coThai} onChange={e => setForm({ ...form, coThai: e.target.checked })} className="w-4 h-4 accent-teal-600" />
                  <label htmlFor="coThai" className="text-sm text-gray-700">Đang mang thai</label>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <Dialog.Close className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">Hủy</Dialog.Close>
              <button onClick={handleSave} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                {editPt ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

function InfoRow({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div>
      <div className="text-xs text-gray-400 mb-0.5">{label}</div>
      <div className={`text-sm font-medium ${highlight ? 'text-red-600' : 'text-gray-700'}`}>{value}</div>
    </div>
  );
}
