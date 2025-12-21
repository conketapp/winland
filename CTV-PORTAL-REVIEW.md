# CTV PORTAL CODE REVIEW

**Ngày review:** 2025-01-XX  
**Scope:** CTV Portal Commissions & Related Features

---

## TỔNG QUAN

CTV Portal sử dụng Next.js API routes (serverless functions) để proxy requests đến database, không gọi trực tiếp backend REST API. Đây là pattern hợp lý cho Next.js app.

---

## 1. VẤN ĐỀ TÌM THẤY

### ⚠️ Issue 1: Missing `deletedAt` filter trong payment-requests/my-summary

**File:** `apps/ctv-portal/app/api/payment-requests/my-summary/route.ts`

**Vấn đề:**
```typescript
// Line 29-36: Không filter deletedAt
const commissions = await prisma.commission.findMany({
  where: { ctvId: user.id },
  include: {
    paymentRequests: true,
    unit: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

**Impact:** Có thể trả về commissions đã bị soft delete

**Recommendation:**
```typescript
const commissions = await prisma.commission.findMany({
  where: { 
    ctvId: user.id,
    deletedAt: null, // ✅ Add this
  },
  include: {
    paymentRequests: true,
    unit: true,
  },
  orderBy: { createdAt: 'desc' },
});
```

### ⚠️ Issue 2: Missing pagination trong commissions route

**File:** `apps/ctv-portal/app/api/commissions/route.ts`

**Vấn đề:**
- Route này trả về tất cả commissions của CTV, không có pagination
- Có thể có performance issues nếu CTV có nhiều commissions

**Recommendation:**
- Thêm pagination params (page, limit)
- Giới hạn default limit (ví dụ: 50)
- Trả về pagination metadata

### ⚠️ Issue 3: Summary calculation duplicate logic

**File:** `apps/ctv-portal/app/api/payment-requests/my-summary/route.ts`

**Vấn đề:**
- Đang tính summary manually (lines 38-64)
- Logic này đã có trong backend CommissionsService.getMySummary()
- Tuy nhiên, vì CTV portal dùng Next.js API routes, không phải backend API, nên có thể chấp nhận được

**Note:** Nếu muốn consistency, có thể:
- Option 1: Gọi backend API `/api/commissions/my-summary` (nhưng cần JWT token)
- Option 2: Giữ nguyên nhưng đảm bảo logic giống nhau
- **Recommendation:** Option 2 (vì CTV portal pattern là direct DB access)

### ✅ Issue 4: Commission route đã được fix (OK)

**File:** `apps/ctv-portal/app/api/commissions/route.ts`

- ✅ Đã sử dụng Commission table thay vì tính từ deposits
- ✅ Đã có `deletedAt: null` filter
- ✅ Trả về đúng format với calculationBase, basePrice, etc.

---

## 2. CẢI THIỆN ĐỀ XUẤT

### 2.1. Add pagination cho commissions route

```typescript
// apps/ctv-portal/app/api/commissions/route.ts
export async function GET(request: NextRequest) {
  // ... existing code ...
  
  const page = parseInt(request.nextUrl.searchParams.get('page') || '1');
  const limit = parseInt(request.nextUrl.searchParams.get('limit') || '50');
  const skip = (page - 1) * limit;
  
  const [commissions, total] = await Promise.all([
    prisma.commission.findMany({
      where: {
        ctvId: user.id,
        deletedAt: null,
      },
      // ... include ...
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit,
    }),
    prisma.commission.count({
      where: {
        ctvId: user.id,
        deletedAt: null,
      },
    }),
  ]);
  
  return NextResponse.json({
    commissions: formattedCommissions,
    summary: { ... },
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
  });
}
```

### 2.2. Frontend pagination cho commissions page

- Commissions page hiện tại không có pagination UI
- Có thể thêm nếu cần (khi CTV có nhiều commissions)

---

## 3. KẾT LUẬN

### Vấn đề cần fix ngay:

1. **Add `deletedAt: null` filter trong payment-requests/my-summary route**
   - Priority: High
   - Impact: Data consistency

### Vấn đề nên cải thiện (Medium Priority):

2. **Add pagination cho commissions route**
   - Priority: Medium
   - Impact: Performance khi có nhiều commissions

### Đã OK:

- ✅ Commission route đã được fix đúng
- ✅ Data format consistent
- ✅ Sử dụng Commission table thay vì hardcoded calculation

---

## 4. RECOMMENDATIONS

### Immediate Fix:
1. Fix `deletedAt` filter trong `payment-requests/my-summary/route.ts`

### Future Improvements:
1. Add pagination cho commissions route nếu cần
2. Consider caching nếu performance trở thành vấn đề
3. Consider using backend API thay vì direct DB access nếu cần centralized logic
