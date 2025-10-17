# CTV Mobile UX Specifications

## 📱 Tại sao Mobile-First?

**Reality:** 90% CTV làm việc trên mobile
- Đi xem căn → Dùng phone
- Gặp khách → Show info trên phone
- Upload chứng từ → Chụp bằng camera phone
- Nhận notification → Push on phone

**Requirement:** CTV Portal phải **tối ưu cho mobile**, desktop là secondary.

---

## 🎨 Mobile UI Design

### Bottom Navigation (Sticky)

```
┌─────────────────────────────────────┐
│                                     │
│         [Content Area]              │
│                                     │
│                                     │
├─────────────────────────────────────┤
│ 🏠     🔍     📋     💰     👤      │
│ Home  Tìm   Phiếu   HH   Profile   │
└─────────────────────────────────────┘
```

**5 Tabs chính:**
1. **Dashboard** (🏠) - Tổng quan, stats, notifications
2. **Tìm căn** (🔍) - Search & filter units
3. **Phiếu của tôi** (📋) - Reservations, Bookings, Deposits
4. **Hoa hồng** (💰) - Commissions, payment requests
5. **Profile** (👤) - Account settings

---

### Dashboard Mobile

```
┌─────────────────────────────────────┐
│ ☰  Dashboard           🔔(3)        │ ← Sticky header
├─────────────────────────────────────┤
│                                     │
│ Xin chào, Nguyễn Văn A              │
│                                     │
│ ┌────────┬────────┬────────┐       │
│ │Giữ chỗ │Booking │ Đã cọc │       │
│ │   3    │   2    │   1    │       │ ← Swipeable cards
│ └────────┴────────┴────────┘       │
│                                     │
│ Giữ chỗ sắp hết hạn (2)             │
│ ┌─────────────────────────────────┐ │
│ │ 🏠 A1-08-05                     │ │
│ │ 2PN • 75m² • 2.5 tỷ             │ │
│ │ ⏱️ Còn: 02:15:30               │ ← Live countdown
│ │ Khách: Nguyễn Văn A             │ │
│ │                                 │ │
│ │ [Gia hạn] [Booking] [Hủy]      │ ← Touch buttons
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🏠 B2-10-12                     │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Booking chờ duyệt (1)               │
│ ...                                 │
│                                     │
├─────────────────────────────────────┤
│ 🏠  🔍  📋  💰  👤                  │ ← Bottom nav
└─────────────────────────────────────┘
```

---

### Tìm Căn (Search) - Mobile

```
┌─────────────────────────────────────┐
│ ← Tìm căn hộ          [Filter] 🔍  │
├─────────────────────────────────────┤
│ ┌─────────────────────────────────┐ │
│ │ 🔍 Tìm theo mã căn...          │ │ ← Large search bar
│ └─────────────────────────────────┘ │
│                                     │
│ Bộ lọc nhanh:                       │ ← Horizontal scroll
│ ┌──────┬──────┬──────┬──────┐      │
│ │2-3 tỷ│2PN   │Đông  │Còn   │      │
│ │      │      │Nam   │trống │      │
│ └──────┴──────┴──────┴──────┘      │
│                                     │
│ 25 căn phù hợp                      │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ [Ảnh căn]                       │ │
│ │ A1-08-05 • 2PN                  │ │
│ │ 75m² • Đông Nam                 │ │
│ │ 2,500,000,000 VNĐ               │ │
│ │ 🎯 HH: 50tr                     │ │ ← Highlight commission
│ │ 🟢 Còn trống                    │ │
│ │                                 │ │
│ │ [👁️ Xem] [🔖 Giữ chỗ]         │ │ ← Large touch buttons
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ 🏠  🔍  📋  💰  👤                  │
└─────────────────────────────────────┘
```

---

### Chi Tiết Căn - Mobile

```
┌─────────────────────────────────────┐
│ ← A1-08-05                    ⋮     │
├─────────────────────────────────────┤
│ [Swipeable Image Gallery]           │ ← Swipe images
│ ● ○ ○ ○                            │
│                                     │
│ Căn hộ A1-08-05                     │
│ Block A1 • Tầng 8 • Hướng Đông Nam  │
│                                     │
│ ┌───────────────────────────────┐   │
│ │ 2,500,000,000 VNĐ             │   │ ← Big price
│ │ 💰 Hoa hồng: 50,000,000 VNĐ   │   │ ← Highlight HH
│ └───────────────────────────────┘   │
│                                     │
│ 📐 75m² • 🛏️ 2PN • 🚿 2WC         │
│ 🧭 Đông Nam • 🌆 View hồ           │
│                                     │
│ Trạng thái: 🟢 CÒN TRỐNG           │
│                                     │
│ ─────────────────────────────       │
│                                     │
│ 📍 Vị trí                           │
│ Tầng 8, Block A1                    │
│ Vinhomes Smart City                 │
│ [Xem trên bản đồ]                   │ ← Tap → Show floor plan
│                                     │
│ 📋 Mô tả                            │
│ Căn góc, 2 ban công...              │
│ [Xem thêm ▼]                        │ ← Collapsible
│                                     │
├─────────────────────────────────────┤
│ [🔖 Giữ chỗ ngay]                   │ ← Sticky bottom CTA
└─────────────────────────────────────┘
```

---

### Giữ Chỗ Form - Mobile

```
┌─────────────────────────────────────┐
│ ← Giữ chỗ căn A1-08-05              │
├─────────────────────────────────────┤
│                                     │
│ Thông tin khách hàng                │
│                                     │
│ Họ tên *                            │
│ ┌─────────────────────────────────┐ │
│ │ Nguyễn Văn A                    │ │ ← Large input
│ └─────────────────────────────────┘ │
│                                     │
│ Số điện thoại *                     │
│ ┌─────────────────────────────────┐ │
│ │ 📱 0912 345 678                 │ │ ← Phone keyboard
│ └─────────────────────────────────┘ │
│                                     │
│ Email                               │
│ ┌─────────────────────────────────┐ │
│ │ khach@example.com               │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Ghi chú                             │
│ ┌─────────────────────────────────┐ │
│ │ Khách muốn xem căn cuối tuần    │ │ ← Textarea
│ │                                 │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ⏱️ Thời gian giữ chỗ: 24 giờ       │
│ Hết hạn: 15:30 ngày 22/10/2025      │
│                                     │
├─────────────────────────────────────┤
│ [Hủy]        [✓ Xác nhận giữ chỗ]  │ ← Full width buttons
└─────────────────────────────────────┘
```

---

### Upload Chứng Từ - Mobile (Camera Integration)

```
┌─────────────────────────────────────┐
│ ← Upload chứng từ thanh toán         │
├─────────────────────────────────────┤
│                                     │
│ Chọn cách upload:                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  📷  Chụp ảnh                   │ │ ← Open camera
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  🖼️  Chọn từ thư viện           │ │ ← Photo library
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │  📁  Chọn file                  │ │ ← File picker
│ └─────────────────────────────────┘ │
│                                     │
│ Đã chọn (2):                        │
│ ┌──────────┬──────────┐             │
│ │[Ảnh 1]   │[Ảnh 2]   │ [×]         │ ← Preview + remove
│ └──────────┴──────────┘             │
│                                     │
│ [+ Thêm ảnh]                        │
│                                     │
├─────────────────────────────────────┤
│ [Hủy]        [✓ Upload]             │
└─────────────────────────────────────┘

Sau khi chụp:
┌─────────────────────────────────────┐
│ Preview ảnh                         │
│                                     │
│ [Large image preview]               │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ 🔄 Chụp lại                     │ │
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ ✓ Sử dụng ảnh này               │ │
│ └─────────────────────────────────┘ │
└─────────────────────────────────────┘
```

---

### Phiếu của Tôi - Mobile (Tab View)

```
┌─────────────────────────────────────┐
│ ← Phiếu của tôi                     │
├─────────────────────────────────────┤
│ [Giữ chỗ(3)] [Booking(2)] [Cọc(1)] │ ← Swipeable tabs
│ ═════════                           │
│                                     │
│ [Filter] [Sort ▼]                   │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ RSV-20251020-001                │ │
│ │ 🏠 A1-08-05 • 2.5 tỷ            │ │
│ │ 👤 Nguyễn Văn A                 │ │
│ │ ⏱️ Còn: 15:30:25               │ ← Live countdown
│ │ 🟢 Đang giữ                     │ │
│ │                                 │ │
│ │ [Gia hạn] [Booking] [Hủy]      │ │ ← Action buttons
│ │ [Xem phiếu PDF]                 │ │ ← Download PDF
│ └─────────────────────────────────┘ │
│                                     │
│ ┌─────────────────────────────────┐ │
│ │ RSV-20251019-045                │ │
│ │ ...                             │ │
│ └─────────────────────────────────┘ │
│                                     │
├─────────────────────────────────────┤
│ 🏠  🔍  📋  💰  👤                  │
└─────────────────────────────────────┘
```

---

### Booking Detail - Mobile

```
┌─────────────────────────────────────┐
│ ← BOK-20251020-001          [PDF]   │
├─────────────────────────────────────┤
│                                     │
│ Status: 🟡 Chờ admin duyệt          │
│                                     │
│ Căn hộ                              │
│ ┌─────────────────────────────────┐ │
│ │ [Ảnh] A1-08-05                  │ │
│ │ 75m² • 2PN • 2.5 tỷ             │ │
│ │ HH: 50tr                        │ │
│ └─────────────────────────────────┘ │
│                                     │
│ Khách hàng                          │
│ 👤 Nguyễn Văn A                     │
│ 📱 0912 345 678                     │
│ 📧 khach@example.com                │
│                                     │
│ Thanh toán                          │
│ 💰 10,000,000 VNĐ                   │
│ 🏦 Chuyển khoản                     │
│ 📅 20/10/2025                       │
│                                     │
│ [Xem QR Code]                       │ ← Tap → Show QR fullscreen
│                                     │
│ Chứng từ (2)                        │
│ ┌──────┬──────┐                     │
│ │[Ảnh] │[Ảnh] │                     │ ← Tap → View fullscreen
│ └──────┴──────┘                     │
│                                     │
│ Thời hạn: 22/10/2025 15:30          │
│ ⏱️ Còn: 1 ngày 15 giờ              │
│                                     │
├─────────────────────────────────────┤
│         [Nâng cấp lên Cọc]          │ ← Sticky CTA
├─────────────────────────────────────┤
│ 🏠  🔍  📋  💰  👤                  │
└─────────────────────────────────────┘
```

---

## 📸 Camera & File Upload

### Native Features

**Camera Access:**
```javascript
// Use native camera API
<input type="file" accept="image/*" capture="environment" />

// Or use library: react-camera-pro
import { Camera } from 'react-camera-pro';
```

**Features:**
- ✅ Auto-focus
- ✅ Flash control
- ✅ Front/back camera switch
- ✅ Preview before upload
- ✅ Crop & rotate
- ✅ Compress image (max 2MB)
- ✅ Multi-select (max 5 files)

---

## 🔔 Push Notifications (PWA)

### Critical Notifications (Cần push ngay)

**High Priority:**
- 🔴 Giữ chỗ sắp hết hạn (2h trước)
- 🔴 Booking được duyệt/từ chối
- 🔴 Deposit được duyệt
- 🔴 Payment overdue warning
- 🔴 Commission mới
- 🔴 Payment request được duyệt

**Medium Priority:**
- 🟡 Căn mới available (match filter)
- 🟡 Payment reminder (7 days trước)

**Low Priority:**
- ⚪ System announcement
- ⚪ New features

---

## ⚡ Performance - Mobile Optimization

### Critical Metrics

**Load Time:**
- First Contentful Paint (FCP): < 1.5s
- Time to Interactive (TTI): < 3s
- Largest Contentful Paint (LCP): < 2.5s

**Bundle Size:**
- Initial JS: < 200KB (gzipped)
- Images: WebP format, lazy load
- Code splitting by route

**Network:**
- Work on 3G (slow connection)
- Offline fallback (cached data)
- Optimistic UI updates

---

## 🎯 Touch Interactions

### Button Sizes

**Minimum:**
- Buttons: 44×44px (Apple)
- Touch targets: 48×48px (Material)

**Spacing:**
- Between buttons: 8px min
- Padding around touch area: 12px

### Gestures

**Implemented:**
- ✅ Swipe right: Back navigation
- ✅ Pull down: Refresh list
- ✅ Swipe left/right: Image gallery
- ✅ Long press: Context menu (copy, share)
- ✅ Pinch zoom: Images, floor plans

**Avoided:**
- ❌ Hover effects (no hover on mobile)
- ❌ Small click targets
- ❌ Double-click (use single tap)

---

## 📴 Offline Capability (PWA - Phase 2)

### Service Worker Strategy

**Cache:**
- App shell (HTML, CSS, JS)
- Recently viewed units
- User's active reservations/bookings
- System configs

**Offline Actions:**
- ✅ View cached units
- ✅ View own reservations
- ✅ Prepare form (save to localStorage)
- ❌ Submit transactions (require online)

**Sync:**
- When back online → Auto sync
- Pending actions → Show queue
- Conflict resolution

---

## 🚀 Implementation

### Tech Stack - CTV Portal

**Base:**
- React 18 (same as Admin)
- Vite 5
- Tailwind CSS 3

**Mobile-specific:**
- `react-use-gesture` - Touch gestures
- `react-camera-pro` - Camera access
- `workbox` - Service worker (PWA)
- `@capacitor/core` - Native features (Phase 3)

**PWA Manifest:**
```json
{
  "name": "Batdongsan CTV",
  "short_name": "CTV Portal",
  "display": "standalone",
  "orientation": "portrait",
  "theme_color": "#3b82f6",
  "background_color": "#ffffff",
  "icons": [
    {
      "src": "/icon-192.png",
      "sizes": "192x192",
      "type": "image/png"
    },
    {
      "src": "/icon-512.png",
      "sizes": "512x512",
      "type": "image/png",
      "purpose": "any maskable"
    }
  ],
  "screenshots": [...]
}
```

---

## 📱 Roadmap

### Phase 1 - Responsive Web (MVP)
- ✅ Mobile-first responsive design
- ✅ Touch-optimized UI
- ✅ Camera upload
- ✅ Real-time countdown
- ✅ Bottom navigation

### Phase 2 - PWA
- 📋 Service worker
- 📋 Offline capability
- 📋 Push notifications (web)
- 📋 Install on homescreen
- 📋 App-like experience

### Phase 3 - Native App
- 📋 React Native
- 📋 iOS + Android
- 📋 Native camera, notifications
- 📋 Biometric login
- 📋 Better performance

---

**Document Version:** 3.0  
**Priority:** HIGH - CTV Portal mobile là critical  
**Implementation:** Phase 1 (MVP)






