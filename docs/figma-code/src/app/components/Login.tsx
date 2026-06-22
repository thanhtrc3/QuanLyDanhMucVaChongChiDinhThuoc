import { useState } from 'react';
import { Pill, Lock, User, Eye, EyeOff } from 'lucide-react';
import type { User as UserType } from '../types';
import { mockUsers } from '../mockData';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = mockUsers.find(u => u.tenDangNhap === username && u.trangThai);
    if (!user) {
      setError('Tên đăng nhập không đúng hoặc tài khoản bị khóa.');
      return;
    }
    if (password !== 'password123') {
      setError('Mật khẩu không chính xác.');
      return;
    }
    onLogin(user);
  };

  const quickLogin = (role: 'Admin' | 'Bac si' | 'Duoc si') => {
    const user = mockUsers.find(u => u.vaiTro === role && u.trangThai);
    if (user) onLogin(user);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-900 via-teal-800 to-cyan-900">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-20 left-20 w-72 h-72 bg-teal-400 rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-cyan-400 rounded-full blur-3xl" />
      </div>

      <div className="relative w-full max-w-md px-4">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-white rounded-2xl shadow-xl mb-4">
            <Pill className="w-10 h-10 text-teal-600" />
          </div>
          <h1 className="text-white text-3xl font-bold">QLThuoc Hayday</h1>
          <p className="text-teal-200 text-sm mt-1">Hệ thống quản lý dược phẩm</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h2 className="text-gray-800 text-xl font-semibold mb-6 text-center">Đăng nhập hệ thống</h2>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type="text"
                  value={username}
                  onChange={e => { setUsername(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Nhập tên đăng nhập"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => { setPassword(e.target.value); setError(''); }}
                  className="w-full pl-10 pr-10 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
                  placeholder="Nhập mật khẩu"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600">
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-teal-600 hover:bg-teal-700 text-white py-2.5 rounded-lg font-medium transition-colors"
            >
              Đăng nhập
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-gray-100">
            <p className="text-center text-xs text-gray-500 mb-3">Đăng nhập nhanh (Demo)</p>
            <div className="grid grid-cols-3 gap-2">
              {[
                { role: 'Admin' as const, label: 'Admin', color: 'bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200' },
                { role: 'Bac si' as const, label: 'Bác sĩ', color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
                { role: 'Duoc si' as const, label: 'Dược sĩ', color: 'bg-green-50 text-green-700 hover:bg-green-100 border-green-200' },
              ].map(({ role, label, color }) => (
                <button key={role} onClick={() => quickLogin(role)} className={`text-xs py-2 px-3 rounded-lg border font-medium transition-colors ${color}`}>
                  {label}
                </button>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-2">Mật khẩu demo: password123</p>
          </div>
        </div>
      </div>
    </div>
  );
}
