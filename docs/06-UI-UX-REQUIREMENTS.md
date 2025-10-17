# UI/UX Requirements

## 📋 Thông tin tài liệu

**Dự án:** Batdongsan Platform  
**Phiên bản:** 1.0  
**Ngày tạo:** October 2025

## 1. Design Principles

### 1.1 Core Principles
1. **Mobile-First**: CTV Portal ưu tiên mobile (90% usage)
2. **Simplicity**: Giao diện đơn giản, dễ hiểu
3. **Consistency**: Nhất quán trong toàn bộ hệ thống
4. **Touch-Friendly**: Buttons, inputs tối ưu cho touch
5. **Performance**: Nhanh, mượt mà trên 3G/4G
6. **Offline-Ready**: Cache data, work offline (future PWA)

### 1.2 Design System
- **UI Library**: shadcn/ui (primary), Preline UI (filters/selects)
- **CSS Framework**: Tailwind CSS v3
- **Icons**: Lucide React
- **Fonts**: Inter (default), sans-serif
- **Color Scheme**: Professional, modern
- **Mobile Framework**: React (responsive) → PWA (Phase 2) → Native App (Phase 3)

### 1.3 Device Strategy

**CTV Portal:**
- **Primary:** Mobile (iPhone, Android)
- **Secondary:** Tablet (iPad)
- **Tertiary:** Desktop (occasional)
- **Approach:** Mobile-FIRST design, progressive enhancement

**Admin Panel:**
- **Primary:** Desktop/Laptop
- **Secondary:** Tablet
- **Not optimized:** Mobile (admin ít dùng mobile)

**Client Website:**
- **Universal:** All devices equally

## 2. Color Palette

### Primary Colors
```css
--primary: 217 91% 60% (Blue)
--primary-foreground: 210 40% 98%
```

### Secondary Colors
```css
--secondary: 210 40% 96.1%
--secondary-foreground: 222.2 47.4% 11.2%
```

### Semantic Colors
```css
--destructive: 0 84.2% 60.2% (Red)
--muted: 210 40% 96.1% (Gray)
--accent: 210 40% 96.1%
```

### Usage
- Primary: CTAs, links, active states
- Secondary: Backgrounds, cards
- Destructive: Errors, delete actions
- Muted: Disabled states, secondary text

## 3. Typography

### Font Families
- **Primary**: Inter (body, headings)
- **Fallback**: system-ui, sans-serif

### Scale
```
- Heading 1: 3rem (48px), font-weight: 700
- Heading 2: 2.25rem (36px), font-weight: 700
- Heading 3: 1.875rem (30px), font-weight: 600
- Heading 4: 1.5rem (24px), font-weight: 600
- Body: 1rem (16px), font-weight: 400
- Small: 0.875rem (14px)
- Tiny: 0.75rem (12px)
```

## 4. Layout & Spacing

### Container
- Max-width: 1400px (2xl)
- Padding: 2rem (32px) desktop, 1rem (16px) mobile

### Spacing Scale (Tailwind)
- xs: 0.25rem (4px)
- sm: 0.5rem (8px)
- md: 1rem (16px)
- lg: 1.5rem (24px)
- xl: 2rem (32px)
- 2xl: 3rem (48px)

### Grid
- Desktop: 12-column grid
- Tablet: 8-column grid
- Mobile: 4-column grid

## 5. Components Standards

### 5.1 Buttons

**Primary Button**
- Background: primary color
- Text: white
- Hover: darker shade
- Padding: 0.5rem 1rem (py-2 px-4)
- Border-radius: 0.5rem (rounded-lg)

**Secondary Button**
- Background: transparent
- Border: 1px solid primary
- Text: primary color
- Hover: light primary background

**Destructive Button**
- Background: destructive color
- Text: white

### 5.2 Forms

**Input Fields**
- Height: 2.5rem (40px)
- Border: 1px solid border color
- Border-radius: 0.5rem
- Focus: 2px ring primary color
- Padding: 0.5rem 0.75rem

**Labels**
- Font-size: 0.875rem (14px)
- Font-weight: 500
- Margin-bottom: 0.5rem

**Error Messages**
- Color: destructive
- Font-size: 0.875rem
- Display below field

### 5.3 Cards

**Property Card**
- Border: 1px solid border
- Border-radius: 0.75rem (rounded-xl)
- Padding: 1rem
- Shadow: subtle shadow
- Hover: elevated shadow

**Structure:**
```
┌──────────────────────┐
│   Thumbnail Image    │
│   (16:9 ratio)       │
├──────────────────────┤
│ Badge (Type)         │
│ Title                │
│ Price (Highlighted)  │
│ Area • Bedrooms      │
│ Location             │
└──────────────────────┘
```

### 5.4 Loading States

**Skeleton Loaders**
- Use for cards, lists
- Animated shimmer effect
- Same dimensions as content

**Spinners**
- Center of container
- Primary color
- Size: 2rem (32px)

### 5.5 Empty States

**Structure:**
- Icon (large, muted)
- Title (heading)
- Description (muted text)
- Action button (optional)

**Example:**
```
    [Icon]
   "Chưa có dữ liệu"
 "Thêm mới để bắt đầu"
    [Button]
```

## 6. Page Layouts

### 6.1 Admin Panel Layout

```
┌────────────────────────────────────┐
│           Header (sticky)           │
├─────────┬──────────────────────────┤
│         │                          │
│ Sidebar │      Main Content        │
│ (fixed) │      (scrollable)        │
│         │                          │
│         │                          │
└─────────┴──────────────────────────┘
```

**Sidebar:**
- Width: 16rem (256px)
- Background: white
- Border-right: 1px
- Navigation items with icons

**Header:**
- Height: 4rem (64px)
- Background: white
- Border-bottom: 1px
- Title + Actions

### 6.2 Client Layout

```
┌────────────────────────────────────┐
│     Header (sticky, transparent)    │
├────────────────────────────────────┤
│                                    │
│          Main Content              │
│          (scrollable)              │
│                                    │
├────────────────────────────────────┤
│            Footer                  │
└────────────────────────────────────┘
```

**Header:**
- Background: white/95 with backdrop blur
- Logo + Navigation + Auth buttons

**Footer:**
- Background: gray-50
- Links, contact info, copyright

## 7. Responsive Breakpoints

```css
/* Mobile First - CTV Portal Priority */
xs: 375px   /* iPhone SE, small phones */
sm: 640px   /* Mobile landscape, small tablet */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
2xl: 1536px /* Extra large */
```

### CTV Portal - Mobile-First Design

**Mobile (< 640px) - PRIMARY:**
- ✅ Single column layout
- ✅ **Bottom navigation bar** (5 tabs max)
  - 🏠 Dashboard
  - 🔍 Tìm căn
  - 📋 Phiếu của tôi
  - 💰 Hoa hồng
  - 👤 Profile
- ✅ Full-width cards
- ✅ Touch targets: Min 44×44px (Apple guideline)
- ✅ Swipe gestures:
  - Swipe right: Back
  - Pull down: Refresh
- ✅ Sticky header (collapse on scroll)
- ✅ FAB (Floating Action Button) cho quick actions
- ✅ Native-like transitions
- ✅ Camera access (upload chứng từ)
- ✅ Auto-save form (prevent data loss)

**Tablet (640px - 1024px):**
- 2-column grid
- Sidebar drawer (collapsible)
- Optimized touch targets

**Desktop (> 1024px):**
- 3-column grid
- Fixed sidebar
- Hover effects

### Admin Panel - Desktop-First

**Desktop (> 1024px) - PRIMARY:**
- Multi-column layout
- Fixed sidebar
- Data tables
- Hover tooltips

**Tablet/Mobile:**
- Responsive fallback
- Limited usage expected

## 8. Interactions & Animations

### 8.1 Transitions
- Duration: 200ms (fast), 300ms (normal)
- Easing: ease-in-out
- Properties: colors, transform, opacity

```css
transition: all 0.2s ease-in-out;
```

### 8.2 Hover Effects
- Cards: elevation + border color
- Buttons: darker shade
- Links: underline + color change

### 8.3 Loading Animations
- Skeleton: shimmer effect
- Spinners: rotate animation
- Progress bars: indeterminate

## 9. Accessibility (A11y)

### 9.1 Requirements
- WCAG 2.1 Level AA compliance
- Keyboard navigation support
- Screen reader compatible
- Color contrast ratio ≥ 4.5:1

### 9.2 Implementation
- Semantic HTML
- ARIA labels
- Focus indicators
- Alt text for images
- Skip to content link

## 10. Specific Page Designs

### 10.1 Home Page (Client)

**Hero Section:**
- Full-width background gradient
- Large heading
- Search bar (prominent)
- Quick filters/keywords

**Featured Properties:**
- Grid: 3 columns (desktop), 1 column (mobile)
- Show 6 properties
- "Xem tất cả" link

**Categories:**
- Grid: 4 columns
- Icon + name + count
- Clickable cards

**Stats:**
- 4 stat cards
- Icon + number + label

### 10.2 Property List Page

**Layout:**
```
┌────────────┬─────────────────────────┐
│            │  Sort + View options    │
│  Filters   ├─────────────────────────┤
│  Sidebar   │                         │
│            │    Property Grid        │
│            │                         │
│            │                         │
│            ├─────────────────────────┤
│            │      Pagination         │
└────────────┴─────────────────────────┘
```

**Filters:**
- Collapsible sections
- Preline select components
- Price/Area sliders
- Apply + Reset buttons

### 10.3 Property Detail Page

**Layout:**
```
┌────────────────────────────────────┐
│        Breadcrumb                  │
├────────────────────────────────────┤
│                                    │
│       Image Gallery (Carousel)     │
│                                    │
├─────────────────┬──────────────────┤
│                 │                  │
│ Main Info       │  Agent Card      │
│ - Title         │  - Avatar        │
│ - Price         │  - Name          │
│ - Description   │  - Phone         │
│ - Details       │  - Contact btn   │
│ - Amenities     │                  │
│ - Location      │  Action Buttons  │
│                 │  - Favorite      │
│                 │  - Share         │
│                 │                  │
├─────────────────┴──────────────────┤
│     Related Properties             │
└────────────────────────────────────┘
```

### 10.4 Admin Dashboard

**Stats Cards:**
- Grid: 4 columns
- Icon + number + label + change

**Charts:**
- Pie chart: properties by type
- Bar chart: properties by status

**Tables:**
- Recent properties (5 items)
- Quick actions column

## 11. UI Component Library

### Must-Have Components
- [x] Button (primary, secondary, destructive)
- [x] Input (text, email, password, number)
- [x] Select (Preline UI)
- [x] Textarea
- [x] Checkbox
- [x] Radio
- [x] Card
- [x] Badge
- [x] Dialog/Modal
- [x] Toast/Notification (Sonner)
- [x] Loading State
- [x] Empty State
- [x] Pagination
- [x] Breadcrumb
- [x] Tabs
- [ ] Dropdown Menu
- [ ] Tooltip
- [ ] Slider (Range)
- [ ] Date Picker (future)

## 12. Design Mockups & Prototypes

### Tools
- Figma (recommended)
- Adobe XD
- Sketch

### Deliverables
- Wireframes (low-fidelity)
- Mockups (high-fidelity)
- Prototype (interactive)
- Design system documentation

---

**Document Version:** 1.0  
**Status:** Draft  
**Last Updated:** October 2025

