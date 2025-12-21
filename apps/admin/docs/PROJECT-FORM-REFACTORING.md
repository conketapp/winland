# Project Form Refactoring - Code Duplication Fix

**Ngày:** December 2024  
**Module:** Projects Pages (Admin)  
**Feature:** Shared Form Logic và Components

---

## 📋 Vấn Đề Ban Đầu

### Code Duplication:

**CreateProjectPage.tsx:** ~307 lines  
**EditProjectPage.tsx:** ~387 lines

**Duplicated Code:**
- ✅ Form structure (100% giống nhau)
- ✅ Validation logic (100% giống nhau)
- ✅ `normalizeOptionalNumber()` function
- ✅ `handleChange()` logic
- ✅ Form fields JSX (100% giống nhau)

**Hạn chế:**
- ❌ Maintenance nightmare - fix bug ở 2 nơi
- ❌ Inconsistency risk - có thể update 1 nơi quên nơi kia
- ❌ Code bloat - ~700 lines total cho 2 pages
- ❌ Testing khó khăn - phải test 2 nơi

---

## ✅ Giải Pháp

### 1. Custom Hook: `useProjectForm`

**File:** `apps/admin/src/hooks/useProjectForm.ts`

**Features:**
- ✅ Form state management
- ✅ Validation logic
- ✅ Error handling
- ✅ Payload preparation
- ✅ Reusable across Create/Edit

**API:**
```typescript
const {
  formData,      // Form state
  errors,        // Validation errors
  validate,      // Validate function
  handleChange,  // Change handler
  preparePayload, // Prepare API payload
  reset,         // Reset form
  setFormData,   // Set form data (for loading)
} = useProjectForm(initialData?);
```

### 2. Shared Component: `ProjectFormFields`

**File:** `apps/admin/src/components/projects/ProjectFormFields.tsx`

**Features:**
- ✅ All form fields in one component
- ✅ Consistent structure
- ✅ Reusable JSX

**Props:**
```typescript
interface ProjectFormFieldsProps {
  formData: ProjectFormData;
  errors: Record<string, string>;
  onChange: (field: keyof ProjectFormData, value: any) => void;
}
```

---

## 📊 Code Reduction

### Before:

| File | Lines | Duplicated |
|------|-------|------------|
| CreateProjectPage.tsx | 307 | ~250 |
| EditProjectPage.tsx | 387 | ~250 |
| **Total** | **694** | **~500** |

### After:

| File | Lines | Notes |
|------|-------|-------|
| CreateProjectPage.tsx | ~60 | Reduced 80% |
| EditProjectPage.tsx | ~100 | Reduced 74% |
| useProjectForm.ts | ~150 | New shared hook |
| ProjectFormFields.tsx | ~180 | New shared component |
| **Total** | **~490** | **Reduced 29%** |

**Duplication:** 0% (tất cả logic shared)

---

## 🔄 Refactored Code

### CreateProjectPage (Before → After):

**Before:** 307 lines
```typescript
// Form state, validation, handlers, JSX all in one file
const [formData, setFormData] = useState({...});
const validate = () => { /* 40 lines */ };
const handleChange = () => { /* ... */ };
// ... 200+ lines of JSX
```

**After:** ~60 lines
```typescript
const { formData, errors, validate, handleChange, preparePayload } = useProjectForm();

const handleSubmit = async (e) => {
  if (!validate()) return;
  const payload = preparePayload();
  await projectsApi.create(payload);
};

return (
  <form>
    <ProjectFormFields {...props} />
    <Button>Submit</Button>
  </form>
);
```

### EditProjectPage (Before → After):

**Before:** 387 lines
```typescript
// Similar duplication
```

**After:** ~100 lines
```typescript
const { formData, errors, validate, handleChange, preparePayload, setFormData } = useProjectForm();

// Load project data
useEffect(() => {
  const project = await projectsApi.getById(projectId);
  setFormData({...project});
}, [projectId]);

// Same form structure
```

---

## 🎯 Benefits

### 1. Maintainability
- ✅ **Single source of truth** - Fix bug ở 1 nơi
- ✅ **Consistent behavior** - Create và Edit giống nhau
- ✅ **Easier updates** - Update form structure ở 1 nơi

### 2. Code Quality
- ✅ **DRY principle** - Don't Repeat Yourself
- ✅ **Separation of concerns** - Logic vs UI
- ✅ **Reusability** - Hook có thể dùng cho forms khác

### 3. Testing
- ✅ **Test hook once** - Logic testing
- ✅ **Test component once** - UI testing
- ✅ **Less test code** - Không cần test duplicate logic

### 4. Developer Experience
- ✅ **Faster development** - Tạo form mới nhanh hơn
- ✅ **Less bugs** - Ít code = ít bugs
- ✅ **Better readability** - Code ngắn gọn hơn

---

## 📝 Usage Examples

### Create Project:

```typescript
import { useProjectForm } from '../../hooks/useProjectForm';
import ProjectFormFields from '../../components/projects/ProjectFormFields';

function CreateProjectPage() {
  const { formData, errors, validate, handleChange, preparePayload } = useProjectForm();
  
  const handleSubmit = async (e) => {
    if (!validate()) return;
    await projectsApi.create(preparePayload());
  };
  
  return (
    <form onSubmit={handleSubmit}>
      <ProjectFormFields
        formData={formData}
        errors={errors}
        onChange={handleChange}
      />
    </form>
  );
}
```

### Edit Project:

```typescript
function EditProjectPage() {
  const { formData, errors, validate, handleChange, preparePayload, setFormData } = useProjectForm();
  
  useEffect(() => {
    const project = await projectsApi.getById(id);
    setFormData({...project});
  }, [id]);
  
  // Same form structure
}
```

---

## 🔍 Hook API Details

### `useProjectForm(initialData?)`

**Returns:**
```typescript
{
  formData: ProjectFormData;        // Current form state
  errors: Record<string, string>;    // Validation errors
  validate: () => boolean;          // Validate form
  handleChange: (field, value) => void; // Handle field change
  preparePayload: () => CreateProjectDto; // Prepare API payload
  reset: (data?) => void;           // Reset form
  setFormData: (data) => void;      // Set form data
}
```

### Methods:

**`validate()`:**
- Validates all fields
- Returns `true` if valid, `false` otherwise
- Sets errors in state

**`handleChange(field, value)`:**
- Updates form field
- Clears error for that field

**`preparePayload()`:**
- Normalizes numbers (0 → undefined)
- Uppercases code
- Returns ready-to-send payload

**`reset(data?)`:**
- Resets form to initial state
- Optionally with new data

---

## 🎨 Component API Details

### `ProjectFormFields`

**Props:**
```typescript
{
  formData: ProjectFormData;
  errors: Record<string, string>;
  onChange: (field: keyof ProjectFormData, value: any) => void;
}
```

**Renders:**
- Basic Info section (name, code, developer, description)
- Location section (address, district, city, location)
- Project Details section (buildings, units, prices, commission)

---

## 📚 Related Files

### New Files:
- `apps/admin/src/hooks/useProjectForm.ts` - Shared hook
- `apps/admin/src/components/projects/ProjectFormFields.tsx` - Shared component

### Updated Files:
- `apps/admin/src/pages/projects/CreateProjectPage.tsx` - Refactored
- `apps/admin/src/pages/projects/EditProjectPage.tsx` - Refactored

---

## ✅ Summary

### Before:
- ❌ 694 lines total
- ❌ ~500 lines duplicated
- ❌ Maintenance nightmare
- ❌ Inconsistency risk

### After:
- ✅ ~490 lines total (29% reduction)
- ✅ 0% duplication
- ✅ Single source of truth
- ✅ Consistent behavior
- ✅ Easier maintenance
- ✅ Better testability

**Result:** Clean, maintainable, DRY code! 🎉

---

## 🚀 Future Improvements

### 1. Extend to Other Forms

**Apply pattern to:**
- Unit forms (CreateUnitPage, EditUnitPage)
- Other entity forms

**Pattern:**
```typescript
// Create hook
useUnitForm()
useBookingForm()
// etc.

// Create component
UnitFormFields
BookingFormFields
// etc.
```

### 2. Form Library Integration

**Consider:**
- React Hook Form for better form management
- Zod for schema validation
- Formik as alternative

**Benefits:**
- Better validation
- Better performance
- Less boilerplate

### 3. Generic Form Hook

**Create:**
```typescript
function useForm<T>(schema: ZodSchema<T>) {
  // Generic form hook
  // Works with any form type
}
```

---

**Last Updated:** December 2024
