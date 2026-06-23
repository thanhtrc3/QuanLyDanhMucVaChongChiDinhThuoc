import { useState, useEffect } from 'react';
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
  hoTen: '', ngaySinh: '', canNang: null, tienSuBenh: '', isMangThai: false
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
  const [confirmDeletePt, setConfirmDeletePt] = useState<Patient | null>(null);
  const [form, setForm] = useState<Omit<Patient, 'id' | 'maBenhNhan'>>(EMPTY);
  const [historyTab, setHistoryTab] = useState<'info' | 'history'>('info');
  const [patientHistory, setPatientHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const filtered = patients.filter(p => {
    const q = search.toLowerCase();
    return !q || p.hoTen.toLowerCase().includes(q) || p.maBenhNhan?.toLowerCase().includes(q);
  });

  const openAdd = () => { setEditPt(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (p: Patient) => { setEditPt(p); setForm({ ...p }); setModalOpen(true); };
  const openView = (p: Patient) => {
    setViewPt(p);
    setHistoryTab('info');
    setPatientHistory([]);
    setViewOpen(true);
  };

  const handleSave = async () => {
    if (!form.hoTen.trim() || !form.ngaySinh) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc.');
      return;
    }
    if (form.canNang !== null && form.canNang <= 0) {
      toast.error('Cân nặng phải lớn hơn 0 nếu được nhập.');
      return;
    }

    try {
      const payload = {
        hoTen: form.hoTen,
        ngaySinh: form.ngaySinh,
        canNang: form.canNang,
        tienSuBenh: form.tienSuBenh,
        isMangThai: form.isMangThai,
      };

      if (editPt) {
        const res = await fetch(`/api/benh-nhan/${editPt.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Cập nhật thất bại');
        
        setPatients(patients.map(p => p.id === editPt.id ? { ...p, ...form } : p));
        toast.success('Cập nhật bệnh nhân thành công.');
      } else {
        const res = await fetch('/api/benh-nhan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Thêm thất bại');
        const data = await res.json();
        
        const generatedId = data.benhNhanID || data.id;
        const maBN = `BN${String(generatedId).padStart(3, '0')}`;
        setPatients([...patients, { ...form, id: generatedId, maBenhNhan: maBN }]);
        toast.success('Thêm bệnh nhân thành công.');
      }
      setModalOpen(false);
    } catch (err) {
      toast.error('Có lỗi xảy ra khi lưu dữ liệu');
    }
  };

  const handleDeleteClick = (p: Patient) => {
    setConfirmDeletePt(p);
  };

  const executeDelete = async () => {
    if (!confirmDeletePt) return;
    const p = confirmDeletePt;
    setConfirmDeletePt(null);
    try {
      const res = await fetch(`/api/benh-nhan/${p.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) {
        if (res.status === 404) {
          // Bệnh nhân đã bị xóa trong database từ trước (ví dụ xóa thủ công)
          setPatients(patients.filter(pt => pt.id !== p.id));
          toast.success('Bệnh nhân này đã không còn trong cơ sở dữ liệu.');
          return;
        }
        const errData = await res.json();
        throw new Error(errData.message || 'Xóa thất bại');
      }
      
      setPatients(patients.filter(pt => pt.id !== p.id));
      toast.success('Đã xóa bệnh nhân.');
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi xóa');
    }
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
            placeholder="Tìm theo tên, mã BN..."
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
                {['Mã BN', 'Họ tên', 'Ngày sinh / Tuổi', 'Cân nặng', 'Tiền sử bệnh', 'Đang mang thai', ''].map(h => (
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
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    <div>{p.ngaySinh}</div>
                    <div className="text-xs text-gray-400">{getAge(p.ngaySinh)}</div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {p.canNang ? `${p.canNang} kg` : '-'}
                  </td>
                  <td className="px-4 py-3">
                    {p.tienSuBenh ? (
                      <span className="text-gray-600 text-xs">{p.tienSuBenh}</span>
                    ) : <span className="text-gray-400 text-xs">Không có</span>}
                  </td>
                  <td className="px-4 py-3">
                    {p.isMangThai && (
                      <span className="flex items-center gap-1 text-xs text-pink-600 bg-pink-50 px-2 py-0.5 w-fit rounded-full">
                        <Baby className="w-3 h-3" /> Có thai
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button onClick={() => openView(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"><Eye className="w-3.5 h-3.5" /></button>
                      {canEdit && <button onClick={() => openEdit(p)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>}
                      {canEdit && <button onClick={() => handleDeleteClick(p)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">Không tìm thấy bệnh nhân nào.</td></tr>}
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
                    <div className="text-sm text-gray-500">{viewPt.maBenhNhan} · {getAge(viewPt.ngaySinh)}</div>
                    {viewPt.isMangThai && <span className="inline-flex items-center gap-1 text-xs text-pink-600 bg-pink-100 px-2 py-0.5 rounded-full mt-1"><Baby className="w-3 h-3" /> Đang mang thai</span>}
                  </div>
                </div>
                {/* Tabs */}
                <div className="flex border-b border-gray-200">
                  <button onClick={() => setHistoryTab('info')} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${historyTab === 'info' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Hồ sơ</button>
                  <button onClick={() => {
                    setHistoryTab('history');
                    if (patientHistory.length === 0 && !historyLoading) {
                      setHistoryLoading(true);
                      fetch(`/api/benh-nhan/${viewPt.id}/don-thuoc`, { headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } })
                        .then(r => r.json()).then(data => { setPatientHistory(Array.isArray(data) ? data : []); })
                        .catch(() => setPatientHistory([]))
                        .finally(() => setHistoryLoading(false));
                    }
                  }} className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${historyTab === 'history' ? 'border-teal-600 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700'}`}>Lịch sử khám</button>
                </div>
                {historyTab === 'info' && (
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <InfoRow label="Ngày sinh" value={viewPt.ngaySinh} />
                    <InfoRow label="Cân nặng" value={viewPt.canNang ? `${viewPt.canNang} kg` : 'Chưa ghi nhận'} />
                    <div className="col-span-2">
                      <InfoRow label="Tiền sử bệnh" value={viewPt.tienSuBenh || 'Không có'} />
                    </div>
                  </div>
                )}
                {historyTab === 'history' && (
                  <div>
                    {historyLoading ? (
                      <div className="flex justify-center py-6"><span className="inline-block w-5 h-5 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
                    ) : patientHistory.length === 0 ? (
                      <div className="text-center py-6 text-gray-400 text-sm">Chưa có đơn thuốc nào.</div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto">
                        {patientHistory.map((px: any) => (
                          <div key={px.donThuocID} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg text-sm">
                            <div>
                              <div className="font-medium text-gray-800">{px.chanDoan || 'Không có chẩn đoán'}</div>
                              <div className="text-xs text-gray-400">{px.ngayKeDon?.substring(0,10)} · BS: {px.tenBacSi || 'N/A'} · {px.soLoaiThuoc} loại thuốc</div>
                            </div>
                            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${px.trangThai === 'Da cap' ? 'bg-green-100 text-green-700' : px.trangThai === 'Huy' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                              {px.trangThai === 'Da cap' ? 'Đã cấp' : px.trangThai === 'Huy' ? 'Hủy' : 'Chờ duyệt'}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
                <label className="block text-xs font-medium text-gray-700 mb-1">Cân nặng (kg)</label>
                <input type="number" value={form.canNang ?? ''} onChange={e => setForm({ ...form, canNang: e.target.value ? +e.target.value : null })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" min={1} />
              </div>
              <div className="col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-1">Tiền sử bệnh</label>
                <textarea value={form.tienSuBenh} onChange={e => setForm({ ...form, tienSuBenh: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
              <div className="col-span-2 flex items-center gap-3">
                <input type="checkbox" id="isMangThai" checked={form.isMangThai} onChange={e => setForm({ ...form, isMangThai: e.target.checked })} className="w-4 h-4 accent-teal-600" />
                <label htmlFor="isMangThai" className="text-sm text-gray-700">Đang mang thai</label>
              </div>
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

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={!!confirmDeletePt} onOpenChange={(open) => !open && setConfirmDeletePt(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-sm z-[60] p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-2 text-slate-800">Xác nhận xóa bệnh nhân</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa bệnh nhân <span className="font-semibold">{confirmDeletePt?.hoTen}</span>? 
              <br />Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeletePt(null)} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Hủy bỏ
              </button>
              <button onClick={executeDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                Xóa vĩnh viễn
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
