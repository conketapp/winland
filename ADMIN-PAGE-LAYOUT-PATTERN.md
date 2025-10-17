# 📐 Admin Page Layout Pattern - Standardized

## ✅ Standard Pattern cho TẤT CẢ Pages trong DashboardLayout

### 🎯 **Consistent Wrapper:**

```tsx
export default function YourPage() {
  return (
    <div className="p-6 space-y-6">
      {/* Back button (optional) */}
      {hasBackButton && (
        <Button variant="ghost" onClick={goBack}>
          <ArrowLeft className="w-4 h-4" />
          Quay lại
        </Button>
      )}

      {/* Page Header - ALWAYS use PageHeader component */}
      <PageHeader
        title="Page Title"
        description="Page description"
        action={{
          label: 'Action',
          onClick: handleAction,
          icon: <Plus className="w-5 h-5" />
        }}
      />

      {/* Page Content */}
      <div>
        {/* Your content here */}
      </div>
    </div>
  );
}
```

---

## ✅ Applied to All Pages:

### 1. **List Pages** (Projects, Bookings, Deposits)
```tsx
<div className="p-6 space-y-6">
  <PageHeader title="..." description="..." action={{...}} />
  <Card>{/* Filters */}</Card>
  <div>{/* List items */}</div>
</div>
```

### 2. **Form Pages** (Create/Edit)
```tsx
<div className="p-6 space-y-6">
  <Button variant="ghost" onClick={goBack}>Quay lại</Button>
  <PageHeader title="..." description="..." />
  <div className="max-w-4xl">
    <form>{/* Form sections */}</form>
  </div>
</div>
```

### 3. **Dashboard Page**
```tsx
<div className="p-6 space-y-6">
  <PageHeader title="Dashboard" description="..." />
  <div className="grid grid-cols-4 gap-4">{/* Stats */}</div>
  <div>{/* Quick actions */}</div>
</div>
```

---

## 🎨 Spacing System:

```
DashboardLayout (Outlet)
  ↓
  Page Wrapper: p-6 space-y-6
    ├─ Back Button (optional)
    ├─ PageHeader (required)
    └─ Content (space-y-6 nếu nhiều sections)
```

### **Standard Spacing:**
- Page wrapper: `p-6` (padding around)
- Between sections: `space-y-6` (vertical spacing)
- Form max width: `max-w-4xl` (readable width)
- Grid gaps: `gap-4` hoặc `gap-6`

---

## ❌ BAD Examples (Không đồng bộ):

```tsx
// ❌ Thiếu p-6
<div className="space-y-6">
  <PageHeader />
</div>

// ❌ Dùng custom wrapper
<div className="min-h-screen bg-gray-50 p-6">
  <div className="max-w-4xl mx-auto">
    <h1>Title</h1>
  </div>
</div>

// ❌ Không dùng PageHeader component
<div className="p-6">
  <h1 className="text-3xl font-bold">Title</h1>
  <p className="text-gray-600">Description</p>
</div>
```

---

## ✅ GOOD Examples (Đồng bộ):

```tsx
// ✅ List page
<div className="p-6 space-y-6">
  <PageHeader title="..." />
  <Card>{/* Content */}</Card>
</div>

// ✅ Form page
<div className="p-6 space-y-6">
  <Button variant="ghost" onClick={goBack}>
    <ArrowLeft /> Quay lại
  </Button>
  <PageHeader title="..." />
  <form>{/* Fields */}</form>
</div>

// ✅ Detail page
<div className="p-6 space-y-6">
  <PageHeader title="..." />
  <Card>{/* Details */}</Card>
</div>
```

---

## 📋 Checklist for All Pages:

- [ ] Wrapper: `<div className="p-6 space-y-6">`
- [ ] PageHeader: Always use component (not custom `<h1>`)
- [ ] Back button: Use ghost Button with ArrowLeft icon
- [ ] Sections: Use Card or FormSection
- [ ] Actions: Use shadcn Button
- [ ] Badges: Use shadcn Badge or StatusBadge
- [ ] Consistent spacing: space-y-6 between sections

---

## 🎯 Summary:

**Pattern:** `p-6 space-y-6` wrapper cho TẤT CẢ pages  
**Components:** PageHeader, FormSection, Card, Button  
**Result:** Layout đồng bộ 100%, spacing nhất quán!

✅ Apply pattern này cho ALL pages = Perfect consistency! 🎨

