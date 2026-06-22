import React, { useState } from 'react';
import { User, Calendar, Weight, Activity, Save, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function NhapThongTinBenhNhan() {
  const [formData, setFormData] = useState({
    hoTen: '',
    ngaySinh: '',
    canNang: '',
    tienSuBenh: '',
    isMangThai: false
  });

  const [errors, setErrors] = useState({});
  const [isSuccess, setIsSuccess] = useState(false);
  const [tuoiHienTai, setTuoiHienTai] = useState(null);

  // Xử lý thay đổi input
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Tính tuổi trực tiếp khi chọn ngày sinh
    if (name === 'ngaySinh' && value) {
      const birthDate = new Date(value);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      setTuoiHienTai(age);
    } else if (name === 'ngaySinh' && !value) {
      setTuoiHienTai(null);
    }

    // Clear lỗi khi người dùng bắt đầu nhập lại
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
  };

  // Hàm Validation
  const validate = () => {
    const newErrors = {};
    const today = new Date();
    
    // Validate Họ tên
    if (!formData.hoTen.trim()) {
      newErrors.hoTen = 'Họ tên không được để trống';
    } else if (formData.hoTen.length < 2) {
      newErrors.hoTen = 'Họ tên phải có ít nhất 2 ký tự';
    }

    // Validate Ngày sinh
    if (!formData.ngaySinh) {
      newErrors.ngaySinh = 'Vui lòng chọn ngày sinh';
    } else {
      const birthDate = new Date(formData.ngaySinh);
      if (birthDate > today) {
        newErrors.ngaySinh = 'Ngày sinh không thể lớn hơn ngày hiện tại';
      } else if (tuoiHienTai !== null && tuoiHienTai > 150) {
        newErrors.ngaySinh = 'Tuổi bệnh nhân không hợp lệ (vượt quá 150 tuổi)';
      }
    }

    // Validate Cân nặng
    if (!formData.canNang) {
      newErrors.canNang = 'Vui lòng nhập cân nặng';
    } else if (parseFloat(formData.canNang) <= 0 || parseFloat(formData.canNang) > 300) {
      newErrors.canNang = 'Cân nặng phải lớn hơn 0 và hợp lý (<= 300kg)';
    }

    // Validate Tiền sử bệnh
    if (formData.tienSuBenh.trim().length > 0 && formData.tienSuBenh.trim().length < 10) {
      newErrors.tienSuBenh = 'Tiền sử bệnh lý nếu có nhập thì phải mô tả chi tiết (tối thiểu 10 ký tự)';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Xử lý Lưu thông tin
  const handleSubmit = (e) => {
    e.preventDefault();
    setIsSuccess(false);

    if (validate()) {
      // Tính tuổi (Mô phỏng hàm tinhTuoi() trong class diagram)
      const birthDate = new Date(formData.ngaySinh);
      const today = new Date();
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }

      console.log('Dữ liệu hợp lệ, Chuẩn bị lưu DB:', {
        ...formData,
        tuoi: age,
      console.log('Dữ liệu hợp lệ, Chuẩn bị lưu DB:', {
        ...formData,
        tuoi: tuoiHienTai,
        canNang: parseFloat(formData.canNang)
      });
      
      // Giả lập call API lưu dữ liệu thành công
      setTimeout(() => {
        setIsSuccess(true);
        // Reset form sau khi lưu thành công nếu cần
        // setFormData({ hoTen: '', ngaySinh: '', canNang: '', tienSuBenh: '', isMangThai: false });
      }, 500);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 flex items-center gap-2">
          <User className="w-8 h-8 text-blue-600" />
          Tiếp Nhận Bệnh Nhân
        </h1>
        <p className="text-gray-500 mt-2">Nhập, kiểm tra và lưu thông tin cá nhân & tiền sử bệnh lý.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
        {isSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 text-green-700 rounded-lg flex items-center gap-3">
            <CheckCircle2 className="w-6 h-6 text-green-500" />
            <div>
              <p className="font-semibold">Lưu thông tin thành công!</p>
              <p className="text-sm">Hồ sơ bệnh nhân đã được tạo trong hệ thống.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Họ tên */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700">Họ và tên bệnh nhân <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="text"
                  name="hoTen"
                  value={formData.hoTen}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 outline-none transition-all ${errors.hoTen ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'}`}
                  placeholder="VD: Nguyễn Văn A"
                />
                <User className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
              {errors.hoTen && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.hoTen}</p>}
            </div>

            {/* Ngày sinh */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Ngày sinh <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="date"
                  name="ngaySinh"
                  value={formData.ngaySinh}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 outline-none transition-all ${errors.ngaySinh ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'}`}
                />
                <Calendar className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
              {tuoiHienTai !== null && !errors.ngaySinh && (
                <p className="text-sm text-green-600 mt-1 font-medium">Đã tính tuổi: {tuoiHienTai} tuổi</p>
              )}
              {errors.ngaySinh && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.ngaySinh}</p>}
            </div>

            {/* Cân nặng */}
            <div className="space-y-2">
              <label className="text-sm font-semibold text-gray-700">Cân nặng (kg) <span className="text-red-500">*</span></label>
              <div className="relative">
                <input
                  type="number"
                  step="0.1"
                  name="canNang"
                  value={formData.canNang}
                  onChange={handleChange}
                  className={`w-full pl-10 pr-4 py-2.5 border rounded-lg focus:ring-2 outline-none transition-all ${errors.canNang ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'}`}
                  placeholder="VD: 60.5"
                />
                <Weight className="w-5 h-5 text-gray-400 absolute left-3 top-3" />
              </div>
              {errors.canNang && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.canNang}</p>}
            </div>

            {/* Tình trạng mang thai */}
            <div className="space-y-2 md:col-span-2 pt-2">
              <label className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                <input
                  type="checkbox"
                  name="isMangThai"
                  checked={formData.isMangThai}
                  onChange={handleChange}
                  className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500"
                />
                <span className="text-gray-700 font-medium">Bệnh nhân đang mang thai (Phục vụ cảnh báo Chống chỉ định)</span>
              </label>
            </div>

            {/* Tiền sử bệnh lý */}
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <Activity className="w-4 h-4 text-gray-500" />
                Tiền sử bệnh lý & Dị ứng thuốc
              </label>
              <textarea
                name="tienSuBenh"
                value={formData.tienSuBenh}
                onChange={handleChange}
                rows="4"
                className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none transition-all"
                placeholder="Nhập các bệnh lý nền, dị ứng (nếu có)..."
              ></textarea>
              <p className="text-xs text-gray-500">Thông tin này rất quan trọng để hệ thống Quét chống chỉ định tự động (CCD).</p>
                className={`w-full p-3 border rounded-lg focus:ring-2 outline-none transition-all ${errors.tienSuBenh ? 'border-red-300 focus:ring-red-200' : 'border-gray-200 focus:ring-blue-100 focus:border-blue-500'}`}
                placeholder="Nhập các bệnh lý nền, dị ứng (nếu có)..."
              ></textarea>
              {errors.tienSuBenh ? (
                <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3 h-3"/>{errors.tienSuBenh}</p>
              ) : (
                <p className="text-xs text-gray-500">Thông tin này rất quan trọng để hệ thống Quét chống chỉ định tự động (CCD).</p>
              )}
            </div>
          </div>

          <div className="pt-6 border-t border-gray-100 flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setFormData({ hoTen: '', ngaySinh: '', canNang: '', tienSuBenh: '', isMangThai: false })}
              onClick={() => {
                setFormData({ hoTen: '', ngaySinh: '', canNang: '', tienSuBenh: '', isMangThai: false });
                setTuoiHienTai(null);
                setErrors({});
              }}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Làm mới
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <Save className="w-5 h-5" />
              Lưu Thông Tin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
