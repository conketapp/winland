# ĐÁNH GIÁ MODULE HOA HỒNG (COMMISSIONS) VÀ CTV/USERS

**Ngày đánh giá:** 2025-01-XX  
**Scope:** Backend + Frontend (Admin Portal + CTV Portal)  
**Modules:** Commissions, Users/CTV Management

---

## TỔNG QUAN

Module **Commissions** (Hoa hồng) và **Users/CTV** là các modules quan trọng trong hệ thống, quản lý tính toán hoa hồng cho CTV và quản lý thông tin người dùng/CTV.

### Quy trình nghiệp vụ

```
Deposit COMPLETED → Unit SOLD
                         ↓
                   Commission Created (PENDING)
                         ↓
                   CTV Request Payment
                         ↓
                   Payment Request (PENDING)
                         ↓
                   Admin Approve → Commission APPROVED
                         ↓
                   Admin Mark Paid → Commission PAID
```

---

## 1. ĐÁNH GIÁ NGHIỆP VỤ (BUSINESS LOGIC)

### ✅ Điểm mạnh

#### 1.1. Commission Calculation
- ✅ **Auto-creation:** Commission được tạo tự động khi unit status = SOLD
- ✅ **Flexible calculation base:** Hỗ trợ tính dựa trên `final_price` hoặc `list_price` (configurable từ SystemConfig)
- ✅ **Rate priority:** Unit rate > Project rate > Default (2.0%)
- ✅ **Calculation formula:** `amount = basePrice × rate / 100`
- ✅ **One-to-one relationship:** Mỗi deposit chỉ có 1 commission (unique constraint trên depositId)
- ✅ **Transaction safety:** Commission được tạo trong transaction khi unit marked as SOLD

#### 1.2. Commission Recalculation
- ✅ **Support recalculation:** Có thể tính lại commission khi finalPrice thay đổi
- ✅ **Status validation:** Chỉ cho phép recalculate khi commission.status = PENDING
- ✅ **Audit trail:** Log old và new values trong audit log
- ✅ **Notification:** Thông báo CTV khi commission được tính lại

#### 1.3. Commission Status Flow
- ✅ **Clear status flow:** PENDING → APPROVED (khi payment request approved) → PAID (khi mark paid)
- ✅ **Status sync:** Commission status tự động update khi payment request approved/paid
- ✅ **Integration:** Tích hợp tốt với Payment Requests module

#### 1.4. Users/CTV Management
- ✅ **Role-based:** Hỗ trợ 4 roles: SUPER_ADMIN, ADMIN, CTV, USER
- ✅ **Status management:** Có thể activate/deactivate users
- ✅ **totalDeals tracking:** Tự động update khi deposit confirmed/cancelled
- ✅ **Soft delete:** Hỗ trợ soft delete với deletedAt

### ⚠️ Điểm cần cải thiện

#### 1.1. Commission Module Architecture
**Vấn đề:**
- ⚠️ **Không có dedicated CommissionService:**
  - Commission logic nằm trong TransactionsService (private methods)
  - Khó maintain và extend
  - Không có dedicated API endpoints cho commissions
  - CTV chỉ có thể xem commissions qua payment-requests/my-summary

**Recommendation:**
```typescript
// Tạo CommissionsService riêng
@Injectable()
export class CommissionsService {
  async findAll(filters?: CommissionFilters, pagination?: PaginationOptions)
  async findMyCommissions(ctvId: string)
  async findOne(id: string)
  async recalculateCommission(depositId: string)
  private async createCommission(depositId: string)
}

// Tạo CommissionsController
@Controller('commissions')
export class CommissionsController {
  @Get() // Admin: list all commissions
  @Get('my-commissions') // CTV: list own commissions
  @Get(':id') // Get commission by ID
  @Patch(':id/recalculate') // Admin: recalculate commission
}
```

#### 1.2. Commission Calculation Timing
**Vấn đề:**
- ⚠️ **Commission được tạo khi unit SOLD, nhưng có thể cần tạo sớm hơn:**
  - Hiện tại commission chỉ được tạo khi tất cả payments completed
  - Có thể CTV muốn biết commission amount sớm hơn (khi deposit confirmed)
  - Không có "estimated commission" feature

**Recommendation:**
- Document rõ business rule: Commission chỉ được tạo khi unit SOLD
- Hoặc implement estimated commission feature cho CTV preview

#### 1.3. Users Service Functionality
**Vấn đề:**
- ⚠️ **UsersService quá đơn giản, thiếu nhiều features:**
  - Không có create user endpoint
  - Không có update user profile
  - Không có pagination
  - Không có search functionality
  - Không có filter by multiple criteria
  - Không có user statistics/analytics

**Recommendation:**
```typescript
// Mở rộng UsersService
async create(dto: CreateUserDto)
async update(id: string, dto: UpdateUserDto)
async findAll(filters?: UserFilters, pagination?: PaginationOptions)
async search(query: string, filters?: UserFilters)
async getStatistics(ctvId?: string) // Commission stats, deal stats, etc.
async updateProfile(userId: string, dto: UpdateProfileDto)
```

#### 1.4. totalDeals Management
**Vấn đề:**
- ⚠️ **totalDeals chỉ được update qua TriggerService:**
  - Logic rải rác, khó maintain
  - Không có validation (có thể < 0 nếu có bug)
  - Không có sync mechanism nếu data inconsistent

**Recommendation:**
- Centralize totalDeals update logic
- Add validation để ensure totalDeals >= 0
- Add sync mechanism để recalculate từ actual deposits

---

## 2. ĐÁNH GIÁ CODE QUALITY

### ✅ Điểm mạnh

#### 2.1. Commission Calculation Logic
- ✅ **Clear calculation logic:** Formula rõ ràng, dễ hiểu
- ✅ **Configurable:** Hỗ trợ config từ SystemConfig
- ✅ **Fallback logic:** Có fallback cho rate (unit > project > default)
- ✅ **Type safety:** Proper typing cho calculationBase

#### 2.2. Integration với Other Modules
- ✅ **Good integration:** Tích hợp tốt với Deposits, Transactions, Payment Requests
- ✅ **Transaction safety:** Commission creation trong transaction
- ✅ **Notifications:** Gửi notifications cho CTV

### ⚠️ Điểm cần cải thiện

#### 2.1. Code Organization
**Vấn đề:**
- ⚠️ **Commission logic nằm trong TransactionsService:**
  ```typescript
  // transactions.service.ts
  private async createCommission(depositId: string) { ... }
  async recalculateCommission(depositId: string) { ... }
  ```
  - Vi phạm Single Responsibility Principle
  - Khó test và maintain riêng
  - Khó extend với features mới

**Recommendation:**
- Extract commission logic vào CommissionsService riêng
- TransactionsService chỉ nên focus vào transaction management

#### 2.2. Type Safety
**Vấn đề:**
- ⚠️ **UsersService dùng `any` type:**
  ```typescript
  async findAll(where: any = {}) {
    // ...
  }
  ```

**Recommendation:**
```typescript
import { Prisma, UserRole } from '@prisma/client';

async findAll(
  filters?: { role?: UserRole; isActive?: boolean },
  pagination?: PaginationOptions
): Promise<PaginationResult<Prisma.UserGetPayload<...>>> {
  const where: Prisma.UserWhereInput = {};
  // ...
}
```

#### 2.3. Error Handling
**Vấn đề:**
- ⚠️ **Hardcoded error messages:**
  ```typescript
  throw new NotFoundException(`User with ID ${id} not found`);
  ```

**Recommendation:**
- Sử dụng ErrorMessages constants
- Standardize error handling pattern

#### 2.4. Missing Validation
**Vấn đề:**
- ⚠️ **UsersService không có validation:**
  - Không validate user exists trước khi update
  - Không validate role transitions
  - Không validate isActive changes

**Recommendation:**
- Add validation methods
- Validate business rules (e.g., không thể deactivate user nếu có active deposits/bookings)

---

## 3. ĐÁNH GIÁ BACKEND IMPLEMENTATION

### ✅ Điểm mạnh

#### 3.1. Commission Calculation
- ✅ **Accurate calculation:** Formula đúng, logic rõ ràng
- ✅ **Support both calculation bases:** final_price và list_price
- ✅ **Rate priority:** Unit > Project > Default
- ✅ **Audit trail:** Có audit log cho commission creation và recalculation

#### 3.2. Database Design
- ✅ **Good indexes:** Composite indexes cho common queries
- ✅ **Relationships:** Foreign keys và cascade deletes properly configured
- ✅ **Constraints:** Unique constraint trên depositId trong commission

### ⚠️ Điểm cần cải thiện

#### 3.1. Missing Dedicated API
**Vấn đề:**
- ⚠️ **Không có dedicated commission endpoints:**
  - CTV chỉ có thể xem commissions qua `/api/payment-requests/my-summary`
  - Admin không có endpoint để list all commissions
  - Không có endpoint để get commission details

**Recommendation:**
- Tạo CommissionsController với endpoints:
  - `GET /api/commissions` - Admin: list all commissions (với filters, pagination)
  - `GET /api/commissions/my-commissions` - CTV: list own commissions
  - `GET /api/commissions/:id` - Get commission by ID
  - `PATCH /api/commissions/:id/recalculate` - Admin: recalculate commission

#### 3.2. Commission Summary Logic
**Vấn đề:**
- ⚠️ **Summary logic duplicate trong payment-requests service:**
  ```typescript
  // payment-requests.service.ts - getMySummary()
  commissions.forEach((commission) => {
    summary.totalEarned += commission.amount;
    if (commission.status === 'PENDING') { ... }
    // ...
  });
  ```
  - Logic này nên nằm trong CommissionsService

**Recommendation:**
- Move summary calculation vào CommissionsService
- PaymentRequestsService chỉ nên focus vào payment requests

#### 3.3. Users Service Limitations
**Vấn đề:**
- ⚠️ **UsersService quá đơn giản:**
  - Không có pagination
  - Không có search
  - Không có create/update
  - Không có statistics

**Recommendation:**
- Add pagination support
- Add search functionality (by name, email, phone)
- Add create/update methods
- Add statistics method (commission stats, deal stats)

#### 3.4. totalDeals Sync
**Vấn đề:**
- ⚠️ **totalDeals có thể inconsistent:**
  - Chỉ update khi deposit confirmed/cancelled
  - Không có sync mechanism
  - Có thể < 0 nếu có bug

**Recommendation:**
```typescript
// Add sync method
async syncUserTotalDeals(ctvId: string) {
  const actualCount = await this.prisma.deposit.count({
    where: {
      ctvId,
      status: { in: ['CONFIRMED', 'COMPLETED'] },
    },
  });
  
  await this.prisma.user.update({
    where: { id: ctvId },
    data: { totalDeals: actualCount },
  });
}
```

---

## 4. ĐÁNH GIÁ FRONTEND IMPLEMENTATION

### ✅ Điểm mạnh

#### 4.1. CTV Portal Commissions Page
- ✅ **Modern UI:** Clean design với gradient effects
- ✅ **Summary cards:** Hiển thị tổng hoa hồng, pending, available
- ✅ **Status filtering:** Filter theo status (all, pending, approved, paid)
- ✅ **Status badges:** Visual indicators cho status

#### 4.2. Admin Portal Users Page
- ✅ **Filtering:** Filter theo role và status
- ✅ **Stats display:** Hiển thị statistics (total users, admins, CTVs, etc.)
- ✅ **Status management:** Có thể activate/deactivate users
- ✅ **Role badges:** Visual indicators cho roles

### ⚠️ Điểm cần cải thiện

#### 4.1. Commission Data Source Inconsistency
**Vấn đề:**
- ⚠️ **CTV Portal có 2 implementations khác nhau:**
  - `ctv-portal/app/api/commissions/route.ts` - Tính commission từ deposits (hardcoded 2%)
  - `ctv-portal/app/api/payment-requests/my-summary/route.ts` - Lấy từ commission table (đúng)
  - `ctv-portal-vite/src/pages/CommissionsPage.tsx` - Dùng mock data

**Recommendation:**
- Standardize: Tất cả commission queries nên dùng Commission table
- Remove duplicate/hardcoded calculation logic
- Update frontend để dùng đúng API endpoints

#### 4.2. Missing Features
**Vấn đề:**
- ⚠️ **Frontend thiếu nhiều features:**
  - Không có pagination cho commissions list
  - Không có search functionality
  - Không có commission detail view
  - Không có export functionality
  - UsersPage không có pagination

**Recommendation:**
- Add pagination cho commissions và users lists
- Add search functionality
- Add commission detail modal/page
- Add export to Excel/CSV

#### 4.3. Type Safety
**Vấn đề:**
- ⚠️ **Frontend có một số `any` types:**
  ```typescript
  // ctv-portal/app/api/commissions/route.ts
  // Tính commission từ deposits thay vì dùng commission table
  commissionAmount: deposit.depositAmount * 0.02, // Hardcoded 2%
  ```

**Recommendation:**
- Remove hardcoded calculation
- Use proper types từ commission table
- Standardize commission data structure

---

## 5. ĐÁNH GIÁ TỔNG QUAN

### ✅ Strengths

1. **Solid Commission Calculation:** Logic đúng, hỗ trợ flexible calculation base
2. **Good Integration:** Tích hợp tốt với các modules khác
3. **Transaction Safety:** Commission creation trong transaction
4. **Clear Status Flow:** PENDING → APPROVED → PAID

### ⚠️ Areas for Improvement

#### High Priority

1. **Create Dedicated CommissionsService:** Extract commission logic từ TransactionsService
2. **Create CommissionsController:** Add dedicated API endpoints
3. **Fix Frontend Data Source:** Standardize commission queries, remove hardcoded calculations
4. **Type Safety:** Fix `any` types trong UsersService
5. **Error Handling:** Standardize error messages

#### Medium Priority

6. **Users Service Enhancement:** Add pagination, search, create/update
7. **Commission Summary:** Move summary logic vào CommissionsService
8. **totalDeals Sync:** Add sync mechanism để ensure consistency
9. **Frontend Pagination:** Add pagination cho commissions và users lists
10. **Frontend Search:** Add search functionality

#### Low Priority

11. **User Statistics:** Add statistics/analytics endpoints
12. **Export Functionality:** Export commissions/users to Excel/CSV
13. **Estimated Commission:** Preview commission amount before unit SOLD
14. **User Profile Management:** Allow CTV update their own profile

---

## 6. KHUYẾN NGHỊ

### 6.1 Ưu Tiên Cao (Làm ngay)

1. **Create CommissionsService và CommissionsController**
   - Extract commission logic từ TransactionsService
   - Tạo dedicated API endpoints
   - Improve code organization

2. **Fix Frontend Commission Data Source**
   - Remove hardcoded 2% calculation
   - Standardize để dùng Commission table
   - Update all frontend pages để dùng đúng API

3. **Type Safety và Error Handling**
   - Fix `any` types trong UsersService
   - Standardize error messages với ErrorMessages constants
   - Add proper TypeScript types

4. **Users Service Enhancement**
   - Add pagination support
   - Add search functionality
   - Add create/update methods

### 6.2 Ưu Tiên Trung Bình

5. **Commission Summary Refactoring**
   - Move summary logic vào CommissionsService
   - Reuse trong PaymentRequestsService

6. **totalDeals Sync**
   - Add sync mechanism
   - Add validation

7. **Frontend Improvements**
   - Add pagination
   - Add search
   - Add commission detail view

### 6.3 Ưu Tiên Thấp

8. **Enhancements**
   - User statistics
   - Export functionality
   - Estimated commission preview
   - User profile management

---

## 7. KẾT LUẬN

Module **Commissions** và **Users/CTV** có business logic đúng đắn nhưng cần cải thiện về architecture và functionality. Commission logic nên được extract vào service riêng, và Users service cần được mở rộng với pagination, search, và các features cơ bản khác.

**Overall Rating:** 6.5/10

**Recommendation:** Ưu tiên tạo CommissionsService và fix frontend data source inconsistency trước, sau đó enhance Users service.
