import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, X, Layers } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../types';

interface Props {
  currentUser: User;
  addAuditLog: (table: string, action: 'Them' | 'Sua' | 'Xoa', oldVal: string, newVal: string) => void;
}

interface DrugGroup {
  nhomThuocID: number;
  tenNhom: string;
  moTa?: string;
}

export function DrugGroupManagement({ currentUser, addAuditLog }: Props) {
  const [groups, setGroups] = useState<DrugGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editGroup, setEditGroup] = useState<DrugGroup | null>(null);
  const [form, setForm] = useState({ tenNhom: '', moTa: '' });
  const [confirmDelete, setConfirmDelete] = useState<DrugGroup | null>(null);

  const token = () => localStorage.getItem('token');

  const fetchGroups = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/nhom-thuoc');
      const data = await res.json();
      if (Array.isArray(data)) setGroups(data);
    } catch { toast.error('Không thể tải danh sách nhóm thuốc.'); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchGroups(); }, []);

  const openAdd = () => { setEditGroup(null); setForm({ tenNhom: '', moTa: '' }); setModalOpen(true); };
  const openEdit = (g: DrugGroup) => { setEditGroup(g); setForm({ tenNhom: g.tenNhom, moTa: g.moTa || '' }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.tenNhom.trim()) { toast.error('Tên nhóm thuốc không được để trống.'); return; }
    try {
      if (editGroup) {
        const res = await fetch(`/api/nhom-thuoc/${editGroup.nhomThuocID}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
          body: JSON.stringify(form)
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Lỗi cập nhật');
        setGroups(groups.map(g => g.nhomThuocID === editGroup.nhomThuocID ? { ...g, ...form } : g));
        addAuditLog('NhomThuoc', 'Sua', editGroup.tenNhom, form.tenNhom);
        toast.success('Cập nhật nhóm thuốc thành công.');
      } else {
        const res = await fetch('/api/nhom-thuoc', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token()}` },
          body: JSON.stringify(form)
        });
        if (!res.ok) throw new Error((await res.json()).message || 'Lỗi thêm');
        const data = await res.json();
        setGroups([...groups, data]);
        addAuditLog('NhomThuoc', 'Them', '', form.tenNhom);
        toast.success('Thêm nhóm thuốc thành công.');
      }
      setModalOpen(false);
    } catch (e: any) { toast.error(e.message || 'Có lỗi xảy ra.'); }
  };

  const handleDelete = async () => {
    if (!confirmDelete) return;
    try {
      const res = await fetch(`/api/nhom-thuoc/${confirmDelete.nhomThuocID}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token()}` }
      });
      if (!res.ok) throw new Error((await res.json()).message || 'Lỗi xóa');
      setGroups(groups.filter(g => g.nhomThuocID !== confirmDelete.nhomThuocID));
      addAuditLog('NhomThuoc', 'Xoa', confirmDelete.tenNhom, '');
      toast.success('Đã xóa nhóm thuốc.');
    } catch (e: any) { toast.error(e.message || 'Không thể xóa. Nhóm thuốc này có thể đang được sử dụng.'); }
    finally { setConfirmDelete(null); }
  };

  const isAdmin = currentUser.vaiTro === 'Admin';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Layers className="w-5 h-5 text-teal-600" />
          <span className="text-sm text-gray-500">{groups.length} nhóm thuốc</span>
        </div>
        <button onClick={openAdd} className="flex items-center gap-2 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Thêm nhóm
        </button>
      </div>

      {loading ? (
        <div className="flex justify-center py-12"><span className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" /></div>
      ) : groups.length === 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 text-center py-16 text-gray-400">
          <Layers className="w-10 h-10 mx-auto mb-2 opacity-30" />
          <p>Chưa có nhóm thuốc nào.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left">STT</th>
                <th className="px-6 py-3 text-left">Tên nhóm thuốc</th>
                <th className="px-6 py-3 text-left">Mô tả</th>
                <th className="px-6 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {groups.map((g, idx) => (
                <tr key={g.nhomThuocID} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-6 py-4 text-gray-400">{idx + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-teal-100 flex items-center justify-center">
                        <Layers className="w-4 h-4 text-teal-600" />
                      </div>
                      <span className="font-medium text-gray-800">{g.tenNhom}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-500 max-w-xs truncate">{g.moTa || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => openEdit(g)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Sửa">
                        <Pencil className="w-4 h-4" />
                      </button>
                      {isAdmin && (
                        <button onClick={() => setConfirmDelete(g)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-semibold text-gray-800">{editGroup ? 'Sửa nhóm thuốc' : 'Thêm nhóm thuốc'}</h3>
              <button onClick={() => setModalOpen(false)} className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên nhóm thuốc *</label>
                <input autoFocus value={form.tenNhom} onChange={e => setForm({ ...form, tenNhom: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500"
                  placeholder="VD: Kháng sinh, Hạ sốt giảm đau..." />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả</label>
                <textarea value={form.moTa} onChange={e => setForm({ ...form, moTa: e.target.value })} rows={3}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none"
                  placeholder="Mô tả về nhóm thuốc..." />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setModalOpen(false)} className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</button>
              <button onClick={handleSave} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium">
                {editGroup ? 'Cập nhật' : 'Thêm mới'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {confirmDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-2 text-slate-800">Xác nhận xóa</h3>
            <p className="text-sm text-gray-600 mb-6">Bạn có chắc muốn xóa nhóm thuốc <span className="font-semibold">{confirmDelete.tenNhom}</span>? Hành động này không thể hoàn tác.</p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDelete(null)} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium">Hủy bỏ</button>
              <button onClick={handleDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium">Xóa</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
