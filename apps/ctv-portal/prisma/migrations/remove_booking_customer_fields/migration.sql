-- AlterTable: Remove customerIdCard and customerAddress from bookings table
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "customer_id_card";
ALTER TABLE "bookings" DROP COLUMN IF EXISTS "customer_address";
