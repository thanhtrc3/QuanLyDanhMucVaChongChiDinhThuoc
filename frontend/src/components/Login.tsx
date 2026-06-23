import { useState, useEffect } from 'react';
import { Lock, User, Eye, EyeOff, Activity, Shield, AlertCircle } from 'lucide-react';
import type { User as UserType } from '../types';
import '../styles/login.css';

interface LoginProps {
  onLogin: (user: UserType) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [requestModalOpen, setRequestModalOpen] = useState(false);
  const [reqForm, setReqForm] = useState({ hoTen: '', tenDangNhap: '', emailOrPhone: '', vaiTro: 'Bac si', lyDo: '' });
  const [reqError, setReqError] = useState('');
  const [reqSuccess, setReqSuccess] = useState('');

  const handleRequestAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setReqError(''); setReqSuccess('');
    setLoading(true);
    try {
      const res = await fetch('/api/account-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reqForm)
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      setReqSuccess(data.message || 'Gửi yêu cầu thành công!');
      setTimeout(() => setRequestModalOpen(false), 3000);
    } catch (err: any) {
      setReqError(err.message || 'Lỗi kết nối.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedUser = localStorage.getItem('savedUsername');
    if (savedUser) {
      setUsername(savedUser);
      setRememberMe(true);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    if (e) e.preventDefault();
    setError('');
    if (!username || !password) {
      setError('Vui lòng nhập tên đăng nhập và mật khẩu.');
      return;
    }
    setLoading(true);
    try {
      const response = await fetch('/api/nguoidung/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDangNhap: username, matKhau: password })
      });
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.message || 'Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.');
      }
      if (rememberMe) {
        localStorage.setItem('savedUsername', username);
      } else {
        localStorage.removeItem('savedUsername');
      }
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message || 'Lỗi kết nối đến máy chủ.');
    } finally {
      setLoading(false);
    }
  }

  async function quickLogin(tenDangNhap: string) {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/nguoidung/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tenDangNhap, matKhau: 'password123' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Đăng nhập thất bại');
      localStorage.setItem('token', data.token);
      onLogin(data.user);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-page">
      {/* Animated background orbs */}
      <div className="login-orb login-orb-1" />
      <div className="login-orb login-orb-2" />
      <div className="login-orb login-orb-3" />

      {/* Grid overlay */}
      <div className="login-grid" />

      <div className="login-card-wrapper">
        {/* Brand */}
        <div className="login-brand">
          <div className="login-logo-ring">
            <Activity size={30} color="#fff" strokeWidth={2.5} />
          </div>
          <h1 className="login-app-name">QLThuoc Hayday</h1>
          <p className="login-app-sub">Hệ thống quản lý dược phẩm &amp; chống chỉ định</p>
        </div>

        {/* Glass card */}
        <div className="login-glass-card">
          <h2>Đăng nhập hệ thống</h2>

          {error && (
            <div className="login-error-banner">
              <AlertCircle size={16} />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="login-form" autoComplete="on">
            {/* Username */}
            <div className="login-field">
              <label htmlFor="login-username">Tên đăng nhập</label>
              <div className="login-input-wrap">
                <User className="login-input-icon" size={16} />
                <input
                  id="login-username"
                  type="text"
                  className="login-input"
                  placeholder="Nhập tên đăng nhập"
                  value={username}
                  onChange={e => setUsername(e.target.value)}
                  disabled={loading}
                  autoFocus
                  autoComplete="username"
                />
              </div>
            </div>

            {/* Password */}
            <div className="login-field">
              <label htmlFor="login-password">Mật khẩu</label>
              <div className="login-input-wrap">
                <Lock className="login-input-icon" size={16} />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  className="login-input login-input-password"
                  placeholder="Nhập mật khẩu"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  disabled={loading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="login-toggle-password"
                  onClick={() => setShowPassword(v => !v)}
                  tabIndex={-1}
                  aria-label="Hiện/ẩn mật khẩu"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="login-row">
              <label className="login-remember">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={e => setRememberMe(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
              <button
                type="button"
                className="login-forgot"
                onClick={() => alert('Vui lòng liên hệ Quản trị viên IT để được cấp lại mật khẩu.')}
              >
                Quên mật khẩu?
              </button>
            </div>

            {/* Submit */}
            <button type="submit" className="login-btn" disabled={loading}>
              {loading && !requestModalOpen ? <span className="login-spinner" /> : 'Đăng nhập'}
            </button>
          </form>

          
        </div>

        {/* Footer */}
        <div className="login-footer-note">
          Chưa có tài khoản?
          <button
            type="button"
            onClick={() => setRequestModalOpen(true)}
          >
            Xin cấp tài khoản
          </button>
        </div>

        <div className="login-security-badge">
          <Shield size={12} />
          <span>Kết nối bảo mật &nbsp;·&nbsp; Mã hoá đầu cuối</span>
        </div>
      </div>

      {/* MODAL XIN CẤP TÀI KHOẢN */}
      {requestModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative animate-in fade-in zoom-in duration-200">
            <div className="bg-slate-50 border-b border-slate-100 px-6 py-4 flex items-center justify-between">
              <h3 className="text-lg font-bold text-slate-800">Xin cấp tài khoản</h3>
              <button onClick={() => setRequestModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <form onSubmit={handleRequestAccount} className="p-6 space-y-4">
              {reqError && (
                <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-100">
                  {reqError}
                </div>
              )}
              {reqSuccess && (
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-lg text-sm border border-emerald-100">
                  {reqSuccess}
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Họ và tên *</label>
                <input 
                  type="text" required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                  value={reqForm.hoTen} onChange={e => setReqForm({...reqForm, hoTen: e.target.value})}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Tên đăng nhập mong muốn *</label>
                <input 
                  type="text" required
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                  value={reqForm.tenDangNhap} onChange={e => setReqForm({...reqForm, tenDangNhap: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Email / Số điện thoại *</label>
                  <input 
                    type="text" required
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500"
                    value={reqForm.emailOrPhone} onChange={e => setReqForm({...reqForm, emailOrPhone: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Vai trò *</label>
                  <select 
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 bg-white"
                    value={reqForm.vaiTro} onChange={e => setReqForm({...reqForm, vaiTro: e.target.value})}
                  >
                    <option value="Bac si">Bác sĩ</option>
                    <option value="Duoc si">Dược sĩ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Lý do xin cấp (Tuỳ chọn)</label>
                <textarea 
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 outline-none focus:ring-2 focus:ring-teal-500 resize-none h-20"
                  value={reqForm.lyDo} onChange={e => setReqForm({...reqForm, lyDo: e.target.value})}
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-3">
                <button type="button" onClick={() => setRequestModalOpen(false)} className="px-4 py-2 text-slate-600 font-medium hover:bg-slate-100 rounded-lg">
                  Đóng
                </button>
                <button type="submit" disabled={loading} className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white font-medium rounded-lg shadow-sm disabled:opacity-70 flex items-center gap-2">
                  {loading && requestModalOpen ? <span className="login-spinner w-4 h-4 border-2"></span> : 'Gửi yêu cầu'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
