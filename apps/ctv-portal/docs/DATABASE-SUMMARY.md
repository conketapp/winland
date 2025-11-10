# Database Summary

## Overview
Complete database structure for the CTV Portal application using PostgreSQL with Prisma ORM.

## Database Configuration

### Connection
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Client Output:** `lib/generated/prisma`
- **Connection String:** `DATABASE_URL` in `.env`

### Example Connection
```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

## Database Structure

### Complete Schema Overview
```
User (Core)
├── Authentication & Profile
├── OTP Verification
├── Projects Management
│   ├── Buildings
│   │   ├── Floors
│   │   │   └── Units
│   │   │       ├── Unit Types
│   │   │       ├── Reservations
│   │   │       ├── Bookings
│   │   │       └── Deposits
│   │   │           ├── Payment Schedules
│   │   │           ├── Transactions
│   │   │           └── Commissions
│   │   │               └── Payment Requests
├── System Configuration
├── PDF Templates
└── Audit Logs
```

## Models (18 Total)

### 1. User
**Purpose:** User accounts (CTV, Admin, Super Admin)

**Fields:**
- `id` - UUID primary key
- `phone` - Unique phone number
- `email` - Unique email address
- `password` - Hashed password
- `fullName` - Full name
- `avatar` - Profile picture URL
- `role` - User role (SUPER_ADMIN, ADMIN, CTV, USER)
- `isActive` - Account status
- `totalDeals` - Number of completed deals
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Projects created
- Reservations, Bookings, Deposits
- Commissions, Payment requests
- Audit logs

### 2. OTP
**Purpose:** One-Time Password verification

**Fields:**
- `id` - UUID primary key
- `phone` - Phone number
- `code` - OTP code
- `purpose` - Verification purpose
- `attempts` - Number of attempts
- `expiresAt` - Expiration time
- `verifiedAt` - Verification timestamp
- `createdAt` - Creation timestamp

### 3. Project
**Purpose:** Real estate projects

**Fields:**
- `id` - UUID primary key
- `name` - Project name
- `code` - Unique project code
- `status` - UPCOMING, OPEN, CLOSED
- `developer` - Developer name
- `location` - Location description
- `address` - Full address
- `district` - District
- `city` - City
- `latitude` - GPS latitude
- `longitude` - GPS longitude
- `totalArea` - Total area (m²)
- `totalBuildings` - Number of buildings
- `totalUnits` - Number of units
- `priceFrom` - Starting price
- `priceTo` - Maximum price
- `description` - Project description
- `amenities` - Amenities list
- `images` - Image URLs (JSON)
- `masterPlan` - Master plan image
- `floorPlan` - Floor plan image
- `openDate` - Opening date
- `commissionRate` - Commission rate (%)
- `createdBy` - Creator user ID
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Buildings, Units
- Creator (User)

### 4. Building
**Purpose:** Buildings within projects

**Fields:**
- `id` - UUID primary key
- `projectId` - Parent project
- `code` - Building code
- `name` - Building name
- `floors` - Number of floors
- `description` - Description
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Project, Floors, Units

### 5. Floor
**Purpose:** Floors within buildings

**Fields:**
- `id` - UUID primary key
- `buildingId` - Parent building
- `number` - Floor number
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Building, Units

### 6. Unit
**Purpose:** Individual apartments/units

**Fields:**
- `id` - UUID primary key
- `projectId` - Parent project
- `buildingId` - Parent building
- `floorId` - Parent floor
- `code` - Unique unit code
- `unitNumber` - Unit number
- `unitTypeId` - Unit type
- `status` - AVAILABLE, RESERVED_BOOKING, DEPOSITED, SOLD
- `price` - Unit price
- `area` - Area (m²)
- `bedrooms` - Number of bedrooms
- `bathrooms` - Number of bathrooms
- `direction` - Facing direction
- `balcony` - Has balcony
- `view` - View description
- `description` - Unit description
- `floorPlanImage` - Floor plan image
- `images` - Image URLs (JSON)
- `commissionRate` - Custom commission rate
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Project, Building, Floor, Unit Type
- Reservations, Bookings, Deposits, Commissions

### 7. UnitType
**Purpose:** Unit type definitions (1BR, 2BR, etc.)

**Fields:**
- `id` - UUID primary key
- `name` - Type name
- `code` - Unique type code
- `description` - Description
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Units

### 8. Reservation
**Purpose:** Unit reservation queue system

**Fields:**
- `id` - UUID primary key
- `code` - Unique reservation code
- `unitId` - Reserved unit
- `ctvId` - CTV who created
- `customerName` - Customer name
- `customerPhone` - Customer phone
- `customerEmail` - Customer email
- `notes` - Notes
- `status` - ACTIVE, YOUR_TURN, MISSED, EXPIRED, CANCELLED, COMPLETED
- `priority` - Queue priority
- `reservedUntil` - Reservation expiry
- `extendCount` - Number of extensions
- `cancelledBy` - Who cancelled
- `cancelledReason` - Cancellation reason
- `notifiedAt` - Notification timestamp
- `depositDeadline` - Deposit deadline
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Unit, CTV (User)

### 9. Booking
**Purpose:** Unit booking with payment

**Fields:**
- `id` - UUID primary key
- `code` - Unique booking code
- `unitId` - Booked unit
- `ctvId` - CTV who created
- `customerName` - Customer name
- `customerPhone` - Customer phone
- `customerEmail` - Customer email
- `customerIdCard` - ID card number
- `customerAddress` - Address
- `bookingAmount` - Booking amount
- `paymentMethod` - Payment method
- `paymentProof` - Payment proof URL
- `status` - PENDING_PAYMENT, PENDING_APPROVAL, CONFIRMED, CANCELLED, EXPIRED, UPGRADED
- `expiresAt` - Booking expiry
- `approvedBy` - Approver user ID
- `approvedAt` - Approval timestamp
- `cancelledReason` - Cancellation reason
- `refundAmount` - Refund amount
- `notes` - Notes
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Unit, CTV (User), Approver (User)

### 10. Deposit
**Purpose:** Deposit contracts

**Fields:**
- `id` - UUID primary key
- `code` - Unique deposit code
- `unitId` - Deposited unit
- `ctvId` - CTV who created
- `customerName` - Customer name
- `customerPhone` - Customer phone
- `customerEmail` - Customer email
- `customerIdCard` - ID card number
- `customerAddress` - Address
- `depositAmount` - Deposit amount
- `depositPercentage` - Deposit percentage
- `depositDate` - Deposit date
- `paymentMethod` - Payment method
- `paymentProof` - Payment proof URL
- `contractUrl` - Contract document URL
- `status` - PENDING_APPROVAL, CONFIRMED, OVERDUE, CANCELLED, COMPLETED
- `approvedBy` - Approver user ID
- `approvedAt` - Approval timestamp
- `cancelledBy` - Canceller user ID
- `cancelledReason` - Cancellation reason
- `refundAmount` - Refund amount
- `notes` - Notes
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Unit, CTV (User), Approver (User), Canceller (User)
- Payment Schedules, Transactions, Commission

### 11. PaymentSchedule
**Purpose:** Payment installment schedules

**Fields:**
- `id` - UUID primary key
- `depositId` - Parent deposit
- `installment` - Installment number
- `name` - Installment name
- `percentage` - Percentage of total
- `amount` - Amount
- `dueDate` - Due date
- `status` - PENDING, PAID, OVERDUE, CANCELLED
- `paidAmount` - Amount paid
- `paidAt` - Payment timestamp
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Deposit, Transactions

### 12. Transaction
**Purpose:** Payment transactions

**Fields:**
- `id` - UUID primary key
- `depositId` - Parent deposit
- `paymentScheduleId` - Related schedule
- `amount` - Transaction amount
- `paymentDate` - Payment date
- `paymentMethod` - Payment method
- `paymentProof` - Payment proof URL
- `transactionRef` - Transaction reference
- `status` - PENDING_CONFIRMATION, CONFIRMED, CANCELLED
- `confirmedAt` - Confirmation timestamp
- `notes` - Notes
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Deposit, Payment Schedule

### 13. Commission
**Purpose:** CTV commission tracking

**Fields:**
- `id` - UUID primary key
- `unitId` - Related unit
- `ctvId` - CTV user
- `depositId` - Related deposit
- `amount` - Commission amount
- `rate` - Commission rate
- `status` - PENDING, APPROVED, PAID
- `paidAt` - Payment timestamp
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Unit, CTV (User), Deposit
- Payment Requests

### 14. PaymentRequest
**Purpose:** Commission payment requests

**Fields:**
- `id` - UUID primary key
- `commissionId` - Related commission
- `ctvId` - CTV user
- `amount` - Request amount
- `bankName` - Bank name
- `bankAccount` - Account number
- `bankAccountName` - Account holder name
- `status` - PENDING, APPROVED, REJECTED
- `requestedAt` - Request timestamp
- `approvedBy` - Approver user ID
- `approvedAt` - Approval timestamp
- `rejectedReason` - Rejection reason
- `notes` - Notes
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

**Relations:**
- Commission, CTV (User), Approver (User)

### 15. SystemConfig
**Purpose:** System configuration

**Fields:**
- `id` - UUID primary key
- `key` - Config key
- `value` - Config value
- `type` - Value type
- `label` - Display label
- `category` - Config category
- `description` - Description
- `editableBy` - Who can edit
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### 16. PdfTemplate
**Purpose:** PDF template management

**Fields:**
- `id` - UUID primary key
- `type` - Template type
- `name` - Template name
- `templateUrl` - Template file URL
- `variables` - Template variables (JSON)
- `isDefault` - Is default template
- `isActive` - Is active
- `createdAt` - Creation timestamp
- `updatedAt` - Last update timestamp

### 17. AuditLog
**Purpose:** Audit trail for all actions

**Fields:**
- `id` - UUID primary key
- `userId` - User who performed action
- `action` - Action performed
- `entityType` - Entity type
- `entityId` - Entity ID
- `oldValue` - Old value (JSON)
- `newValue` - New value (JSON)
- `ipAddress` - IP address
- `userAgent` - User agent
- `createdAt` - Creation timestamp

**Relations:**
- User

## Enums (10 Total)

### UserRole
- `SUPER_ADMIN` - Super administrator
- `ADMIN` - Administrator
- `CTV` - Collaborator (Sales agent)
- `USER` - Regular user

### ProjectStatus
- `UPCOMING` - Project upcoming
- `OPEN` - Project open for sales
- `CLOSED` - Project closed

### UnitStatus
- `AVAILABLE` - Available for sale
- `RESERVED_BOOKING` - Reserved or booked
- `DEPOSITED` - Deposit paid
- `SOLD` - Sold

### ReservationStatus
- `ACTIVE` - Active reservation
- `YOUR_TURN` - Customer's turn
- `MISSED` - Missed turn
- `EXPIRED` - Reservation expired
- `CANCELLED` - Cancelled
- `COMPLETED` - Completed

### BookingStatus
- `PENDING_PAYMENT` - Waiting for payment
- `PENDING_APPROVAL` - Waiting for approval
- `CONFIRMED` - Confirmed
- `CANCELLED` - Cancelled
- `EXPIRED` - Expired
- `UPGRADED` - Upgraded to deposit

### DepositStatus
- `PENDING_APPROVAL` - Waiting for approval
- `CONFIRMED` - Confirmed
- `OVERDUE` - Payment overdue
- `CANCELLED` - Cancelled
- `COMPLETED` - Completed

### PaymentScheduleStatus
- `PENDING` - Pending payment
- `PAID` - Paid
- `OVERDUE` - Overdue
- `CANCELLED` - Cancelled

### TransactionStatus
- `PENDING_CONFIRMATION` - Waiting for confirmation
- `CONFIRMED` - Confirmed
- `CANCELLED` - Cancelled

### CommissionStatus
- `PENDING` - Pending approval
- `APPROVED` - Approved
- `PAID` - Paid

### PaymentRequestStatus
- `PENDING` - Pending approval
- `APPROVED` - Approved
- `REJECTED` - Rejected

## Database Commands

### Push Schema to Database
```bash
npx prisma db push
```

### Generate Prisma Client
```bash
npx prisma generate
```

### Open Prisma Studio (GUI)
```bash
npm run db:studio
```

### Format Schema
```bash
npx prisma format
```

### Validate Schema
```bash
npx prisma validate
```

### Pull Schema from Database
```bash
npx prisma db pull
```

## Quick Scripts

### User Management
```bash
npm run script:user:create    # Create test user
npm run script:user:deals     # Update user deals
```

### Testing
```bash
npm run script:test:db        # Test database connection
npm run script:diagnose       # Run diagnostics
```

## Database Statistics

- **Total Tables:** 18
- **Total Enums:** 10
- **Total Relations:** 40+
- **Total Indexes:** 30+

## Key Features

### Real Estate Management
- Multi-project support
- Hierarchical structure (Project → Building → Floor → Unit)
- Unit types and categorization
- Comprehensive unit details

### Sales Process
- Reservation queue system
- Booking with payment
- Deposit contracts
- Payment schedules
- Transaction tracking

### CTV Management
- Commission calculation
- Payment requests
- Performance tracking (totalDeals)
- Audit trail

### System Features
- OTP verification
- Dynamic configuration
- PDF template management
- Complete audit logging

## Security Features

- Password hashing (implement bcrypt)
- OTP verification
- Audit logging
- User role-based access
- Active/inactive user status

## Performance Optimizations

- Indexed fields for fast queries
- Cascading deletes for data integrity
- Optimized relations
- Efficient query patterns

## Backup & Maintenance

### Backup Database
```bash
pg_dump -U user -d database > backup.sql
```

### Restore Database
```bash
psql -U user -d database < backup.sql
```

### Check Database Size
```sql
SELECT pg_size_pretty(pg_database_size('database_name'));
```

## Documentation

- [User Data Integration](./features/USER-DATA-INTEGRATION.md)
- [Total Deals Feature](./features/TOTAL-DEALS.md)
- [Scripts Guide](../scripts/README.md)
- [Troubleshooting](./troubleshooting/)

## Support

For database issues:
1. Run diagnostics: `npm run script:diagnose`
2. Check connection: `npm run script:test:db`
3. View in Studio: `npm run db:studio`
4. See [Troubleshooting](./troubleshooting/500-ERROR-FIX.md)
