# Kịch bản kiểm thử (Test Case) - Quét Chống Chỉ Định (QCD-70)

## Mục tiêu
Kiểm thử tính năng tự động quét chống chỉ định khi Bác sĩ kê đơn thuốc, đảm bảo hệ thống chặn hoặc cảnh báo đúng với độ tuổi, bệnh lý nền và tình trạng của bệnh nhân.

## Điều kiện tiên quyết
- Bác sĩ đã đăng nhập thành công.
- Có sẵn dữ liệu Rule Chống chỉ định trong cơ sở dữ liệu (ví dụ: Không dùng Warfarin cho Phụ nữ có thai).

## Các Test Case

### TC01: Kiểm tra chống chỉ định độ tuổi
- **Các bước thực hiện:**
  1. Chọn bệnh nhân là trẻ em (tuổi < 12).
  2. Kê đơn một loại thuốc có Rule Chống chỉ định cho trẻ em dưới 12 tuổi (ví dụ: Codein).
  3. Nhấn [Lưu đơn thuốc].
- **Kết quả mong đợi:**
  Hệ thống chặn lại, hiển thị thông báo Đỏ "Chống chỉ định tuyệt đối: Trẻ em dưới 12 tuổi". Nút [Lưu] bị mờ (disabled).

### TC02: Kiểm tra chống chỉ định thai kỳ
- **Các bước thực hiện:**
  1. Chọn bệnh nhân nữ đang mang thai (isMangThai = 1).
  2. Kê đơn thuốc Warfarin (hoặc Isotretinoin).
  3. Nhấn [Lưu].
- **Kết quả mong đợi:**
  Hệ thống phát hiện tương tác, báo lỗi "Chống chỉ định tuyệt đối cho Phụ nữ có thai" và từ chối kê đơn.

### TC03: Kiểm tra bỏ qua cảnh báo (Override)
- **Các bước thực hiện:**
  1. Kê đơn thuốc có cảnh báo ở mức "Thận trọng".
  2. Popup cảnh báo màu Vàng xuất hiện.
  3. Nhập lý do vào ô "Lý do vượt rào" và nhấn [Tiếp tục kê đơn].
- **Kết quả mong đợi:**
  Hệ thống cho phép lưu đơn thuốc thành công và lưu lại thao tác Override này vào bảng `AuditLog` để phục vụ truy vết.
