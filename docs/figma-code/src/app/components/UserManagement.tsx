import { useState } from 'react';
import { Plus, Pencil, Lock, Unlock, X, UserCog, Trash2 } from 'lucide-react';
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
  const [modalOpen, setModalOpen] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [form, setForm] = useState<Omit<User, 'id' | 'ngayTao'>>(EMPTY);
  const [filterRole, setFilterRole] = useState('');

  const filtered = users.filter(u => !filterRole || u.vaiTro === filterRole);

  const openAdd = () => { setEditUser(null); setForm(EMPTY); setModalOpen(true); };
  const openEdit = (u: User) => { setEditUser(u); setForm({ tenDangNhap: u.tenDangNhap, hoTen: u.hoTen, vaiTro: u.vaiTro, trangThai: u.trangThai, email: u.email }); setModalOpen(true); };

  const handleSave = () => {
    if (!form.tenDangNhap.trim() || form.tenDangNhap.length < 4) { toast.error('Tên đăng nhập phải có ít nhất 4 ký tự.'); return; }
    if (!form.hoTen.trim()) { toast.error('Vui lòng nhập họ tên.'); return; }
    if (users.some(u => u.tenDangNhap === form.tenDangNhap && u.id !== editUser?.id)) { toast.error('Tên đăng nhập đã tồn tại.'); return; }
    if (editUser) {
      setUsers(users.map(u => u.id === editUser.id ? { ...form, id: editUser.id, ngayTao: editUser.ngayTao } : u));
      addAuditLog('NguoiDung', 'Sua', editUser.hoTen, form.hoTen);
      toast.success('Cập nhật thành công.');
    } else {
      const newId = Math.max(...users.map(u => u.id)) + 1;
      const now = new Date().toISOString().split('T')[0];
      setUsers([...users, { ...form, id: newId, ngayTao: now }]);
      addAuditLog('NguoiDung', 'Them', '', `Tạo tài khoản ${form.tenDangNhap} (${ROLE_LABELS[form.vaiTro]})`);
      toast.success('Tạo tài khoản thành công. Mật khẩu mặc định: password123');
    }
    setModalOpen(false);
  };

  const handleDelete = (u: User) => {
    if (u.id === currentUser.id) { toast.error('Không thể xóa tài khoản đang đăng nhập.'); return; }
    if (!confirm(`Xóa tài khoản "${u.hoTen}"? Hành động này không thể hoàn tác.`)) return;
    setUsers(users.filter(x => x.id !== u.id));
    addAuditLog('NguoiDung', 'Xoa', u.hoTen, '');
    toast.success('Đã xóa tài khoản.');
  };

  const toggleLock = (u: User) => {
    if (u.id === currentUser.id) { toast.error('Không thể khóa tài khoản của chính mình.'); return; }
    const newStatus = !u.trangThai;
    setUsers(users.map(x => x.id === u.id ? { ...x, trangThai: newStatus } : x));
    addAuditLog('NguoiDung', 'Sua', `${u.hoTen}: trangThai = ${u.trangThai}`, `trangThai = ${newStatus} (${newStatus ? 'Mở khóa' : 'Khóa tài khoản'})`);
    toast.success(newStatus ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.');
  };

  return (
    <div className="space-y-4">
      {/* Toolbar */}
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
        <button onClick={openAdd} className="flex items-center gap-2 bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors">
          <Plus className="w-4 h-4" /> Thêm người dùng
        </button>
      </div>

      {/* Cards */}
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
                <span>{u.email}</span>
                <span>·</span>
                <span>Tạo: {u.ngayTao}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-shrink-0">
              <button onClick={() => openEdit(u)} className="p-2 text-gray-400 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors">
                <Pencil className="w-4 h-4" />
              </button>
              {u.id !== currentUser.id && (
                <button onClick={() => toggleLock(u)} className={`p-2 rounded-lg transition-colors ${u.trangThai ? 'text-gray-400 hover:text-orange-600 hover:bg-orange-50' : 'text-gray-400 hover:text-green-600 hover:bg-green-50'}`} title={u.trangThai ? 'Khóa tài khoản' : 'Mở khóa tài khoản'}>
                  {u.trangThai ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
                </button>
              )}
              {u.id !== currentUser.id && (
                <button onClick={() => handleDelete(u)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Xóa tài khoản">
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        ))}
        {filtered.length === 0 && <div className="text-center py-10 text-gray-400">Không có người dùng nào.</div>}
      </div>

      {/* Add/Edit Modal */}
      <Dialog.Root open={modalOpen} onOpenChange={setModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/40 z-50" />
          <Dialog.Content className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl shadow-2xl w-full max-w-md z-50 p-6">
            <div className="flex items-center justify-between mb-5">
              <Dialog.Title className="text-lg font-semibold flex items-center gap-2">
                <UserCog className="w-5 h-5 text-teal-600" />
                {editUser ? 'Chỉnh sửa người dùng' : 'Thêm người dùng mới'}
              </Dialog.Title>
              <Dialog.Close className="p-2 hover:bg-gray-100 rounded-lg"><X className="w-4 h-4" /></Dialog.Close>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Họ và tên *</label>
                <input value={form.hoTen} onChange={e => setForm({ ...form, hoTen: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Tên đăng nhập * (ít nhất 4 ký tự)</label>
                <input value={form.tenDangNhap} onChange={e => setForm({ ...form, tenDangNhap: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" disabled={!!editUser} />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Vai trò</label>
                <select value={form.vaiTro} onChange={e => setForm({ ...form, vaiTro: e.target.value as Role })} className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500">
                  <option value="Admin">Quản trị viên</option>
                  <option value="Bac si">Bác sĩ</option>
                  <option value="Duoc si">Dược sĩ</option>
                </select>
              </div>
              {!editUser && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs text-blue-700">
                  Mật khẩu mặc định sẽ là: <strong>password123</strong>. Người dùng nên đổi sau khi đăng nhập.
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <Dialog.Close className="px-4 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">Hủy</Dialog.Close>
              <button onClick={handleSave} className="px-5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-sm font-medium">{editUser ? 'Cập nhật' : 'Tạo tài khoản'}</button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
