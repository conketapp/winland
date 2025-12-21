# Project Status Change Validation Improvement

**Ngày:** December 2024  
**Module:** Projects  
**Feature:** Enhanced validation for OPEN status change

---

## 📋 Vấn Đề Ban Đầu

### Vấn đề:
```typescript
// ❌ Chỉ check có units, không check status của units
if (newStatus === ProjectStatus.OPEN) {
  if (!project.units || project.units.length === 0) {
    throw new BadRequestException('Dự án chưa có căn, không thể mở bán');
  }
}
```

**Hạn chế:**
- ❌ Không check status của units
- ❌ Có thể mở bán dù không có unit AVAILABLE
- ❌ Queue processing sẽ không có gì để process
- ❌ User experience kém (mở bán nhưng không có gì để bán)

**Ví dụ vấn đề:**
- Project có 100 units nhưng tất cả đều là `DEPOSITED` hoặc `SOLD`
- Validation pass (vì có units)
- Nhưng không có unit nào để bán
- Queue processing chạy nhưng không process được gì

---

## ✅ Giải Pháp

### Enhanced Validation:

**Before:**
```typescript
// Business rule: When opening, project must have at least 1 unit
if (newStatus === ProjectStatus.OPEN) {
  if (!project.units || project.units.length === 0) {
    throw new BadRequestException('Dự án chưa có căn, không thể mở bán');
  }
}
```

**After:**
```typescript
// Business rule: When opening, project must have at least 1 AVAILABLE unit
if (newStatus === ProjectStatus.OPEN) {
  if (!project.units || project.units.length === 0) {
    throw new BadRequestException('Dự án chưa có căn, không thể mở bán');
  }

  // Check if there's at least 1 AVAILABLE unit
  const availableUnits = project.units.filter((unit) => unit.status === 'AVAILABLE');
  if (availableUnits.length === 0) {
    const unitStatusCounts = project.units.reduce((acc, unit) => {
      acc[unit.status] = (acc[unit.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusSummary = Object.entries(unitStatusCounts)
      .map(([status, count]) => `${status}: ${count}`)
      .join(', ');

    throw new BadRequestException(
      `Dự án không có căn AVAILABLE để mở bán. ` +
      `Tổng số căn: ${project.units.length}. ` +
      `Trạng thái: ${statusSummary}. ` +
      `Vui lòng thêm căn AVAILABLE trước khi mở bán.`
    );
  }
}
```

---

## 🎯 Improvements

### 1. Status Check
- ✅ **Check AVAILABLE units** - Đảm bảo có ít nhất 1 unit AVAILABLE
- ✅ **Prevent invalid state** - Không cho mở bán khi không có gì để bán
- ✅ **Better error message** - Thông báo rõ ràng về vấn đề

### 2. Error Message
**Before:**
```
"Dự án chưa có căn, không thể mở bán"
```

**After:**
```
"Dự án không có căn AVAILABLE để mở bán. 
Tổng số căn: 100. 
Trạng thái: DEPOSITED: 50, SOLD: 50. 
Vui lòng thêm căn AVAILABLE trước khi mở bán."
```

**Benefits:**
- ✅ **Informative** - Cho biết tổng số căn và phân bổ status
- ✅ **Actionable** - Hướng dẫn user phải làm gì
- ✅ **Debugging friendly** - Dễ debug khi có vấn đề

### 3. Business Logic
- ✅ **Prevent empty queue processing** - Không process queue khi không có unit AVAILABLE
- ✅ **Better UX** - User biết rõ tại sao không thể mở bán
- ✅ **Data integrity** - Đảm bảo project OPEN luôn có unit để bán

---

## 📊 Unit Statuses

### Available Statuses:
```typescript
enum UnitStatus {
  AVAILABLE           // Căn có sẵn để bán
  RESERVED_BOOKING    // Đã được đặt chỗ
  DEPOSITED           // Đã đặt cọc
  SOLD                // Đã bán
}
```

### Validation Logic:
- ✅ **OPEN status requires:** At least 1 unit with status `AVAILABLE`
- ✅ **All other statuses:** Can be any status (DEPOSITED, SOLD, etc.)
- ✅ **Empty project:** Cannot open (no units at all)

---

## 🔍 Example Scenarios

### Scenario 1: Valid - Has AVAILABLE Units
```
Project: Vinhomes Smart City
Units: 100 total
  - AVAILABLE: 80
  - DEPOSITED: 15
  - SOLD: 5

Result: ✅ Can open (has 80 AVAILABLE units)
```

### Scenario 2: Invalid - No AVAILABLE Units
```
Project: Vinhomes Smart City
Units: 100 total
  - DEPOSITED: 50
  - SOLD: 50
  - AVAILABLE: 0

Result: ❌ Cannot open
Error: "Dự án không có căn AVAILABLE để mở bán. 
       Tổng số căn: 100. 
       Trạng thái: DEPOSITED: 50, SOLD: 50. 
       Vui lòng thêm căn AVAILABLE trước khi mở bán."
```

### Scenario 3: Invalid - No Units
```
Project: Vinhomes Smart City
Units: 0 total

Result: ❌ Cannot open
Error: "Dự án chưa có căn, không thể mở bán"
```

### Scenario 4: Valid - All AVAILABLE
```
Project: Vinhomes Smart City
Units: 100 total
  - AVAILABLE: 100

Result: ✅ Can open (all units AVAILABLE)
```

---

## 📝 Code Changes

### File: `apps/backend/src/modules/projects/projects.service.ts`

**Method:** `changeStatus(id: string, newStatus: ProjectStatus)`

**Changes:**
1. ✅ Added filter for AVAILABLE units
2. ✅ Added status count calculation
3. ✅ Enhanced error message with status breakdown
4. ✅ Better validation logic

---

## ✅ Summary

### Before:
- ❌ Only check if units exist
- ❌ No status validation
- ❌ Can open project with no AVAILABLE units
- ❌ Generic error message
- ❌ Queue processing may run with nothing to process

### After:
- ✅ Check if AVAILABLE units exist
- ✅ Status validation before opening
- ✅ Cannot open without AVAILABLE units
- ✅ Detailed error message with status breakdown
- ✅ Queue processing only runs when there are units to process
- ✅ Better user experience
- ✅ Better debugging information

**Result:** Robust validation ensuring project can only open when there are units available to sell! 🎉

---

## 🚀 Related Features

### Queue Processing:
- Queue processing only processes `AVAILABLE` units
- This validation ensures queue processing has units to work with
- Prevents unnecessary queue processing runs

### Business Logic:
- Aligns with business requirement: "Can only open project if there are units to sell"
- Prevents invalid business states
- Ensures data integrity

---

**Last Updated:** December 2024
