# Client Website (Next.js)

Website khách hàng cho nền tảng bất động sản, xây dựng với Next.js 14, Tailwind CSS và shadcn/ui.

## 🛠️ Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS 3
- **UI Components**: shadcn/ui
- **State Management**: React Query (TanStack Query)
- **Forms**: React Hook Form + Zod
- **HTTP Client**: Axios
- **Language**: TypeScript 5

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Auth routes group
│   ├── properties/        # Properties pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── providers.tsx      # Client providers
├── components/            # Reusable components
│   ├── home/             # Home page sections
│   ├── layout/           # Layout components (Header, Footer)
│   └── ui/               # UI components
├── lib/                  # Utilities and configurations
│   ├── api.ts           # Axios instance
│   └── utils.ts         # Helper functions
└── types/               # TypeScript type definitions
```

## 🚀 Getting Started

### Installation

1. **Navigate to client directory**
```bash
cd apps/client
```

2. **Install dependencies** (from root)
```bash
npm install
```

3. **Set up environment variables**
```bash
# In root .env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

### Development

```bash
# Start development server
npm run dev
```

Client website will be available at: `http://localhost:3000`

### Build

```bash
# Build for production
npm run build

# Start production server
npm run start
```

## 📱 Features

### ✅ Home Page
- Hero section với search bar
- Featured properties section
- Categories section
- Stats section
- Responsive design

### ✅ Layout
- Header với navigation menu
- Footer với links và contact info
- Mobile-friendly navigation
- Sticky header

### 🔄 Planned Features
- [ ] Property listing page với filters
- [ ] Property detail page
- [ ] User authentication (login/register)
- [ ] User dashboard
- [ ] Property search functionality
- [ ] Favorites/Wishlist
- [ ] Contact form
- [ ] News/Blog section

## 🎨 UI/UX Standards

Theo yêu cầu của dự án, website tuân thủ các chuẩn sau:

- ✅ Responsive design cho mọi thiết bị
- ✅ Sử dụng shadcn/ui components cho consistency
- ✅ Tailwind CSS v3 cho styling
- ✅ Modern và professional UI
- ✅ Fast loading với Next.js optimizations

## 🔧 Adding shadcn/ui Components

```bash
# From client directory
npx shadcn@latest add button
npx shadcn@latest add card
npx shadcn@latest add dialog
# etc...
```

## 📦 Key Dependencies

- `next`: React framework
- `react` & `react-dom`: UI framework
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
| NEXT_PUBLIC_API_URL | Backend API URL | http://localhost:3001/api |

## 🎯 SEO Optimization

- Metadata configuration trong layout.tsx
- Semantic HTML
- Optimized images với Next.js Image component
- Fast loading times
- Mobile-first approach

## 📝 Development Notes

- Sử dụng App Router của Next.js 14
- Server Components by default
- Client Components được đánh dấu với 'use client'
- TypeScript strict mode enabled
- Không sử dụng `any` type
- Components được tổ chức theo module
- Tailwind CSS với CSS variables cho theming

## 🚀 Performance

- Next.js automatic code splitting
- Image optimization với next/image
- Static generation khi có thể
- Server-side rendering cho dynamic content
- React Query cho efficient data fetching

