# Testing Guide - Project Management with Database

## ✅ Data Generation Complete!

The "Lê Văn Thiêm Luxury" project has been successfully generated in the database.

### 📊 Generated Data Summary:

- **Project**: Lê Văn Thiêm Luxury (LVT-LUXURY)
- **Status**: OPEN
- **Location**: Thanh Xuân, Hà Nội
- **Buildings**: 4 (LK1, LK2, LK3, LK4)
- **Total Units**: 200 units
- **Price Range**: 5.5B - 10.3B VND
- **Commission Rate**: 2%

### 🏠 Unit Distribution:
- **AVAILABLE** (Đang mở bán): 54 units - Green
- **RESERVED_BOOKING** (Đang có đặt chỗ): 48 units - Yellow
- **DEPOSITED** (Đã cọc tiền): 48 units - Purple
- **SOLD** (Đã bán): 50 units - Red

## 🧪 How to Test

### 1. Start the Development Server
```bash
cd apps/ctv-portal
npm run dev
```

### 2. Login to the Application
- Navigate to: http://localhost:3000/login
- Login with your credentials
- You should be redirected to the dashboard

### 3. Navigate to Project Management
- Click on "Quản lý dự án" in the bottom navigation
- Or go directly to: http://localhost:3000/project-management

### 4. What You Should See

#### Project Header:
```
Dự Án: Lê Văn Thiêm Luxury
Danh sách các tòa: Tòa LK1, Tòa LK2, Tòa LK3, Tòa LK4
```

#### Legend (Color-coded statuses):
- 🟢 Đang mở bán (Green)
- 🟡 Đang có đặt chỗ (Yellow)
- 🔵 Đang có booking (Blue)
- 🟣 Đã cọc tiền (Purple)
- 🔴 Đã bán (Red)

#### Buildings:
Each building (LK1-LK4) displays 50 units in a grid layout

#### Unit Cards:
Each card shows:
- Unit code (e.g., LK1-0501)
- Status badge
- Area (e.g., 150m²)
- Price (e.g., 7.85B VND)
- Bedrooms (PN: 3)
- Bathrooms (WC: 2)

### 5. Test Features

#### Search Functionality:
1. Type a unit code in the search bar (e.g., "LK1-05")
2. Dropdown should show matching units
3. Click on a unit to view details

#### Unit Details:
1. Click on an **AVAILABLE** (green) unit
2. Unit modal should open showing:
   - Images (3-5 photos)
   - Full details
   - Price and area
   - Direction and view
   - Description
3. Try the action buttons:
   - "Đặt cọc" (Deposit)
   - "Giữ chỗ" (Reserve)
   - "Booking"

#### Status Interactions:
1. Click on **RESERVED** (yellow) unit → Shows info toast
2. Click on **DEPOSITED** (purple) unit → Shows warning toast
3. Click on **SOLD** (red) unit → Shows error toast

#### Responsive Design:
1. Resize browser window
2. Check mobile view (< 768px)
3. Check tablet view (768px - 1024px)
4. Check desktop view (> 1024px)

#### Dark Mode:
1. Click sun/moon icon in header
2. Theme should toggle
3. All colors should adapt

## 🔍 Verification Commands

### Check Database Data:
```bash
node scripts/verify-data.js
```

### Re-generate Data:
```bash
node scripts/seed-project.js
```

### View in Prisma Studio:
```bash
npx prisma studio
```
Then navigate to: http://localhost:5555

## 🐛 Troubleshooting

### Issue: No projects showing
**Solution**: 
1. Check browser console for errors
2. Verify you're logged in (check sessionStorage for 'login:userPhone')
3. Check API response: Open DevTools → Network → Look for `/api/projects`
4. Verify project status is 'OPEN' in database

### Issue: Units not displaying
**Solution**:
1. Check if buildings have units
2. Run verification script: `node scripts/verify-data.js`
3. Check browser console for errors

### Issue: Search not working
**Solution**:
1. Check if `filteredUnits` has data
2. Verify search term is being set
3. Check console for errors

### Issue: Modals not opening
**Solution**:
1. Only AVAILABLE units should open modals
2. Other statuses show toast notifications
3. Check if `selectedUnit` state is being set

### Issue: Images not loading
**Solution**:
1. Images are from Unsplash (requires internet)
2. Check browser console for 404 errors
3. Verify `images` field in database is valid JSON

## 📱 API Endpoints

### GET /api/projects
Fetches all OPEN projects with buildings and units

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Lê Văn Thiêm Luxury",
    "code": "LVT-LUXURY",
    "status": "OPEN",
    "buildings": [
      {
        "id": "uuid",
        "name": "Tòa LK1",
        "code": "LK1",
        "units": [
          {
            "id": "uuid",
            "code": "LK1-0501",
            "area": 150,
            "price": 7850000000,
            "bedrooms": 3,
            "bathrooms": 2,
            "status": "AVAILABLE",
            ...
          }
        ]
      }
    ]
  }
]
```

## 🎯 Test Scenarios

### Scenario 1: Browse Units
1. ✅ Login to app
2. ✅ Navigate to Project Management
3. ✅ See project header with name
4. ✅ See 4 buildings (LK1-LK4)
5. ✅ See 50 units per building
6. ✅ Units are color-coded by status

### Scenario 2: Search for Unit
1. ✅ Type "LK2-08" in search
2. ✅ See filtered results
3. ✅ Click on available unit
4. ✅ Modal opens with details

### Scenario 3: View Unit Details
1. ✅ Click on green (available) unit
2. ✅ Modal shows images
3. ✅ See all unit details
4. ✅ See action buttons

### Scenario 4: Try Booking
1. ✅ Open available unit
2. ✅ Click "Booking" button
3. ✅ Booking modal opens
4. ✅ Form is displayed

### Scenario 5: Check Status Restrictions
1. ✅ Click yellow unit → Info toast
2. ✅ Click purple unit → Warning toast
3. ✅ Click red unit → Error toast
4. ✅ Only green units open modal

## 📈 Performance Metrics

Expected load times:
- Initial page load: < 2s
- API call (/api/projects): < 1s
- Unit modal open: < 100ms
- Search results: < 50ms

## ✨ Success Criteria

The integration is successful if:
- ✅ Project loads from database
- ✅ All 4 buildings display
- ✅ All 200 units display
- ✅ Status colors are correct
- ✅ Search works
- ✅ Modals open for available units
- ✅ Toast notifications work
- ✅ Responsive design works
- ✅ Dark mode works
- ✅ No console errors

## 🎉 Congratulations!

If all tests pass, your Project Management page is now fully integrated with the database and ready for production use!
