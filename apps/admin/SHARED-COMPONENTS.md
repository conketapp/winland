# 📦 Shared Components Guide - Admin Dashboard

## 🎯 Overview

Shared components giúp code **clean, đồng bộ, dễ maintain**. Tất cả forms, modals, và UI elements sử dụng cùng components để đảm bảo consistency.

---

## 📚 Available Shared Components

### 1. **FormField** - Reusable Form Input

**Purpose:** Standardized form input with label, validation, and error display.

**Usage:**
```tsx
import FormField from '@/components/shared/FormField';

<FormField
  label="Tên dự án"
  name="projectName"
  value={name}
  onChange={(value) => setName(value)}
  placeholder="Vinhomes Smart City"
  required
  type="text"
  error={errors.name}
/>
```

**Props:**
- `label` (string) - Field label
- `name` (string) - Input name
- `value` (string | number) - Current value
- `onChange` (function) - Change handler
- `type` (optional) - Input type (text, email, number, tel, date, password)
- `placeholder` (optional) - Placeholder text
- `required` (optional) - Required field
- `disabled` (optional) - Disabled state
- `error` (optional) - Error message
- `step`, `min`, `max` (optional) - For number inputs

---

### 2. **FormSection** - Form Section Wrapper

**Purpose:** Groups related form fields in a Card with title.

**Usage:**
```tsx
import FormSection from '@/components/shared/FormSection';

<FormSection 
  title="Thông tin cơ bản"
  description="Nhập thông tin chung của dự án"
>
  <FormField label="Tên" ... />
  <FormField label="Mã" ... />
</FormSection>
```

**Props:**
- `title` (string) - Section title
- `description` (optional) - Section description
- `children` (ReactNode) - Form fields

---

### 3. **StatusBadge** - Status Display

**Purpose:** Consistent status badges across the app.

**Usage:**
```tsx
import StatusBadge from '@/components/shared/StatusBadge';

<StatusBadge status="OPEN" />  // → "Đang mở bán" (blue)
<StatusBadge status="PENDING_APPROVAL" />  // → "Chờ duyệt" (yellow)
<StatusBadge status="CONFIRMED" />  // → "Đã xác nhận" (green)
```

**Supported Statuses:**
- Project: `OPEN`, `UPCOMING`, `CLOSED`, `DRAFT`
- Unit: `AVAILABLE`, `RESERVED`, `DEPOSITED`, `SOLD`
- Transaction: `PENDING_APPROVAL`, `CONFIRMED`, `CANCELLED`, `EXPIRED`
- Commission: `PENDING`, `APPROVED`, `PAID`

---

### 4. **DetailModal** - Detail View Modal

**Purpose:** Reusable modal for viewing details.

**Usage:**
```tsx
import DetailModal from '@/components/shared/DetailModal';

<DetailModal
  open={isOpen}
  onClose={() => setIsOpen(false)}
  title="Chi tiết Booking"
  description="Thông tin chi tiết phiếu booking"
  footer={
    <>
      <Button onClick={onApprove}>Duyệt</Button>
      <Button variant="destructive" onClick={onReject}>Từ chối</Button>
    </>
  }
>
  <DetailRow label="Mã booking" value={booking.code} />
  <DetailRow label="Căn hộ" value={booking.unit.code} />
</DetailModal>
```

**Props:**
- `open` (boolean) - Modal open state
- `onClose` (function) - Close handler
- `title` (string) - Modal title
- `description` (optional) - Modal description
- `children` (ReactNode) - Modal content
- `footer` (optional) - Modal footer actions

---

### 5. **DetailRow** - Detail Display Row

**Purpose:** Consistent detail row display.

**Usage:**
```tsx
import DetailRow from '@/components/shared/DetailRow';

<dl className="grid grid-cols-2 gap-4">
  <DetailRow label="Mã booking" value="BOK-20251011-001" />
  <DetailRow label="Số tiền" value="10,000,000 VNĐ" />
  <DetailRow 
    label="Mô tả" 
    value="Mô tả dài..."
    fullWidth 
  />
</dl>
```

**Props:**
- `label` (string) - Label text
- `value` (ReactNode) - Value to display
- `fullWidth` (optional) - Span 2 columns

---

### 6. **ActionButtons** - Action Button Group

**Purpose:** Consistent action buttons across tables/cards.

**Usage:**
```tsx
import ActionButtons from '@/components/shared/ActionButtons';

<ActionButtons
  onView={() => handleView(item)}
  onEdit={() => handleEdit(item)}
  onDelete={() => handleDelete(item)}
  viewLabel="Xem chi tiết"
  editLabel="Chỉnh sửa"
  deleteLabel="Xóa"
/>

// For approval workflows
<ActionButtons
  onApprove={() => handleApprove(item)}
  onReject={() => handleReject(item)}
  approveLabel="Duyệt ngay"
  rejectLabel="Từ chối"
/>
```

**Props:**
- `onView`, `onEdit`, `onDelete` (optional) - CRUD actions
- `onApprove`, `onReject` (optional) - Approval actions
- `onDownload` (optional) - Download action
- `*Label` (optional) - Custom labels for buttons

---

## 🔄 Refactoring Existing Pages

### Before (❌ Repetitive Code):
```tsx
// 20 lines of repetitive code
<Card>
  <CardHeader>
    <CardTitle>Thông tin cơ bản</CardTitle>
  </CardHeader>
  <CardContent>
    <div className="space-y-2">
      <label className="text-sm font-medium">Tên dự án *</label>
      <Input value={name} onChange={e => setName(e.target.value)} required />
    </div>
    <div className="space-y-2">
      <label className="text-sm font-medium">Mã dự án *</label>
      <Input value={code} onChange={e => setCode(e.target.value)} required />
    </div>
  </CardContent>
</Card>
```

### After (✅ Clean & Reusable):
```tsx
// 8 lines - 60% less code!
<FormSection title="Thông tin cơ bản">
  <FormField label="Tên dự án" value={name} onChange={setName} required />
  <FormField label="Mã dự án" value={code} onChange={setCode} required />
</FormSection>
```

---

## 📊 Benefits

### 1. **Code Reduction**
- Before: 20+ lines per form field
- After: 3-5 lines per form field
- **Reduction: ~60%**

### 2. **Consistency**
- ✅ All labels same style
- ✅ All inputs same size
- ✅ All errors same format
- ✅ All sections same spacing

### 3. **Maintainability**
- Update FormField → Apply to ALL forms
- Change validation → One place only
- Fix bug → Fix once for all

### 4. **Type Safety**
- TypeScript props
- IntelliSense support
- Compile-time errors

---

## 🎨 Usage in Different Scenarios

### Create Form
```tsx
<FormSection title="Thông tin cơ bản">
  <FormField label="Tên" value={name} onChange={setName} required />
  <FormField label="Email" type="email" value={email} onChange={setEmail} />
</FormSection>
```

### Edit Form (same components!)
```tsx
<FormSection title="Chỉnh sửa thông tin">
  <FormField label="Tên" value={existingName} onChange={setName} />
  <FormField label="Email" value={existingEmail} onChange={setEmail} />
</FormSection>
```

### Detail View
```tsx
<DetailModal open={isOpen} onClose={close} title="Chi tiết">
  <dl className="grid grid-cols-2 gap-4">
    <DetailRow label="Mã" value={item.code} />
    <DetailRow label="Tên" value={item.name} />
    <DetailRow label="Mô tả" value={item.desc} fullWidth />
  </dl>
</DetailModal>
```

### List Actions
```tsx
<ActionButtons
  onView={() => navigate(\`/items/\${id}\`)}
  onEdit={() => navigate(\`/items/\${id}/edit\`)}
  onDelete={() => setDeleteDialog(true)}
/>
```

---

## 🚀 Next Steps

### Apply to All Pages:
- [x] CreateProjectPage.tsx - Using shared components ✅
- [ ] ProjectsPage.tsx - Add ActionButtons
- [ ] BookingsApprovalPage.tsx - Add DetailModal
- [ ] DepositsApprovalPage.tsx - Add DetailModal
- [ ] Future forms - Use FormField + FormSection

### Create More Shared Components:
- [ ] DataTable.tsx - Reusable table
- [ ] FilterBar.tsx - Reusable filter section
- [ ] StatsCard.tsx - Dashboard stat cards
- [ ] FileUpload.tsx - File upload component
- [ ] DatePicker.tsx - Date selection

---

## 📝 Best Practices

### 1. **Always Use Shared Components**
```tsx
// ✅ DO
<FormField label="Name" ... />

// ❌ DON'T
<div><label>Name</label><Input /></div>
```

### 2. **Extend, Don't Duplicate**
```tsx
// ✅ DO - Extend shared component
<FormField label="Special" ... className="custom-class" />

// ❌ DON'T - Copy & modify
<div className="custom-space-y-2">...</div>
```

### 3. **Keep Props Simple**
```tsx
// ✅ DO
<FormField label="Name" value={name} onChange={setName} />

// ❌ DON'T
<FormField 
  config={{ label: "Name", ... }} 
  handlers={{ change: setName }} 
/>
```

---

## ✨ Summary

**Shared Components = Clean Code!**

✅ **60% less code**  
✅ **100% consistency**  
✅ **Easy to update**  
✅ **Type-safe**  
✅ **Well documented**  

**Follow the naming conventions in `NAMING-CONVENTIONS.md`!** 🎯

