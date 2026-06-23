import { useState, useEffect } from 'react';
import { Plus, Pencil, Lock, Unlock, X, UserCog, Trash2, CheckCircle2, XCircle, Clock } from 'lucide-react';
import * as Dialog from '@radix-ui/react-dialog';
import { toast } from 'sonner';
import type { User, Role } from '../types';

interface Props {
  users: User[];
  setUsers: (u: User[]) => void;
  currentUser: User;
  addAuditLog: (table: string, action: 'Them' | 'Sua' | 'Xoa', oldVal: string, newVal: string) => void;
}

const EMPTY: Omit<User, 'id' | 'ngayTao'> = { tenDangNhap: '', hoTen: '', vaiTro: 'Bac si', trangThai: true, email: '' };

const ROLE_LABELS: Record<string, string> = { Admin: 'Quản trị viên', 'Bac si': 'Bác sĩ', 'Duoc si': 'Dược sĩ' };
const ROLE_COLORS: Record<string, string> = { Admin: 'bg-purple-100 text-purple-700', 'Bac si': 'bg-blue-100 text-blue-700', 'Duoc si': 'bg-green-100 text-green-700' };
const AVATAR_COLORS: Record<string, string> = { Admin: 'bg-purple-500', 'Bac si': 'bg-blue-500', 'Duoc si': 'bg-green-500' };

export function UserManagement({ users, setUsers, currentUser, addAuditLog }: Props) {
  const [activeTab, setActiveTab] = useState<'users' | 'requests'>('users');
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [confirmDeleteUser, setConfirmDeleteUser] = useState<User | null>(null);
  const [form, setForm] = useState<Omit<User, 'id' | 'ngayTao'>>(EMPTY);
  const [filterRole, setFilterRole] = useState('');
  
  // Account Requests State
  const [requests, setRequests] = useState<any[]>([]);
  const [loadingReqs, setLoadingReqs] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchRequests();
  }, [activeTab]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/nguoidung', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setUsers(data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequests = async () => {
    setLoadingReqs(true);
    try {
      const token = localStorage.getItem('token');
      const res = await fetch('/api/account-requests', { headers: { 'Authorization': `Bearer ${token}` } });
      const data = await res.json();
      if (res.ok) setRequests(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingReqs(false);
    }
  };

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/account-requests/${id}/approve`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success(data.message);
      fetchRequests();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi duyệt.');
    }
  };

  const handleReject = async (id: number) => {
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/account-requests/${id}/reject`, {
        method: 'PUT',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);
      toast.success('Đã từ chối yêu cầu.');
      fetchRequests();
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi từ chối.');
    }
  };

  const filtered = users.filter(u => !filterRole || u.vaiTro === filterRole);

  const openAdd = () => { setEditUser(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (u: User) => { setEditUser(u); setForm({ tenDangNhap: u.tenDangNhap, hoTen: u.hoTen, vaiTro: u.vaiTro, trangThai: u.trangThai, email: u.email }); setModalOpen(true); };

  const handleSave = async () => {
    if (!form.tenDangNhap.trim() || form.tenDangNhap.length < 4) { toast.error('Tên đăng nhập phải có ít nhất 4 ký tự.'); return; }
    if (!form.hoTen.trim()) { toast.error('Vui lòng nhập họ tên.'); return; }

    try {
      const token = localStorage.getItem('token');
      const url = editUser ? `/api/nguoidung/${editUser.id}` : '/api/nguoidung';
      const method = editUser ? 'PUT' : 'POST';
      
      const payload = editUser ? form : { ...form, matKhau: 'password123' };

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.message);

      if (editUser) {
        addAuditLog('NguoiDung', 'Sua', editUser.hoTen, form.hoTen);
        toast.success('Cập nhật thành công.');
      } else {
        addAuditLog('NguoiDung', 'Them', '', `Tạo tài khoản ${form.tenDangNhap}`);
        toast.success('Tạo tài khoản thành công. Mật khẩu mặc định: password123');
      }
      
      fetchUsers();
      setModalOpen(false);
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi lưu người dùng');
    }
  };

  const toggleLock = async (u: User) => {
    if (u.id === currentUser.id) { toast.error('Không thể khóa tài khoản của chính mình.'); return; }
    const newStatus = !u.trangThai;
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/nguoidung/${u.id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ trangThai: newStatus })
      });
      if (!res.ok) throw new Error('Lỗi cập nhật trạng thái');
      
      setUsers(users.map(x => x.id === u.id ? { ...x, trangThai: newStatus } : x));
      addAuditLog('NguoiDung', 'Sua', `${u.hoTen}: trangThai = ${u.trangThai}`, `trangThai = ${newStatus} (${newStatus ? 'Mở khóa' : 'Khóa tài khoản'})`);
      toast.success(newStatus ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.');
    } catch (err) {
      toast.error('Lỗi khi đổi trạng thái.');
    }
  };

  const handleDeleteClick = (u: User) => {
    if (u.id === currentUser.id) { toast.error('Không thể xóa tài khoản của chính mình.'); return; }
    setConfirmDeleteUser(u);
  };

  const executeDelete = async () => {
    if (!confirmDeleteUser) return;
    const u = confirmDeleteUser;
    setConfirmDeleteUser(null);
    
    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`/api/nguoidung/${u.id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Lỗi khi xóa người dùng');
      
      setUsers(users.filter(x => x.id !== u.id));
      addAuditLog('NguoiDung', 'Xoa', u.hoTen, '');
      toast.success('Đã xóa tài khoản thành công.');
    } catch (err: any) {
      toast.error(err.message || 'Lỗi khi xóa tài khoản. Tài khoản có thể đang chứa dữ liệu.');
    }
  };

  const pendingCount = requests.filter(r => r.trangThai === 'ChoDuyet').length;

  return (
    <div className="space-y-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-200">
        <button 
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors ${activeTab === 'users' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setActiveTab('users')}
        >
          Danh sách người dùng
        </button>
        <button 
          className={`py-3 px-6 text-sm font-medium border-b-2 transition-colors flex items-center gap-2 ${activeTab === 'requests' ? 'border-teal-500 text-teal-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}`}
          onClick={() => setActiveTab('requests')}
        >
          Yêu cầu cấp tài khoản
          {pendingCount > 0 && <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">{pendingCount}</span>}
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="animate-in fade-in duration-300 space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <select value={filterRole} onChange={e => setFilterRole(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                <option value="">Tất cả vai trò</option>
                <option value="Admin">Quản trị viên</option>
                <option value="Bac si">Bác sĩ</option>
                <option value="Duoc si">Dược sĩ</option>
              </select>
              <div className="flex gap-2 text-xs">
                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">{users.filter(u => u.vaiTro === 'Admin').length} Admin</span>
                <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">{users.filter(u => u.vaiTro === 'Bac si').length} Bác sĩ</span>
                <span className="bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">{users.filter(u => u.vaiTro === 'Duoc si').length} Dược sĩ</span>
              </div>
            </div>
            <button onClick={openAdd} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm">
              <Plus className="w-4 h-4" /> Thêm người dùng
            </button>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {filtered.map(u => (
              <div key={u.id} className={`bg-white rounded-xl border border-gray-200 p-4 flex items-center gap-4 ${!u.trangThai ? 'opacity-60' : ''}`}>
                <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 ${AVATAR_COLORS[u.vaiTro] || 'bg-gray-400'}`}>
                  {u.hoTen.charAt(u.hoTen.lastIndexOf(' ') + 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-800">{u.hoTen}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ROLE_COLORS[u.vaiTro]}`}>{ROLE_LABELS[u.vaiTro]}</span>
                    {!u.trangThai && <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-700 font-medium">Đã khóa</span>}
                    {u.id === currentUser.id && <span className="text-xs text-teal-600 font-medium">(Bạn)</span>}
                  </div>
                  <div className="text-sm text-gray-500 mt-0.5 flex items-center gap-3">
                    <span>@{u.tenDangNhap}</span>
                    <span>·</span>
                    <span>Tạo: {u.ngayTao ? u.ngayTao.substring(0,10) : ''}</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button onClick={() => openEdit(u)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                    <Pencil className="w-4 h-4" />
                  </button>
                  {u.id !== currentUser.id && (
                    <>
                      <button onClick={() => toggleLock(u)} className={`p-2 rounded-lg transition-colors ${u.trangThai ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`} title={u.trangThai ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                        {u.trangThai ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                      </button>
                      <button onClick={() => handleDeleteClick(u)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa tài khoản">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
            {filtered.length === 0 && <div className="text-center py-10 text-gray-400">Không có người dùng nào.</div>}
          </div>
        </div>
      )}

      {activeTab === 'requests' && (
        <div className="animate-in fade-in duration-300">
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-500 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Họ tên & Email</th>
                  <th className="px-6 py-4">Tên Đăng Nhập</th>
                  <th className="px-6 py-4">Vai trò</th>
                  <th className="px-6 py-4">Lý do / Ngày yêu cầu</th>
                  <th className="px-6 py-4">Trạng thái</th>
                  <th className="px-6 py-4 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loadingReqs ? (
                  <tr><td colSpan={6} className="text-center py-10"><span className="inline-block w-6 h-6 border-2 border-teal-500 border-t-transparent rounded-full animate-spin"></span></td></tr>
                ) : requests.length === 0 ? (
                  <tr><td colSpan={6} className="text-center py-10 text-gray-400">Chưa có yêu cầu nào.</td></tr>
                ) : requests.map(r => (
                  <tr key={r.requestID} className="hover:bg-gray-50/50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{r.hoTen}</div>
                      <div className="text-gray-500 text-xs mt-0.5">{r.emailOrPhone}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-teal-600">@{r.tenDangNhap}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs px-2 py-1 rounded-md font-medium ${ROLE_COLORS[r.vaiTro]}`}>{ROLE_LABELS[r.vaiTro]}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-gray-900 max-w-[200px] truncate" title={r.lyDo}>{r.lyDo || '-'}</div>
                      <div className="text-gray-400 text-xs mt-0.5">{r.ngayYeuCau.substring(0,10)}</div>
                    </td>
                    <td className="px-6 py-4">
                      {r.trangThai === 'ChoDuyet' && <span className="inline-flex items-center gap-1 text-orange-600 bg-orange-50 px-2 py-1 rounded-md font-medium text-xs"><Clock className="w-3 h-3"/> Chờ duyệt</span>}
                      {r.trangThai === 'DaDuyet' && <span className="inline-flex items-center gap-1 text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md font-medium text-xs"><CheckCircle2 className="w-3 h-3"/> Đã duyệt</span>}
                      {r.trangThai === 'TuChoi' && <span className="inline-flex items-center gap-1 text-red-600 bg-red-50 px-2 py-1 rounded-md font-medium text-xs"><XCircle className="w-3 h-3"/> Từ chối</span>}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {r.trangThai === 'ChoDuyet' && (
                        <div className="flex items-center justify-end gap-2">
                          <button onClick={() => handleApprove(r.requestID)} className="px-3 py-1.5 bg-emerald-50 text-emerald-600 hover:bg-emerald-600 hover:text-white rounded text-xs font-semibold transition-colors">Duyệt</button>
                          <button onClick={() => handleReject(r.requestID)} className="px-3 py-1.5 bg-red-50 text-red-600 hover:bg-red-600 hover:text-white rounded text-xs font-semibold transition-colors">Từ chối</button>
                        </div>
                      )}
                      {r.trangThai !== 'ChoDuyet' && <span className="text-xs text-gray-400">Đã xử lý</span>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50 backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-md z-50 p-6 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-lg font-semibold flex items-center gap-2 text-slate-800">
                <UserCog className="w-5 h-5 text-teal-600" />
                {editUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg text-slate-400 hover:text-slate-600 transition-colors"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input value={form.hoTen} onChange={e => setForm({ ...form, hoTen: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên đăng nhập * (ít nhất 4 ký tự)</label>
                <input value={form.tenDangNhap} onChange={e => setForm({ ...form, tenDangNhap: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 disabled:bg-slate-50 disabled:text-slate-500" disabled={!!editUser} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email / Số điện thoại</label>
                <input type="text" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Vai trò</label>
                <select value={form.vaiTro} onChange={e => setForm({ ...form, vaiTro: e.target.value as Role })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500 bg-white">
                  <option value="Admin">Quản trị viên</option>
                  <option value="Bac si">Bác sĩ</option>
                  <option value="Duoc si">Dược sĩ</option>
                </select>
              </div>
              {!editUser && (
                <div className="bg-sky-50 border border-sky-100 rounded-lg p-3 text-xs text-sky-700 leading-relaxed">
                  Mật khẩu mặc định của tài khoản sẽ là: <strong className="font-mono text-sky-900 bg-sky-100 px-1 py-0.5 rounded">password123</strong>. Người dùng bắt buộc phải đổi lại sau khi đăng nhập lần đầu.
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-slate-100">
              <Dialog.Close className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">Hủy bỏ</Dialog.Close>
              <button onClick={handleSave} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">{editUser ? 'Lưu thay đổi' : 'Tạo tài khoản'}</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>

      {/* Delete Confirmation Modal */}
      <Dialog.Root open={!!confirmDeleteUser} onOpenChange={(open) => !open && setConfirmDeleteUser(null)}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-xl w-full max-w-sm z-[60] p-6 animate-in zoom-in-95 duration-200">
            <h3 className="text-lg font-bold mb-2 text-slate-800">Xác nhận xóa tài khoản</h3>
            <p className="text-sm text-gray-600 mb-6">
              Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản của <span className="font-semibold">{confirmDeleteUser?.hoTen}</span>? 
              <br />Hành động này không thể hoàn tác.
            </p>
            <div className="flex justify-end gap-3">
              <button onClick={() => setConfirmDeleteUser(null)} className="px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors">
                Hủy bỏ
              </button>
              <button onClick={executeDelete} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg text-sm font-medium transition-colors">
                Xóa vĩnh viễn
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
