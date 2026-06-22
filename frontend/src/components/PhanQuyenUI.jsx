import React, { useState } from 'react';
import { Search, Plus, Edit2, Trash2, Shield, User, Activity, AlertCircle } from 'lucide-react';

const usersData = [
  { userId: 1, tenDangNhap: 'admin', hoTen: 'Nguyễn Văn A', vaiTro: 'Quản trị viên', trangThai: true },
  { userId: 2, tenDangNhap: 'bacsi01', hoTen: 'Trần Thị B', vaiTro: 'Bác sĩ', trangThai: true },
  { userId: 3, tenDangNhap: 'duocsi01', hoTen: 'Lê Văn C', vaiTro: 'Dược sĩ', trangThai: false },
];

const roles = ['Quản trị viên', 'Bác sĩ', 'Dược sĩ'];

export default function RoleManagementUI() {
  const [users, setUsers] = useState(usersData);
  const [searchTerm, setSearchTerm] = useState('');

  const filteredUsers = users.filter((u) =>
    u.tenDangNhap.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.hoTen.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <Shield className="w-8 h-8 text-blue-600" />
          Quản Lý Tài Khoản & Phân Quyền
        </h1>
        <p className="text-gray-500 mt-2">Phân quyền và quản lý tài khoản người dùng trong hệ thống.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6">
          <div className="relative w-full sm:w-96">
            <input
              type="text"
              placeholder="Tìm kiếm tài khoản, tên..."
              className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
          </div>
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors">
            <Plus className="w-5 h-5" />
            Thêm Tài Khoản Mới
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 border-b border-gray-100">
                <th className="py-3 px-4 font-semibold">ID</th>
                <th className="py-3 px-4 font-semibold">Tên đăng nhập</th>
                <th className="py-3 px-4 font-semibold">Họ tên</th>
                <th className="py-3 px-4 font-semibold">Vai trò</th>
                <th className="py-3 px-4 font-semibold">Trạng thái</th>
                <th className="py-3 px-4 font-semibold text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((user) => (
                <tr key={user.userId} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4 text-gray-600">#{user.userId}</td>
                  <td className="py-3 px-4 font-medium text-gray-800">{user.tenDangNhap}</td>
                  <td className="py-3 px-4 text-gray-600">{user.hoTen}</td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${user.vaiTro === 'Quản trị viên' ? 'bg-purple-100 text-purple-700' :
                        user.vaiTro === 'Bác sĩ' ? 'bg-blue-100 text-blue-700' :
                        'bg-emerald-100 text-emerald-700'}`}>
                      <User className="w-3.5 h-3.5" />
                      {user.vaiTro}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium
                      ${user.trangThai ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {user.trangThai ? <Activity className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                      {user.trangThai ? 'Hoạt động' : 'Khóa'}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button className="p-1.5 text-gray-400 hover:text-blue-600 rounded-md hover:bg-blue-50 transition-colors" title="Chỉnh sửa">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button className="p-1.5 text-gray-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors" title="Xóa">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan="6" className="py-8 text-center text-gray-500">
                    Không tìm thấy tài khoản nào.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
