# Project Audit Log Implementation

**Ngày:** December 2024  
**Module:** Projects  
**Feature:** Audit logging for Create/Update/Delete operations

---

## 📋 Vấn Đề Ban Đầu

### Vấn đề:
- ❌ Create/Update/Delete project không có audit log
- ❌ Không track ai thay đổi gì
- ❌ Không có lịch sử thay đổi
- ❌ Khó debug khi có vấn đề

**Hạn chế:**
- ❌ Không biết ai tạo project
- ❌ Không biết ai update project
- ❌ Không biết ai delete project
- ❌ Không track được thay đổi gì

---

## ✅ Giải Pháp

### 1. Create Project - Audit Log

**Implementation:**
```typescript
async create(dto: CreateProjectDto, createdBy: string) {
  // Create project in transaction with audit log
  const project = await this.prisma.$transaction(async (tx) => {
    const created = await tx.project.create({
      data: { ...dto, createdBy },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: createdBy,
        action: 'CREATE',
        entityType: 'PROJECT',
        entityId: created.id,
        newValue: JSON.stringify({
          name: created.name,
          code: created.code,
          status: created.status,
          developer: created.developer,
          city: created.city,
          location: created.location,
        }),
      },
    });

    return created;
  });

  return project;
}
```

**Audit Log Fields:**
- `userId`: User tạo project
- `action`: `'CREATE'`
- `entityType`: `'PROJECT'`
- `entityId`: Project ID
- `newValue`: JSON của project data

### 2. Update Project - Audit Log

**Implementation:**
```typescript
async update(id: string, dto: UpdateProjectDto, userId: string) {
  // Get old project data
  const oldProject = await this.prisma.project.findUnique({
    where: { id },
  });

  // Update in transaction with audit log
  const updated = await this.prisma.$transaction(async (tx) => {
    const updatedProject = await tx.project.update({
      where: { id },
      data: { ...dto },
    });

    // Track changed fields
    const changes: Record<string, { old: unknown; new: unknown }> = {};
    Object.keys(dto).forEach((key) => {
      const oldValue = (oldProject as Record<string, unknown>)[key];
      const newValue = (updatedProject as Record<string, unknown>)[key];
      
      if (JSON.stringify(oldValue) !== JSON.stringify(newValue)) {
        changes[key] = { old: oldValue, new: newValue };
      }
    });

    // Create audit log if there are changes
    if (Object.keys(changes).length > 0) {
      await tx.auditLog.create({
        data: {
          userId,
          action: 'UPDATE',
          entityType: 'PROJECT',
          entityId: id,
          oldValue: JSON.stringify({
            name: oldProject.name,
            code: oldProject.code,
            status: oldProject.status,
            developer: oldProject.developer,
            city: oldProject.city,
            location: oldProject.location,
            ...Object.fromEntries(
              Object.entries(changes).map(([key, values]) => [key, values.old])
            ),
          }),
          newValue: JSON.stringify({
            name: updatedProject.name,
            code: updatedProject.code,
            status: updatedProject.status,
            developer: updatedProject.developer,
            city: updatedProject.city,
            location: updatedProject.location,
            ...Object.fromEntries(
              Object.entries(changes).map(([key, values]) => [key, values.new])
            ),
          }),
        },
      });
    }

    return updatedProject;
  });

  return updated;
}
```

**Audit Log Fields:**
- `userId`: User update project
- `action`: `'UPDATE'`
- `entityType`: `'PROJECT'`
- `entityId`: Project ID
- `oldValue`: JSON của project data cũ
- `newValue`: JSON của project data mới
- Chỉ log khi có thay đổi thực sự

### 3. Delete Project - Audit Log

**Implementation:**
```typescript
async remove(id: string, userId: string) {
  // Get project data before deletion
  const project = await this.prisma.project.findUnique({
    where: { id },
    include: { units: { where: { status: { notIn: ['AVAILABLE'] } } } },
  });

  if (!project) {
    throw new NotFoundException('Dự án không tồn tại');
  }

  // Cannot delete if has units that are not AVAILABLE
  if (project.units.length > 0) {
    throw new BadRequestException(
      'Không thể xóa dự án có căn hộ đang được giữ chỗ/đặt cọc/đã bán'
    );
  }

  // Soft delete in transaction with audit log
  const deleted = await this.prisma.$transaction(async (tx) => {
    const softDeleted = await tx.project.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId,
        action: 'DELETE',
        entityType: 'PROJECT',
        entityId: id,
        oldValue: JSON.stringify({
          name: project.name,
          code: project.code,
          status: project.status,
          developer: project.developer,
          city: project.city,
          location: project.location,
        }),
      },
    });

    return softDeleted;
  });

  return { message: 'Xóa dự án thành công', project: deleted };
}
```

**Audit Log Fields:**
- `userId`: User delete project
- `action`: `'DELETE'`
- `entityType`: `'PROJECT'`
- `entityId`: Project ID
- `oldValue`: JSON của project data (trước khi xóa)
- Soft delete (set `deletedAt`) thay vì hard delete

---

## 🔄 Controller Changes

### Update Controller Methods:

**Before:**
```typescript
@Patch(':id')
@UseGuards(JwtAuthGuard)
update(@Param('id') id: string, @Body() dto: UpdateProjectDto) {
  return this.projectsService.update(id, dto);
}

@Delete(':id')
@UseGuards(JwtAuthGuard)
remove(@Param('id') id: string) {
  return this.projectsService.remove(id);
}
```

**After:**
```typescript
@Patch(':id')
@UseGuards(JwtAuthGuard)
update(@Param('id') id: string, @Body() dto: UpdateProjectDto, @Request() req) {
  return this.projectsService.update(id, dto, req.user.userId);
}

@Delete(':id')
@UseGuards(JwtAuthGuard)
remove(@Param('id') id: string, @Request() req) {
  return this.projectsService.remove(id, req.user.userId);
}
```

**Note:** `create` method đã có `@Request() req` và truyền `req.user.userId` từ trước.

---

## 📊 Audit Log Data Structure

### CREATE Action:
```json
{
  "userId": "user-uuid",
  "action": "CREATE",
  "entityType": "PROJECT",
  "entityId": "project-uuid",
  "newValue": "{\"name\":\"Vinhomes Smart City\",\"code\":\"VHS-2025\",\"status\":\"UPCOMING\",\"developer\":\"Vingroup\",\"city\":\"Hà Nội\",\"location\":\"Miền Bắc\"}"
}
```

### UPDATE Action:
```json
{
  "userId": "user-uuid",
  "action": "UPDATE",
  "entityType": "PROJECT",
  "entityId": "project-uuid",
  "oldValue": "{\"name\":\"Vinhomes Smart City\",\"code\":\"VHS-2025\",\"status\":\"UPCOMING\",\"developer\":\"Vingroup\",\"city\":\"Hà Nội\",\"location\":\"Miền Bắc\"}",
  "newValue": "{\"name\":\"Vinhomes Smart City 2\",\"code\":\"VHS-2025\",\"status\":\"OPEN\",\"developer\":\"Vingroup\",\"city\":\"Hà Nội\",\"location\":\"Miền Bắc\"}"
}
```

### DELETE Action:
```json
{
  "userId": "user-uuid",
  "action": "DELETE",
  "entityType": "PROJECT",
  "entityId": "project-uuid",
  "oldValue": "{\"name\":\"Vinhomes Smart City\",\"code\":\"VHS-2025\",\"status\":\"CLOSED\",\"developer\":\"Vingroup\",\"city\":\"Hà Nội\",\"location\":\"Miền Bắc\"}"
}
```

---

## 🎯 Benefits

### 1. Traceability
- ✅ **Track who did what** - Biết ai tạo/update/delete
- ✅ **Track when** - Timestamp tự động
- ✅ **Track what changed** - Old vs new values

### 2. Compliance & Security
- ✅ **Audit trail** - Đáp ứng yêu cầu compliance
- ✅ **Accountability** - Mỗi thay đổi có người chịu trách nhiệm
- ✅ **Forensics** - Có thể trace lại lịch sử

### 3. Debugging
- ✅ **Troubleshooting** - Dễ tìm nguyên nhân vấn đề
- ✅ **History** - Xem lại lịch sử thay đổi
- ✅ **Rollback info** - Có thể restore từ oldValue

---

## 📝 Files Changed

### Updated Files:
1. **`apps/backend/src/modules/projects/projects.service.ts`**
   - ✅ `create()` - Thêm audit log trong transaction
   - ✅ `update()` - Thêm userId parameter, audit log với old/new values
   - ✅ `remove()` - Thêm userId parameter, audit log với oldValue

2. **`apps/backend/src/modules/projects/projects.controller.ts`**
   - ✅ `update()` - Thêm `@Request() req` và truyền `req.user.userId`
   - ✅ `remove()` - Thêm `@Request() req` và truyền `req.user.userId`

---

## 🔍 Query Audit Logs

### Get All Project Audit Logs:
```typescript
GET /api/audit-logs?entityType=PROJECT&entityId={projectId}
```

### Get Create Actions:
```typescript
GET /api/audit-logs?entityType=PROJECT&action=CREATE
```

### Get Update Actions:
```typescript
GET /api/audit-logs?entityType=PROJECT&action=UPDATE
```

### Get Delete Actions:
```typescript
GET /api/audit-logs?entityType=PROJECT&action=DELETE
```

### Get User's Actions:
```typescript
GET /api/audit-logs?userId={userId}&entityType=PROJECT
```

---

## ✅ Summary

### Before:
- ❌ No audit log for Create
- ❌ No audit log for Update
- ❌ No audit log for Delete
- ❌ Cannot track changes
- ❌ Cannot identify who made changes

### After:
- ✅ Audit log for Create (with newValue)
- ✅ Audit log for Update (with oldValue and newValue)
- ✅ Audit log for Delete (with oldValue)
- ✅ Track all changes
- ✅ Track who made changes
- ✅ Track when changes were made
- ✅ Transaction-safe (atomic operations)

**Result:** Complete audit trail for Project CRUD operations! 🎉

---

## 🚀 Future Improvements

### 1. Status Change Audit Log

**Add audit log for status changes:**
```typescript
async changeStatus(id: string, newStatus: ProjectStatus, userId: string) {
  // ... existing logic ...
  
  // Add audit log
  await this.prisma.auditLog.create({
    data: {
      userId,
      action: 'STATUS_CHANGE',
      entityType: 'PROJECT',
      entityId: id,
      oldValue: JSON.stringify({ status: project.status }),
      newValue: JSON.stringify({ status: newStatus }),
    },
  });
}
```

### 2. IP Address & User Agent

**Track request metadata:**
```typescript
await tx.auditLog.create({
  data: {
    userId,
    action: 'CREATE',
    entityType: 'PROJECT',
    entityId: created.id,
    newValue: JSON.stringify({...}),
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  },
});
```

### 3. Field-Level Changes

**Track individual field changes:**
```typescript
// Instead of full object, track only changed fields
oldValue: JSON.stringify({ name: oldProject.name }),
newValue: JSON.stringify({ name: updatedProject.name }),
```

---

**Last Updated:** December 2024
