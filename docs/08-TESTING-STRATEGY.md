# Testing Strategy

## 📋 Thông tin tài liệu

**Dự án:** Batdongsan Platform  
**Phiên bản:** 1.0

## 1. Testing Overview

### 1.1 Testing Pyramid

```
        /\
       /  \       E2E Tests (10%)
      /────\      
     /      \     Integration Tests (30%)
    /────────\    
   /          \   Unit Tests (60%)
  /────────────\  
```

### 1.2 Test Coverage Goals

- Overall: ≥ 80%
- Critical paths: ≥ 90%
- Services/Business logic: ≥ 85%
- Controllers: ≥ 75%
- Components: ≥ 70%

## 2. Backend Testing (NestJS)

### 2.1 Unit Tests

**Framework:** Jest

**What to Test:**
- Services (business logic)
- Utilities
- Validators
- Transformers

**Example:**
```typescript
describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: UsersService,
          useValue: { findByEmail: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: { sign: jest.fn() },
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should validate user credentials', async () => {
    // Test implementation
  });

  it('should generate JWT token', async () => {
    // Test implementation
  });
});
```

### 2.2 Integration Tests

**Framework:** Jest + Supertest

**What to Test:**
- API endpoints
- Database interactions
- Auth flow
- Module integration

**Example:**
```typescript
describe('PropertiesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/api/properties (GET)', () => {
    return request(app.getHttpServer())
      .get('/api/properties')
      .expect(200)
      .expect((res) => {
        expect(res.body.data).toBeInstanceOf(Array);
        expect(res.body.meta).toHaveProperty('page');
      });
  });

  it('/api/properties (POST) - unauthorized', () => {
    return request(app.getHttpServer())
      .post('/api/properties')
      .send({ title: 'Test' })
      .expect(401);
  });
});
```

### 2.3 E2E Tests

**Scope:**
- Critical user flows
- End-to-end scenarios
- Cross-module interactions

**Example Scenarios:**
- User registration → Login → Create property → View property
- Admin login → Approve property → Set featured

## 3. Frontend Testing

### 3.1 Unit Tests (React)

**Framework:** Vitest (Vite) / Jest (Next.js)

**What to Test:**
- Utilities
- Hooks
- Pure functions
- Context providers

**Example:**
```typescript
import { renderHook } from '@testing-library/react-hooks';
import { useAuth } from './useAuth';

describe('useAuth', () => {
  it('should return null user initially', () => {
    const { result } = renderHook(() => useAuth());
    expect(result.current.user).toBeNull();
  });

  it('should set user after login', async () => {
    const { result } = renderHook(() => useAuth());
    await result.current.login('test@example.com', 'password');
    expect(result.current.user).not.toBeNull();
  });
});
```

### 3.2 Component Tests

**Framework:** React Testing Library

**What to Test:**
- Component rendering
- User interactions
- Conditional rendering
- Props variations

**Example:**
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { PropertyCard } from './PropertyCard';

describe('PropertyCard', () => {
  const mockProperty = {
    id: '1',
    title: 'Test Property',
    price: 2500000000,
    area: 75,
    // ...
  };

  it('should render property info', () => {
    render(<PropertyCard property={mockProperty} />);
    expect(screen.getByText('Test Property')).toBeInTheDocument();
  });

  it('should call onClick when card is clicked', () => {
    const handleClick = jest.fn();
    render(<PropertyCard property={mockProperty} onClick={handleClick} />);
    
    fireEvent.click(screen.getByRole('article'));
    expect(handleClick).toHaveBeenCalledWith('1');
  });
});
```

### 3.3 E2E Tests (Cypress/Playwright)

**Framework:** Playwright (recommended)

**Test Scenarios:**
1. User Registration Flow
2. Login Flow
3. Property Search & Filter
4. View Property Detail
5. Add to Favorites
6. Agent Post Property
7. Admin Dashboard

**Example:**
```typescript
test('user can search and view properties', async ({ page }) => {
  await page.goto('http://localhost:3000');
  
  // Search
  await page.fill('input[placeholder="Tìm kiếm..."]', 'Hà Nội');
  await page.click('button:has-text("Tìm kiếm")');
  
  // Wait for results
  await page.waitForSelector('.property-card');
  
  // Click first property
  await page.click('.property-card:first-child');
  
  // Verify detail page
  await expect(page).toHaveURL(/\/properties\/[a-z0-9-]+/);
  await expect(page.locator('h1')).toBeVisible();
});
```

## 4. API Testing

### 4.1 Postman/Newman

**Collection Structure:**
```
Batdongsan API
├── Auth
│   ├── Register
│   ├── Login
│   └── Get Me
├── Properties
│   ├── List Properties
│   ├── Get Property
│   ├── Create Property
│   ├── Update Property
│   └── Delete Property
├── Categories
└── Amenities
```

**Automated Tests:**
- Response status codes
- Response schema validation
- Response time < 200ms
- Data consistency

### 4.2 Load Testing

**Tool:** Artillery or K6

**Scenarios:**
- Normal load: 100 users/minute
- Peak load: 500 users/minute
- Stress test: 1000 users/minute

**Metrics:**
- Response time (p50, p95, p99)
- Throughput (requests/second)
- Error rate (%)

**Example (artillery.yml):**
```yaml
config:
  target: 'http://localhost:3001'
  phases:
    - duration: 60
      arrivalRate: 10
      name: Warm up
    - duration: 120
      arrivalRate: 50
      name: Sustained load
scenarios:
  - name: 'Browse properties'
    flow:
      - get:
          url: '/api/properties?page=1&limit=10'
```

## 5. Testing Checklist

### 5.1 Before Merge/Deploy

- [ ] All unit tests pass
- [ ] All integration tests pass
- [ ] E2E tests pass (critical flows)
- [ ] Code coverage ≥ 80%
- [ ] No console errors/warnings
- [ ] Linter passes
- [ ] TypeScript compiles
- [ ] Manual smoke test

### 5.2 Regression Testing

After each release:
- [ ] Core functionalities work
- [ ] No breaking changes
- [ ] Performance not degraded
- [ ] UI/UX consistent

### 5.3 Security Testing

- [ ] SQL injection tests
- [ ] XSS tests
- [ ] CSRF protection
- [ ] Authentication bypass attempts
- [ ] Authorization tests
- [ ] Input validation tests

## 6. Test Data Management

### 6.1 Test Database

**Setup:**
```bash
# Create test database
DATABASE_URL="file:./test.db" npx prisma migrate deploy

# Seed test data
npm run test:seed
```

**Cleanup:**
```typescript
afterEach(async () => {
  await prisma.property.deleteMany();
  await prisma.user.deleteMany();
});
```

### 6.2 Fixtures

```typescript
// test/fixtures/users.ts
export const testUsers = {
  admin: {
    email: 'admin@test.com',
    password: 'password123',
    fullName: 'Test Admin',
    role: 'ADMIN',
  },
  agent: {
    email: 'agent@test.com',
    password: 'password123',
    fullName: 'Test Agent',
    role: 'AGENT',
  },
  user: {
    email: 'user@test.com',
    password: 'password123',
    fullName: 'Test User',
    role: 'USER',
  },
};
```

## 7. Continuous Integration

### 7.1 GitHub Actions Workflow

```yaml
name: CI

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm ci
        
      - name: Run tests
        run: npm test
        
      - name: Upload coverage
        uses: codecov/codecov-action@v3
```

### 7.2 Pre-commit Hooks

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "lint-staged",
      "pre-push": "npm test"
    }
  },
  "lint-staged": {
    "*.{ts,tsx}": [
      "eslint --fix",
      "prettier --write"
    ]
  }
}
```

## 8. Test Reports

### 8.1 Coverage Report

```bash
npm run test:cov
```

Output:
```
File            | % Stmts | % Branch | % Funcs | % Lines |
----------------|---------|----------|---------|---------|
All files       |   85.2  |   78.5   |   82.1  |   86.3  |
 auth.service   |   92.1  |   85.3   |   90.0  |   93.2  |
 users.service  |   88.5  |   80.2   |   85.5  |   89.1  |
```

### 8.2 E2E Test Report

- Screenshots on failure
- Video recordings
- Test execution time
- Pass/Fail status

---

**Document Version:** 1.0  
**Status:** Draft  
**Last Updated:** October 2025

