import { useState } from 'react';
import { Plus, Pencil, Trash2, X, Zap, Search } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import type { DrugInteraction, Medicine, User } from '../types';

interface Props {
  interactions: DrugInteraction[];
  setInteractions: (i: DrugInteraction[]) => void;
  medicines: Medicine[];
  currentUser: User;
  addAuditLog: (table: string, action: 'Them' | 'Sua' | 'Xoa', oldVal: string, newVal: string) => void;
}

const SEV_COLORS: Record<string, string> = {
  'Nghiem trong': 'bg-red-100 text-red-700 border-red-200',
  'Trung binh': 'bg-orange-100 text-orange-700 border-orange-200',
  'Nhe': 'bg-blue-100 text-blue-700 border-blue-200',
};
const SEV_LABELS: Record<string, string> = { 'Nghiem trong': 'Nghiêm trọng', 'Trung binh': 'Trung bình', 'Nhe': 'Nhẹ' };
const SEV_BORDER: Record<string, string> = { 'Nghiem trong': 'border-red-500', 'Trung binh': 'border-orange-400', 'Nhe': 'border-blue-400' };

const EMPTY: Omit<DrugInteraction, 'id'> = { thuocID_1: 0, tenThuoc_1: '', maATC_1: '', thuocID_2: 0, tenThuoc_2: '', maATC_2: '', mucDo: 'Trung binh', coCheTacDung: '', khuyen_cao: '' };

export function DrugInteractions({ interactions, setInteractions, medicines, currentUser, addAuditLog }: Props) {
  const [modalOpen, setModalOpen] = useState(false);
  const [checkOpen, setCheckOpen] = useState(false);
  const [editItem, setEditItem] = useState<DrugInteraction | null>(null);
  const [form, setForm] = useState<Omit<DrugInteraction, 'id'>>(EMPTY);
  const [deleteConfirm, setDeleteConfirm] = useState<DrugInteraction | null>(null);
  const [filterSev, setFilterSev] = useState('');
  const [checkMed1, setCheckMed1] = useState('');
  const [checkMed2, setCheckMed2] = useState('');
  const [checkResult, setCheckResult] = useState<DrugInteraction | null | 'none'>(null);

  const filtered = interactions.filter(i => !filterSev || i.mucDo === filterSev);

  const selectMed1 = (id: number) => {
    const m = medicines.find(x => x.id === id);
    if (m) setForm(f => ({ ...f, thuocID_1: m.id, tenThuoc_1: m.tenThuong, maATC_1: m.maATC }));
  };
  const selectMed2 = (id: number) => {
    const m = medicines.find(x => x.id === id);
    if (m) setForm(f => ({ ...f, thuocID_2: m.id, tenThuoc_2: m.tenThuong, maATC_2: m.maATC }));
  };

  const handleSave = () => {
    if (!form.thuocID_1 || !form.thuocID_2 || !form.coCheTacDung.trim() || !form.khuyen_cao.trim()) {
      toast.error('Vui lòng điền đầy đủ thông tin.');
      return;
    }
    if (form.thuocID_1 === form.thuocID_2) { toast.error('Hai thuốc phải khác nhau.'); return; }
    const isDuplicate = interactions.some(i =>
      i.id !== editItem?.id &&
      ((i.thuocID_1 === form.thuocID_1 && i.thuocID_2 === form.thuocID_2) ||
       (i.thuocID_1 === form.thuocID_2 && i.thuocID_2 === form.thuocID_1))
    );
    if (isDuplicate) { toast.error('Cặp tương tác thuốc này đã tồn tại.'); return; }
    if (editItem) {
      setInteractions(interactions.map(i => i.id === editItem.id ? { ...form, id: editItem.id } : i));
      addAuditLog('TuongTacThuoc', 'Sua', `${editItem.tenThuoc_1} - ${editItem.tenThuoc_2}`, `${form.tenThuoc_1} - ${form.tenThuoc_2}`);
      toast.success('Cập nhật thành công.');
    } else {
      const newId = Math.max(...interactions.map(i => i.id), 0) + 1;
      setInteractions([...interactions, { ...form, id: newId }]);
      addAuditLog('TuongTacThuoc', 'Them', '', `${form.tenThuoc_1} + ${form.tenThuoc_2} (${SEV_LABELS[form.mucDo]})`);
      toast.success('Thêm tương tác thuốc thành công.');
    }
    setModalOpen(false);
  };

  const handleCheck = () => {
    if (!checkMed1 || !checkMed2) { toast.error('Vui lòng chọn 2 thuốc để kiểm tra.'); return; }
    const id1 = +checkMed1; const id2 = +checkMed2;
    const found = interactions.find(i => (i.thuocID_1 === id1 && i.thuocID_2 === id2) || (i.thuocID_1 === id2 && i.thuocID_2 === id1));
    setCheckResult(found || 'none');
  };

  const isAdmin = currentUser.vaiTro === 'Admin';

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <select value={filterSev} onChange={e => setFilterSev(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
            <option value="">Tất cả mức độ</option>
            <option value="Nghiem trong">Nghiêm trọng</option>
            <option value="Trung binh">Trung bình</option>
            <option value="Nhe">Nhẹ</option>
          </select>
          <div className="flex gap-2">
            <span className="bg-red-100 text-red-700 px-2 py-0.5 rounded-full text-xs font-medium">{interactions.filter(i => i.mucDo === 'Nghiem trong').length} Nghiêm trọng</span>
            <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full text-xs font-medium">{interactions.filter(i => i.mucDo === 'Trung binh').length} Trung bình</span>
          </div>
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setCheckMed1(''); setCheckMed2(''); setCheckResult(null); setCheckOpen(true); }} className="flex items-center gap-2 border border-teal-600 text-teal-600 hover:bg-teal-50 px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Search className="w-4 h-4" /> Kiểm tra tương tác
          </button>
          {isAdmin && (
            <button onClick={() => { setEditItem(null); setForm(EMPTY); setModalOpen(true); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
              <Plus className="w-4 h-4" /> Thêm tương tác
            </button>
          )}
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 gap-3">
        {filtered.map(item => (
          <div key={item.id} className={`bg-white rounded-xl border-l-4 p-4 shadow-sm flex gap-4 ${SEV_BORDER[item.mucDo]}`}>
            <div className="flex-shrink-0 mt-1">
              <Zap className={`w-5 h-5 ${item.mucDo === 'Nghiem trong' ? 'text-red-500' : item.mucDo === 'Trung binh' ? 'text-orange-500' : 'text-blue-500'}`} />
            </div>
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{item.tenThuoc_1}</span>
                    <span className="text-gray-400">+</span>
                    <span className="font-semibold text-gray-800">{item.tenThuoc_2}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full border font-medium ${SEV_COLORS[item.mucDo]}`}>{SEV_LABELS[item.mucDo]}</span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5 font-mono">{item.maATC_1} × {item.maATC_2}</div>
                </div>
                {isAdmin && (
                  <div className="flex items-center gap-1">
                    <button onClick={() => { setEditItem(item); setForm({ ...item }); setModalOpen(true); }} className="p-1.5 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded"><Pencil className="w-3.5 h-3.5" /></button>
                    <button onClick={() => setDeleteConfirm(item)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded"><Trash2 className="w-3.5 h-3.5" /></button>
                  </div>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-2"><strong>Cơ chế:</strong> {item.coCheTacDung}</p>
              <p className="text-sm text-teal-700 mt-1"><strong>Khuyến cáo:</strong> {item.khuyen_cao}</p>
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-10 text-gray-400">Không có dữ liệu tương tác thuốc.</div>}
      </div>

      {/* Check interaction modal */}
      <Dialog.Root open={checkOpen} onOpenChange={setCheckOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-md z-50 p-6">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-lg font-semibold">Kiểm tra tương tác thuốc</Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Thuốc 1</label>
                <select value={checkMed1} onChange={e => { setCheckMed1(e.target.value); setCheckResult(null); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">-- Chọn thuốc --</option>
                  {medicines.filter(m => m.trangThai).map(m => <option key={m.id} value={m.id}>{m.tenThuong}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Thuốc 2</label>
                <select value={checkMed2} onChange={e => { setCheckMed2(e.target.value); setCheckResult(null); }} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="">-- Chọn thuốc --</option>
                  {medicines.filter(m => m.trangThai).map(m => <option key={m.id} value={m.id}>{m.tenThuong}</option>)}
                </select>
              </div>
              <button onClick={handleCheck} className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center justify-center gap-2">
                <Search className="w-4 h-4" /> Kiểm tra
              </button>
              {checkResult === 'none' && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                  <p className="text-green-700 font-medium">Không tìm thấy tương tác</p>
                  <p className="text-green-600 text-sm">Hai thuốc này an toàn khi dùng chung (theo dữ liệu hiện có).</p>
                </div>
              )}
              {checkResult && checkResult !== 'none' && (
                <div className={`rounded-xl p-4 border ${SEV_COLORS[checkResult.mucDo]}`}>
                  <div className="font-semibold mb-2 flex items-center gap-2">
                    <Zap className="w-4 h-4" /> Phát hiện tương tác — {SEV_LABELS[checkResult.mucDo]}
                  </div>
                  <p className="text-sm"><strong>Cơ chế:</strong> {checkResult.coCheTacDung}</p>
                  <p className="text-sm mt-1"><strong>Khuyến cáo:</strong> {checkResult.khuyen_cao}</p>
                </div>
              )}
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Add/Edit Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-lg z-50 p-6">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-lg font-semibold">{editItem ? 'Chỉnh sửa tương tác' : 'Thêm tương tác thuốc'}</Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Thuốc 1 *</label>
                  <select value={form.thuocID_1 || ''} onChange={e => selectMed1(+e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">-- Chọn --</option>
                    {medicines.filter(m => m.trangThai).map(m => <option key={m.id} value={m.id}>{m.tenThuong}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Thuốc 2 *</label>
                  <select value={form.thuocID_2 || ''} onChange={e => selectMed2(+e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">-- Chọn --</option>
                    {medicines.filter(m => m.trangThai).map(m => <option key={m.id} value={m.id}>{m.tenThuong}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Mức độ</label>
                <select value={form.mucDo} onChange={e => setForm({ ...form, mucDo: e.target.value as DrugInteraction['mucDo'] })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="Nghiem trong">Nghiêm trọng</option>
                  <option value="Trung binh">Trung bình</option>
                  <option value="Nhe">Nhẹ</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Cơ chế tác dụng *</label>
                <textarea value={form.coCheTacDung} onChange={e => setForm({ ...form, coCheTacDung: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Khuyến cáo xử trí *</label>
                <textarea value={form.khuyen_cao} onChange={e => setForm({ ...form, khuyen_cao: e.target.value })} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <Dialog.Close className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</Dialog.Close>
              <button onClick={handleSave} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium">{editItem ? 'Cập nhật' : 'Thêm mới'}</button>
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
              <Dialog.Title className="font-semibold">Xóa tương tác thuốc?</Dialog.Title>
              <p className="text-sm text-gray-500">Dữ liệu sẽ bị xóa vĩnh viễn.</p>
              <div className="flex gap-3 w-full mt-2">
                <Dialog.Close className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Hủy</Dialog.Close>
                <button onClick={() => { if (deleteConfirm) { setInteractions(interactions.filter(i => i.id !== deleteConfirm.id)); addAuditLog('TuongTacThuoc', 'Xoa', `${deleteConfirm.tenThuoc_1} - ${deleteConfirm.tenThuoc_2}`, 'Đã xóa'); toast.success('Đã xóa.'); setDeleteConfirm(null); } }} className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium">Xóa</button>
              </div>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
