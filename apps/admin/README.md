# Admin Panel (React + Vite)

Admin panel cho nền tảng bất động sản, xây dựng với React, Vite, Tailwind CSS và shadcn/ui.

## 🛠️ Tech Stack

- **Framework**: React 18
- **Build Tool**: Vite 5
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui, Preline UI
- **Routing**: React Router v6
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Language**: TypeScript 5

## 📁 Project Structure

```
src/
├── components/         # Reusable components
│   ├── auth/          # Authentication components
│   └── ui/            # UI components (LoadingState, EmptyState, etc.)
├── contexts/          # React contexts
│   └── AuthContext.tsx
├── layouts/           # Layout components
│   └── DashboardLayout.tsx
├── pages/             # Page components
│   ├── auth/         # Auth pages (login, register)
│   ├── properties/   # Property management
│   ├── categories/   # Category management
│   ├── amenities/    # Amenity management
│   └── users/        # User management
├── lib/              # Utilities and configurations
│   ├── api.ts        # Axios instance
│   └── utils.ts      # Helper functions
├── App.tsx           # Main app component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## 🚀 Getting Started

### Installation

1. **Navigate to admin directory**
```bash
cd apps/admin
```

2. **Install dependencies** (from root)
```bash
npm install
```

3. **Set up environment variables**
```bash
# In root .env
VITE_API_URL=http://localhost:3001/api
```

### Development

```bash
# Start development server
npm run dev
```

Admin panel will be available at: `http://localhost:5173`

### Build

```bash
# Build for production
npm run build

# Preview production build
npm run preview
```

## 📱 Features

### ✅ Authentication
- Login page với shadcn/ui components
- Protected routes
- JWT token management
- Auto redirect khi token hết hạn

### ✅ Dashboard Layout
- Responsive sidebar với mobile support
- Navigation menu
- User profile section
- Logout functionality

### ✅ Pages
- **Dashboard**: Tổng quan thống kê
- **Properties**: Quản lý bất động sản
- **Categories**: Quản lý danh mục
- **Amenities**: Quản lý tiện ích
- **Users**: Quản lý người dùng

### ✅ UI Components
- LoadingState: Loading indicator
- EmptyState: Empty data placeholder
- Consistent styling với Tailwind CSS
- shadcn/ui components integration

## 🎨 UI/UX Standards

Theo yêu cầu của dự án, tất cả các trang đều tuân thủ các chuẩn sau:

- ✅ Sử dụng các component trạng thái chuẩn hoá (LoadingState, EmptyState)
- ✅ Layout nhất quán với sidebar trên tất cả các trang
- ✅ Responsive design cho mobile và desktop
- ✅ Preline UI components cho filters và selects
- ✅ shadcn/ui components cho UI elements

## 🔧 Adding shadcn/ui Components

```bash
# From admin directory
npx shadcn@latest add button
npx shadcn@latest add dialog
npx shadcn@latest add form
# etc...
```

## 📦 Key Dependencies

- `react` & `react-dom`: UI framework
- `react-router-dom`: Client-side routing
- `@tanstack/react-query`: Server state management
- `react-hook-form`: Form handling
- `zod`: Schema validation
- `axios`: HTTP client
- `tailwindcss`: Styling
- `lucide-react`: Icons
- `sonner`: Toast notifications

## 🌍 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| VITE_API_URL | Backend API URL | http://localhost:3001/api |

## 🔐 Authentication Flow

1. User enters email/password on login page
2. Credentials sent to `/api/auth/login`
3. Receive access token and user data
4. Store in localStorage
5. Add token to all subsequent API requests
6. Auto logout on 401 response

## 📝 Development Notes

- Tất cả components sử dụng TypeScript strict mode
- Không sử dụng `any` type
- Components được tổ chức theo module và chức năng
- Sử dụng React Hook Form cho form validation
- API calls được quản lý bởi React Query
- Tailwind CSS với CSS variables cho theming

