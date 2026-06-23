# Kịch bản Kiểm thử Hệ thống (System Test) & UAT

Tài liệu này bao gồm danh sách tối thiểu 20 Test Case để bao phủ các luồng nghiệp vụ chính của phần mềm Quản lý Danh mục và Chống chỉ định Thuốc.

## 1. Module Xác thực & Phân quyền (Authentication & Authorization)
| ID | Tên Test Case (Mô tả) | Các bước thực hiện | Kết quả mong đợi | Loại Test |
|---|---|---|---|---|
| TC-01 | Đăng nhập thành công với tài khoản Admin | 1. Nhập ID `admin`, Pass `123456`<br>2. Nhấn "Đăng nhập" | Chuyển hướng đến Dashboard. Hiển thị đủ chức năng quản trị. | System Test |
| TC-02 | Đăng nhập thành công với tài khoản Bác sĩ | 1. Nhập ID `bacsi`, Pass `123456`<br>2. Nhấn "Đăng nhập" | Chuyển hướng đến Giao diện kê đơn. Bị ẩn chức năng Quản lý người dùng. | System Test |
| TC-03 | Đăng nhập sai mật khẩu | 1. Nhập ID `admin`, Pass `sai123`<br>2. Nhấn "Đăng nhập" | Hiển thị thông báo lỗi "Tên đăng nhập hoặc mật khẩu không đúng". Không cho đăng nhập. | System Test |
| TC-04 | Đăng nhập để trống trường thông tin | 1. Để trống ID hoặc Pass<br>2. Nhấn "Đăng nhập" | Hiển thị cảnh báo yêu cầu nhập đầy đủ thông tin. | System Test |
| TC-05 | Phân quyền truy cập bằng URL | 1. Đăng nhập bằng `bacsi`<br>2. Sửa URL trên trình duyệt để truy cập trang `/admin/users` | Hệ thống chặn và báo lỗi "Không có quyền truy cập" hoặc chuyển về trang chủ. | Security / System Test |

## 2. Module Quản lý Danh mục & Tồn kho (Medicine Inventory)
| ID | Tên Test Case (Mô tả) | Các bước thực hiện | Kết quả mong đợi | Loại Test |
|---|---|---|---|---|
| TC-06 | Thêm mới một loại thuốc hợp lệ | 1. Điền đủ thông tin (Tên, Mã ATC, Đơn vị, Số lượng...)<br>2. Nhấn "Lưu" | Thuốc được thêm vào danh sách, thông báo "Thêm thuốc thành công". | System Test |
| TC-07 | Thêm mới thuốc trùng mã ATC đã tồn tại | 1. Nhập mã ATC của thuốc đã có trong DB<br>2. Nhấn "Lưu" | Hiển thị lỗi "Mã ATC đã tồn tại". Không cho phép lưu. | System Test |
| TC-08 | Cảnh báo khi thêm thuốc đã hết hạn | 1. Chọn Hạn sử dụng là ngày trong quá khứ<br>2. Nhấn "Lưu" | Hệ thống cảnh báo hoặc bôi đỏ ngày hết hạn, tùy thuộc nghiệp vụ cho phép lưu hay không. | System Test |
| TC-09 | Cập nhật số lượng tồn kho (Nhập thêm thuốc) | 1. Mở form sửa thuốc<br>2. Tăng số lượng tồn<br>3. Nhấn "Lưu" | Số lượng tồn kho được cập nhật chính xác. | System Test |
| TC-10 | Xóa thuốc đang có tồn kho > 0 | 1. Chọn thuốc có số lượng > 0<br>2. Nhấn "Xóa" | Hệ thống chặn việc xóa (hoặc cảnh báo yêu cầu xác nhận đặc biệt). | System Test |
| TC-11 | Tính toán lại tồn kho khi đổi đơn vị (Quy đổi tỷ lệ) | 1. Thuốc đang ở đơn vị "Hộp" (1 hộp = 10 vỉ)<br>2. Quy đổi sang "Vỉ" | Số lượng tồn kho tự động nhân với tỷ lệ quy đổi tương ứng (x10). | UAT |

## 3. Module Cảnh báo Thông minh (Alert Engine)
| ID | Tên Test Case (Mô tả) | Các bước thực hiện | Kết quả mong đợi | Loại Test |
|---|---|---|---|---|
| TC-12 | Cảnh báo Thuốc hết hạn trên danh sách | 1. Truy cập danh sách Thuốc | Các thuốc đã quá hạn sử dụng bị bôi xám/đỏ và khóa (không cho kê đơn). | System Test |
| TC-13 | Cảnh báo tồn kho tối thiểu | 1. Truy cập trang Dashboard hoặc Danh sách thuốc | Các thuốc có số lượng tồn < ngưỡng tối thiểu sẽ hiển thị icon cảnh báo (Warning). | UAT |
| TC-14 | Cảnh báo Tương tác thuốc (Thuật toán n(n-1)/2) - Có tương tác | 1. Màn hình Kê đơn, chọn Thuốc A.<br>2. Chọn tiếp Thuốc B (biết A và B kỵ nhau). | Ngay khi chọn Thuốc B, popup cảnh báo tương tác bật lên, hiển thị mức độ nguy hiểm. | System Test |
| TC-15 | Cảnh báo Tương tác thuốc - Không tương tác | 1. Màn hình Kê đơn, chọn Thuốc A.<br>2. Chọn tiếp Thuốc C (an toàn với A). | Thuốc C được thêm vào đơn bình thường, không có cảnh báo. | System Test |
| TC-16 | Chặn Kê đơn nếu chọn "Bỏ qua cảnh báo Mức độ Nghiêm trọng" (Tùy nghiệp vụ) | 1. Gặp cảnh báo tương tác "Nghiêm trọng"<br>2. Cố tình nhấn "Lưu đơn thuốc" | Hệ thống không cho phép lưu, bắt buộc phải thay đổi thuốc. | System Test |

## 4. Module Kê Đơn Thuốc Ngoại Trú (Prescription)
| ID | Tên Test Case (Mô tả) | Các bước thực hiện | Kết quả mong đợi | Loại Test |
|---|---|---|---|---|
| TC-17 | Tạo đơn thuốc thành công | 1. Nhập thông tin BN.<br>2. Thêm thuốc (hợp lệ, đủ tồn kho).<br>3. Nhấn "Lưu đơn" | Đơn thuốc được tạo, sinh Mã đơn ngẫu nhiên an toàn. | System Test |
| TC-18 | Kê số lượng thuốc vượt quá tồn kho | 1. Thêm thuốc vào đơn<br>2. Nhập số lượng kê > số lượng tồn kho | Hệ thống báo lỗi "Không đủ số lượng trong kho". | System Test |
| TC-19 | Trừ tồn kho tự động sau khi tạo đơn | 1. Lưu đơn thuốc thành công<br>2. Kiểm tra lại danh mục thuốc | Tồn kho của các thuốc trong đơn đã bị trừ đi chính xác bằng số lượng đã kê. | UAT |
| TC-20 | In đơn thuốc | 1. Xem chi tiết đơn thuốc đã lưu<br>2. Nhấn "In đơn" | Hiển thị giao diện hoặc tạo file PDF đơn thuốc theo chuẩn Form mẫu. | UAT |

## 5. Module Nhật ký & Báo cáo (Audit Log & Reports)
| ID | Tên Test Case (Mô tả) | Các bước thực hiện | Kết quả mong đợi | Loại Test |
|---|---|---|---|---|
| TC-21 | Ghi nhận Audit Log khi Xóa thuốc | 1. Admin xóa 1 loại thuốc<br>2. Vào xem Nhật ký hệ thống | Có bản ghi: Admin vừa thực hiện hành động "Xóa" thuốc [Tên thuốc] vào [Thời gian]. | System Test |
| TC-22 | Xuất file Excel danh mục thuốc | 1. Mở Danh mục thuốc<br>2. Nhấn "Xuất Excel" | File Excel được tải xuống chứa đầy đủ thông tin y hệt như trên lưới dữ liệu (Grid). | UAT |
