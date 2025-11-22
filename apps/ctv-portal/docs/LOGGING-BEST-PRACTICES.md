# Logging Best Practices

## Security Issue: Console.log in Production

**Problem:** Using `console.log()` directly in code can leak sensitive information in production environments, including:
- User credentials (passwords, tokens, phone numbers)
- Personal information (emails, addresses, IDs)
- Internal system details
- API keys and secrets
- Database queries and results

## Solution: Use Logger Utility

We've created a safe logging utility at `lib/logger.ts` that:
- Only logs detailed information in development mode
- Only logs errors in production mode
- Sanitizes sensitive data
- Provides consistent log formatting

## Usage

### Import the Logger
```typescript
import { logger } from '@/lib/logger';
```

### Log Levels

#### 1. Info - General information
```typescript
logger.info('User action completed', { action: 'profile_update' });
```

#### 2. Debug - Detailed debugging (development only)
```typescript
logger.debug('API request received', { 
    endpoint: '/api/user/me',
    hasAuth: true 
});
```

#### 3. Warning - Potential issues
```typescript
logger.warn('Rate limit approaching', { requests: 95, limit: 100 });
```

#### 4. Error - Errors and exceptions
```typescript
logger.error('Database query failed', error);
```

### Grouped Logs
```typescript
logger.group('🔄 Profile Update');
logger.debug('Request data', { fields: ['name', 'email'] });
logger.debug('Validation passed');
logger.groupEnd();
```

## What NOT to Log

### ❌ Never Log:
- Passwords (plain or hashed)
- Full phone numbers
- Email addresses
- Credit card numbers
- API keys or tokens
- Session IDs
- Full user objects

### ✅ Safe to Log:
- Action types ('login', 'update', 'delete')
- Boolean flags (hasEmail, isValid, success)
- Counts and statistics
- Masked identifiers ('user_***', 'phone_***')
- Error messages (without sensitive data)

## Examples

### Bad ❌
```typescript
console.log('User logged in:', user);
// Exposes: { id, phone, email, password, etc. }

console.log('Login attempt:', { phone: '0912345678', password: 'secret123' });
// Exposes credentials!
```

### Good ✅
```typescript
logger.info('User logged in', { userId: user.id });
// Only logs user ID

logger.debug('Login attempt', { 
    phone: user.phone ? '***' : 'none',
    hasPassword: !!password 
});
// Masks sensitive data
```

## Migration Guide

### Replace console.log
```typescript
// Before
console.log('User data:', userData);

// After
logger.debug('User data loaded', { 
    hasData: !!userData,
    fields: Object.keys(userData)
});
```

### Replace console.error
```typescript
// Before
console.error('Error:', error);

// After
logger.error('Operation failed', error);
```

### Replace console.warn
```typescript
// Before
console.warn('Deprecated API used');

// After
logger.warn('Deprecated API used', { endpoint: '/old-api' });
```

## Production Behavior

In production (`NODE_ENV=production`):
- `logger.info()` - Silent
- `logger.debug()` - Silent
- `logger.warn()` - Silent
- `logger.error()` - Logs to console.error (for monitoring)

## Monitoring Integration

The logger can be extended to integrate with monitoring services:
- Sentry
- LogRocket
- Datadog
- CloudWatch

Example:
```typescript
// In lib/logger.ts
if (level === 'error' && process.env.NODE_ENV === 'production') {
    // Send to Sentry
    Sentry.captureException(error);
}
```

## Files Updated

The following files have been updated to use the logger:
- ✅ `app/login/page.tsx` - Removed sensitive user data logging
- ✅ `app/signup/page.tsx` - Removed user data logging
- ✅ `app/api/user/me/route.ts` - Sanitized API logs
- ⚠️ Other files - Need review and update

## TODO

Files that still need updating:
- `app/login/authentication/page.tsx`
- `app/login/forget-pass/page.tsx`
- `app/login/reset-password/page.tsx`
- `app/api/auth/signup/route.ts`
- `app/api/test-db/route.ts`
- All other API routes with console.log

## Checklist for New Code

Before committing code, ensure:
- [ ] No `console.log()` with sensitive data
- [ ] Use `logger` utility instead
- [ ] Sensitive data is masked or omitted
- [ ] Only necessary information is logged
- [ ] Logs are helpful for debugging
- [ ] Production logs don't expose internals
