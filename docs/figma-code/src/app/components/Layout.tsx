import { ReactNode } from 'react';
import {
  LayoutDashboard, Users, FileText, Pill, ShieldAlert, Zap,
  Package, UserCog, ScrollText, Settings, LogOut, Bell, ChevronRight,
} from 'lucide-react';
import type { User, View } from '../types';

interface NavItem {
  id: View;
  label: string;
  icon: React.ElementType;
  roles: string[];
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['Admin', 'Bac si', 'Duoc si'] },
  { id: 'patients', label: 'Bệnh nhân', icon: Users, roles: ['Admin', 'Bac si'] },
  { id: 'prescriptions', label: 'Đơn thuốc', icon: FileText, roles: ['Admin', 'Bac si', 'Duoc si'] },
  { id: 'medicines', label: 'Danh mục thuốc', icon: Pill, roles: ['Admin', 'Bac si', 'Duoc si'] },
  { id: 'contraindications', label: 'Chống chỉ định', icon: ShieldAlert, roles: ['Admin', 'Bac si'] },
  { id: 'interactions', label: 'Tương tác thuốc', icon: Zap, roles: ['Admin', 'Bac si', 'Duoc si'] },
  { id: 'inventory', label: 'Kho thuốc', icon: Package, roles: ['Admin', 'Duoc si'] },
  { id: 'users', label: 'Người dùng', icon: UserCog, roles: ['Admin'] },
  { id: 'audit-logs', label: 'Nhật ký hệ thống', icon: ScrollText, roles: ['Admin'] },
  { id: 'settings', label: 'Cài đặt', icon: Settings, roles: ['Admin'] },
];

const PAGE_TITLES: Record<View, string> = {
  dashboard: 'Dashboard',
  patients: 'Quản lý bệnh nhân',
  prescriptions: 'Quản lý đơn thuốc',
  medicines: 'Danh mục thuốc',
  contraindications: 'Quy tắc chống chỉ định',
  interactions: 'Tương tác thuốc',
  inventory: 'Quản lý kho thuốc',
  users: 'Quản lý người dùng',
  'audit-logs': 'Nhật ký hệ thống',
  settings: 'Cài đặt',
};

const ROLE_LABELS: Record<string, string> = {
  'Admin': 'Quản trị viên',
  'Bac si': 'Bác sĩ',
  'Duoc si': 'Dược sĩ',
};

const ROLE_COLORS: Record<string, string> = {
  'Admin': 'bg-purple-500',
  'Bac si': 'bg-blue-500',
  'Duoc si': 'bg-green-500',
};

interface LayoutProps {
  currentUser: User;
  currentView: View;
  setCurrentView: (view: View) => void;
  onLogout: () => void;
  children: ReactNode;
  alertCount?: number;
}

export function Layout({ currentUser, currentView, setCurrentView, onLogout, children, alertCount = 0 }: LayoutProps) {
  const allowedItems = NAV_ITEMS.filter(item => item.roles.includes(currentUser.vaiTro));

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 bg-slate-800 flex flex-col h-full">
        {/* Logo */}
        <div className="p-5 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-teal-500 rounded-lg flex items-center justify-center">
              <Pill className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="text-white font-bold text-sm leading-tight">QLThuoc Hayday</div>
              <div className="text-slate-400 text-xs">Quản lý dược phẩm</div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {allowedItems.map(item => {
            const Icon = item.icon;
            const isActive = currentView === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all text-sm ${
                  isActive
                    ? 'bg-teal-600 text-white shadow-sm'
                    : 'text-slate-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="flex-1">{item.label}</span>
                {isActive && <ChevronRight className="w-3 h-3 opacity-60" />}
              </button>
            );
          })}
        </nav>

        {/* User Info */}
        <div className="p-3 border-t border-slate-700">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg bg-slate-700/50">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0 ${ROLE_COLORS[currentUser.vaiTro] || 'bg-teal-500'}`}>
              {currentUser.hoTen.charAt(currentUser.hoTen.lastIndexOf(' ') + 1)}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-white text-xs font-medium truncate">{currentUser.hoTen}</div>
              <div className="text-slate-400 text-xs truncate">{ROLE_LABELS[currentUser.vaiTro]}</div>
            </div>
            <button onClick={onLogout} className="text-slate-400 hover:text-red-400 transition-colors flex-shrink-0" title="Đăng xuất">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3.5 flex items-center justify-between flex-shrink-0">
          <div>
            <h2 className="text-gray-800 font-semibold">{PAGE_TITLES[currentView]}</h2>
            <div className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
              <span>QLThuoc Hayday</span>
              <ChevronRight className="w-3 h-3" />
              <span className="text-teal-600">{PAGE_TITLES[currentView]}</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="relative p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors">
              <Bell className="w-5 h-5" />
              {alertCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center leading-none">{alertCount}</span>
              )}
            </button>
            <div className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${ROLE_COLORS[currentUser.vaiTro] || 'bg-teal-500'}`}>
                {currentUser.hoTen.charAt(currentUser.hoTen.lastIndexOf(' ') + 1)}
              </div>
              <div className="text-sm">
                <div className="text-gray-700 font-medium leading-tight">{currentUser.hoTen}</div>
                <div className="text-gray-400 text-xs">{ROLE_LABELS[currentUser.vaiTro]}</div>
              </div>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
