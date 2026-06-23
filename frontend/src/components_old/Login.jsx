import { useState } from 'react';
import { Lock, User, Eye, EyeOff, Activity } from 'lucide-react';

export default function Login({ onLogin }) {
  const [username, setUsername] = useState(() => localStorage.getItem('savedUsername') || '');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => !!localStorage.getItem('savedUsername'));

  async function handleSubmit(e) {
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

      onLogin(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleForgotPassword() {
    alert("Hệ thống bảo mật nội bộ không hỗ trợ tự cấp lại mật khẩu qua Email.\n\nVui lòng liên hệ Quản trị viên IT của Phòng khám/Bệnh viện để được reset mật khẩu.");
  }

  return (
    <div className="login-container">
      {/* Mesh Gradient Background Elements */}
      <div className="blob blob-1"></div>
      <div className="blob blob-2"></div>
      
      <div className="login-wrapper">
        <div className="brand-header slide-down">
          <div className="brand-icon-wrapper">
            <Activity size={32} className="brand-icon" />
          </div>
          <h1 className="login-title">QLThuoc Hayday</h1>
          <p className="login-subtitle">Hệ thống quản lý dược phẩm & chống chỉ định</p>
        </div>

        <div className="login-card glass-panel pop-in">
          <h2 className="card-title">Đăng nhập hệ thống</h2>
          
          {error && <div className="login-error slide-in">{error}</div>}
          
          <form onSubmit={handleSubmit} className="login-form">
            <div className="form-group">
              <label>Tên đăng nhập</label>
              <div className="input-group">
                <User className="input-icon" size={18} />
                <input 
                  type="text" 
                  placeholder="Nhập tên đăng nhập" 
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  disabled={loading}
                  autoFocus
                />
              </div>
            </div>

            <div className="form-group">
              <label>Mật khẩu</label>
              <div className="input-group">
                <Lock className="input-icon" size={18} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  placeholder="Nhập mật khẩu" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
                <button 
                  type="button" 
                  className="password-toggle"
                  onClick={() => setShowPassword(!showPassword)}
                  tabIndex="-1"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="login-options">
              <label className="remember-me">
                <input 
                  type="checkbox" 
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span>Ghi nhớ tài khoản</span>
              </label>
              <button type="button" className="forgot-password" onClick={handleForgotPassword}>
                Quên mật khẩu?
              </button>
            </div>

            <button type="submit" className={`primary-button login-submit ${loading ? 'loading' : ''}`} disabled={loading}>
              {loading ? (
                <span className="spinner"></span>
              ) : (
                'Đăng nhập'
              )}
            </button>
          </form>


        </div>

        <div className="login-footer slide-up">
          <p>Chưa có tài khoản? <button type="button" onClick={() => alert("Đây là phần mềm quản lý nội bộ.\n\nVui lòng liên hệ Quản trị viên hệ thống để yêu cầu cấp phát tài khoản.")}>Liên hệ Quản trị viên</button></p>
        </div>
      </div>
    </div>
  );
}
