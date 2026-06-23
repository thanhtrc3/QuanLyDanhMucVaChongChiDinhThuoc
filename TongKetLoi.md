# Tổng Kết Kiểm Thử Lỗi Hệ Thống

Dựa trên quá trình kiểm tra các file docs, file database (SQL), cũng như việc chạy thử server qua 2 lần bật/tắt để phát hiện lỗi, dưới đây là tổng hợp các vấn đề và lỗi đã được phát hiện trong dự án:

## 1. Lỗi Cài Đặt (Frontend)
- **Xung đột phiên bản thư viện (`ERESOLVE`)**: Khi chạy `npm install` thông thường, NPM báo lỗi xung đột (peer dependency conflict). Cụ thể, thư viện `react-day-picker@8.10.1` yêu cầu React phiên bản `^16.8.0 || ^17.0.0 || ^18.0.0`, trong khi dự án đang sử dụng React phiên bản mới là `19.2.6`.
- **Cách khắc phục tạm thời**: Phải thêm cờ `--legacy-peer-deps` để cài đặt thành công, tuy nhiên về lâu dài cần nâng cấp hoặc đổi thư viện lịch tương thích.

## 2. Lỗi Cú Pháp và Cấu Hình (Frontend)
Phát hiện nhiều lỗi nghiêm trọng khi chạy ESLint và Vite:
- **Lỗi cú pháp (Syntax Error)**: File `NhapThongTinBenhNhan.jsx` có lỗi `Parsing error: Unexpected token .` tại dòng 103. Lỗi này có khả năng làm sập ứng dụng (Crash) khi render.
- **Lỗi Vite Config**: File `vite.config.js` báo lỗi `__dirname is not defined`. Do dự án đang chạy với `"type": "module"`, biến `__dirname` mặc định của CommonJS sẽ không khả dụng và cần được thay thế bằng import meta url.
- **Lỗi React Hooks (Performance)**: Các component `DoseWarningDialog.jsx`, `Login.jsx` và `PrescriptionWorkspace.jsx` gặp lỗi `Calling setState synchronously within an effect`. Việc gọi setState trực tiếp trong block của useEffect gây ra chuỗi render liên tục (cascading renders), làm giảm hiệu năng ứng dụng đáng kể.
- **Biến/Import rác chưa sử dụng**: Rất nhiều file có import `React` nhưng không dùng, các biến như `useState`, `loading`, `error`, `_error`, `_localID` được khai báo nhưng chưa hề được sử dụng ở nhiều component khác nhau.

## 3. Lỗi Cảnh Báo Khi Build (Frontend)
- **Chunk Size quá lớn**: Khi chạy `npm run build`, hệ thống báo cảnh báo `Some chunks are larger than 500 kB after minification`. Mã nguồn sau khi đóng gói đang hơi lớn, nên xem xét lazy load (`dynamic import()`) để giảm dung lượng file ban đầu khi tải trang.

## 4. Kiểm Thử Backend và Cơ Sở Dữ Liệu
- Qua 2 lần chạy `node server.js` thì backend chạy ổn định, không bị crash, kết nối SQL Server thành công (Cron job cảnh báo thuốc hết hạn cũng khởi chạy tốt).
- Hệ thống Unit Test backend qua lệnh `npm test` hiện tại chạy tốt nhưng mức độ phủ (coverage) khá ít (đang check cú pháp và chạy duy nhất `dosageCalculator.test.js`). 
- Script SQL tạo database chạy bình thường, cấu trúc bảng đã được khởi tạo. Các file test cases (VD: `QCD-54-manual-test-ke-don.md`) đã có nhưng đang được thực hiện kiểu thủ công. Khuyến nghị viết thêm test tự động (Automated tests) dựa trên các case này.

## Kết luận
Nhóm cần ưu tiên sửa ngay lập tức:
1. Sửa lỗi `Unexpected token .` trong `NhapThongTinBenhNhan.jsx` để tránh sập app.
2. Xử lý lại biến `__dirname` ở `vite.config.js`.
3. Sửa lại luồng gọi `setState` trong các hook `useEffect` tại `Login.jsx`, `DoseWarningDialog.jsx`, `PrescriptionWorkspace.jsx`.
4. Xem xét nâng cấp hoặc đổi thư viện tương thích với React 19 để tránh dùng `--legacy-peer-deps`.
