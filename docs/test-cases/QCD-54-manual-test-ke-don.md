# QCD-54 - Manual test luồng kê đơn

## Phạm vi

Kiểm tra luồng tạo đơn thuốc từ lúc nhập bệnh nhân, tìm thuốc, nhập liều đến khi lưu toàn bộ đơn và chi tiết đơn.

## Tiền điều kiện

- Chạy migration `20260622_QCD_50_prescriptions.sql` trên SQL Server.
- Backend chạy tại `http://localhost:5000` và frontend chạy tại `http://localhost:5173`.
- Bảng `Thuoc` có ít nhất ba thuốc, gồm mã ATC `J01CA04` và `N02BE01`.
- Người dùng có vai trò `BacSi` hoặc `Admin`.

## Bộ test case

| ID | Tình huống | Dữ liệu/Bước thực hiện | Kết quả mong đợi |
| --- | --- | --- | --- |
| TC01 | Mở màn hình kê đơn | Chọn **Đơn thuốc** trên thanh điều hướng | Hiển thị phần thông tin bệnh nhân và bảng chi tiết thuốc |
| TC02 | Lưu thiếu bệnh nhân | Để trống bệnh nhân, bấm **Lưu đơn thuốc** | Hiện thông báo yêu cầu nhập tên bệnh nhân, không gọi lưu |
| TC03 | Tìm theo mã ATC | Nhập `J01` tại ô tìm thuốc | Danh sách gợi ý có thuốc mã `J01CA04` |
| TC04 | Tìm theo tên thuốc | Nhập `Para` | Danh sách gợi ý có Paracetamol |
| TC05 | Không có kết quả | Nhập chuỗi không tồn tại | Hiện `Không tìm thấy thuốc phù hợp` |
| TC06 | Chọn thuốc | Chọn một kết quả autocomplete | Mã, tên, hoạt chất và hàm lượng đúng với thuốc đã chọn |
| TC07 | Thêm dòng thuốc | Bấm nút **Thêm thuốc** hai lần | Bảng tăng thêm hai dòng, bố cục không dịch chuyển bất thường |
| TC08 | Xóa dòng thuốc | Bấm biểu tượng thùng rác ở một dòng | Dòng được xóa; bảng luôn giữ tối thiểu một dòng nhập liệu |
| TC09 | Nhập liều hợp lệ | Liều/lần `1`, lần/ngày `3`, số ngày `5`, số lượng `15` | Giá trị được chấp nhận và giữ nguyên sau khi rời ô |
| TC10 | Liều bằng 0 | Nhập liều/lần `0`, lưu đơn | API trả lỗi validation, không tạo dữ liệu đơn |
| TC11 | Số lần âm | Nhập lần/ngày `-1`, lưu đơn | Trình duyệt chặn hoặc API trả lỗi, không tạo dữ liệu |
| TC12 | Thuốc trùng | Thêm hai dòng cùng một thuốc rồi lưu | API báo thuốc bị trùng trong đơn, transaction rollback |
| TC13 | Lưu đơn hợp lệ | Nhập bệnh nhân và hai dòng thuốc hợp lệ, bấm lưu | Hiện mã đơn và số dòng đã lưu |
| TC14 | Kiểm tra phần đầu đơn | Truy vấn `DonThuoc` theo mã vừa tạo | Có đúng một bản ghi, trạng thái `Đã lưu` |
| TC15 | Kiểm tra chi tiết đơn | Truy vấn `ChiTietDonThuoc` theo `donThuocID` | Số bản ghi bằng số dòng trên UI và đúng thuốc/liều |
| TC16 | Lỗi một dòng chi tiết | Dùng `thuocID` không tồn tại trong payload | Không có phần đầu hay chi tiết nào được lưu |
| TC17 | Tải lại đơn | Gọi `GET /api/don-thuoc/:id` | Trả về phần đầu và đầy đủ mảng `chiTiet` |
| TC18 | Màn hình nhỏ | Thu cửa sổ dưới 1080px | Bảng cuộn ngang, tiêu đề và nút lưu không chồng lấn |
| TC19 | Phím Escape autocomplete | Mở danh sách gợi ý rồi nhấn Escape | Danh sách gợi ý đóng |
| TC20 | Phím Enter autocomplete | Nhập từ khóa rồi nhấn Enter | Chọn kết quả đầu tiên và đóng danh sách |

## Kiểm tra transaction trực tiếp

```sql
SELECT * FROM DonThuoc ORDER BY createdAt DESC;
SELECT * FROM ChiTietDonThuoc ORDER BY chiTietID DESC;
```

Khi một dòng chi tiết lỗi khóa ngoại hoặc validation, số bản ghi ở cả hai bảng phải không thay đổi.

## Biên bản chạy test

| Ngày chạy | Người chạy | Môi trường | Passed | Failed | Ghi chú |
| --- | --- | --- | --- | --- | --- |
|  |  |  |  |  |  |
