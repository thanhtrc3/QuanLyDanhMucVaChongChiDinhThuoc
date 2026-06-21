# Phần mềm Quản lý Danh mục và Chống chỉ định Thuốc (Desktop App)

Dự án phát triển phần mềm quản lý nhà thuốc/phòng khám, tập trung vào nghiệp vụ quản lý danh mục thuốc, cảnh báo chống chỉ định và tương tác thuốc. Bài tập lớn môn học.

## 👥 Nhóm phát triển (Nhóm 9)
- **Nguyễn Thanh Hiến** - Quản lý dự án (PM), Database & Backend
- **Nguyễn Thành Đạt** - Frontend (React), Testing
- **Nguyễn Trường Duy** - UI Design, Frontend
- **Trần Mộng Bình** - BA, Frontend Dashboard

## 🚀 Công nghệ sử dụng (Tech Stack)
- **Frontend:** React.js, Vite
- **Backend:** Node.js, Express.js
- **Database:** Microsoft SQL Server
- **Desktop App:** Electron.js

## ⚙️ Hướng dẫn cài đặt (Installation)

### 1. Clone dự án
```bash
git clone <link-github-của-bạn>
cd QuanLyDanhMucVaChongChiDinhThuoc
```

### 2. Khởi chạy Backend
```bash
cd backend
npm install
npm start
```

### 3. Khởi chạy Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📚 Tính năng chính (Key Features)
1. Xác thực và Phân quyền (Admin, Dược sĩ, Bác sĩ).
2. Quản lý thông tin và danh mục thuốc theo chuẩn ATC.
3. Cảnh báo tự động chống chỉ định và tương tác thuốc.
4. Kê đơn thuốc ngoại trú an toàn.
5. Hệ thống Audit Log theo dõi thao tác người dùng.
6. Quản lý tồn kho và thống kê thuốc sắp hết hạn.