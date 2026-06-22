import { useState } from 'react';
import { Package, AlertTriangle, TrendingDown, Clock, Plus, Minus } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { toast } from 'sonner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import type { Medicine, User } from '../types';

interface Props {
  medicines: Medicine[];
  setMedicines: (m: Medicine[]) => void;
  currentUser: User;
  addAuditLog: (table: string, action: 'Them' | 'Sua' | 'Xoa', oldVal: string, newVal: string) => void;
}

export function InventoryManagement({ medicines, setMedicines, currentUser, addAuditLog }: Props) {
  const [tab, setTab] = useState<'all' | 'low' | 'expired' | 'near'>('all');
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustMed, setAdjustMed] = useState<Medicine | null>(null);
  const [adjustQty, setAdjustQty] = useState(0);
  const [adjustType, setAdjustType] = useState<'add' | 'sub'>('add');

  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const allMeds = medicines.filter(m => m.trangThai);
  const lowStock = allMeds.filter(m => m.tonKho < m.tonKhoToiThieu);
  const expired = allMeds.filter(m => new Date(m.hanDung) < today);
  const nearExpiry = allMeds.filter(m => { const d = new Date(m.hanDung); return d >= today && d <= in30Days; });

  const displayMeds = tab === 'all' ? allMeds : tab === 'low' ? lowStock : tab === 'expired' ? expired : nearExpiry;

  const chartData = [...allMeds]
    .sort((a, b) => b.tonKho - a.tonKho)
    .slice(0, 10)
    .map(m => ({
      name: m.tenThuong.split(' ').slice(0, 2).join(' '),
      tonKho: m.tonKho,
      toiThieu: m.tonKhoToiThieu,
      isLow: m.tonKho < m.tonKhoToiThieu,
    }));

  const handleAdjust = () => {
    if (!adjustMed || adjustQty <= 0) { toast.error('Số lượng phải lớn hơn 0.'); return; }
    const oldQty = adjustMed.tonKho;
    if (adjustType === 'subtract' && adjustQty > oldQty) { toast.error('Số lượng xuất không được vượt quá tồn kho hiện tại.'); return; }
    const newQty = adjustType === 'add' ? oldQty + adjustQty : oldQty - adjustQty;
    setMedicines(medicines.map(m => m.id === adjustMed.id ? { ...m, tonKho: newQty } : m));
    addAuditLog('Kho', 'Sua', `${adjustMed.tenThuong}: tonKho = ${oldQty}`, `tonKho = ${newQty}`);
    toast.success(`Đã ${adjustType === 'add' ? 'nhập thêm' : 'xuất'} ${adjustQty} ${adjustMed.donVi}.`);
    setAdjustOpen(false);
  };

  const openAdjust = (med: Medicine) => {
    setAdjustMed(med);
    setAdjustQty(0);
    setAdjustType('add');
    setAdjustOpen(true);
  };

  const getStockPct = (m: Medicine) => m.tonKhoToiThieu > 0 ? Math.min(100, (m.tonKho / (m.tonKhoToiThieu * 2)) * 100) : 50;

  const TABS = [
    { id: 'all' as const, label: 'Tất cả', count: allMeds.length, color: 'text-gray-700' },
    { id: 'low' as const, label: 'Sắp hết kho', count: lowStock.length, color: 'text-orange-600' },
    { id: 'expired' as const, label: 'Hết hạn', count: expired.length, color: 'text-red-600' },
    { id: 'near' as const, label: 'Sắp hết hạn', count: nearExpiry.length, color: 'text-yellow-600' },
  ];

  return (
    <div className="space-y-5">
      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: Package, label: 'Tổng loại thuốc', value: allMeds.length, cls: 'bg-teal-50 text-teal-600' },
          { icon: TrendingDown, label: 'Sắp hết kho', value: lowStock.length, cls: 'bg-orange-50 text-orange-600' },
          { icon: AlertTriangle, label: 'Đã hết hạn', value: expired.length, cls: 'bg-red-50 text-red-600' },
          { icon: Clock, label: 'Sắp hết hạn (30 ngày)', value: nearExpiry.length, cls: 'bg-yellow-50 text-yellow-600' },
        ].map(({ icon: Icon, label, value, cls }) => (
          <div key={label} className="bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${cls}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div>
              <div className="text-2xl font-bold text-gray-800">{value}</div>
              <div className="text-xs text-gray-500">{label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Chart */}
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h3 className="font-semibold text-gray-800 mb-4">Tồn kho Top 10 thuốc</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
            <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 11 }} />
            <Bar dataKey="tonKho" name="Tồn kho" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, idx) => (
                <Cell key={idx} fill={entry.isLow ? '#f97316' : '#0891b2'} />
              ))}
            </Bar>
            <Bar dataKey="toiThieu" name="Tối thiểu" fill="#e2e8f0" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tabs */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="flex border-b border-gray-200">
          {TABS.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)} className={`flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2 ${tab === t.id ? 'border-b-2 border-teal-600 text-teal-600 bg-teal-50/50' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'}`}>
              <span>{t.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${tab === t.id ? 'bg-teal-600 text-white' : 'bg-gray-100 text-gray-500'}`}>{t.count}</span>
            </button>
          ))}
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Tên thuốc', 'Nhóm', 'Tồn kho', 'Tối thiểu', 'Mức tồn', 'Hạn dùng', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-semibold text-gray-500 uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {displayMeds.map(m => {
                const pct = getStockPct(m);
                const isLow = m.tonKho < m.tonKhoToiThieu;
                const isExpired = new Date(m.hanDung) < today;
                return (
                  <tr key={m.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="font-medium text-gray-800">{m.tenThuong}</div>
                      <div className="text-xs text-gray-400 font-mono">{m.maATC}</div>
                    </td>
                    <td className="px-4 py-3"><span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-full">{m.nhomThuoc}</span></td>
                    <td className="px-4 py-3">
                      <span className={`font-semibold text-lg ${isLow ? 'text-orange-600' : 'text-gray-800'}`}>{m.tonKho}</span>
                      <span className="text-gray-400 text-xs ml-1">{m.donVi}</span>
                    </td>
                    <td className="px-4 py-3 text-gray-500">{m.tonKhoToiThieu} {m.donVi}</td>
                    <td className="px-4 py-3 w-40">
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-gray-100 rounded-full h-1.5 overflow-hidden">
                          <div className={`h-full rounded-full transition-all ${isLow ? 'bg-orange-500' : pct > 70 ? 'bg-green-500' : 'bg-yellow-500'}`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-xs text-gray-400 w-8">{Math.round(pct)}%</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className={`text-sm ${isExpired ? 'text-red-600 font-medium' : ''}`}>{m.hanDung}</div>
                      {isExpired && <div className="text-xs text-red-500">Đã hết hạn</div>}
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => openAdjust(m)} className="flex items-center gap-1 text-xs px-2.5 py-1.5 bg-teal-50 text-teal-600 hover:bg-teal-100 rounded-lg transition-colors font-medium">
                        <Package className="w-3 h-3" /> Điều chỉnh
                      </button>
                    </td>
                  </tr>
                );
              })}
              {displayMeds.length === 0 && <tr><td colSpan={7} className="text-center py-8 text-gray-400">Không có dữ liệu.</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      {/* Adjust stock modal */}
      <Dialog.Root open={adjustOpen} onOpenChange={setAdjustOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-sm z-50 p-6">
            <div className="flex items-center justify-between mb-4">
              <Dialog.Title className="font-semibold text-gray-800">Điều chỉnh tồn kho</Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            {adjustMed && (
              <div className="space-y-4">
                <div className="bg-gray-50 rounded-xl p-3 text-sm">
                  <div className="font-medium text-gray-800">{adjustMed.tenThuong}</div>
                  <div className="text-gray-500 mt-0.5">Tồn kho hiện tại: <strong>{adjustMed.tonKho} {adjustMed.donVi}</strong></div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setAdjustType('add')} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${adjustType === 'add' ? 'bg-green-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Plus className="w-4 h-4" /> Nhập kho
                  </button>
                  <button onClick={() => setAdjustType('sub')} className={`flex-1 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${adjustType === 'sub' ? 'bg-orange-600 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}>
                    <Minus className="w-4 h-4" /> Xuất kho
                  </button>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Số lượng ({adjustMed.donVi})</label>
                  <input type="number" value={adjustQty} onChange={e => setAdjustQty(+e.target.value)} min={1} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
                </div>
                {adjustQty > 0 && (
                  <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                    Sau điều chỉnh: <strong>{adjustType === 'add' ? adjustMed.tonKho + adjustQty : adjustMed.tonKho - adjustQty} {adjustMed.donVi}</strong>
                  </div>
                )}
                <div className="flex gap-3">
                  <Dialog.Close className="flex-1 px-4 py-2 border border-gray-300 rounded-lg text-sm hover:bg-gray-50">Hủy</Dialog.Close>
                  <button onClick={handleAdjust} className="flex-1 px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium">Xác nhận</button>
                </div>
              </div>
            )}
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
