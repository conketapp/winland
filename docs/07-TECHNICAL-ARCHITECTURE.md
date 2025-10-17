# Technical Architecture Document

## 📋 Thông tin tài liệu

**Dự án:** Batdongsan Platform  
**Phiên bản:** 1.0  
**Kiến trúc:** Monorepo với Turborepo

## 1. Tổng quan kiến trúc

### 1.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
├──────────────────────┬──────────────────────────────────┤
│   Client Website     │      Admin Panel                 │
│   (Next.js)          │      (React + Vite)              │
│   Port: 3000         │      Port: 5173                  │
└──────────┬───────────┴──────────┬───────────────────────┘
           │                      │
           │  HTTPS/REST API      │
           │                      │
┌──────────▼──────────────────────▼───────────────────────┐
│                   BACKEND LAYER                          │
│                   (NestJS)                               │
│                   Port: 3001                             │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           API Gateway / Router                  │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
│  ┌──────────┬──────────┬──────────┬────────────┐       │
│  │  Auth    │  Users   │Properties│ Categories │       │
│  │  Module  │  Module  │  Module  │   Module   │       │
│  └──────────┴──────────┴──────────┴────────────┘       │
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │           Prisma ORM Layer                      │    │
│  └────────────────────────────────────────────────┘    │
└──────────────────────┬───────────────────────────────────┘
                       │
┌──────────────────────▼───────────────────────────────────┐
│                   DATA LAYER                             │
│            SQLite (dev) / PostgreSQL (prod)              │
└──────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────┐
│                 SHARED PACKAGE                            │
│   Types, Constants, Utils (Used by all apps)             │
└──────────────────────────────────────────────────────────┘
```

## 2. Monorepo Structure

```
batdongsan/
├── apps/
│   ├── backend/          # NestJS API
│   ├── admin/            # React Admin Panel
│   └── client/           # Next.js Website
├── packages/
│   └── shared/           # Shared code
├── package.json          # Workspace root
├── turbo.json            # Turborepo config
└── tsconfig.json         # Base TS config
```

### 2.1 Turborepo Benefits
- Incremental builds
- Remote caching
- Parallel execution
- Dependency graph awareness

## 3. Backend Architecture (NestJS)

### 3.1 Module Structure

```
backend/src/
├── main.ts                 # Entry point
├── app.module.ts           # Root module
├── common/                 # Shared utilities
│   ├── dto/               # Common DTOs
│   ├── guards/            # Auth guards
│   └── decorators/        # Custom decorators
├── prisma/                # Prisma service
│   ├── prisma.module.ts
│   └── prisma.service.ts
└── modules/               # Feature modules
    ├── auth/
    │   ├── auth.module.ts
    │   ├── auth.controller.ts
    │   ├── auth.service.ts
    │   ├── dto/
    │   ├── strategies/
    │   └── guards/
    ├── users/
    ├── properties/
    ├── categories/
    └── amenities/
```

### 3.2 Request Flow

```
Client Request
      ↓
[NestJS Middleware]
      ↓
[Global Exception Filter]
      ↓
[Controller] ← Validates DTO
      ↓
[Service] ← Business Logic
      ↓
[Prisma Service] ← Database Access
      ↓
[Database]
      ↓
[Response] → Transforms & Returns
```

### 3.3 Authentication Flow

```
1. User Login
   ↓
2. LocalStrategy validates credentials
   ↓
3. AuthService generates JWT token
   ↓
4. Token returned to client
   ↓
5. Client stores token (localStorage)
   ↓
6. Protected requests include token
   ↓
7. JwtStrategy validates token
   ↓
8. User info attached to request
```

### 3.4 Module Dependencies

```
AppModule
├── ConfigModule (global)
├── PrismaModule (global)
├── AuthModule
│   └── requires: UsersModule
├── UsersModule
├── PropertiesModule
├── CategoriesModule
└── AmenitiesModule
```

## 4. Frontend Architecture

### 4.1 Admin Panel (React + Vite)

**Architecture:**
- Component-based
- React Router for routing
- React Query for data fetching
- Context API for auth state

**Structure:**
```
admin/src/
├── main.tsx
├── App.tsx
├── components/
│   ├── auth/
│   ├── ui/              # Reusable UI
│   └── layout/          # Layout components
├── contexts/
│   └── AuthContext.tsx
├── layouts/
│   └── DashboardLayout.tsx
├── pages/
│   ├── auth/
│   ├── properties/
│   ├── categories/
│   └── users/
├── lib/
│   ├── api.ts           # Axios instance
│   └── utils.ts
└── hooks/
    └── useAuth.ts
```

**State Management:**
- Auth: Context API
- Server State: React Query
- Form State: React Hook Form

### 4.2 Client Website (Next.js)

**Architecture:**
- App Router (Next.js 14)
- Server Components (default)
- Client Components (interactive)
- React Query for data fetching

**Structure:**
```
client/src/
├── app/
│   ├── layout.tsx       # Root layout
│   ├── page.tsx         # Home page
│   ├── providers.tsx    # Client providers
│   ├── properties/
│   │   ├── page.tsx
│   │   └── [id]/
│   │       └── page.tsx
│   └── favorites/
│       └── page.tsx
├── components/
│   ├── layout/
│   │   ├── Header.tsx
│   │   └── Footer.tsx
│   └── home/
│       ├── HeroSection.tsx
│       └── FeaturedProperties.tsx
└── lib/
    ├── api.ts
    └── utils.ts
```

**Rendering Strategy:**
- Static: Home page, about, terms
- SSR: Property list (for SEO)
- CSR: User dashboard, favorites

## 5. Data Flow

### 5.1 Property List Flow

```
1. User visits /properties
   ↓
2. [Client] Renders page, calls API
   ↓
3. [Backend] PropertiesController.findAll()
   ↓
4. [Service] Applies filters, pagination
   ↓
5. [Prisma] Queries database
   ↓
6. [Database] Returns data
   ↓
7. [Backend] Transforms & returns JSON
   ↓
8. [Client] React Query caches response
   ↓
9. [UI] Renders property cards
```

### 5.2 Create Property Flow

```
1. Agent fills form
   ↓
2. [Client] Validates with React Hook Form + Zod
   ↓
3. [Client] POSTs to /api/properties
   ↓
4. [Backend] Validates DTO (class-validator)
   ↓
5. [Backend] Checks user permissions
   ↓
6. [Service] Creates property + images + amenities
   ↓
7. [Prisma] Transaction: Insert property, images, relations
   ↓
8. [Database] Commits transaction
   ↓
9. [Backend] Returns created property
   ↓
10. [Client] Invalidates cache, shows success
```

## 6. Security Architecture

### 6.1 Authentication & Authorization

**JWT Strategy:**
- Algorithm: HS256
- Expiry: 7 days
- Secret: Environment variable
- Payload: { sub: userId }

**Authorization Levels:**
```
PUBLIC → Anyone
USER → Authenticated users
AGENT → Users with AGENT role
ADMIN → Users with ADMIN role
```

**Implementation:**
```typescript
@UseGuards(JwtAuthGuard)        // Authentication
@Roles('ADMIN')                 // Authorization
@Controller('admin')
```

### 6.2 Input Validation

**Backend:**
- class-validator on all DTOs
- Whitelist: strip unknown properties
- Transform: convert types

**Frontend:**
- React Hook Form + Zod
- Validate before submit
- Show inline errors

### 6.3 Security Measures

1. **Password Security:**
   - Hashed with bcrypt (salt rounds: 10)
   - Never store plain text
   - Never return in responses

2. **SQL Injection:**
   - Prisma ORM parameterized queries
   - No raw SQL (unless necessary)

3. **XSS Prevention:**
   - React escapes by default
   - Sanitize HTML if needed

4. **CORS:**
   - Whitelist specific origins
   - No wildcard in production

5. **Rate Limiting:** (Future)
   - 100 requests/minute per IP
   - 1000 requests/day per user

## 7. Database Architecture

### 7.1 Connection Management

**Development (SQLite):**
- File-based: `prisma/dev.db`
- No connection pool needed

**Production (PostgreSQL):**
- Connection pool size: 10-20
- Timeout: 30 seconds
- Retry logic

**Prisma Client:**
```typescript
// Singleton pattern
let prisma: PrismaClient;

if (process.env.NODE_ENV === 'production') {
  prisma = new PrismaClient();
} else {
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}
```

### 7.2 Query Optimization

**Indexes:**
- Primary keys: auto-indexed
- Foreign keys: indexed
- Frequently queried fields: indexed
- Composite indexes for common queries

**N+1 Problem:**
- Use Prisma `include` for relations
- Avoid multiple queries in loops

**Pagination:**
- Cursor-based (future)
- Offset-based (current)

## 8. Performance Optimization

### 8.1 Backend

**Caching:** (Future)
- Redis for frequent queries
- Cache invalidation strategy

**Database:**
- Query optimization
- Connection pooling
- Read replicas (future)

**API:**
- Compression (gzip)
- Response pagination
- Field selection

### 8.2 Frontend

**Code Splitting:**
- Route-based (automatic in Next.js)
- Component-based (React.lazy)

**Image Optimization:**
- Next.js Image component
- WebP format
- Lazy loading

**Caching:**
- React Query cache
- Browser cache headers
- Service Worker (future PWA)

## 9. Scalability

### 9.1 Horizontal Scaling

**Backend:**
- Stateless design
- Load balancer
- Multiple instances

**Database:**
- Read replicas
- Sharding (future)

### 9.2 Vertical Scaling

- Upgrade server resources
- Optimize queries
- Add indexes

### 9.3 CDN

- Static assets
- Images
- Videos (future)

## 10. Monitoring & Logging

### 10.1 Logging

**Backend:**
- Built-in NestJS logger
- Log levels: error, warn, info, debug
- Structured logs (JSON)

**Log Storage:**
- Local files (dev)
- Cloud service (prod): CloudWatch, Datadog

### 10.2 Monitoring

**Metrics:**
- API response time
- Error rate
- Request count
- Database query time

**Tools:**
- Health check endpoint: `/api/health`
- Uptime monitoring
- APM (future): New Relic, Datadog

### 10.3 Error Tracking

- Sentry (recommended)
- Capture errors, stack traces
- User context, breadcrumbs

## 11. Deployment Architecture

### 11.1 Infrastructure

```
┌─────────────────────────────────────────┐
│           Load Balancer (HTTPS)         │
└───┬────────────────────────┬────────────┘
    │                        │
┌───▼──────────┐      ┌──────▼────────────┐
│  Frontend    │      │    Backend API    │
│  (Vercel)    │      │    (AWS/GCP)      │
└──────────────┘      └──────┬────────────┘
                             │
                      ┌──────▼────────────┐
                      │   PostgreSQL DB   │
                      │   (Managed)       │
                      └───────────────────┘
```

### 11.2 CI/CD Pipeline

```
Code Push → GitHub
     ↓
GitHub Actions
     ↓
[Test] → [Build] → [Deploy]
     ↓
Production
```

---

**Document Version:** 1.0  
**Status:** Draft  
**Last Updated:** October 2025

