# ✅ Development Checklist - Batdongsan MVP

Quick reference cho các tính năng cần phát triển tiếp theo.

---

## 🔴 CRITICAL PRIORITY (Trước khi Production)

### 1. File Upload Service
- [ ] Integrate AWS S3 or Cloudinary
- [ ] Create upload endpoint `/api/upload`
- [ ] Add file validation (size, type, malware scan)
- [ ] Image optimization (resize, compress)
- [ ] Secure URL generation (signed URLs)
- [ ] Update frontend upload components
- [ ] Test upload flow end-to-end

**Affects:** Bookings, Deposits, Projects (images)  
**Estimate:** 2-3 days

---

### 2. Email/SMS Notifications
- [ ] Integrate SendGrid or AWS SES (Email)
- [ ] Integrate Twilio or ViettelSMS (SMS)
- [ ] Create notification templates
- [ ] Implement OTP sending
- [ ] Booking approval/rejection emails
- [ ] Deposit confirmation emails
- [ ] Payment reminder emails
- [ ] Test all notification flows

**Affects:** Authentication, Bookings, Deposits, Payments  
**Estimate:** 2-3 days

---

### 3. Cron Jobs & Schedulers
- [ ] Install Bull Queue + Redis
- [ ] Create reservation auto-expire job
- [ ] Create booking auto-expire job
- [ ] Create payment reminder job
- [ ] Set up cron schedule (every hour)
- [ ] Add job monitoring/logging
- [ ] Test auto-expire logic

**Affects:** Reservations, Bookings  
**Estimate:** 1-2 days

---

### 4. PostgreSQL Migration
- [ ] Set up PostgreSQL database
- [ ] Update DATABASE_URL in .env
- [ ] Run migrations on PostgreSQL
- [ ] Test all queries
- [ ] Update connection pooling
- [ ] Set up replication (optional)
- [ ] Migrate seed data

**Affects:** All data persistence  
**Estimate:** 1 day

---

### 5. Security Enhancements
- [ ] Enforce RBAC on all protected endpoints
- [ ] Add rate limiting (express-rate-limit)
- [ ] Implement helmet.js for security headers
- [ ] Add CORS whitelist for production
- [ ] Sanitize all inputs
- [ ] Add CSRF protection
- [ ] Use environment secrets manager
- [ ] Security audit

**Affects:** All endpoints  
**Estimate:** 2 days

---

### 6. Docker & Deployment
- [ ] Create Dockerfile for backend
- [ ] Create Dockerfile for admin UI
- [ ] Create Dockerfile for CTV portal
- [ ] Create docker-compose.yml
- [ ] Set up nginx reverse proxy
- [ ] Configure environment variables
- [ ] Test local Docker build
- [ ] Document deployment process

**Affects:** Deployment  
**Estimate:** 1 day

---

## 🟡 HIGH PRIORITY (Complete MVP)

### 7. Connect CTV Portal APIs
- [ ] Update CTV login to use real auth
- [ ] Connect dashboard to stats API
- [ ] Connect units listing to GET /units
- [ ] Connect unit detail to GET /units/:id
- [ ] Connect reservation form to POST /reservations
- [ ] Connect booking form to POST /bookings
- [ ] Connect deposit form to POST /deposits
- [ ] Connect my-transactions to GET /transactions/me
- [ ] Connect commissions to GET /commissions/me
- [ ] Test full CTV workflow

**Affects:** CTV Portal functionality  
**Estimate:** 1-2 days

---

### 8. Dashboard Stats Endpoint
- [ ] Create `/api/dashboard/stats` endpoint
- [ ] Aggregate projects by status
- [ ] Aggregate units by status
- [ ] Count recent bookings
- [ ] Count recent deposits
- [ ] Calculate revenue stats
- [ ] Update Admin dashboard to use endpoint
- [ ] Update CTV dashboard to use endpoint

**Affects:** Dashboard pages  
**Estimate:** 1 day

---

### 9. Unit CRUD Forms
- [ ] Create `CreateUnitPage.tsx` (Admin)
- [ ] Create `EditUnitPage.tsx` (Admin)
- [ ] Add form validation
- [ ] Connect to POST /units endpoint
- [ ] Connect to PATCH /units/:id endpoint
- [ ] Add to routes
- [ ] Add menu navigation
- [ ] Test create/edit flow

**Affects:** Unit management  
**Estimate:** 1 day

---

### 10. Users Management Page
- [ ] Create `UsersPage.tsx` (Admin)
- [ ] List all users (Admin, CTV, Customers)
- [ ] Create user form
- [ ] Edit user form
- [ ] Activate/Deactivate users
- [ ] Role assignment
- [ ] Connect to `/api/users` endpoints
- [ ] Test user management

**Affects:** Admin portal  
**Estimate:** 1 day

---

### 11. Integrate Detail Modals
- [ ] Add "View Details" button to BookingsApprovalPage
- [ ] Integrate BookingDetailModal
- [ ] Add "View Details" button to DepositsApprovalPage
- [ ] Integrate DepositDetailModal
- [ ] Test modal display with real data
- [ ] Add payment schedules view

**Affects:** Admin workflow  
**Estimate:** 4 hours

---

## 🟢 MEDIUM PRIORITY (Enhanced Features)

### 12. Real-time Notifications
- [ ] Set up Socket.io or SSE
- [ ] Create notification service
- [ ] Add notification bell icon
- [ ] Show unread count
- [ ] Mark as read functionality
- [ ] Real-time booking updates
- [ ] Test notifications

**Estimate:** 3-4 days

---

### 13. Advanced Filtering
- [ ] Add full-text search
- [ ] Add date range filters
- [ ] Add price range sliders
- [ ] Add multi-select filters
- [ ] Save filter presets
- [ ] Export filtered data

**Estimate:** 2-3 days

---

### 14. Pagination
- [ ] Backend: Add pagination logic
- [ ] Frontend: Add page controls
- [ ] Add page size selector
- [ ] Show total count
- [ ] Test with large datasets

**Estimate:** 2 days

---

### 15. Export & Reporting
- [ ] Export units to Excel
- [ ] Export transactions to PDF
- [ ] Commission reports
- [ ] Sales reports
- [ ] Payment schedules export

**Estimate:** 2-3 days

---

## 🟢 LOW PRIORITY (Nice to Have)

### 16. Audit Trail UI
- [ ] Create audit logs page
- [ ] Display who changed what
- [ ] Filter by user, date, action
- [ ] Search functionality
- [ ] Export audit logs

**Estimate:** 2 days

---

### 17. Analytics Dashboard
- [ ] Sales performance charts
- [ ] CTV rankings
- [ ] Revenue trends
- [ ] Conversion rates
- [ ] Customer analytics

**Estimate:** 1 week

---

### 18. Multi-language Support
- [ ] Set up react-i18next
- [ ] Create translation files (vi, en)
- [ ] Add language switcher
- [ ] Translate all UI text
- [ ] Test language switching

**Estimate:** 2-3 days

---

### 19. Dark Mode
- [ ] Set up shadcn/ui dark mode
- [ ] Create theme provider
- [ ] Add theme switcher
- [ ] Test all pages in dark mode
- [ ] Persist user preference

**Estimate:** 1 day

---

### 20. PWA Features
- [ ] Create service worker
- [ ] Add manifest.json
- [ ] Enable offline mode
- [ ] Add install prompt
- [ ] Push notifications
- [ ] Test PWA install

**Estimate:** 2-3 days

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] Backend services (80% coverage target)
- [ ] Frontend components
- [ ] Utility functions
- [ ] Set up Jest configuration
- [ ] Run tests in CI/CD

**Estimate:** 1 week

---

### Integration Tests
- [ ] API endpoint tests
- [ ] Database transaction tests
- [ ] Authentication flow tests
- [ ] Set up test database
- [ ] Mock external services

**Estimate:** 3-4 days

---

### E2E Tests (Automated)
- [ ] Set up Playwright test suite
- [ ] Test critical user flows
- [ ] Test booking → deposit workflow
- [ ] Test admin approval workflow
- [ ] Run tests in CI/CD

**Estimate:** 1 week

---

## 🐛 Bug Fixes Needed

### Known Issues:
- [ ] Dashboard "Tổng Căn" shows 0 (needs stats endpoint)
- [ ] Backend script naming (start:dev vs dev)
- [ ] TypeScript strict mode disabled (tech debt)
- [ ] Some API error messages not user-friendly
- [ ] Port conflicts (5173-5175 occupied)

**Estimate:** 1 day total

---

## 📦 Deployment Checklist

### Pre-deployment:
- [ ] Environment variables secured
- [ ] Database backups configured
- [ ] SSL certificates obtained
- [ ] Domain DNS configured
- [ ] CDN set up (images, static assets)
- [ ] Monitoring tools installed
- [ ] Error tracking (Sentry)
- [ ] Log aggregation

### Deployment:
- [ ] Build Docker images
- [ ] Push to container registry
- [ ] Deploy to staging
- [ ] Run smoke tests
- [ ] Deploy to production
- [ ] Monitor for errors
- [ ] Update documentation

**Estimate:** 2-3 days

---

## 📚 Documentation Checklist

### Technical Docs:
- [x] Business requirements
- [x] Functional requirements
- [x] Database design
- [x] API specifications
- [x] System architecture
- [x] Code patterns
- [ ] API documentation (Swagger)
- [ ] Deployment guide
- [ ] Troubleshooting guide

### User Docs:
- [ ] Admin user manual
- [ ] CTV user manual
- [ ] FAQ section
- [ ] Video tutorials
- [ ] Training materials

**Estimate:** 3-4 days

---

## 🎯 Sprint Planning

### Sprint 1 (Week 1): Production Essentials
**Goal:** Make system production-ready

- [ ] File uploads (S3)
- [ ] Email/SMS service
- [ ] Cron jobs
- [ ] Security hardening
- [ ] PostgreSQL migration

**Success Criteria:** Can handle real user uploads and notifications

---

### Sprint 2 (Week 2): Core Features
**Goal:** Complete all MVP features

- [ ] Connect CTV Portal APIs
- [ ] Dashboard stats endpoint
- [ ] Unit CRUD forms
- [ ] Users management
- [ ] Docker setup

**Success Criteria:** All pages functional with real data

---

### Sprint 3 (Week 3-4): Polish & Deploy
**Goal:** Deploy to staging

- [ ] Testing (unit, integration, E2E)
- [ ] Bug fixes
- [ ] Performance optimization
- [ ] Documentation
- [ ] Staging deployment

**Success Criteria:** Staging environment running stable

---

## ✅ Definition of Done

A feature is considered "done" when:

1. ✅ Code written and reviewed
2. ✅ Tests written and passing
3. ✅ API integrated (if applicable)
4. ✅ UI implemented (if applicable)
5. ✅ Documentation updated
6. ✅ No TypeScript errors
7. ✅ No console errors
8. ✅ Tested on all devices (desktop/tablet/mobile)
9. ✅ Reviewed by another developer
10. ✅ Deployed to staging

---

## 📊 Progress Tracking

Use this checklist to track development:

```
□ Not started
◐ In progress
✓ Complete
✗ Blocked
```

### Example:
```
✓ Backend APIs
✓ Admin UI
◐ CTV Portal (UI done, API pending)
□ File uploads
□ Email service
```

---

## 🎯 Success Metrics

### Code Quality:
- [ ] TypeScript coverage: 100%
- [ ] Test coverage: >80%
- [ ] No critical bugs
- [ ] No security vulnerabilities
- [ ] Page load time: <2s

### Features:
- [ ] All CRUD operations working
- [ ] All workflows tested
- [ ] All pages responsive
- [ ] All APIs documented
- [ ] All forms validated

### User Experience:
- [ ] <3 clicks to any action
- [ ] Clear error messages
- [ ] Fast page transitions
- [ ] Mobile-friendly
- [ ] Accessible (WCAG 2.1)

---

## 🚀 Ready to Go

This checklist will guide development for the next phase. Priority order:

1. 🔴 **Critical tasks** - Do first (1-2 weeks)
2. 🟡 **High tasks** - Do second (1 week)
3. 🟢 **Medium/Low tasks** - Do later (2-4 weeks)

**Track your progress and update this checklist as you go!**

---

**Last Updated:** October 11, 2025  
**Next Review:** After Phase 1 completion

