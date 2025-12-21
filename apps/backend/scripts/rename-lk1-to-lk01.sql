-- Script to rename LK1 to LK01
-- Run this script to update existing database

BEGIN;

-- 1. Update building code
UPDATE buildings 
SET code = 'LK01', name = 'LK01 - Liền kề'
WHERE code = 'LK1';

-- 2. Update unit codes
UPDATE units 
SET code = REPLACE(code, 'LK1-', 'LK01-'),
    unit_number = REPLACE(unit_number, 'LK1-', 'LK01-')
WHERE code LIKE 'LK1-%';

-- 3. Update building_id references if needed (should be automatic via foreign key)
-- Note: The buildingId foreign key will automatically update, but let's verify

COMMIT;

-- Verify the changes
SELECT code, name FROM buildings WHERE code IN ('LK1', 'LK01');
SELECT code FROM units WHERE code LIKE 'LK01-%' OR code LIKE 'LK1-%';
