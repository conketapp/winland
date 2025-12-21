# Diagrams - Sơ Đồ Hệ Thống

Thư mục này chứa các file PlantUML để tạo sơ đồ cho tài liệu Business Analyst.

## Các Sơ Đồ

1. **sales-process-flow.puml** - Quy trình bán căn hộ từ giữ chỗ đến bán
2. **project-hierarchy.puml** - Cấu trúc phân cấp dự án (Dự án → Tòa → Tầng → Căn)
3. **queue-processing.puml** - Hệ thống xếp hàng khi nhiều CTV giữ chỗ
4. **booking-approval-flow.puml** - Quy trình duyệt phiếu đặt chỗ
5. **deposit-approval-flow.puml** - Quy trình duyệt phiếu đặt cọc
6. **payment-schedule.puml** - Lịch trả góp 4 đợt
7. **transaction-confirmation-flow.puml** - Quy trình xác nhận giao dịch thanh toán
8. **commission-calculation.puml** - Quy trình tính hoa hồng
9. **system-overview.puml** - Tổng quan kiến trúc hệ thống
10. **user-roles.puml** - Phân quyền người dùng
11. **status-transitions.puml** - Quy trình chuyển đổi tình trạng các entity
12. **data-relationships.puml** - Sơ đồ quan hệ dữ liệu (ERD)

## Cách Generate Hình Ảnh

### Option 1: Sử dụng script (Khuyến nghị)

```bash
cd ba-docs/diagrams
./generate-images.sh
```

### Option 2: Sử dụng PlantUML trực tiếp

**Cài đặt PlantUML:**

```bash
# Cách 1: Sử dụng npm (Node.js)
npm install -g node-plantuml

# Cách 2: Sử dụng Java (Download từ plantuml.com)
# Download plantuml.jar và chạy:
java -jar plantuml.jar -tpng *.puml

# Cách 3: Sử dụng Homebrew (macOS)
brew install plantuml
```

**Generate hình ảnh:**

```bash
# Nếu dùng npm
puml generate *.puml

# Nếu dùng plantuml command
plantuml -tpng *.puml

# Nếu dùng Java jar
java -jar plantuml.jar -tpng *.puml
```

### Option 3: Online (Nếu không muốn cài đặt)

1. Truy cập: http://www.plantuml.com/plantuml/uml/
2. Copy nội dung file .puml
3. Paste vào editor
4. Download hình ảnh PNG

## Output

Sau khi generate, các file hình ảnh `.png` sẽ được tạo ra trong cùng thư mục và sẽ được chèn vào các tài liệu BA.

## Sử dụng trong Tài liệu

Sau khi có hình ảnh, chèn vào tài liệu markdown bằng:

```markdown
![Mô tả hình ảnh](./diagrams/tên-file.png)
```
