import React from 'react';

// Giả lập lấy thông tin user đang đăng nhập (trong thực tế sẽ lấy từ Context/Redux/LocalStorage)
const useAuth = () => {
  return {
    user: {
      userId: 1,
      tenDangNhap: 'admin',
      vaiTro: 'Quản trị viên', // Các vai trò: 'Quản trị viên', 'Bác sĩ', 'Dược sĩ'
      trangThai: true
    },
    isAuthenticated: true
  };
};

// Component Wrapper phân quyền
export const ProtectedRoute = ({ allowedRoles, children }) => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return (
      <div className="p-6 bg-red-50 text-red-600 border border-red-200 rounded-lg text-center">
        Bạn cần đăng nhập để truy cập trang này.
      </div>
    );
  }

  if (allowedRoles && !allowedRoles.includes(user.vaiTro)) {
    return (
      <div className="p-8 max-w-2xl mx-auto mt-10 bg-white shadow-sm border border-gray-200 rounded-xl text-center">
        <div className="w-16 h-16 bg-red-100 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Truy cập bị từ chối</h2>
        <p className="text-gray-600">
          Tài khoản của bạn ({user.vaiTro}) không có quyền truy cập vào chức năng này. 
          Cần quyền: {allowedRoles.join(', ')}
        </p>
      </div>
    );
  }

  return <>{children}</>;
};

// Ví dụ Cách sử dụng Phân quyền trong Menu/Component
export function AuthorizationExample() {
  const { user } = useAuth();

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold border-b pb-2">Ví dụ Phân Quyền Thao Tác</h1>
      <p className="text-gray-600 mb-4">Bạn đang đăng nhập với vai trò: <strong className="text-blue-600">{user.vaiTro}</strong></p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Vùng chỉ Quản trị viên thấy */}
        <ProtectedRoute allowedRoles={['Quản trị viên']}>
          <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2">Khu vực Quản trị viên</h3>
            <button className="bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700">
              Quản lý Danh mục & Tài khoản
            </button>
          </div>
        </ProtectedRoute>

        {/* Vùng Bác sĩ và Quản trị viên thấy */}
        <ProtectedRoute allowedRoles={['Quản trị viên', 'Bác sĩ']}>
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">Khu vực Kê đơn thuốc</h3>
            <button className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
              Kê đơn & Cảnh báo tương tác
            </button>
          </div>
        </ProtectedRoute>

        {/* Vùng Dược sĩ và Quản trị viên thấy */}
        <ProtectedRoute allowedRoles={['Quản trị viên', 'Dược sĩ']}>
          <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
            <h3 className="font-semibold text-emerald-800 mb-2">Khu vực Quản lý Thuốc</h3>
            <button className="bg-emerald-600 text-white px-4 py-2 rounded hover:bg-emerald-700">
              Quản lý Kho & Danh mục Thuốc
            </button>
          </div>
        </ProtectedRoute>
      </div>
    </div>
  );
}
