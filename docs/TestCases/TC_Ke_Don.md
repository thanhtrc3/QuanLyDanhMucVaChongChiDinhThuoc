# Kịch bản kiểm thử (Test Case) - Luồng Kê Đơn (QCD-54)

## Mục tiêu
Kiểm thử luồng kê đơn thuốc của Bác sĩ, đảm bảo hệ thống có thể thêm thuốc vào đơn, tính toán liều lượng chính xác và không cho phép lưu nếu thiếu thông tin bắt buộc.

## Điều kiện tiên quyết
- Bác sĩ đã đăng nhập thành công.
- Bác sĩ đã chọn một bệnh nhân có sẵn trong hệ thống.

## Các Test Case

### TC01: Kiểm tra tính toán Tổng liều dùng
- **Các bước thực hiện:**
  1. Ở màn hình kê đơn, nhập tên thuốc (ví dụ: Paracetamol 500mg).
  2. Nhập `Số lượng: 2`, `Liều mỗi lần: 1`, `Số lần dùng/ngày: 3`.
- **Kết quả mong đợi:**
  Hệ thống tự động hiển thị `Tổng liều/ngày = 3` (Liều mỗi lần * Số lần dùng).

### TC02: Kiểm tra cảnh báo quá liều
- **Các bước thực hiện:**
  1. Thêm thuốc Amoxicillin 500mg.
  2. Nhập liều dùng vượt quá mức tối đa cho phép (ví dụ: Tổng liều/ngày = 6 viên).
  3. Nhấn nút [Lưu đơn thuốc].
- **Kết quả mong đợi:**
  Hệ thống hiển thị popup cảnh báo vượt liều tối đa và chặn không cho lưu đơn.

### TC03: Kiểm tra bỏ trống thông tin bắt buộc
- **Các bước thực hiện:**
  1. Không chọn Bệnh nhân hoặc không nhập chẩn đoán.
  2. Nhấn nút [Lưu đơn thuốc].
- **Kết quả mong đợi:**
  Hệ thống hiển thị lỗi yêu cầu nhập đầy đủ thông tin bắt buộc. Không lưu đơn thuốc.
