# Booking Visit Schedule Feature

## Overview
Added visit schedule tracking to bookings, allowing CTVs to record and display when customers will visit properties.

## Database Changes

### Schema Updates
Added three new fields to the `Booking` model:

```prisma
visitDate       String?  @map("visit_date")
visitStartTime  String?  @map("visit_start_time")
visitEndTime    String?  @map("visit_end_time")
```

**Field Details:**
- `visitDate`: Date of the property visit (format: YYYY-MM-DD)
- `visitStartTime`: Start time of visit (format: HH:MM, e.g., "09:00")
- `visitEndTime`: End time of visit (format: HH:MM, e.g., "10:30")

All fields are optional (nullable) to maintain backward compatibility.

## API Updates

### POST /api/bookings/create
Updated to accept and store visit schedule:

**New Request Fields:**
```json
{
  "visitDate": "2024-11-20",
  "startTime": "09:00",
  "endTime": "10:30"
}
```

**Database Storage:**
- Maps `startTime` → `visitStartTime`
- Maps `endTime` → `visitEndTime`
- Stores `visitDate` as-is
- Also stores formatted schedule in `notes` field for backward compatibility

## UI Updates

### 1. Notification Page
**Display Format:**
```
📅 Lịch xem: 2024-11-20 từ 09:00 đến 10:30
```

**Features:**
- Highlighted in blue background box
- Only shown for bookings (not deposits/reservations)
- Only displayed when all three fields are present
- Responsive design with calendar icon

**Location:** Below unit code, above amount (if any)

### 2. Dashboard Page
**Display Format:**
```
2024-11-20 • 09:00-10:30
```

**Features:**
- Compact format for dashboard cards
- Blue text color to stand out
- Shows date and time range on one line
- Displayed below customer name

**Location:** In booking card, between customer name and created date

### 3. BookingModal
**No Changes Required:**
- Form already collects these fields
- Fields: `date`, `startTime`, `endTime`
- Validation already in place
- Data now properly saved to database

## Data Flow

1. **User Input (BookingModal)**
   - Customer fills in visit date
   - Selects start time from dropdown
   - Selects end time from dropdown
   - Form validates time range

2. **API Processing**
   - Receives visit schedule data
   - Validates required fields
   - Stores in database with proper field mapping
   - Creates formatted notes string

3. **Display (Notification & Dashboard)**
   - Fetches booking with visit schedule
   - Checks if all schedule fields exist
   - Displays formatted schedule
   - Uses appropriate styling

## Example Data

### Database Record:
```json
{
  "id": "uuid",
  "code": "BK000001",
  "visitDate": "2024-11-20",
  "visitStartTime": "09:00",
  "visitEndTime": "10:30",
  "notes": "Lịch xem nhà: 2024-11-20 từ 09:00 đến 10:30"
}
```

### Notification Display:
```
Booking
BK000001

👤 Nguyễn Văn A • 0901234567
Căn hộ: T1-0816
📅 Lịch xem: 2024-11-20 từ 09:00 đến 10:30
🕐 16/11/2024, 14:30:00
```

### Dashboard Display:
```
┌─────────────────────────┐
│ 📅  T1-0816            │
│     Nguyễn Văn A       │
│     2024-11-20 • 09:00-10:30 │
│     16/11/2024         │
│     [Xem chi tiết]     │
└─────────────────────────┘
```

## Benefits

1. **Clear Communication**: CTVs and customers know exactly when the visit is scheduled
2. **Better Organization**: Easy to see all upcoming property visits
3. **Professional**: Shows structured appointment management
4. **Tracking**: Historical record of all scheduled visits
5. **Reminders**: Foundation for future reminder features

## Future Enhancements

Potential improvements:
1. Add calendar view of all bookings
2. Send SMS/email reminders before visit
3. Add visit confirmation/cancellation
4. Track actual visit completion
5. Add visit feedback/notes
6. Conflict detection for same unit/time
7. CTV availability calendar
8. Automatic timezone handling
9. Recurring visit schedules
10. Visit rescheduling functionality

## Migration Notes

- Existing bookings will have `null` values for visit schedule fields
- No data migration needed (fields are optional)
- Old bookings still display correctly (schedule section hidden when null)
- New bookings automatically include visit schedule
