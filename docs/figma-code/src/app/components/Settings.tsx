import { useState } from 'react';
import { Save, Bell, Shield, Database, Pill } from 'lucide-react';
import { toast } from 'sonner';
import type { User } from '../types';

interface Props {
  currentUser: User;
}

export function Settings({ currentUser }: Props) {
  const [profile, setProfile] = useState({ hoTen: currentUser.hoTen, email: currentUser.email });
  const [notif, setNotif] = useState({ lowStock: true, expiry: true, prescriptionWarning: true, auditAlert: false });
  const [thresholds, setThresholds] = useState({ nearExpiryDays: 30, lowStockMultiplier: 1 });

  const handleSaveProfile = () => {
    toast.success('Đã cập nhật thông tin cá nhân.');
  };

  return (
    <div className="max-w-2xl space-y-6">
      {/* Profile */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
            <Shield className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Thông tin tài khoản</h3>
        </div>
        <div className="flex items-center gap-4 mb-5 p-4 bg-gray-50 rounded-xl">
          <div className="w-16 h-16 bg-teal-600 rounded-full flex items-center justify-center text-white font-bold text-2xl">
            {currentUser.hoTen.charAt(currentUser.hoTen.lastIndexOf(' ') + 1)}
          </div>
          <div>
            <div className="font-semibold text-gray-800">{currentUser.hoTen}</div>
            <div className="text-sm text-gray-500">@{currentUser.tenDangNhap}</div>
            <div className="text-xs text-teal-600 font-medium mt-1">{currentUser.vaiTro === 'Admin' ? 'Quản trị viên' : currentUser.vaiTro === 'Bac si' ? 'Bác sĩ' : 'Dược sĩ'}</div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Họ và tên</label>
            <input value={profile.hoTen} onChange={e => setProfile({ ...profile, hoTen: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
            <input type="email" value={profile.email} onChange={e => setProfile({ ...profile, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Mật khẩu mới</label>
            <input type="password" placeholder="Để trống nếu không đổi" className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
          </div>
          <button onClick={handleSaveProfile} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Save className="w-4 h-4" /> Lưu thay đổi
          </button>
        </div>
      </div>

      {/* Notifications */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
            <Bell className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Cài đặt thông báo</h3>
        </div>
        <div className="space-y-3">
          {[
            { key: 'lowStock' as const, label: 'Cảnh báo thuốc sắp hết kho', desc: 'Nhận thông báo khi tồn kho dưới mức tối thiểu' },
            { key: 'expiry' as const, label: 'Cảnh báo thuốc sắp hết hạn', desc: 'Nhận thông báo khi thuốc sắp hết hạn trong 30 ngày' },
            { key: 'prescriptionWarning' as const, label: 'Cảnh báo đơn thuốc', desc: 'Hiển thị popup khi tạo đơn có tương tác hoặc CCĐ' },
            { key: 'auditAlert' as const, label: 'Cảnh báo hành động bất thường', desc: 'Thông báo khi có ghi đè cảnh báo nghiêm trọng' },
          ].map(({ key, label, desc }) => (
            <div key={key} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-0">
              <div>
                <div className="text-sm font-medium text-gray-800">{label}</div>
                <div className="text-xs text-gray-400">{desc}</div>
              </div>
              <button onClick={() => setNotif({ ...notif, [key]: !notif[key] })} className={`w-11 h-6 rounded-full transition-colors relative ${notif[key] ? 'bg-teal-500' : 'bg-gray-200'}`}>
                <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${notif[key] ? 'left-5' : 'left-0.5'}`} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Thresholds */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-orange-100 rounded-lg flex items-center justify-center">
            <Database className="w-4 h-4 text-orange-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Ngưỡng cảnh báo hệ thống</h3>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Cảnh báo hết hạn trước (ngày)</label>
            <input type="number" value={thresholds.nearExpiryDays} onChange={e => setThresholds({ ...thresholds, nearExpiryDays: +e.target.value })} min={7} max={90} className="w-32 border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
            <span className="text-xs text-gray-400 ml-2">ngày trước khi hết hạn</span>
          </div>
          <button onClick={() => toast.success('Đã lưu cài đặt ngưỡng cảnh báo.')} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
            <Save className="w-4 h-4" /> Lưu cài đặt
          </button>
        </div>
      </div>

      {/* System info */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 bg-teal-100 rounded-lg flex items-center justify-center">
            <Pill className="w-4 h-4 text-teal-600" />
          </div>
          <h3 className="font-semibold text-gray-800">Thông tin hệ thống</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[
            ['Tên hệ thống', 'QLThuoc Hayday'],
            ['Phiên bản', 'v1.0.0'],
            ['Môi trường', 'Demo / Frontend'],
            ['Ngày triển khai', '2024-01-01'],
            ['Cơ sở dữ liệu', 'Mock (Demo mode)'],
            ['API', 'RESTful (Simulated)'],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-gray-400 text-xs mb-0.5">{label}</div>
              <div className="text-gray-700 font-medium">{value}</div>
            </div>
          ))}
        </div>
        <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
          Đây là môi trường demo với dữ liệu mô phỏng. Trong triển khai thực tế, hệ thống kết nối với backend Node.js/Express và cơ sở dữ liệu MySQL.
        </div>
      </div>
    </div>
  );
}
