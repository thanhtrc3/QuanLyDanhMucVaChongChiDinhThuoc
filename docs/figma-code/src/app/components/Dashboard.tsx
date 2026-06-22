import { Users, FileText, Package, AlertTriangle, TrendingUp, Activity, Clock, ShieldAlert } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, Legend } from 'recharts';
import type { Medicine, Patient, Prescription, User } from '../types';

interface DashboardProps {
  currentUser: User;
  medicines: Medicine[];
  patients: Patient[];
  prescriptions: Prescription[];
}

const prescriptionTrend = [
  { month: 'T1', donThuoc: 12 }, { month: 'T2', donThuoc: 19 }, { month: 'T3', donThuoc: 15 },
  { month: 'T4', donThuoc: 22 }, { month: 'T5', donThuoc: 28 }, { month: 'T6', donThuoc: 24 },
  { month: 'T7', donThuoc: 31 }, { month: 'T8', donThuoc: 27 }, { month: 'T9', donThuoc: 35 },
  { month: 'T10', donThuoc: 29 }, { month: 'T11', donThuoc: 42 }, { month: 'T12', donThuoc: 38 },
];

const PIE_COLORS = ['#0891b2', '#16a34a', '#ea580c', '#8b5cf6', '#f59e0b', '#ef4444'];

const STATUS_LABELS: Record<string, string> = {
  'Da cap': 'Đã cấp',
  'Cho duyet': 'Chờ duyệt',
  'Huy': 'Hủy',
};

const STATUS_COLORS: Record<string, string> = {
  'Da cap': 'bg-green-100 text-green-700',
  'Cho duyet': 'bg-yellow-100 text-yellow-700',
  'Huy': 'bg-red-100 text-red-700',
};

export function Dashboard({ currentUser, medicines, patients, prescriptions }: DashboardProps) {
  const today = new Date();
  const in30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

  const lowStockMeds = medicines.filter(m => m.tonKho < m.tonKhoToiThieu && m.trangThai);
  const expiredMeds = medicines.filter(m => new Date(m.hanDung) < today && m.trangThai);
  const nearExpiryMeds = medicines.filter(m => {
    const d = new Date(m.hanDung);
    return d >= today && d <= in30Days && m.trangThai;
  });
  const pendingPrescriptions = prescriptions.filter(p => p.trangThai === 'Cho duyet');
  const warningCount = lowStockMeds.length + expiredMeds.length + nearExpiryMeds.length;

  const nhomThuocStats = Object.entries(
    medicines.reduce((acc, m) => {
      acc[m.nhomThuoc] = (acc[m.nhomThuoc] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([name, value]) => ({ name, value }));

  const topInventory = [...medicines]
    .sort((a, b) => b.tonKho - a.tonKho)
    .slice(0, 8)
    .map(m => ({ name: m.tenThuong.split(' ').slice(0, 2).join(' '), tonKho: m.tonKho, toiThieu: m.tonKhoToiThieu }));

  const recentPrescriptions = [...prescriptions].sort((a, b) => b.ngayKe.localeCompare(a.ngayKe)).slice(0, 5);

  const canSeePatients = ['Admin', 'Bac si'].includes(currentUser.vaiTro);
  const canSeeInventory = ['Admin', 'Duoc si'].includes(currentUser.vaiTro);

  return (
    <div className="space-y-6">
      {/* Alert banner */}
      {warningCount > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-amber-800 font-medium text-sm">Có {warningCount} cảnh báo cần chú ý</p>
            <p className="text-amber-700 text-xs mt-0.5">
              {lowStockMeds.length > 0 && `${lowStockMeds.length} thuốc sắp hết kho. `}
              {expiredMeds.length > 0 && `${expiredMeds.length} thuốc đã hết hạn. `}
              {nearExpiryMeds.length > 0 && `${nearExpiryMeds.length} thuốc sắp hết hạn trong 30 ngày.`}
            </p>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {canSeePatients && (
          <StatCard icon={Users} label="Tổng bệnh nhân" value={patients.length} color="blue" delta="+3 tháng này" />
        )}
        <StatCard icon={FileText} label="Đơn thuốc" value={prescriptions.length} color="teal" delta={`${pendingPrescriptions.length} chờ duyệt`} />
        <StatCard icon={Package} label="Loại thuốc" value={medicines.filter(m => m.trangThai).length} color="green" delta={`${lowStockMeds.length} sắp hết`} />
        <StatCard icon={ShieldAlert} label="Cảnh báo kho" value={warningCount} color="red" delta={`${expiredMeds.length} hết hạn`} />
      </div>

      <div className="grid grid-cols-3 gap-6">
        {/* Prescription trend */}
        <div className="col-span-2 bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-gray-800 font-semibold">Đơn thuốc theo tháng</h3>
              <p className="text-xs text-gray-500">Năm 2024</p>
            </div>
            <div className="flex items-center gap-1 text-green-600 text-sm">
              <TrendingUp className="w-4 h-4" />
              <span>+18%</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={prescriptionTrend}>
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#0891b2" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#0891b2" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 12 }} />
              <Area type="monotone" dataKey="donThuoc" name="Đơn thuốc" stroke="#0891b2" strokeWidth={2} fill="url(#tealGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Medicine groups */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <h3 className="text-gray-800 font-semibold mb-1">Nhóm thuốc</h3>
          <p className="text-xs text-gray-500 mb-4">Phân loại theo danh mục</p>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie data={nhomThuocStats} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value" paddingAngle={3}>
                {nhomThuocStats.map((_, idx) => (
                  <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 11 }} />
              <Legend iconSize={10} wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Recent prescriptions */}
        <div className="bg-white rounded-xl border border-gray-200 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-gray-800 font-semibold">Đơn thuốc gần đây</h3>
            <Activity className="w-4 h-4 text-gray-400" />
          </div>
          <div className="space-y-3">
            {recentPrescriptions.map(p => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 font-medium truncate">{p.tenBenhNhan}</p>
                  <p className="text-xs text-gray-400 truncate">{p.chanDoan}</p>
                </div>
                <div className="flex items-center gap-2 ml-2">
                  {p.hasWarning && <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />}
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[p.trangThai]}`}>
                    {STATUS_LABELS[p.trangThai]}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory alerts */}
        {canSeeInventory && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-800 font-semibold">Cảnh báo kho thuốc</h3>
              <Clock className="w-4 h-4 text-gray-400" />
            </div>
            <div className="space-y-2">
              {[...expiredMeds.map(m => ({ ...m, alertType: 'expired' as const })), ...lowStockMeds.map(m => ({ ...m, alertType: 'low' as const })), ...nearExpiryMeds.map(m => ({ ...m, alertType: 'near' as const }))].slice(0, 6).map(m => (
                <div key={`${m.alertType}-${m.id}`} className={`flex items-center justify-between p-2.5 rounded-lg border text-xs ${m.alertType === 'expired' ? 'bg-red-50 border-red-100' : m.alertType === 'low' ? 'bg-orange-50 border-orange-100' : 'bg-yellow-50 border-yellow-100'}`}>
                  <span className="font-medium text-gray-700 truncate flex-1">{m.tenThuong}</span>
                  <span className={`ml-2 px-2 py-0.5 rounded-full font-medium ${m.alertType === 'expired' ? 'bg-red-100 text-red-700' : m.alertType === 'low' ? 'bg-orange-100 text-orange-700' : 'bg-yellow-100 text-yellow-700'}`}>
                    {m.alertType === 'expired' ? 'Hết hạn' : m.alertType === 'low' ? `Còn ${m.tonKho}` : 'Sắp hết hạn'}
                  </span>
                </div>
              ))}
              {warningCount === 0 && <p className="text-center text-gray-400 text-sm py-4">Không có cảnh báo</p>}
            </div>
          </div>
        )}

        {/* Inventory bar chart (if not showing alerts) */}
        {!canSeeInventory && (
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h3 className="text-gray-800 font-semibold mb-4">Tồn kho thuốc (Top 8)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={topInventory} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <YAxis type="category" dataKey="name" width={100} tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ borderRadius: 8, border: '1px solid #e5e7eb', fontSize: 11 }} />
                <Bar dataKey="tonKho" name="Tồn kho" fill="#0891b2" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, delta }: { icon: React.ElementType; label: string; value: number; color: string; delta: string }) {
  const colors: Record<string, string> = {
    blue: 'bg-blue-500 text-blue-50',
    teal: 'bg-teal-500 text-teal-50',
    green: 'bg-green-500 text-green-50',
    red: 'bg-red-500 text-red-50',
  };
  const bgLight: Record<string, string> = {
    blue: 'bg-blue-50',
    teal: 'bg-teal-50',
    green: 'bg-green-50',
    red: 'bg-red-50',
  };
  return (
    <div className={`${bgLight[color]} rounded-xl border border-gray-200 bg-white p-5`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs text-gray-500 font-medium">{label}</p>
          <p className="text-3xl font-bold text-gray-800 mt-1">{value}</p>
          <p className="text-xs text-gray-400 mt-1">{delta}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors[color]}`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
