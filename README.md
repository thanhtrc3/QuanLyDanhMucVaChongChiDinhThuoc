# Phần mềm Quản lý Danh mục và Chống chỉ định Thuốc (Desktop & Web App)

Dự án phát triển phần mềm quản lý kho thuốc, phòng khám tập trung vào nghiệp vụ quản lý danh mục thuốc, cảnh báo tự động chống chỉ định (CCĐ) và tương tác thuốc an toàn khi kê đơn.

## 👥 Nhóm phát triển (Nhóm 9)
- **Nguyễn Thanh Hiến** - Quản lý dự án (PM), Database & Backend
- **Nguyễn Thành Đạt** - Frontend (React), Testing
- **Nguyễn Trường Duy** - UI Design, Frontend
- **Trần Mộng Bình** - BA, Frontend Dashboard

---

## 🚀 Công nghệ sử dụng (Tech Stack)
- **Frontend:** React.js, Vite (UI/UX Component based).
- **Backend:** Node.js, Express.js (RESTful APIs).
- **Database:** Microsoft SQL Server (Tích hợp Windows Authentication).
- **Desktop Wrapper:** Electron.js (Đóng gói ứng dụng web thành phần mềm Desktop đa nền tảng).

---

## ⚙️ Hướng dẫn Cài đặt & Khởi chạy (Installation)

### Bước 1: Chuẩn bị Cơ sở dữ liệu (Database)
1. Mở Microsoft SQL Server Management Studio (SSMS).
2. Tạo một Database mới với tên là `QuanLyThuoc_ChongChiDinh`.
3. *(Lưu ý: Backend sử dụng Windows Authentication để kết nối tự động, không cần nhập sa/password).*
4. Nếu máy bạn dùng tên DB khác, hãy tạo file `.env` trong thư mục `backend` và thêm dòng: `DB_NAME=Ten_Cua_Ban`.

### Bước 2: Clone dự án
```bash
git clone <link-github-của-bạn>
cd QuanLyDanhMucVaChongChiDinhThuoc
```

### Bước 3: Khởi chạy Server (Backend)
```bash
cd backend
cmd
npm install
npm start
# Server sẽ chạy tại http://localhost:5000
```

### Bước 4: Khởi chạy Giao diện (Frontend)
Mở một terminal (cmd/powershell) mới, trỏ vào thư mục `frontend`:

```bash
cd frontend
cmd
npm install
```

**Lựa chọn 1: Chạy trên trình duyệt Web (Dev mode)**
```bash
npm run dev
# Mở trình duyệt và truy cập http://localhost:5173
```

**Lựa chọn 2: Chạy thành phần mềm Desktop (Electron mode)**
```bash
npm start
# Cửa sổ phần mềm Desktop sẽ tự động hiển thị lên màn hình
```

---

## 📦 Hướng dẫn đóng gói thành file cài đặt (.exe)
Nếu bạn muốn đóng gói thành file cài đặt để gửi cho khách hàng hoặc chạy trên máy khác:
1. Đảm bảo bạn đang ở thư mục `frontend`.
2. Cài đặt công cụ đóng gói: `npm install electron-builder --save-dev`
3. Chạy lệnh: `npm run build-app`
4. File cài đặt sẽ được tạo ra trong thư mục `frontend/dist-electron`.

---

## 📚 Tính năng cốt lõi (Key Features)
1. **Xác thực và Phân quyền:**
   - Hỗ trợ 3 vai trò: Quản trị viên (Admin), Dược sĩ, Bác sĩ.
   - Các chức năng nhạy cảm (như Nhật ký hệ thống, Xóa thuốc) được bảo mật nghiêm ngặt.
2. **Quản lý Danh mục & Tồn kho:**
   - Quản lý thông tin thuốc theo chuẩn mã ATC.
   - Theo dõi tồn kho thực tế, hỗ trợ cảnh báo tồn tối thiểu.
   - Tính năng "Đổi đơn vị" tỷ lệ động, tự động tính toán lại tồn kho khi quy đổi (Viên/Vỉ/Hộp).
3. **Cảnh báo Thông minh (Alert Engine):**
   - Tự động bôi xám và khóa các loại thuốc đã quá **Hạn sử dụng**.
   - Quét thuật toán n(n-1)/2: Chặn và cảnh báo ngay lập tức nếu bác sĩ kê các cặp thuốc có Tương tác nguy hiểm.
4. **Kê đơn thuốc ngoại trú:**
   - Luồng lưu đơn thuốc chuẩn hóa: Sinh mã đơn ngẫu nhiên an toàn, tự động trừ tồn kho theo số lượng đã kê.
5. **Nhật ký Hệ thống (Audit Log):**
   - Theo dõi toàn bộ lịch sử thao tác thêm/sửa/xóa của người dùng.
   - Hỗ trợ xuất dữ liệu ra file Excel phục vụ báo cáo.
