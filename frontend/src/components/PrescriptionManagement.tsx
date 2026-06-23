import { useState } from 'react';
import { Search, Plus, Eye, X, ShieldAlert, CheckCircle, AlertTriangle, Trash2, ChevronRight, Printer } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import type { Prescription, Medicine, Patient, User, ContraindicationRule, DrugInteraction, SafetyWarning, PrescriptionDetail } from '../types';

interface Props {
  prescriptions: Prescription[];
  setPrescriptions: (p: Prescription[]) => void;
  medicines: Medicine[];
  setMedicines: (m: Medicine[]) => void;
  patients: Patient[];
  contraindications: ContraindicationRule[];
  interactions: DrugInteraction[];
  currentUser: User;
  addAuditLog: (table: string, action: 'Them' | 'Sua' | 'Xoa' | 'Override', oldVal: string, newVal: string, reason?: string) => void;
}

const STATUS_LABELS: Record<string, string> = { 'Da cap': 'Đã cấp', 'Cho duyet': 'Chờ duyệt', 'Huy': 'Hủy' };
const STATUS_COLORS: Record<string, string> = { 'Da cap': 'bg-green-100 text-green-700', 'Cho duyet': 'bg-yellow-100 text-yellow-700', 'Huy': 'bg-red-100 text-red-700' };

export const checkSafety = (details, patient, contraindications, interactions) => {
  const warnings = [];

  // 1. KIỂM TRA CHỐNG CHỈ ĐỊNH theo thông tin bệnh nhân
  const patientAge = patient?.tuoiHienTai ?? (() => {
    if (!patient?.ngaySinh) return null;
    return Math.floor((Date.now() - new Date(patient.ngaySinh).getTime()) / (1000 * 60 * 60 * 24 * 365.25));
  })();
  const tienSuLower = (patient?.tienSuBenh || '').toLowerCase();

  details.forEach(thuoc => {
    const ccdRules = contraindications.filter(rule => Number(rule.thuocID) === Number(thuoc.thuocID));
    ccdRules.forEach(rule => {
      const dk = (rule.dieuKien || '').toLowerCase().trim();
      let matched = false;

      // Kiểm tra mang thai
      if (patient?.isMangThai && (dk.includes('mang thai') || dk.includes('có thai') || dk.includes('phụ nữ có thai'))) {
        matched = true;
      }
      // Kiểm tra tuổi: "tuổi < 12", "age > 65", "trẻ em", "người cao tuổi"...
      if (!matched && patientAge !== null) {
        const ageMatch = dk.match(/tu[oổ]i?\s*([<>]=?)\s*(\d+)/);
        if (ageMatch) {
          const op = ageMatch[1]; const limit = Number(ageMatch[2]);
          if (op === '<' && patientAge < limit) matched = true;
          else if (op === '<=' && patientAge <= limit) matched = true;
          else if (op === '>' && patientAge > limit) matched = true;
          else if (op === '>=' && patientAge >= limit) matched = true;
        }
        if (dk.includes('trẻ em') && patientAge < 12) matched = true;
        if ((dk.includes('người cao tuổi') || dk.includes('người lớn tuổi')) && patientAge >= 65) matched = true;
      }
      // Kiểm tra tiền sử bệnh — tìm từ khóa trong dieuKien có khớp tiền sử bệnh nhân không
      if (!matched && tienSuLower && dk.length > 2) {
        const keywords = dk.split(/[,;\/\s]+/).filter(k => k.length > 3);
        if (keywords.some(k => tienSuLower.includes(k))) matched = true;
      }

      if (matched) {
        warnings.push({
          type: 'Chống chỉ định',
          mucDo: rule.mucDoNguyHiem || 'Nghiem trong',
          medicine: thuoc.tenThuoc,
          message: `${thuoc.tenThuoc}: Vi phạm chống chỉ định "${rule.dieuKien}"`,
          consequence: rule.moTa || rule.heuQua || ''
        });
      }
    });
  });

  // 2. KIỂM TRA TƯƠNG TÁC TỔ HỢP — O(1) lookup với HashMap
  const interactionMap = new Map();
  interactions.forEach(rule => {
    const key1 = `${rule.thuocID_1}-${rule.thuocID_2}`;
    const key2 = `${rule.thuocID_2}-${rule.thuocID_1}`;
    interactionMap.set(key1, rule);
    interactionMap.set(key2, rule);
  });

  for (let i = 0; i < details.length; i++) {
    for (let j = i + 1; j < details.length; j++) {
      const thuocA = details[i];
      const thuocB = details[j];
      const lookupKey = `${thuocA.thuocID}-${thuocB.thuocID}`;
      if (interactionMap.has(lookupKey)) {
        const conflict = interactionMap.get(lookupKey);
        warnings.push({
          type: 'Tương tác thuốc',
          mucDo: conflict.mucDoCanhBao || conflict.mucDoNguyHiem || 'Nghiem trong',
          medicinePair: [thuocA.tenThuoc, thuocB.tenThuoc],
          message: `Tương tác: ${thuocA.tenThuoc} ↔ ${thuocB.tenThuoc}`,
          consequence: conflict.moTa || 'Có nguy cơ gây tác dụng phụ nguy hiểm khi kết hợp.'
        });
      }
    }
  }

  return warnings;
};

export function PrescriptionManagement({ prescriptions, setPrescriptions, medicines, setMedicines, patients, contraindications, interactions, currentUser, addAuditLog }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [viewOpen, setViewOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [viewPx, setViewPx] = useState<Prescription | null>(null);
  const [confirmDeletePx, setConfirmDeletePx] = useState<Prescription | null>(null);
  const [step, setStep] = useState(1);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [chanDoan, setChanDoan] = useState('');
  const [ghiChu, setGhiChu] = useState('');

  const [details, setDetails] = useState<PrescriptionDetail[]>([]);
  const [warnings, setWarnings] = useState<SafetyWarning[]>([]);
  const [overrideReason, setOverrideReason] = useState('');
  const [selectedMedId, setSelectedMedId] = useState('');
  const [safetyChecked, setSafetyChecked] = useState(false);

  const filtered = prescriptions.filter(p => {
    const q = search.toLowerCase();
    const matchQ = !q || p.tenBenhNhan.toLowerCase().includes(q) || p.maDonThuoc.toLowerCase().includes(q) || p.chanDoan.toLowerCase().includes(q);
    const matchStatus = !filterStatus || p.trangThai === filterStatus;
    return matchQ && matchStatus;
  });

  const resetCreate = () => {
    setStep(1); setSelectedPatient(null); setChanDoan(''); setGhiChu('');
    setDetails([]); setWarnings([]); setOverrideReason(''); setSelectedMedId(''); setSafetyChecked(false);
  };

  const addMedToDetail = () => {
    if (!selectedMedId) return;
    const med = medicines.find(m => String(m.id) === String(selectedMedId));
    if (!med) return;
    if (details.find(d => String(d.thuocID) === String(med.id))) { toast.error('Thuốc đã có trong đơn.'); return; }
    setDetails([...details, { thuocID: med.id, tenThuoc: med.tenThuong, soLuong: 10, lieuMoiLan: 1, soLanDungNgay: 2, cachDung: 'Uống sau ăn' }]);
    setSelectedMedId('');
    setSafetyChecked(false);
  };

  const handleRunSafety = () => {
    if (!selectedPatient || details.length === 0) return;
    const w = checkSafety(details, selectedPatient, contraindications, interactions);
    setWarnings(w);
    setSafetyChecked(true);
  };

  const severityOrder: Record<string, number> = { 'Tuyet doi': 0, 'Nghiem trong': 1, 'Tuong doi': 2, 'Trung binh': 3, 'Canh bao': 4, 'Nhe': 5 };

  const handleSavePx = async () => {
    if (!selectedPatient || !chanDoan.trim()) { toast.error('Vui lòng chọn bệnh nhân và nhập chẩn đoán.'); return; }
    if (details.length === 0) { toast.error('Đơn thuốc phải có ít nhất 1 loại thuốc.'); return; }
    const shortage = details.find(d => (medicines.find(m => m.id === d.thuocID)?.tonKho ?? 0) < d.soLuong);
    if (shortage) { toast.error(`Tồn kho không đủ cho ${shortage.tenThuoc}.`); return; }
    const hasSevere = warnings.some(w => ['Tuyet doi', 'Nghiem trong'].includes(w.mucDo));
    if (hasSevere && !overrideReason.trim()) { toast.error('Vui lòng cung cấp lý do ghi đè cảnh báo nghiêm trọng.'); return; }

    try {
      const payload = {
        bacSiID: currentUser.id,
        benhNhanID: selectedPatient.id,
        chanDoan: chanDoan,
        trangThai: 'Chờ duyệt',
        chiTiet: details.map(d => ({
          thuocID: d.thuocID,
          soLuong: d.soLuong,
          lieuMoiLan: d.lieuMoiLan,
          soLanDungNgay: d.soLanDungNgay,
          cachDung: d.cachDung,
          ghiChu: d.ghiChu || ''
        }))
      };

      const res = await fetch('/api/don-thuoc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || 'Thất bại');
      }

      const savedPx = await res.json();
      
      setPrescriptions([savedPx, ...prescriptions]);
      
      setMedicines(medicines.map(m => {
        const detail = details.find(d => d.thuocID === m.id);
        return detail ? { ...m, tonKho: m.tonKho - detail.soLuong } : m;
      }));

      toast.success('Tạo đơn thuốc thành công.');
      setCreateOpen(false);
      resetCreate();
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi lưu đơn thuốc');
    }
  };

  const approvePx = (px: Prescription) => {
    updateStatus(px.id, 'Da cap');
  };

  const updateStatus = async (id: number, newStatus: string) => {
    try {
      const res = await fetch(`/api/don-thuoc/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ trangThai: newStatus })
      });
      if (!res.ok) throw new Error('Cập nhật thất bại');
      
      setPrescriptions(prescriptions.map(p => p.id === id ? { ...p, trangThai: newStatus as any } : p));
      toast.success('Đã cập nhật trạng thái đơn thuốc.');
      
      const px = prescriptions.find(p => p.id === id);
      if (px) addAuditLog('DonThuoc', 'Sua', `trangThai: ${px.trangThai}`, `trangThai: ${newStatus}`);
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra');
    }
  };

  const handleDeleteClick = (px: Prescription) => {
    if (px.trangThai === 'Da cap' || px.trangThai === 'Đã cấp') { toast.error('Không thể hủy đơn thuốc đã cấp phát.'); return; }
    if (px.trangThai === 'Huy' || px.trangThai === 'Hủy') { toast.error('Đơn thuốc này đã bị hủy.'); return; }
    setConfirmDeletePx(px);
  };

  const executeCancel = async () => {
    if (!confirmDeletePx) return;
    let px = confirmDeletePx;
    setConfirmDeletePx(null);

    try {
      // Fetch full prescription details if chiTiet is not present
      if (!px.chiTiet) {
        const detailRes = await fetch(`/api/don-thuoc/${px.id}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        });
        if (detailRes.ok) {
          px = await detailRes.json();
        }
      }

      const res = await fetch(`/api/don-thuoc/${px.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
        body: JSON.stringify({ trangThai: 'Huy' })
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.message || 'Hủy thất bại');
      }
      
      // Update prescription status locally
      setPrescriptions(prescriptions.map(p => p.id === px.id ? { ...p, trangThai: 'Huy' as any } : p));
      
      // Restore stock locally
      if (px.chiTiet) {
        setMedicines(medicines.map(m => {
          const detail = px.chiTiet!.find((d: any) => String(d.thuocID) === String(m.id));
          return detail ? { ...m, tonKho: m.tonKho + detail.soLuong } : m;
        }));
      }

      toast.success('Đã hủy đơn thuốc và hoàn lại số lượng thuốc.');
      addAuditLog('DonThuoc', 'Sua', `trangThai: ${px.trangThai}`, `trangThai: Hủy`);
    } catch (err: any) {
      toast.error(err.message || 'Có lỗi xảy ra khi hủy');
    }
  };

  const handleView = async (px: Prescription) => {
    try {
      const res = await fetch(`/api/don-thuoc/${px.id}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      setViewPx({ ...px, ...data });
      setViewOpen(true);
    } catch (err) {
      toast.error('Không thể tải chi tiết đơn thuốc');
    }
  };

  const canCreate = ['Admin', 'Bac si'].includes(currentUser.vaiTro);

  const printPrescription = (px: Prescription) => {
    const details = (px as any).chiTiet || [];
    const html = `
      <!DOCTYPE html><html><head><meta charset="UTF-8"><title>Don Thuoc</title>
      <style>
        body { font-family: 'Times New Roman', serif; margin: 20mm; color: #000; }
        h1 { text-align: center; font-size: 18pt; margin-bottom: 4px; }
        .subtitle { text-align: center; font-size: 10pt; margin-bottom: 20px; }
        .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 16px; font-size: 11pt; }
        .info-grid div { padding: 4px 0; border-bottom: 1px dashed #ccc; }
        .label { color: #555; font-style: italic; }
        table { width: 100%; border-collapse: collapse; margin-top: 12px; font-size: 11pt; }
        th { background: #f0f0f0; border: 1px solid #999; padding: 6px 8px; text-align: left; }
        td { border: 1px solid #ccc; padding: 6px 8px; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 10pt; }
        .sig { text-align: center; }
        @media print { body { margin: 15mm; } }
      </style></head><body>
      <h1>ĐƠN THUỐC</h1>
      <div class="subtitle">Mã đơn: <strong>${px.maDonThuoc}</strong></div>
      <div class="info-grid">
        <div><span class="label">Bệnh nhân:</span> <strong>${px.tenBenhNhan}</strong></div>
        <div><span class="label">Ngày kê:</span> ${px.ngayKe || ''}</div>
        <div><span class="label">Chẩn đoán:</span> <strong>${px.chanDoan}</strong></div>
        <div><span class="label">Bác sĩ kê đơn:</span> ${px.tenBacSi || ''}</div>
      </div>
      <table>
        <thead><tr><th>STT</th><th>Tên thuốc</th><th>Liều/lần</th><th>Số lần/ngày</th><th>Số lượng</th><th>Cách dùng</th></tr></thead>
        <tbody>${details.map((d: any, i: number) => `
          <tr><td>${i+1}</td><td>${d.tenThuoc}</td><td>${d.lieuMoiLan}</td><td>${d.soLanDungNgay}</td><td>${d.soLuong}</td><td>${d.cachDung}</td></tr>
        `).join('')}</tbody>
      </table>
      <div class="footer">
        <div></div>
        <div class="sig"><p>Ngày ${new Date().getDate()} tháng ${new Date().getMonth()+1} năm ${new Date().getFullYear()}</p><p><strong>Bác sĩ ký tên</strong></p><br/><br/><p>${px.tenBacSi || ''}</p></div>
      </div>
      </body></html>`;
    const win = window.open('', '_blank', 'width=800,height=600');
    if (win) { win.document.write(html); win.document.close(); win.print(); }
  };
  const canApprove = ['Admin', 'Duoc si'].includes(currentUser.vaiTro);
  const canDelete = ['Admin', 'Bac si'].includes(currentUser.vaiTro);

  const MED_LEVEL_COLORS: Record<string, string> = {
    'Tuyet doi': 'text-red-700 bg-red-100',
    'Nghiem trong': 'text-red-700 bg-red-100',
    'Tuong doi': 'text-orange-700 bg-orange-100',
    'Trung binh': 'text-orange-700 bg-orange-100',
    'Canh bao': 'text-yellow-700 bg-yellow-100',
    'Nhe': 'text-blue-700 bg-blue-100',
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)} placeholder="Tìm theo tên BN, mã đơn, chẩn đoán..." className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
          <option value="">Tất cả trạng thái</option>
          <option value="Cho duyet">Chờ duyệt</option>
          <option value="Da cap">Đã cấp</option>
          <option value="Huy">Hủy</option>
        </select>
        {canCreate && (
          <button onClick={() => { resetCreate(); setCreateOpen(true); }} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Plus className="w-4 h-4" /> Tạo đơn thuốc
          </button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                {['Mã đơn', 'Bệnh nhân', 'Bác sĩ', 'Chẩn đoán', 'Ngày kê', 'Trạng thái', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(p => (
                <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-gray-500">{p.maDonThuoc}</td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-800 flex items-center gap-1.5">
                      {p.tenBenhNhan}
                      {p.hasWarning && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{p.tenBacSi}</td>
                  <td className="px-4 py-3 text-gray-700 max-w-48 truncate">{p.chanDoan}</td>
                  <td className="px-4 py-3 text-gray-500 text-xs">{p.ngayKe}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-block text-xs px-3 py-1.5 rounded-full font-medium tracking-wide ${STATUS_COLORS[p.trangThai] || 'bg-gray-100 text-gray-800'}`}
                    >
                      {STATUS_LABELS[p.trangThai] || p.trangThai}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1 justify-end">
                      <button onClick={() => handleView(p)} className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors" title="Xem chi tiết"><Eye className="w-3.5 h-3.5" /></button>
                      {canApprove && p.trangThai === 'Cho duyet' && (
                        <button onClick={() => approvePx(p)} className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded transition-colors" title="Duyệt và cấp phát"><CheckCircle className="w-3.5 h-3.5" /></button>
                      )}
                      {canDelete && p.trangThai !== 'Da cap' && (
                        <button onClick={() => handleDeleteClick(p)} className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors" title="Hủy đơn thuốc"><Trash2 className="w-3.5 h-3.5" /></button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">Không có đơn thuốc nào.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* View Modal */}
      <Dialog.Root open={viewOpen} onOpenChange={setViewOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-xl z-50 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-semibold">Chi tiết đơn thuốc</Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            {viewPx && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 text-sm bg-gray-50 rounded-xl p-4">
                  <div><span className="text-gray-400">Mã đơn:</span> <span className="font-mono font-medium">{viewPx.maDonThuoc}</span></div>
                  <div><span className="text-gray-400">Ngày kê:</span> <span>{viewPx.ngayKe}</span></div>
                  <div><span className="text-gray-400">Bệnh nhân:</span> <span className="font-medium">{viewPx.tenBenhNhan}</span></div>
                  <div><span className="text-gray-400">Bác sĩ:</span> <span>{viewPx.tenBacSi}</span></div>
                  <div className="col-span-2"><span className="text-gray-400">Chẩn đoán:</span> <span className="font-medium">{viewPx.chanDoan}</span></div>
                  {viewPx.ghiChu && <div className="col-span-2"><span className="text-gray-400">Ghi chú:</span> <span>{viewPx.ghiChu}</span></div>}
                </div>
                <div>
                  <div className="font-medium text-gray-700 mb-2">Danh sách thuốc</div>
                  <div className="space-y-2">
                    {(viewPx.chiTiet || []).map((d, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg text-sm">
                        <div>
                          <div className="font-medium text-gray-800">{d.tenThuoc}</div>
                          <div className="text-xs text-gray-500">{d.lieuMoiLan} {medicines.find(m => m.id === d.thuocID)?.donVi || 'viên'}/lần × {d.soLanDungNgay} lần/ngày · {d.cachDung}</div>
                        </div>
                        <div className="text-teal-700 font-semibold">{d.soLuong} {medicines.find(m => m.id === d.thuocID)?.donVi || 'viên'}</div>
                      </div>
                    ))}
                  </div>
                </div>
                {viewPx.hasWarning && (
                  <div className={`rounded-xl p-4 text-sm ${viewPx.overrideReason ? 'bg-amber-50 border border-amber-200' : 'bg-red-50 border border-red-200'}`}>
                    <div className="flex items-center gap-2 font-medium mb-1">
                      <AlertTriangle className={`w-4 h-4 ${viewPx.overrideReason ? 'text-amber-500' : 'text-red-500'}`} />
                      <span>Đơn thuốc có cảnh báo an toàn</span>
                    </div>
                    {viewPx.overrideReason && <p className="text-gray-600 text-xs">Lý do ghi đè: <em>{viewPx.overrideReason}</em></p>}
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className={`text-sm px-3 py-1 rounded-full font-medium ${STATUS_COLORS[viewPx.trangThai] || 'bg-gray-100 text-gray-800'}`}>{STATUS_LABELS[viewPx.trangThai] || viewPx.trangThai}</span>
                  <button onClick={() => printPrescription(viewPx)} className="flex items-center gap-2 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors">
                    <Printer className="w-4 h-4" /> In đơn / PDF
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Create Prescription Modal - Multi step */}
      <Dialog.Root open={createOpen} onOpenChange={v => { if (!v) resetCreate(); setCreateOpen(v); }}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-2xl z-50 p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="text-lg font-semibold">Tạo đơn thuốc mới</Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></Dialog.Close>
            </div>

            {/* Step indicator */}
            <div className="flex items-center gap-2 mb-6">
              {['Bệnh nhân', 'Thuốc', 'Kiểm tra', 'Xác nhận'].map((s, i) => (
                <div key={s} className="flex items-center gap-2">
                  <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${step > i + 1 ? 'bg-teal-600 text-white' : step === i + 1 ? 'bg-teal-600 text-white ring-4 ring-teal-100' : 'bg-gray-100 text-gray-400'}`}>
                    {step > i + 1 ? '✓' : i + 1}
                  </div>
                  <span className={`text-xs ${step === i + 1 ? 'text-teal-600 font-medium' : 'text-gray-400'}`}>{s}</span>
                  {i < 3 && <ChevronRight className="w-3 h-3 text-gray-300" />}
                </div>
              ))}
            </div>
            {/* Step 1: Patient + diagnosis */}
            {step === 1 && (
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Chọn bệnh nhân *</label>
                  <select value={selectedPatient?.id ?? ''} onChange={e => setSelectedPatient(patients.find(p => String(p.id) === String(e.target.value)) || null)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">-- Chọn bệnh nhân --</option>
                    {patients.map(p => <option key={p.id} value={p.id}>{p.maBenhNhan} · {p.hoTen}{p.isMangThai ? ' (Có thai)' : ''}</option>)}
                  </select>
                </div>
                {selectedPatient && (
                  <div className="bg-blue-50 rounded-xl p-4 text-sm space-y-1">
                    <div className="font-medium text-gray-800">{selectedPatient.hoTen}</div>
                    {selectedPatient.tienSuBenh && <div className="text-red-600 flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Tiền sử: {selectedPatient.tienSuBenh}</div>}
                    {selectedPatient.isMangThai && <div className="text-pink-600">Đang mang thai</div>}
                  </div>
                )}
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Chẩn đoán *</label>
                  <input value={chanDoan} onChange={e => setChanDoan(e.target.value)} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" placeholder="Nhập chẩn đoán bệnh" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Ghi chú</label>
                  <textarea value={ghiChu} onChange={e => setGhiChu(e.target.value)} rows={2} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 resize-none" />
                </div>

                <div className="flex justify-end">
                  <button onClick={() => { if (!selectedPatient || !chanDoan.trim()) { toast.error('Vui lòng chọn bệnh nhân và nhập chẩn đoán.'); return; } setStep(2); }} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Tiếp theo →
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Add medicines */}
            {step === 2 && (
              <div className="space-y-4">
                <div className="flex gap-2">
                  <select value={selectedMedId} onChange={e => setSelectedMedId(e.target.value)} className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                    <option value="">-- Chọn thuốc --</option>
                    {medicines.filter(m => m.trangThai && m.tonKho > 0).map(m => <option key={m.id} value={m.id}>{m.tenThuong} (Còn {m.tonKho})</option>)}
                  </select>
                  <button type="button" onClick={addMedToDetail} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-1">
                    <Plus className="w-4 h-4" /> Thêm
                  </button>
                </div>
                <div className="space-y-3">
                  {details.map((d, i) => (
                    <div key={d.thuocID} className="bg-gray-50 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-medium text-gray-800 text-sm">{d.tenThuoc}</span>
                        <button onClick={() => setDetails(details.filter((_, j) => j !== i))} className="text-red-400 hover:text-red-600"><Trash2 className="w-4 h-4" /></button>
                      </div>
                      <div className="grid grid-cols-4 gap-2 text-xs">
                        <div>
                          <label className="block text-gray-500 mb-1">Số lượng</label>
                          <input type="number" value={d.soLuong} onChange={e => setDetails(details.map((x, j) => j === i ? { ...x, soLuong: +e.target.value } : x))} min={1} className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                        </div>
                        <div>
                          <label className="block text-gray-500 mb-1">Liều/lần</label>
                          <input type="number" value={d.lieuMoiLan} onChange={e => setDetails(details.map((x, j) => j === i ? { ...x, lieuMoiLan: +e.target.value } : x))} min={0.5} step={0.5} className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                        </div>
                        <div>
                          <label className="block text-gray-500 mb-1">Lần/ngày</label>
                          <input type="number" value={d.soLanDungNgay} onChange={e => setDetails(details.map((x, j) => j === i ? { ...x, soLanDungNgay: +e.target.value } : x))} min={1} className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                        </div>
                        <div>
                          <label className="block text-gray-500 mb-1">Cách dùng</label>
                          <input value={d.cachDung} onChange={e => setDetails(details.map((x, j) => j === i ? { ...x, cachDung: e.target.value } : x))} className="w-full border border-gray-300 rounded px-2 py-1.5 focus:outline-none focus:ring-1 focus:ring-teal-500" />
                        </div>
                      </div>
                    </div>
                  ))}
                  {details.length === 0 && <p className="text-center text-gray-400 py-6">Chưa có thuốc nào trong đơn.</p>}
                </div>
                <div className="flex justify-between">
                  <button onClick={() => setStep(1)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">← Quay lại</button>
                  <button onClick={() => { if (details.length === 0) { toast.error('Vui lòng thêm ít nhất một thuốc.'); return; } setStep(3); handleRunSafety(); }} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Kiểm tra an toàn →
                  </button>
                </div>
              </div>
            )}

            {/* Step 3: Safety check */}
            {step === 3 && (
              <div className="space-y-4">
                {!safetyChecked ? (
                  <button onClick={handleRunSafety} className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors">Chạy kiểm tra an toàn</button>
                ) : warnings.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-6">
                    <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="text-center">
                      <p className="font-semibold text-gray-800">Không có cảnh báo</p>
                      <p className="text-sm text-gray-500">Đơn thuốc an toàn cho bệnh nhân này.</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-amber-700 bg-amber-50 rounded-xl p-3">
                      <ShieldAlert className="w-5 h-5 flex-shrink-0" />
                      <span className="font-medium text-sm">Phát hiện {warnings.length} cảnh báo an toàn</span>
                    </div>
                    {[...warnings].sort((a, b) => (severityOrder[a.mucDo] ?? 9) - (severityOrder[b.mucDo] ?? 9)).map((w, i) => (
                      <div key={i} className={`rounded-xl p-4 border text-sm ${hasSevere && ['Tuyet doi', 'Nghiem trong'].includes(w.mucDo) ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="font-medium text-gray-800">{w.type}</span>
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${MED_LEVEL_COLORS[w.mucDo] || 'bg-gray-100 text-gray-600'}`}>{w.mucDo === 'Tuyet doi' ? 'Tuyệt đối' : w.mucDo === 'Tuong doi' ? 'Tương đối' : w.mucDo === 'Nghiem trong' ? 'Nghiêm trọng' : w.mucDo === 'Trung binh' ? 'Trung bình' : w.mucDo}</span>
                        </div>
                        {w.medicine && <p className="text-gray-600 text-xs mb-1">Thuốc: <strong>{w.medicine}</strong></p>}
                        {w.medicinePair && <p className="text-gray-600 text-xs mb-1">Cặp thuốc: <strong>{w.medicinePair.join(' + ')}</strong></p>}
                        <p className="text-gray-700 text-xs">{w.message}</p>
                        {w.consequence && <p className="text-red-600 text-xs mt-1">Hậu quả: {w.consequence}</p>}
                      </div>
                    ))}
                    {hasSevere && (
                      <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                        <label className="block text-xs font-semibold text-red-700 mb-2">Lý do ghi đè cảnh báo nghiêm trọng * (bắt buộc)</label>
                        <textarea value={overrideReason} onChange={e => setOverrideReason(e.target.value)} rows={3} className="w-full border border-red-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-red-400 resize-none" placeholder="Giải thích lý do chấp nhận rủi ro..." />
                      </div>
                    )}
                  </div>
                )}
                <div className="flex justify-between">
                  <button onClick={() => setStep(2)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">← Quay lại</button>
                  <button onClick={() => setStep(4)} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium transition-colors">
                    Xem tổng kết →
                  </button>
                </div>
              </div>
            )}

            {/* Step 4: Review */}
            {step === 4 && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-4 text-sm space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div><span className="text-gray-400">Bệnh nhân:</span> <span className="font-medium">{selectedPatient?.hoTen}</span></div>
                    <div><span className="text-gray-400">Chẩn đoán:</span> <span>{chanDoan}</span></div>
                  </div>
                  <div className="border-t border-gray-200 pt-2 space-y-1">
                    {details.map((d, i) => (
                      <div key={i} className="flex justify-between text-xs">
                        <span className="text-gray-700">{d.tenThuoc} — {d.lieuMoiLan} viên × {d.soLanDungNgay}/ngày</span>
                        <span className="font-medium">{d.soLuong} viên</span>
                      </div>
                    ))}
                  </div>
                </div>
                {warnings.length > 0 && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                    Đơn thuốc có {warnings.length} cảnh báo. {overrideReason && `Lý do ghi đè: "${overrideReason}"`}
                  </div>
                )}
                <div className="flex justify-between">
                  <button onClick={() => setStep(3)} className="px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50 transition-colors">← Quay lại</button>
                  <button onClick={handleSavePx} className="px-5 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" /> Xác nhận tạo đơn
                  </button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Cancel Confirmation Modal */}
      <Dialog.Root open={!!confirmDeletePx} onOpenChange={(open) => !open && setConfirmDeletePx(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-sm z-[60] p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-2 text-slate-800">Xác nhận hủy đơn thuốc</h3>
            <p className="text-gray-600 text-sm mb-6">
              Bạn có chắc chắn muốn hủy đơn thuốc <span className="font-semibold">{confirmDeletePx?.maDonThuoc}</span>? 
              Thuốc trong đơn sẽ được hoàn lại vào kho.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeletePx(null)} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Quay lại
              </button>
              <button onClick={executeCancel} className="px-4 py-2 text-sm font-medium bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors shadow-sm shadow-red-200">
                Xác nhận hủy
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}

const MED_LEVEL_COLORS: Record<string, string> = {
  'Tuyet doi': 'text-red-700 bg-red-100',
  'Nghiem trong': 'text-red-700 bg-red-100',
  'Tuong doi': 'text-orange-700 bg-orange-100',
  'Trung binh': 'text-orange-700 bg-orange-100',
  'Canh bao': 'text-yellow-700 bg-yellow-100',
  'Nhe': 'text-blue-700 bg-blue-100',
};
