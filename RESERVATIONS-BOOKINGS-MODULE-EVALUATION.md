# ĐÁNH GIÁ MODULE GIỮ CHỖ (RESERVATIONS) VÀ BOOKING

**Ngày đánh giá:** 2025-01-XX  
**Scope:** Backend + Frontend (Admin Portal)  
**Modules:** Reservations, Bookings

---

## TỔNG QUAN

Module **Reservations** và **Bookings** là 2 modules quan trọng nhất trong hệ thống, quản lý quy trình từ "giữ chỗ" (cho dự án UPCOMING) đến "đặt chỗ có thanh toán" (cho dự án OPEN).

### Quy trình nghiệp vụ

```
UPCOMING Project → Reservation (Giữ chỗ) → ACTIVE/YOUR_TURN
                                              ↓
                                        Project OPEN
                                              ↓
                                    Queue Processing
                                              ↓
                                        YOUR_TURN → Deposit
                                              ↓
                                    Booking (Đặt chỗ)
                                              ↓
                                    PENDING_APPROVAL → CONFIRMED
```

---

## 1. ĐÁNH GIÁ NGHIỆP VỤ (BUSINESS LOGIC)

### ✅ Điểm mạnh

#### 1.1. Queue System (Reservations)
- ✅ **Hỗ trợ nhiều CTV giữ chỗ cùng 1 căn** với hệ thống queue (priority-based)
- ✅ **Priority được tính tự động** dựa trên thứ tự đăng ký (priority = existingCount + 1)
- ✅ **Queue processing khi project mở bán** - tự động chuyển ACTIVE → YOUR_TURN cho CTV đầu tiên
- ✅ **Move to next in queue** khi CTV miss deadline hoặc expire

#### 1.2. Status Flow Management
- ✅ **Status workflow rõ ràng:**
  - Reservation: `ACTIVE` → `YOUR_TURN` → `COMPLETED`/`EXPIRED`/`MISSED`/`CANCELLED`
  - Booking: `PENDING_PAYMENT` → `PENDING_APPROVAL` → `CONFIRMED`/`CANCELLED`/`EXPIRED`
- ✅ **Upgrade path:** Reservation có thể upgrade thành Booking
- ✅ **Unit status sync:** Tự động sync unit status dựa trên reservations/bookings (đã cải thiện)

#### 1.3. Expiry & Deadline Management
- ✅ **Auto-expire reservations** (cronjob mỗi giờ)
- ✅ **Process missed turns** (cronjob mỗi 30 phút)
- ✅ **Auto-expire bookings** với configurable duration (default 48h)
- ✅ **reservedUntil** và **depositDeadline** được tính tự động từ config

#### 1.4. Business Rules Validation
- ✅ **Project status check:** Reservation chỉ cho UPCOMING, Booking chỉ cho OPEN
- ✅ **Unit availability check:** Kiểm tra unit status trước khi create
- ✅ **CTV ownership validation:** CTV chỉ có thể cancel/modify reservation/booking của mình
- ✅ **Duplicate prevention:** Ngăn CTV giữ chỗ/đặt chỗ cùng 1 căn nhiều lần

### ⚠️ Điểm cần cải thiện

#### 1.1. Queue Processing Logic
**Vấn đề:**
- ⚠️ **Logic phức tạp và có thể có race condition:**
  - `moveToNextInQueue()` không có transaction protection
  - Queue processing trong `projects.service.ts` có thể chạy song song với user actions
  - Không có lock mechanism khi move to next

**Impact:** Có thể dẫn đến 2 CTV cùng nhận YOUR_TURN hoặc queue bị skip

**Recommendation:**
```typescript
// Sửa moveToNextInQueue để có transaction protection
private async moveToNextInQueue(unitId: string) {
  return await this.prisma.$transaction(
    async (tx) => {
      // Lock unit row
      const unit = await tx.unit.findUnique({
        where: { id: unitId },
        // SELECT FOR UPDATE equivalent
      });
      
      // Check if still needs next (unit might have been booked/deposited)
      if (unit.status !== 'AVAILABLE' && unit.status !== 'RESERVED_BOOKING') {
        return; // Unit already taken
      }
      
      // Find and update next reservation atomically
      const nextReservation = await tx.reservation.findFirst({
        where: {
          unitId,
          status: 'ACTIVE',
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
      });
      
      if (nextReservation) {
        await tx.reservation.update({
          where: { id: nextReservation.id },
          data: { status: 'YOUR_TURN', ... },
        });
      }
    },
    { isolationLevel: 'Serializable' }
  );
}
```

#### 1.2. Expiry Logic
**Vấn đề:**
- ⚠️ **reservedUntil calculation có thể sai:**
  ```typescript
  const reservedUntil =
    currentUnit.project.openDate ||
    new Date(Date.now() + durationHours * 60 * 60 * 1000);
  ```
  - Nếu `openDate` có sẵn, `reservedUntil = openDate` - điều này có thể không đúng vì reservation có thể được tạo trước `openDate` và cần expire khi project mở bán
  - Logic nên là: `reservedUntil = min(openDate, now + durationHours)`

**Recommendation:**
```typescript
const durationMs = durationHours * 60 * 60 * 1000;
const expiryFromNow = new Date(Date.now() + durationMs);
const reservedUntil = currentUnit.project.openDate 
  ? new Date(Math.min(currentUnit.project.openDate.getTime(), expiryFromNow.getTime()))
  : expiryFromNow;
```

#### 1.3. Booking Expiry vs Unit Release
**Vấn đề:**
- ⚠️ **Business rule không rõ ràng:** Booking expire nhưng unit vẫn bị lock bởi booking EXPIRED
- Hiện tại có `cleanup()` method để manual release, nhưng không tự động
- Comment trong code nói "KHÔNG tự động trả unit về AVAILABLE" nhưng không có documentation rõ ràng tại sao

**Recommendation:**
- Document rõ business rule: Booking EXPIRED vẫn lock unit cho đến khi admin cleanup (để review/audit)
- Hoặc: Auto-release sau N giờ (configurable)
- Hoặc: Auto-release ngay khi expire nếu không có active reservations

#### 1.4. Status Transition Validation
**Vấn đề:**
- ⚠️ **Thiếu validation cho status transitions:**
  - Không có validation chặt chẽ cho các transition không hợp lệ
  - Ví dụ: `CANCELLED` → `ACTIVE` có thể xảy ra nếu có bug

**Recommendation:**
```typescript
const VALID_TRANSITIONS = {
  ACTIVE: ['YOUR_TURN', 'EXPIRED', 'CANCELLED', 'COMPLETED'],
  YOUR_TURN: ['COMPLETED', 'MISSED', 'CANCELLED'],
  // ...
};

if (!VALID_TRANSITIONS[currentStatus]?.includes(newStatus)) {
  throw new BadRequestException(`Invalid status transition: ${currentStatus} → ${newStatus}`);
}
```

---

## 2. ĐÁNH GIÁ CODE QUALITY

### ✅ Điểm mạnh

#### 2.1. Transaction Management
- ✅ **Atomic operations:** Hầu hết operations quan trọng đều trong transaction
- ✅ **Isolation levels:** Sử dụng `Serializable` cho critical operations
- ✅ **Retry logic:** Booking creation có retry mechanism (max 3 times)
- ✅ **Error handling:** Proper try-catch với error logging

#### 2.2. Code Organization
- ✅ **Service layer separation:** Business logic tách biệt khỏi controllers
- ✅ **DTO validation:** Sử dụng class-validator cho input validation
- ✅ **Type safety:** TypeScript được sử dụng tốt
- ✅ **Error messages:** Centralized error messages trong `ErrorMessages` constants

#### 2.3. Performance Optimizations
- ✅ **Query optimization:** Sử dụng `QueryOptimizerUtil` để prevent N+1 queries
- ✅ **Pagination:** Hỗ trợ pagination cho list endpoints
- ✅ **Indexes:** Database có indexes phù hợp (composite indexes cho filtering)
- ✅ **Batch processing:** Queue processing có batch size và concurrency control

### ⚠️ Điểm cần cải thiện

#### 2.1. Code Duplication
**Vấn đề:**
- ⚠️ **Duplicate validation logic:**
  - Unit status check được lặp lại nhiều nơi
  - CTV ownership check được duplicate
  - Project status check duplicate

**Recommendation:**
```typescript
// Tạo helper methods
private async validateUnitAvailable(unitId: string, tx?: Prisma.TransactionClient) {
  const client = tx || this.prisma;
  const unit = await client.unit.findUnique({ where: { id: unitId } });
  if (!unit || unit.status !== 'AVAILABLE') {
    throw new BadRequestException(ErrorMessages.UNIT.NOT_AVAILABLE(unit?.status));
  }
  return unit;
}

private async validateCTVOwnership(entityId: string, ctvId: string, entityType: 'RESERVATION' | 'BOOKING') {
  // ...
}
```

#### 2.2. Error Handling
**Vấn đề:**
- ⚠️ **Inconsistent error handling:**
  - Một số nơi catch error và log, một số nơi throw
  - Error messages không consistent
  - Một số operations catch error nhưng không fail operation (syncUnitStatus)

**Recommendation:**
- Standardize error handling pattern
- Create custom exceptions với proper error codes
- Log errors với context (entityId, userId, action)

#### 2.3. Type Safety
**Vấn đề:**
- ⚠️ **Một số nơi dùng `any`:**
  ```typescript
  private async createBookingWithTransaction(
    dto: CreateBookingDto,
    ctvId: string,
    hasValidReservation: boolean,
    _unit: any, // ❌ Should be typed
  )
  ```

**Recommendation:**
- Replace `any` với proper types
- Create interfaces cho complex return types
- Use Prisma generated types

#### 2.4. Comments & Documentation
**Vấn đề:**
- ⚠️ **Thiếu JSDoc comments:**
  - Nhiều methods không có documentation
  - Business rules được comment nhưng không có documentation formal

**Recommendation:**
- Add JSDoc comments cho public methods
- Document business rules trong separate docs
- Add examples trong comments

---

## 3. ĐÁNH GIÁ BACKEND IMPLEMENTATION

### ✅ Điểm mạnh

#### 3.1. API Design
- ✅ **RESTful endpoints:** Endpoints follow REST conventions
- ✅ **HTTP status codes:** Sử dụng đúng status codes (200, 201, 400, 404, 409, 500)
- ✅ **Query parameters:** Support filtering, pagination, sorting
- ✅ **Request validation:** DTO validation với class-validator

#### 3.2. Security
- ✅ **Authentication:** Tất cả endpoints đều có `@UseGuards(JwtAuthGuard)`
- ✅ **Authorization:** CTV chỉ có thể access/modify own entities
- ✅ **Input validation:** DTO validation ngăn invalid data
- ✅ **SQL injection protection:** Prisma ORM prevents SQL injection

#### 3.3. Database Design
- ✅ **Soft delete:** Sử dụng `deletedAt` cho soft delete
- ✅ **Indexes:** Composite indexes cho common queries
- ✅ **Foreign keys:** Proper foreign key constraints
- ✅ **Cascade deletes:** Config đúng cho data integrity

### ⚠️ Điểm cần cải thiện

#### 3.1. Race Condition Protection
**Vấn đề:**
- ⚠️ **Một số operations không có đủ protection:**
  - `moveToNextInQueue()` không có transaction
  - Queue processing có thể conflict với user actions
  - Retry logic trong booking có thể không đủ

**Current implementation:**
```typescript
// ✅ Good: Booking creation có retry
while (attempt < maxRetries) {
  try {
    return await this.prisma.$transaction(...);
  } catch (error) {
    if (error.code === 'P2034' && attempt < maxRetries) {
      await new Promise(resolve => setTimeout(resolve, 50 * Math.pow(2, attempt - 1)));
      continue;
    }
    throw error;
  }
}
```

**Recommendation:**
- Apply similar retry logic cho reservation creation
- Use `SELECT FOR UPDATE` where possible (PostgreSQL)
- Add advisory locks cho queue processing

#### 3.2. Cronjob Reliability
**Vấn đề:**
- ⚠️ **Cronjobs có thể miss hoặc overlap:**
  - `processExpiredReservations()` chạy mỗi giờ - có thể miss nếu server down
  - `processMissedTurns()` chạy mỗi 30 phút - có thể overlap với previous run
  - Không có lock mechanism để prevent concurrent runs

**Recommendation:**
- Use distributed locks (Redis) để prevent concurrent runs
- Add idempotency checks
- Log start/end time để track execution

#### 3.3. Pagination Consistency
**Vấn đề:**
- ⚠️ **Inconsistent pagination response:**
  - Một số endpoints trả về `PaginatedResponse<T>`
  - Một số endpoints trả về array (backward compatibility)
  - Frontend phải handle cả 2 cases

**Current workaround:**
```typescript
// Frontend
const data = Array.isArray(response) ? response : response.items || [];
```

**Recommendation:**
- Standardize all list endpoints to return `PaginatedResponse<T>`
- Deprecate array responses
- Update frontend to expect only paginated responses

---

## 4. ĐÁNH GIÁ FRONTEND IMPLEMENTATION

### ✅ Điểm mạnh

#### 4.1. UI/UX
- ✅ **Loading states:** Có loading indicators
- ✅ **Error handling:** Toast notifications cho errors
- ✅ **Empty states:** Empty state components
- ✅ **Status badges:** Visual status indicators

#### 4.2. Code Organization
- ✅ **Component separation:** Tách biệt components (modals, tables)
- ✅ **API abstraction:** API calls trong separate files
- ✅ **Type safety:** TypeScript được sử dụng
- ✅ **Reusable hooks:** `useFilterRouting` hook

### ⚠️ Điểm cần cải thiện

#### 4.1. Error Handling
**Vấn đề:**
- ⚠️ **Generic error messages:**
  ```typescript
  catch (err: any) {
    showError('Không thể tải danh sách giữ chỗ');
  }
  ```
  - Không hiển thị specific error message từ API
  - Không handle different error types

**Recommendation:**
```typescript
catch (err: any) {
  const errorMessage = err?.response?.data?.message || err?.message || 'Không thể tải danh sách giữ chỗ';
  showError(errorMessage);
  
  // Log full error for debugging
  console.error('Error loading reservations:', err);
}
```

#### 4.2. Real-time Updates
**Vấn đề:**
- ⚠️ **Không có real-time updates:**
  - Status changes không được reflect ngay lập tức
  - User phải refresh để thấy updates
  - Countdown timers không sync với backend

**Recommendation:**
- Implement WebSocket/Polling cho status updates
- Optimistic updates cho user actions
- Sync countdown với backend time

#### 4.3. Form Validation
**Vấn đề:**
- ⚠️ **Validation chỉ ở backend:**
  - Frontend không có validation trước khi submit
  - User phải submit để thấy errors

**Recommendation:**
- Add client-side validation (react-hook-form + zod)
- Show inline errors
- Disable submit button khi invalid

#### 4.4. Data Fetching
**Vấn đề:**
- ⚠️ **Không có caching:**
  - Mỗi lần load lại fetch từ API
  - Không có stale-while-revalidate pattern

**Recommendation:**
- Use React Query hoặc SWR
- Implement caching với proper invalidation
- Background refetch khi tab active

---

## 5. ĐIỂM CẦN CẢI THIỆN TỔNG HỢP

### 🔴 Critical (Cần fix ngay)

1. **Race Condition trong Queue Processing**
   - `moveToNextInQueue()` cần transaction protection
   - Queue processing cần advisory locks

2. **Expiry Logic Bug**
   - `reservedUntil` calculation sai khi có `openDate`
   - Fix logic để `reservedUntil = min(openDate, now + duration)`

3. **Status Transition Validation**
   - Thêm validation cho invalid transitions
   - Prevent invalid status changes

### 🟡 High Priority (Nên fix sớm)

4. **Code Duplication**
   - Extract common validation logic
   - Create helper methods

5. **Error Handling Standardization**
   - Standardize error handling pattern
   - Consistent error messages

6. **Cronjob Reliability**
   - Add distributed locks
   - Idempotency checks

7. **Pagination Standardization**
   - All endpoints return `PaginatedResponse<T>`
   - Remove array response fallback

### 🟢 Medium Priority (Nice to have)

8. **Type Safety**
   - Replace `any` types
   - Better TypeScript types

9. **Documentation**
   - JSDoc comments
   - Business rules documentation

10. **Frontend Improvements**
    - Real-time updates
    - Better error handling
    - Client-side validation
    - Data caching

---

## 6. RECOMMENDATIONS

### 6.1. Short-term (1-2 weeks)

1. ✅ Fix `reservedUntil` calculation bug
2. ✅ Add transaction protection cho `moveToNextInQueue()`
3. ✅ Standardize pagination responses
4. ✅ Improve frontend error handling

### 6.2. Medium-term (1-2 months)

1. ✅ Extract common validation logic
2. ✅ Add status transition validation
3. ✅ Implement distributed locks cho cronjobs
4. ✅ Add client-side validation
5. ✅ Implement data caching (React Query)

### 6.3. Long-term (3+ months)

1. ✅ Real-time updates (WebSocket)
2. ✅ Comprehensive testing (unit + integration)
3. ✅ Performance monitoring
4. ✅ Business rules documentation
5. ✅ API versioning

---

## 7. KẾT LUẬN

### Overall Assessment: **7.5/10**

**Điểm mạnh:**
- ✅ Business logic phức tạp được implement khá tốt
- ✅ Transaction management và race condition protection tốt
- ✅ Database design hợp lý với proper indexes
- ✅ API design RESTful và security tốt

**Điểm yếu:**
- ⚠️ Một số edge cases chưa được handle tốt (queue processing)
- ⚠️ Code duplication và thiếu abstraction
- ⚠️ Frontend thiếu real-time updates và caching
- ⚠️ Documentation chưa đầy đủ

**Priority Actions:**
1. Fix critical bugs (race conditions, expiry logic)
2. Improve code quality (DRY, error handling)
3. Enhance frontend UX (validation, caching, real-time)

**Verdict:** Module có foundation tốt nhưng cần refactoring và improvements để đạt production-ready quality.

---

**Tác giả đánh giá:** AI Assistant  
**Ngày:** 2025-01-XX  
**Version:** 1.0
