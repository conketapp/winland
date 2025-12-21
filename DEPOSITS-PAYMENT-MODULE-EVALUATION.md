# ĐÁNH GIÁ MODULE CỌC (DEPOSITS) VÀ THANH TOÁN (PAYMENT REQUESTS)

**Ngày đánh giá:** 2025-01-XX  
**Scope:** Backend + Frontend (Admin Portal + CTV Portal)  
**Modules:** Deposits, Transactions, Payment Requests, Commissions

---

## TỔNG QUAN

Module **Deposits** (Cọc) và **Payment Requests** (Thanh toán hoa hồng) là các modules quan trọng trong quy trình bán căn hộ, quản lý từ việc đặt cọc đến thanh toán các đợt và cuối cùng là chi trả hoa hồng cho CTV.

### Quy trình nghiệp vụ

```
Reservation/Booking → Deposit (Đặt cọc) → PENDING_APPROVAL
                                              ↓
                                        Admin Approve
                                              ↓
                                    CONFIRMED + Payment Schedule (4 đợt)
                                              ↓
                                    Transaction (Thanh toán từng đợt)
                                              ↓
                                    CONFIRMED (khi đủ 100%) → Unit SOLD
                                              ↓
                                    Commission Calculation
                                              ↓
                                    Payment Request (CTV yêu cầu rút tiền)
                                              ↓
                                    Admin Approve → APPROVED → Mark PAID
```

---

## 1. ĐÁNH GIÁ NGHIỆP VỤ (BUSINESS LOGIC)

### ✅ Điểm mạnh

#### 1.1. Deposit Creation Flow
- ✅ **Validation đầy đủ:** Kiểm tra unit status, deposit amount (>= 5%), existing deposits
- ✅ **Transaction protection:** Sử dụng Serializable isolation level để tránh race condition
- ✅ **Retry mechanism:** Exponential backoff (3 lần) cho conflict errors
- ✅ **Integration với Reservation:** Có thể tạo deposit từ reservation, tự động mark các reservation khác là MISSED
- ✅ **Unit status sync:** Tự động update unit status = DEPOSITED khi tạo deposit
- ✅ **Code generation:** Tự động generate mã deposit (DP000001, DP000002, ...) trong transaction

#### 1.2. Payment Schedule Management
- ✅ **Dynamic template:** Hỗ trợ cấu hình payment schedule từ SystemConfig (deposit_payment_schedule_template)
- ✅ **Fallback logic:** Nếu không có config, dùng template mặc định (4 đợt)
- ✅ **Flexible calculation:** Tính toán dựa trên depositPercentage và remaining amount
- ✅ **Auto-calculation:** Đảm bảo tổng deposit + installments = 100%
- ✅ **Due date management:** Hỗ trợ offsetDays từ config

#### 1.3. Commission Calculation
- ✅ **Auto-creation:** Commission được tạo khi deposit approved (CONFIRMED)
- ✅ **Calculation base:** Hỗ trợ tính dựa trên finalPrice hoặc listPrice (configurable)
- ✅ **Status tracking:** PENDING → APPROVED (khi payment request approved) → PAID (khi mark paid)
- ✅ **One-to-one relationship:** Mỗi deposit chỉ có 1 commission (unique constraint)

#### 1.4. Payment Requests Flow
- ✅ **Validation:** Chỉ cho phép tạo request cho commission PENDING
- ✅ **Duplicate prevention:** Kiểm tra existing PENDING/APPROVED requests
- ✅ **Status flow:** PENDING → APPROVED → PAID (hoặc REJECTED)
- ✅ **Notifications:** Gửi thông báo cho CTV khi approve/reject

#### 1.5. Transaction Management
- ✅ **Payment tracking:** Lưu lại từng giao dịch thanh toán với paymentProof
- ✅ **Schedule linking:** Link transaction với payment schedule installment
- ✅ **Status flow:** PENDING_CONFIRMATION → CONFIRMED → CANCELLED
- ✅ **Auto-update schedule:** Khi confirm transaction, tự động update payment schedule status

### ⚠️ Điểm cần cải thiện

#### 1.1. Unit Status Sync
**Vấn đề:**
- ⚠️ **Unit status không tự động sync khi deposit cancelled/overdue**
  - Khi deposit cancelled, unit vẫn là DEPOSITED
  - Cần manual cleanup để release unit về AVAILABLE
  - Similar issue như Reservations/Bookings module đã fix

**Recommendation:**
```typescript
// Thêm syncUnitStatus() calls sau khi cancel/overdue deposit
async cancel(id: string, ctvId: string, reason: string) {
  // ... cancel logic
  await this.unitsService.syncUnitStatus(deposit.unitId).catch((error) => {
    this.handleNonCriticalError('syncUnitStatus', error, { unitId: deposit.unitId });
  });
}
```

#### 1.2. Payment Schedule Status Management
**Vấn đề:**
- ⚠️ **Status update không atomic với transaction confirmation**
  - Transaction confirm và payment schedule update không trong cùng transaction
  - Có thể dẫn đến inconsistent state nếu transaction confirm thành công nhưng schedule update fail

**Recommendation:**
```typescript
async confirm(id: string, confirmDto: ConfirmTransactionDto, adminId: string) {
  return await this.prisma.$transaction(async (tx) => {
    // Update transaction status
    await tx.transaction.update({ ... });
    
    // Update payment schedule (atomic)
    if (transaction.paymentScheduleId) {
      await tx.paymentSchedule.update({ ... });
    }
    
    // Check if fully paid and update deposit/unit status (atomic)
    const totalPaid = await this.calculateTotalPaid(depositId, tx);
    if (totalPaid >= unitPrice) {
      await tx.deposit.update({ status: 'COMPLETED' });
      await tx.unit.update({ status: 'SOLD', soldAt: new Date() });
    }
  }, { isolationLevel: 'Serializable' });
}
```

#### 1.3. Commission Creation Timing
**Vấn đề:**
- ⚠️ **Commission được tạo khi approve deposit, nhưng finalPrice có thể thay đổi sau**
  - Có method `updateFinalPrice()` để update finalPrice và recalculate commission
  - Nhưng logic này chỉ hoạt động nếu commission.status = PENDING
  - Nếu commission đã APPROVED/PAID, không thể update

**Recommendation:**
- Document rõ business rule: finalPrice chỉ được update khi commission PENDING
- Hoặc implement versioning cho commission (tạo commission mới khi update finalPrice)

#### 1.4. Overdue Detection
**Vấn đề:**
- ⚠️ **Không có automatic overdue detection cho payment schedules**
  - Status OVERDUE cho deposit không được tự động set
  - Cần manual hoặc cronjob để check và update

**Recommendation:**
```typescript
@Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
async processOverdueDeposits() {
  const now = new Date();
  const overdueSchedules = await this.prisma.paymentSchedule.findMany({
    where: {
      status: 'PENDING',
      dueDate: { lt: now },
    },
  });
  
  // Group by depositId and update deposit status
  for (const schedule of overdueSchedules) {
    await this.prisma.deposit.update({
      where: { id: schedule.depositId },
      data: { status: 'OVERDUE' },
    });
  }
}
```

---

## 2. ĐÁNH GIÁ CODE QUALITY

### ✅ Điểm mạnh

#### 2.1. Transaction Management
- ✅ **Proper isolation levels:** Sử dụng Serializable cho critical operations
- ✅ **Retry logic:** Exponential backoff cho race conditions
- ✅ **Timeout handling:** Configurable timeout cho transactions
- ✅ **Atomic operations:** Deposit creation, approval đều trong transaction

#### 2.2. Error Handling
- ✅ **Consistent error messages:** Sử dụng ErrorMessages constants (đã được cải thiện trong Reservations/Bookings)
- ✅ **Proper exceptions:** NotFoundException, BadRequestException, ConflictException
- ✅ **Non-critical error handling:** Notification failures không fail main operations

#### 2.3. Code Organization
- ✅ **Service separation:** DepositsService, TransactionsService, PaymentRequestsService tách biệt rõ ràng
- ✅ **DTO validation:** Class-validator cho input validation
- ✅ **Pagination:** Hỗ trợ pagination cho list endpoints
- ✅ **Query optimization:** Sử dụng QueryOptimizerUtil để prevent N+1 queries

### ⚠️ Điểm cần cải thiện

#### 2.1. Type Safety
**Vấn đề:**
- ⚠️ **Một số nơi dùng `any`:**
  ```typescript
  // deposits.service.ts
  async findAll(...): Promise<PaginationResult<any>> {
    const where: any = { ... };
  }
  
  // payment-requests.service.ts
  async findAll(query: QueryPaymentRequestDto) {
    const where: any = { ... };
  }
  
  // transactions.service.ts
  async findAll(query: QueryTransactionDto) {
    const where: any = { ... };
  }
  ```

**Recommendation:**
```typescript
// Sử dụng Prisma types
import { Prisma } from '@prisma/client';

async findAll(...): Promise<PaginationResult<Prisma.DepositGetPayload<{
  include: ReturnType<typeof QueryOptimizerUtil.buildDepositInclude>
}>>> {
  const where: Prisma.DepositWhereInput = {
    deletedAt: null,
  };
}
```

#### 2.2. Error Handling Consistency
**Vấn đề:**
- ⚠️ **Không consistent với Reservations/Bookings modules:**
  - Một số nơi dùng hardcoded error messages
  - Chưa có `handleNonCriticalError()` helper method
  - Console.error không có structured logging

**Recommendation:**
- Apply same error handling pattern như Reservations/Bookings
- Standardize error messages với ErrorMessages constants
- Add `handleNonCriticalError()` helper

#### 2.3. Code Duplication
**Vấn đề:**
- ⚠️ **Validation logic bị duplicate:**
  - CTV ownership check được lặp lại nhiều nơi
  - Deposit status check duplicate
  - Unit status check duplicate

**Recommendation:**
```typescript
// Tạo helper methods
private async validateCTVOwnershipOrAdmin(
  entityCtvId: string,
  userId: string,
  userRole?: string,
): Promise<void> { ... }

private validateDepositStatusForAction(
  deposit: Deposit,
  allowedStatuses: DepositStatus[],
): void { ... }

private async validateUnitAvailableForDeposit(unit: Unit): Promise<void> { ... }
```

#### 2.4. Missing Documentation
**Vấn đề:**
- ⚠️ **Thiếu JSDoc comments:**
  - Nhiều methods không có documentation
  - Business rules chưa được document đầy đủ
  - Complex logic (như createPaymentSchedule) thiếu explanation

**Recommendation:**
- Add JSDoc cho tất cả public methods
- Document business rules (e.g., deposit percentage requirement, commission calculation)
- Add examples cho complex operations

---

## 3. ĐÁNH GIÁ BACKEND IMPLEMENTATION

### ✅ Điểm mạnh

#### 3.1. API Design
- ✅ **RESTful:** Endpoints tuân theo REST conventions
- ✅ **Role-based access:** Sử dụng RolesGuard và @Roles decorator
- ✅ **Pagination:** Hỗ trợ pagination cho list endpoints
- ✅ **Filtering:** Hỗ trợ filter theo status, projectId, ctvId

#### 3.2. Database Design
- ✅ **Indexes:** Composite indexes cho common queries
- ✅ **Soft delete:** Hỗ trợ soft delete với deletedAt
- ✅ **Relationships:** Foreign keys và cascade deletes properly configured
- ✅ **Constraints:** Unique constraints cho code, depositId trong commission

#### 3.3. Business Logic Implementation
- ✅ **Payment schedule calculation:** Logic rõ ràng, hỗ trợ config
- ✅ **Commission calculation:** Formula đúng, hỗ trợ both finalPrice và listPrice
- ✅ **Status transitions:** Clear status flow, validation

### ⚠️ Điểm cần cải thiện

#### 3.1. Transaction Consistency
**Vấn đề:**
- ⚠️ **Transaction confirmation và schedule update không atomic:**
  ```typescript
  // transactions.service.ts - confirm()
  // Update transaction
  await this.prisma.transaction.update({ ... });
  
  // Update payment schedule (NOT in transaction)
  if (transaction.paymentScheduleId) {
    await this.prisma.paymentSchedule.update({ ... });
  }
  ```

**Recommendation:**
- Wrap trong transaction với Serializable isolation level
- Ensure atomicity của tất cả related updates

#### 3.2. Commission Recalculation
**Vấn đề:**
- ⚠️ **Logic update finalPrice và recalculate commission có thể cải thiện:**
  - Hiện tại chỉ update nếu commission.status = PENDING
  - Nếu commission đã APPROVED/PAID, không thể update
  - Không có audit trail cho commission amount changes

**Recommendation:**
- Document business rule rõ ràng
- Hoặc implement commission versioning
- Hoặc require admin approval để update finalPrice sau khi commission approved

#### 3.3. Missing Features
**Vấn đề:**
- ⚠️ **Không có automatic overdue detection**
- ⚠️ **Không có payment reminders/notifications**
- ⚠️ **Không có bulk operations (e.g., bulk approve deposits)**
- ⚠️ **Không có export functionality**

**Recommendation:**
- Implement cronjob cho overdue detection
- Add notification system cho payment reminders
- Add bulk operations nếu cần thiết
- Add export to Excel/CSV

---

## 4. ĐÁNH GIÁ FRONTEND IMPLEMENTATION

### ✅ Điểm mạnh

#### 4.1. UI/UX
- ✅ **Clean UI:** Sử dụng shadcn/ui components, consistent design
- ✅ **Status badges:** Visual indicators cho status
- ✅ **Loading states:** Proper loading indicators
- ✅ **Error handling:** Error states với retry functionality
- ✅ **Empty states:** Informative empty states

#### 4.2. Functionality
- ✅ **Deposit approval:** Admin có thể approve deposits
- ✅ **Payment request management:** Approve/reject/mark paid
- ✅ **Detail modals:** Chi tiết deposit/transaction/payment request
- ✅ **Filtering:** Filter theo status

### ⚠️ Điểm cần cải thiện

#### 4.1. Type Safety
**Vấn đề:**
- ⚠️ **Một số nơi dùng `any`:**
  ```typescript
  // DepositsApprovalPage.tsx
  const [detailModal, setDetailModal] = useState<{
    open: boolean;
    deposit: any | null; // ❌ Should be Deposit type
  }>({ ... });
  
  // PaymentRequestsPage.tsx
  const params: any = {}; // ❌ Should be typed
  ```

**Recommendation:**
- Define proper TypeScript interfaces
- Remove all `any` types

#### 4.2. Error Handling
**Vấn đề:**
- ⚠️ **Error handling có thể cải thiện:**
  - Một số nơi chỉ console.error, không show toast
  - Error messages không consistent

**Recommendation:**
- Use toast notifications cho user feedback
- Standardize error messages
- Add error boundaries

#### 4.3. Missing Features
**Vấn đề:**
- ⚠️ **Không có pagination UI cho deposits list**
- ⚠️ **Không có search functionality**
- ⚠️ **Không có export to Excel/CSV**
- ⚠️ **Không có bulk operations UI**

**Recommendation:**
- Add pagination controls
- Add search input
- Add export functionality
- Add bulk select và operations

#### 4.4. Data Refresh
**Vấn đề:**
- ⚠️ **Sau khi approve/reject, cần manual refresh:**
  ```typescript
  const confirmApprove = async () => {
    await depositsApi.approve(id);
    loadDeposits(); // Manual refresh
  };
  ```

**Recommendation:**
- Use React Query hoặc SWR cho automatic cache invalidation
- Hoặc implement optimistic updates

---

## 5. ĐÁNH GIÁ TỔNG QUAN

### ✅ Strengths

1. **Solid Business Logic:** Payment flow rõ ràng, commission calculation đúng
2. **Transaction Safety:** Proper use of transactions, retry logic
3. **Integration:** Tích hợp tốt với Reservations/Bookings modules
4. **Extensibility:** Payment schedule configurable từ SystemConfig

### ⚠️ Areas for Improvement

#### High Priority

1. **Type Safety:** Replace all `any` types với proper Prisma types
2. **Error Handling:** Standardize error handling pattern như Reservations/Bookings
3. **Unit Status Sync:** Auto-sync unit status khi deposit cancelled/overdue
4. **Transaction Atomicity:** Ensure transaction confirmation và schedule update atomic

#### Medium Priority

5. **Code Duplication:** Extract common validation logic
6. **Overdue Detection:** Implement automatic overdue detection cronjob
7. **Documentation:** Add JSDoc comments và document business rules
8. **Frontend Pagination:** Add pagination UI
9. **Frontend Search:** Add search functionality

#### Low Priority

10. **Bulk Operations:** Add bulk approve/reject
11. **Export Functionality:** Export to Excel/CSV
12. **Payment Reminders:** Notification system cho payment due dates
13. **Commission Versioning:** Support update finalPrice sau khi commission approved

---

## 6. KHUYẾN NGHỊ

### 6.1 Ưu Tiên Cao (Làm ngay)

1. **Fix Type Safety Issues**
   - Replace `any` types với Prisma types
   - Add proper TypeScript interfaces cho frontend

2. **Standardize Error Handling**
   - Apply same pattern như Reservations/Bookings
   - Add `handleNonCriticalError()` helper
   - Standardize error messages

3. **Fix Unit Status Sync**
   - Add `syncUnitStatus()` calls sau cancel/overdue
   - Ensure unit status tự động sync

4. **Fix Transaction Atomicity**
   - Wrap transaction confirmation và schedule update trong transaction
   - Ensure atomicity của all related updates

### 6.2 Ưu Tiên Trung Bình

5. **Code Refactoring**
   - Extract duplicate validation logic
   - Add helper methods

6. **Add Missing Features**
   - Automatic overdue detection (cronjob)
   - Pagination UI
   - Search functionality

7. **Documentation**
   - Add JSDoc comments
   - Document business rules

### 6.3 Ưu Tiên Thấp

8. **Enhancements**
   - Bulk operations
   - Export functionality
   - Payment reminders
   - Commission versioning

---

## 7. KẾT LUẬN

Module **Deposits** và **Payment Requests** có business logic vững chắc và implementation tốt, nhưng cần cải thiện về type safety, error handling consistency, và một số missing features. Sau khi fix các issues high priority, module sẽ đạt chất lượng tương đương với Reservations/Bookings modules đã được cải thiện.

**Overall Rating:** 7.5/10

**Recommendation:** Ưu tiên fix type safety và error handling trước, sau đó implement missing features.
