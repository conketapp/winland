# Database Seed Scripts

## Overview
This directory contains scripts to populate the database with mock data for testing and development.

## Available Scripts

### 1. `seed-project.js` - Generate "Lê Văn Thiêm Luxury" Project

Generates a complete real estate project with:
- **1 Project**: Lê Văn Thiêm Luxury
- **4 Buildings**: LK1, LK2, LK3, LK4
- **10 Floors per building**: Floors 5-14
- **5 Units per floor**: Total 200 units
- **Random data**: Prices, areas, bedrooms, bathrooms, views, directions, statuses

#### Usage:
```bash
cd apps/ctv-portal
node scripts/seed-project.js
```

#### What it creates:
```
Project: Lê Văn Thiêm Luxury (LVT-LUXURY)
├── Building: Tòa LK1
│   ├── Floor 5
│   │   ├── Unit LK1-0501 (120m², 3BR, 2WC, 6.2B VND)
│   │   ├── Unit LK1-0502 (150m², 4BR, 3WC, 7.8B VND)
│   │   └── ... (5 units per floor)
│   ├── Floor 6
│   └── ... (10 floors total)
├── Building: Tòa LK2
├── Building: Tòa LK3
└── Building: Tòa LK4
```

#### Data Generated:
- **Areas**: 100m², 120m², 150m², 185m², 210m²
- **Prices**: 5.5B - 10.25B VND
- **Bedrooms**: 2-5
- **Bathrooms**: 1-3
- **Directions**: Đông, Tây, Nam, Bắc, Đông Nam, Tây Nam, Đông Bắc, Tây Bắc
- **Views**: City view, River view, Park view, Pool view, Lake view, Golf view, Skyline view
- **Statuses**: AVAILABLE, RESERVED_BOOKING, DEPOSITED, SOLD
- **Images**: 3-5 apartment images per unit
- **Commission Rate**: 2%

#### Notes:
- If project already exists, it will be deleted and recreated
- Uses existing user as creator (or creates admin user if none exists)
- Project status is set to "OPEN" so it appears in the app

## Testing the Data

After running the seed script:

1. **Start the development server**:
   ```bash
   npm run dev
   ```

2. **Login to the app**:
   - Go to http://localhost:3000/login
   - Login with your credentials

3. **View the project**:
   - Navigate to "Quản lý dự án" (Project Management)
   - You should see "Lê Văn Thiêm Luxury" with 4 buildings
   - Each building shows 50 units (10 floors × 5 units)

4. **Test features**:
   - Search for units (e.g., "LK1-0501")
   - Click on available units to see details
   - Try booking, reservation, and deposit modals
   - Check different unit statuses (color-coded)

## Cleanup

To remove the generated data:

```sql
-- Connect to your database and run:
DELETE FROM units WHERE project_id IN (SELECT id FROM projects WHERE code = 'LVT-LUXURY');
DELETE FROM floors WHERE building_id IN (SELECT id FROM buildings WHERE project_id IN (SELECT id FROM projects WHERE code = 'LVT-LUXURY'));
DELETE FROM buildings WHERE project_id IN (SELECT id FROM projects WHERE code = 'LVT-LUXURY');
DELETE FROM projects WHERE code = 'LVT-LUXURY';
```

Or simply run the seed script again (it will delete and recreate).

## Troubleshooting

### Error: "Cannot find module '../lib/generated/prisma'"
**Solution**: Run `npx prisma generate` first

### Error: "No user found"
**Solution**: The script will create an admin user automatically

### Error: "Project already exists"
**Solution**: The script will delete and recreate automatically

### No data showing in app
**Solution**: 
1. Check project status is "OPEN"
2. Verify you're logged in
3. Check browser console for errors
4. Verify API endpoint `/api/projects` returns data

## Database Schema

The seed script creates data following this structure:

```
projects
├── id (UUID)
├── name: "Lê Văn Thiêm Luxury"
├── code: "LVT-LUXURY"
├── status: "OPEN"
└── ...

buildings
├── id (UUID)
├── project_id (FK)
├── code: "LK1", "LK2", etc.
└── ...

floors
├── id (UUID)
├── building_id (FK)
├── number: 5-14
└── ...

units
├── id (UUID)
├── project_id (FK)
├── building_id (FK)
├── floor_id (FK)
├── code: "LK1-0501", etc.
├── status: AVAILABLE | RESERVED_BOOKING | DEPOSITED | SOLD
└── ...
```

## Future Enhancements

Consider adding:
- Multiple projects
- Different building configurations
- Customer data for reserved/sold units
- Booking/Deposit/Reservation records
- Commission records
- Payment schedules
