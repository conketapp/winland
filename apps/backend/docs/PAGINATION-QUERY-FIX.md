# Pagination Query Parameters Fix

**Ngày:** December 2024  
**Module:** Projects API  
**Issue:** 400 Bad Request khi gọi API với pagination params

---

## 📋 Vấn Đề

### Error:
```
GET http://localhost:3002/api/projects?page=1&pageSize=20
400 (Bad Request)

Response:
{
  "message": [
    "property page should not exist",
    "property pageSize should not exist"
  ],
  "error": "Bad Request",
  "statusCode": 400
}
```

### Nguyên nhân:
- `ValidationPipe` với `forbidNonWhitelisted: true` đang reject các properties `page` và `pageSize`
- Mặc dù đã có decorators trong DTO, nhưng ValidationPipe không nhận diện được
- Có thể do thứ tự decorators hoặc cách transform query params

---

## ✅ Giải Pháp

### 1. Tách Pagination Params khỏi DTO

**Before:**
```typescript
// QueryProjectDto có page và pageSize
export class QueryProjectDto {
  // ... other fields
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number;
  
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize?: number;
}

// Controller
@Get()
findAll(@Query() query: QueryProjectDto) {
  return this.projectsService.findAll(query);
}
```

**After:**
```typescript
// QueryProjectDto không có page và pageSize
export class QueryProjectDto {
  // ... other fields (status, city, search, etc.)
  // No page/pageSize
}

// Controller - Parse pagination params separately
@Get()
findAll(
  @Query() query: QueryProjectDto,
  @Query('page', new DefaultValuePipe(1), new ParseIntPipe({ optional: true })) page?: number,
  @Query('pageSize', new DefaultValuePipe(20), new ParseIntPipe({ optional: true })) pageSize?: number,
) {
  const validatedPage = page && page > 0 ? page : 1;
  const validatedPageSize = pageSize && pageSize > 0 && pageSize <= 100 ? pageSize : 20;
  
  return this.projectsService.findAll({
    ...query,
    page: validatedPage,
    pageSize: validatedPageSize,
  });
}
```

### 2. Alternative: Individual Query Params

**Option 2:**
```typescript
@Get()
findAll(
  @Query('status') status?: ProjectStatus,
  @Query('city') city?: string,
  @Query('search') search?: string,
  @Query('sortBy') sortBy?: string,
  @Query('sortOrder') sortOrder?: 'asc' | 'desc',
  @Query('page', new DefaultValuePipe(1), new ParseIntPipe({ optional: true })) page?: number,
  @Query('pageSize', new DefaultValuePipe(20), new ParseIntPipe({ optional: true })) pageSize?: number,
) {
  const validatedPage = page && page > 0 ? page : 1;
  const validatedPageSize = pageSize && pageSize > 0 && pageSize <= 100 ? pageSize : 20;
  
  return this.projectsService.findAll({
    status,
    city,
    search,
    sortBy,
    sortOrder,
    page: validatedPage,
    pageSize: validatedPageSize,
  });
}
```

### 3. Update ValidationPipe Config

**File:** `apps/backend/src/main.ts`

```typescript
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,
    forbidNonWhitelisted: false, // Allow extra properties in query params
    transform: true,
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
```

**Note:** `forbidNonWhitelisted: false` cho phép extra properties trong query params, nhưng vẫn validate các properties có trong DTO.

---

## 🔍 Root Cause

### Vấn đề với ValidationPipe:

1. **`forbidNonWhitelisted: true`** - Reject properties không có trong DTO
2. **Query params là strings** - Cần transform sang number
3. **`@Type(() => Number)`** - Có thể không hoạt động đúng với query params
4. **Thứ tự decorators** - Có thể ảnh hưởng đến validation

### Giải pháp:

- **Tách pagination params** - Parse riêng với `ParseIntPipe`
- **Manual validation** - Validate page và pageSize trong controller
- **Default values** - Sử dụng `DefaultValuePipe` cho default values

---

## 📝 Files Changed

### Updated Files:
1. `apps/backend/src/modules/projects/projects.controller.ts`
   - Tách pagination params khỏi DTO
   - Sử dụng `ParseIntPipe` cho page và pageSize
   - Manual validation trong controller

2. `apps/backend/src/modules/projects/dto/query-project.dto.ts`
   - Loại bỏ page và pageSize khỏi DTO

3. `apps/backend/src/main.ts`
   - Set `forbidNonWhitelisted: false` để allow extra query params

---

## ✅ Testing

### Test API:
```bash
# Should work now
curl "http://localhost:3002/api/projects?page=1&pageSize=20"

# With filters
curl "http://localhost:3002/api/projects?status=OPEN&page=1&pageSize=20"

# With search
curl "http://localhost:3002/api/projects?search=vinhomes&page=1&pageSize=20"
```

### Expected Response:
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20,
  "totalPages": 5,
  "hasNext": true,
  "hasPrev": false
}
```

---

## 🚀 Alternative Solutions

### Option 1: Keep in DTO with Transform

```typescript
@IsOptional()
@Transform(({ value }) => {
  if (value === undefined || value === null || value === '') return undefined;
  const num = Number(value);
  return isNaN(num) ? undefined : num;
})
@IsInt()
@Min(1)
page?: number;
```

### Option 2: Use ParseIntPipe in Controller

```typescript
@Query('page', new DefaultValuePipe(1), ParseIntPipe) page: number
```

### Option 3: Disable Validation for Query Params

```typescript
@Get()
@UsePipes(new ValidationPipe({ skipMissingProperties: true }))
findAll(@Query() query: QueryProjectDto) {
  // ...
}
```

---

## ✅ Summary

### Before:
- ❌ 400 Bad Request
- ❌ "property page should not exist"
- ❌ "property pageSize should not exist"
- ❌ ValidationPipe reject pagination params

### After:
- ✅ Parse pagination params với ParseIntPipe
- ✅ Manual validation trong controller
- ✅ Default values với DefaultValuePipe
- ✅ API works correctly

**Result:** Pagination query params được xử lý đúng cách! 🎉

---

**Last Updated:** December 2024
