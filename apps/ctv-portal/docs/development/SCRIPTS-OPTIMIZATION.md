# Scripts Optimization

## Overview
Complete reorganization of utility scripts for better maintainability.

## New Structure

```
scripts/
├── index.ts              # Main CLI entry point
├── README.md             # Documentation
├── user/                 # User management
│   ├── create-test-user.ts
│   ├── update-user-deals.ts
│   └── set-user-deals.ts
├── test/                 # Testing scripts
│   ├── test-api-direct.ts
│   ├── test-password-validation.ts
│   └── test-form-validation.ts
└── utils/                # Utilities
    └── diagnose-issue.ts
```

## CLI Interface

### Show All Commands
```bash
npm run script help
```

### Run Commands
```bash
npm run script user:create
npm run script test:db
npm run script diagnose
```

## NPM Shortcuts

Added convenient npm scripts:

```bash
npm run script:user:create    # Create test user
npm run script:user:deals     # Update all users
npm run script:test:db        # Test database
npm run script:diagnose       # Run diagnostics

# Database shortcuts
npm run db:push              # Push schema
npm run db:generate          # Generate client
npm run db:studio            # Open Prisma Studio
```

## Benefits

### 1. Easier to Use
- Single command to see all scripts
- Consistent naming convention
- Clear categorization

### 2. Better Maintainability
- Organized by purpose
- Easy to find scripts
- Clear file structure

### 3. Improved Documentation
- README with examples
- Usage instructions
- Troubleshooting guide

### 4. Faster Development
- Quick access via npm scripts
- No need to remember long paths
- Autocomplete friendly

## Migration

### Old Way
```bash
npx tsx scripts/create-test-user.ts
npx tsx scripts/test-api-direct.ts
```

### New Way
```bash
npm run script user:create
npm run script test:db
```

## Common Commands

| Task | Command |
|------|---------|
| Create test user | `npm run script:user:create` |
| Update deals | `npm run script:user:deals` |
| Test database | `npm run script:test:db` |
| Diagnose | `npm run script:diagnose` |
| Prisma Studio | `npm run db:studio` |

## Documentation

See [Scripts README](../../scripts/README.md) for complete documentation.
