# GLOSSARY - THUẬT NGỮ
## Hệ thống Quản lý Bán Căn Hộ Dự Án - Winland

**Document ID:** GL-WINLAND-001  
**Version:** 1.0  
**Date:** January 2025

---

## A

**Admin**  
Người quản lý hệ thống, có quyền duyệt booking, cọc, payment requests, và quản lý dự án/căn hộ.

**Approval (Duyệt)**  
Quá trình Admin xem xét và chấp nhận một phiếu (booking, deposit, payment request).

**Audit Log**  
Nhật ký ghi lại tất cả các thay đổi quan trọng trong hệ thống: ai làm gì, khi nào, giá trị cũ/mới.

**AVAILABLE**  
Trạng thái căn hộ còn trống, có thể bán.

---

## B

**Booking (Phiếu đặt chỗ)**  
Phiếu đặt chỗ chính thức với khoản thanh toán ban đầu (10 triệu VNĐ). Sau khi CTV tạo phiếu, Admin sẽ xem xét và duyệt. Mỗi căn hộ tại một thời điểm chỉ có thể có một phiếu đặt chỗ của một CTV.

**Building (Tòa nhà/Block)**  
Một tòa nhà trong dự án, thường được đánh số hoặc đặt tên, ví dụ: Tòa A1, Tòa B2, Tòa Sunrise.

---

## C

**Commission (Hoa hồng)**  
Khoản tiền thù lao mà CTV nhận được khi bán thành công một căn hộ cho khách hàng. Hệ thống tự động tính dựa trên giá căn và tỷ lệ hoa hồng đã thỏa thuận.

**Commission Rate (Tỷ lệ hoa hồng)**  
Phần trăm hoa hồng được áp dụng, có thể thiết lập riêng cho từng căn hộ hoặc cho toàn bộ dự án. Tỷ lệ mặc định là 2% nếu không có thiết lập riêng.

**CTV (Cộng tác viên)**  
Nhân viên bán hàng hợp tác với công ty, có trách nhiệm tìm kiếm khách hàng, tư vấn và bán căn hộ. CTV nhận hoa hồng khi chốt được deal thành công.

**Calculation Base (Cơ sở tính hoa hồng)**  
Giá trị được dùng làm cơ sở để tính hoa hồng: 
- **Giá thực tế (final_price):** Giá sau khi đã chiết khấu, thương lượng (ưu tiên sử dụng)
- **Giá niêm yết (list_price):** Giá công bố ban đầu của căn hộ

---

## D

**Deposit (Đặt cọc)**  
Phiếu đặt cọc chính thức với số tiền tối thiểu 5% giá trị căn hộ. Sau khi CTV tạo phiếu, Admin sẽ duyệt. Khi được duyệt, hệ thống tự động tạo lịch thanh toán trả góp gồm 4 đợt cho khách hàng.

**DEPOSITED (Đã đặt cọc)**  
Tình trạng căn hộ đã có khách hàng đặt cọc và đang trong quá trình thanh toán các đợt còn lại theo lịch trả góp.

**Due Date (Ngày đến hạn)**  
Ngày cuối cùng khách hàng phải thanh toán cho một đợt trong lịch trả góp. Sau ngày này, đợt thanh toán được coi là quá hạn.

---

## E

**Expiry (Hết hạn)**  
Phiếu giữ chỗ hoặc đặt chỗ tự động hết hạn sau một khoảng thời gian nhất định (có thể cấu hình). Khi hết hạn, phiếu không còn hiệu lực và căn hộ được giải phóng để bán cho khách hàng khác.

---

## F

**Floor (Tầng)**  
Một tầng trong tòa nhà, được đánh số từ dưới lên trên, ví dụ: Tầng 8, Tầng 9, Tầng cao nhất.

**Final Price (Giá thực tế chốt deal)**  
Giá bán cuối cùng sau khi đã thương lượng, chiết khấu với khách hàng. Đây là giá trị thực tế mà khách hàng phải trả và thường được dùng làm cơ sở tính hoa hồng cho CTV.

---

## G

**Giữ chỗ (Reservation)**  
Việc CTV đăng ký quan tâm một căn hộ khi dự án chưa mở bán chính thức. Đây là cam kết nhẹ, không yêu cầu thanh toán, và nhiều CTV có thể cùng giữ chỗ một căn. Khi dự án mở bán, các CTV sẽ được xếp hàng theo thứ tự ưu tiên.

---

## H

**Hoa hồng**  
Xem **Commission (Hoa hồng)**.

---

## L

**List Price (Giá niêm yết)**  
Giá công bố chính thức của căn hộ, thường là giá ban đầu trước khi có bất kỳ chiết khấu hay thương lượng nào. Có thể được dùng làm cơ sở tính hoa hồng nếu không có giá thực tế (final price).

---

## M

**MISSED (Bỏ lỡ cơ hội)**  
Tình trạng phiếu giữ chỗ khi CTV đến lượt được ưu tiên đặt cọc nhưng không thực hiện trong thời hạn quy định, dẫn đến mất quyền ưu tiên cho căn hộ đó.

---

## O

**OPEN (Đang mở bán)**  
Giai đoạn dự án chính thức mở bán cho khách hàng. Khi dự án chuyển từ "Sắp mở bán" sang "Đang mở bán", hệ thống tự động xử lý hàng đợi giữ chỗ và thông báo cho các CTV theo thứ tự ưu tiên.

**OTP (Mã xác thực)**  
Mã số 6 chữ số được gửi qua tin nhắn SMS để xác minh danh tính CTV. Mã này có hiệu lực trong 5 phút, được dùng khi CTV đăng ký tài khoản hoặc đăng nhập vào hệ thống.

**OVERDUE (Quá hạn thanh toán)**  
Tình trạng một đợt thanh toán trong lịch trả góp đã vượt quá ngày đến hạn nhưng khách hàng chưa thanh toán hoặc chưa có giao dịch được xác nhận.

---

## P

**Payment Schedule (Lịch trả góp)**  
Kế hoạch thanh toán được chia thành 4 đợt, tự động tạo khi phiếu đặt cọc được Admin duyệt:
- **Đợt 1 (Cọc):** 5% giá căn - Thanh toán ngay khi đặt cọc
- **Đợt 2:** 30% giá căn - Thanh toán sau 30 ngày
- **Đợt 3:** 30% giá căn - Thanh toán sau 60 ngày
- **Đợt 4 (Bàn giao):** 35% giá căn - Thanh toán khi nhận bàn giao căn

**Payment Request (Yêu cầu rút hoa hồng)**  
Đơn yêu cầu của CTV để rút số tiền hoa hồng đã tích lũy. CTV cần điền thông tin tài khoản ngân hàng, sau đó Admin sẽ duyệt và thực hiện chuyển khoản.

**PENDING (Chờ xử lý)**  
Tình trạng một phiếu, giao dịch, hoặc yêu cầu đang chờ được Admin xem xét, duyệt, xác nhận hoặc xử lý.

**Priority (Thứ tự ưu tiên)**  
Vị trí của CTV trong hàng đợi giữ chỗ cho một căn hộ. CTV đầu tiên (ưu tiên số 1) sẽ được ưu tiên khi dự án chuyển sang giai đoạn mở bán.

**Project (Dự án)**  
Một dự án phát triển bất động sản, bao gồm nhiều tòa nhà (buildings) và hàng trăm đến hàng ngàn căn hộ (units).

**Project Status (Giai đoạn dự án)**  
- **UPCOMING (Sắp mở bán):** Dự án chưa chính thức mở bán, chỉ nhận giữ chỗ
- **OPEN (Đang mở bán):** Dự án đã mở bán chính thức, khách hàng có thể đặt cọc
- **CLOSED (Đã đóng bán):** Dự án đã kết thúc giai đoạn bán hàng

---

## Q

**Queue (Hàng đợi)**  
Danh sách các CTV đã giữ chỗ cho cùng một căn hộ, được sắp xếp theo thứ tự thời gian đăng ký. CTV đăng ký đầu tiên sẽ được ưu tiên khi dự án chuyển sang giai đoạn mở bán.

---

## R

**Reservation (Giữ chỗ)**  
Việc CTV đăng ký quan tâm một căn hộ khi dự án chưa mở bán. Đây là cam kết nhẹ, không ràng buộc, và nhiều CTV có thể cùng giữ chỗ một căn. Xem thêm **Giữ chỗ**.

**RESERVED_BOOKING (Đã có người đặt chỗ)**  
Tình trạng căn hộ đã có khách hàng đặt chỗ với khoản thanh toán ban đầu (booking). Căn hộ có thể được nâng cấp lên đặt cọc hoặc sẽ hết hạn nếu không được xử lý.

**Rate (Tỷ lệ hoa hồng)**  
Xem **Commission Rate**.

---

## S

**Soft Delete (Xóa mềm)**  
Cơ chế xóa dữ liệu mà không thực sự xóa khỏi hệ thống, chỉ đánh dấu là đã xóa. Dữ liệu vẫn được lưu giữ và có thể khôi phục lại nếu cần thiết, đảm bảo an toàn dữ liệu và khả năng kiểm tra lịch sử.

**SOLD (Đã bán)**  
Tình trạng căn hộ đã được bán thành công cho khách hàng. Khi căn hộ chuyển sang trạng thái "Đã bán", hệ thống tự động tính và ghi nhận hoa hồng cho CTV phụ trách.

**Status (Trạng thái)**  
Tình trạng hiện tại của một phiếu, căn hộ, hoặc giao dịch trong hệ thống, ví dụ: Chờ duyệt, Đã duyệt, Đã bán, Quá hạn, v.v.

**SUPER_ADMIN (Quản trị viên tối cao)**  
Người có quyền quản lý cao nhất trong hệ thống, có thể truy cập và điều chỉnh tất cả các chức năng, bao gồm cả việc cấu hình các thông số hệ thống và quản lý người dùng.

---

## T

**Transaction (Giao dịch thanh toán)**  
Một khoản thanh toán của khách hàng được CTV ghi nhận vào hệ thống và sau đó được Admin kiểm tra, xác nhận. Giao dịch này được gắn với một đợt cụ thể trong lịch trả góp của khách hàng.

**totalDeals (Tổng số giao dịch)**  
Tổng số giao dịch bán căn hộ thành công mà một CTV đã thực hiện. Số liệu này tự động cập nhật mỗi khi phiếu đặt cọc của CTV được Admin xác nhận.

---

## U

**Unit (Căn hộ)**  
Một căn hộ cụ thể trong dự án, được định danh bằng mã số riêng, ví dụ: A1-08-05 (Tòa A1, Tầng 8, Căn 05).

**Unit Code (Mã căn hộ)**  
Mã số định danh duy nhất cho mỗi căn hộ, được cấu tạo theo định dạng: `{Mã Tòa}-{Số Tầng}-{Số Căn}`, ví dụ: A1-08-05.

**Unit Status (Tình trạng căn hộ)**  
- **AVAILABLE (Còn trống):** Căn hộ chưa có người đặt hoặc mua
- **RESERVED_BOOKING (Đã có người đặt chỗ):** Đã có khách hàng đặt chỗ với khoản thanh toán ban đầu
- **DEPOSITED (Đã đặt cọc):** Đã có khách hàng đặt cọc và đang trong quá trình thanh toán
- **SOLD (Đã bán):** Đã bán thành công cho khách hàng

**Unit Type (Loại căn hộ)**  
Phân loại căn hộ theo diện tích và số phòng, ví dụ: Studio (chưa ngăn phòng), 1PN (1 phòng ngủ), 2PN (2 phòng ngủ), 3PN (3 phòng ngủ), Penthouse (căn hộ trên cùng), v.v.

**UPCOMING (Sắp mở bán)**  
Giai đoạn dự án chưa chính thức mở bán, chỉ nhận đăng ký giữ chỗ từ CTV. Chỉ các dự án ở giai đoạn này mới cho phép CTV thực hiện giữ chỗ cho khách hàng.

---

## Y

**YOUR_TURN (Đến lượt bạn)**  
Tình trạng phiếu giữ chỗ khi đã đến lượt CTV được ưu tiên đặt cọc cho căn hộ (sau khi dự án chuyển sang giai đoạn mở bán). CTV sẽ nhận được thông báo và có 48 giờ để thực hiện đặt cọc, nếu không sẽ mất quyền ưu tiên.

---

## CÁC KÝ HIỆU & ABBREVIATIONS

| Ký hiệu | Ý nghĩa |
|---------|---------|
| ✅ | Đã hoàn thành / OK |
| ⚠️ | Cảnh báo / Lưu ý |
| ❌ | Không được phép / Lỗi |
| 📊 | Thống kê / Báo cáo |
| 💰 | Tiền / Hoa hồng |
| 🔒 | Lock / Khóa |
| 🔔 | Notification / Thông báo |
| ⏰ | Time / Thời gian |
| 📅 | Schedule / Lịch |
| 🚀 | Action / Hành động |

---

## THUẬT NGỮ NGHIỆP VỤ

**Chốt deal**  
Hoàn tất giao dịch bán căn hộ, tức là khách hàng đã hoàn thành thanh toán đầy đủ tất cả các đợt theo lịch trả góp. Khi chốt deal, căn hộ chuyển sang trạng thái "Đã bán" và CTV được ghi nhận hoa hồng.

**Chiết khấu**  
Khoản giảm giá từ giá niêm yết ban đầu, được áp dụng sau khi thương lượng với khách hàng. Giá thực tế chốt deal = Giá niêm yết - Chiết khấu.

**Trả góp**  
Phương thức thanh toán chia thành nhiều đợt (thường là 4 đợt) trong một khoảng thời gian, thay vì trả toàn bộ một lần. Giúp khách hàng dễ dàng sở hữu căn hộ hơn.

**Bàn giao**  
Quá trình giao căn hộ cho khách hàng sau khi khách hàng đã thanh toán đủ các đợt. Thường được thực hiện cùng với đợt thanh toán cuối cùng (35% giá căn).

**Độc quyền**  
Quyền độc quyền của một CTV đối với một căn hộ tại một thời điểm, nghĩa là chỉ có CTV đó mới có thể tạo phiếu đặt chỗ hoặc đặt cọc cho căn hộ đó. Ngăn chặn xung đột khi nhiều CTV cùng bán một căn.

**Xếp hàng (Queue/Hàng đợi)**  
Cơ chế xử lý khi nhiều CTV cùng quan tâm và đăng ký giữ chỗ một căn hộ. Hệ thống sẽ xếp các CTV theo thứ tự thời gian đăng ký, CTV đăng ký trước sẽ được ưu tiên khi dự án mở bán.

---

**Document End**
