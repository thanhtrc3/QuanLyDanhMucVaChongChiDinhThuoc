import { useState } from 'react';
import { Plus, Pencil, Trash2, X, AlertTriangle, ShieldAlert } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import type { ContraindicationRule, Medicine, User } from '../types';

interface Props {
  rules: ContraindicationRule[];
  setRules: (r: ContraindicationRule[]) => void;
  medicines: Medicine[];
  currentUser: User;
  addAuditLog: (table: string, action: 'Them' | 'Sua' | 'Xoa', oldVal: string, newVal: string) => void;
}

const EMPTY: Omit<ContraindicationRule, 'id'> = {
  thuocID: 0, tenThuoc: '', maATC: '', dieuKien: '', mucDoNguyHiem: 'Canh bao', heuQua: '', moTa: '',
};

const SEVERITY_LABELS: Record<string, string> = { 'Tuyet doi': 'Tuyệt đối', 'Tuong doi': 'Tương đối', 'Canh bao': 'Cảnh báo' };
const SEVERITY_COLORS: Record<string, string> = {
  'Tuyet doi': 'bg-red-100 text-red-700 border-red-200',
  'Tuong doi': 'bg-orange-100 text-orange-700 border-orange-200',
  'Canh bao': 'bg-yellow-100 text-yellow-700 border-yellow-200',
};

export function ContraindicationRules({ rules, setRules, medicines, currentUser, addAuditLog }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [editRule, setEditRule] = useState<ContraindicationRule | null>(null);
  const [form, setForm] = useState<Omit<ContraindicationRule, 'id'>>(EMPTY);
  const [deleteConfirm, setDeleteConfirm] = useState<ContraindicationRule | null>(null);
  const [filterSev, setFilterSev] = useState('');

  const filtered = rules.filter(r => !filterSev || r.mucDoNguyHiem === filterSev);

  const openAdd = () => { setEditRule(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (r: ContraindicationRule) => { setEditRule(r); setForm({ ...r }); setModalOpen(true); };

  const selectMed = (id: number) => {
    const med = medicines.find(m => m.id === id);
    if (med) setForm(f => ({ ...f, thuocID: med.id, tenThuoc: med.tenThuong, maATC: med.maATC }));
  };

  const handleSave = () => {
    if (!form.thuocID || !form.dieuKien.trim() || !form.moTa.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (editRule) {
      setRules(rules.map(r => r.id === editRule.id ? { ...form, id: editRule.id } : r));
      addAuditLog('ChongChiDinh', 'Sua', editRule.dieuKien, form.dieuKien);
      toast.success('Cập nhật quy tắc thành công.');
    } else {
      const newId = Math.max(...rules.map(r => r.id), 0) + 1;
      setRules([...rules, { ...form, id: newId }]);
      addAuditLog('ChongChiDinh', 'Them', '', `${form.tenThuoc} - ${form.dieuKien} (${SEVERITY_LABELS[form.mucDoNguyHiem]})`);
      toast.success('Thêm quy tắc chống chỉ định thành công.');
    }
    setModalOpen(false);
  };

  const handleDelete = (r: ContraindicationRule) => {
    setRules(rules.filter(x => x.id !== r.id));
    addAuditLog('ChongChiDinh', 'Xoa', `${r.tenThuoc} - ${r.dieuKien}`, 'Đã xóa');
    toast.success('Đã xóa quy tắc.');
    setDeleteConfirm(null);
  };

  const isAdmin = currentUser.vaiTro === 'Admin';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <select value={filterSev} onChange={e => setFilterSev(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Tất cả mức độ</option>
            <option value="Tuyet doi">Tuyệt đối</option>
            <option value="Tuong doi">Tương đối</option>
            <option value="Canh bao">Cảnh báo</option>
          </select>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">{rules.filter(r => r.mucDoNguyHiem === 'Tuyet doi').length} Tuyệt đối</span>
            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">{rules.filter(r => r.mucDoNguyHiem === 'Tuong doi').length} Tương đối</span>
            <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">{rules.filter(r => r.mucDoNguyHiem === 'Canh bao').length} Cảnh báo</span>
          </div>
        </div>
        {isAdmin && (
          <button onClick={openAdd} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Thêm quy tắc
          </button>
        )}
      </div>

      <div className="grid grid-cols-1 gap-3">
        {filtered.map(r => (
          <div key={r.id} className={`bg-white rounded-xl border-l-4 p-4 shadow-sm flex gap-4 ${r.mucDoNguyHiem === 'Tuyet doi' ? 'border-red-500' : r.mucDoNguyHiem === 'Tuong doi' ? 'border-orange-400' : 'border-yellow-400'}`}>
            <div className="flex-shrink-0 mt-1">
              <ShieldAlert className={`w-5 h-5 ${r.mucDoNguyHiem === 'Tuyet doi' ? 'text-red-500' : r.mucDoNguyHiem === 'Tuong doi' ? 'text-orange-500' : 'text-yellow-500'}`} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{r.tenThuoc}</span>
                    <span className="font-mono text-xs text-gray-400">({r.maATC})</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEVERITY_COLORS[r.mucDoNguyHiem]}`}>{SEVERITY_LABELS[r.mucDoNguyHiem]}</span>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-sm">
                    <AlertTriangle className="w-3.5 h-3.5 text-gray-400" />
                    <span className="text-gray-600">Điều kiện: <strong>{r.dieuKien}</strong></span>
                  </div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(r)} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded transition-colors"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteConfirm(r)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-500 mt-1.5">{r.moTa}</p>
              <div className="mt-2 text-xs text-red-600 font-medium">Hậu quả: {r.heuQua}</div>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-10 text-gray-400">Không có quy tắc nào.</div>}
      </div>

      {/* Add/Edit Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-lg z-50 p-6">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-lg font-semibold">{editRule ? 'Chỉnh sửa quy tắc' : 'Thêm quy tắc chống chỉ định'}</Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Thuốc *</label>
                <select value={form.thuocID || ''} onChange={e => selectMed(+e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">-- Chọn thuốc --</option>
                  {medicines.filter(m => m.trangThai).map(m => <option key={m.id} value={m.id}>{m.tenThuong} ({m.maATC})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Điều kiện chống chỉ định *</label>
                <input value={form.dieuKien} onChange={e => setForm({ ...form, dieuKien: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="VD: Dị ứng Penicillin, Có thai" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mức độ nguy hiểm *</label>
                <select value={form.mucDoNguyHiem} onChange={e => setForm({ ...form, mucDoNguyHiem: e.target.value as ContraindicationRule['mucDoNguyHiem'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="Tuyet doi">Tuyệt đối</option>
                  <option value="Tuong doi">Tương đối</option>
                  <option value="Canh bao">Cảnh báo</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Hậu quả lâm sàng *</label>
                <input value={form.heuQua} onChange={e => setForm({ ...form, heuQua: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mô tả chi tiết *</label>
                <textarea value={form.moTa} onChange={e => setForm({ ...form, moTa: e.target.value })} rows={3} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <Dialog.Close className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</Dialog.Close>
              <button onClick={handleSave} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">{editRule ? 'Cập nhật' : 'Thêm mới'}</button>
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
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center"><Trash2 className="w-6 h-6 text-red-600" /></div>
              <Dialog.Title className="font-semibold text-gray-800">Xóa quy tắc chống chỉ định?</Dialog.Title>
              <p className="text-sm text-gray-500">Quy tắc sẽ bị xóa vĩnh viễn và không thể khôi phục.</p>
              <div className="flex gap-3 w-full mt-2">
                <Dialog.Close className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Hủy</Dialog.Close>
                <button onClick={() => deleteConfirm && handleDelete(deleteConfirm)} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Xóa</button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
