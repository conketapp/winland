-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "reserved_until" DATETIME NOT NULL,
    "extend_count" INTEGER NOT NULL DEFAULT 0,
    "cancelled_by" TEXT,
    "cancelled_reason" TEXT,
    "notified_at" DATETIME,
    "deposit_deadline" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reservations_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reservations_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_reservations" ("cancelled_by", "cancelled_reason", "code", "created_at", "ctv_id", "customer_email", "customer_name", "customer_phone", "extend_count", "id", "notes", "reserved_until", "status", "unit_id", "updated_at") SELECT "cancelled_by", "cancelled_reason", "code", "created_at", "ctv_id", "customer_email", "customer_name", "customer_phone", "extend_count", "id", "notes", "reserved_until", "status", "unit_id", "updated_at" FROM "reservations";
DROP TABLE "reservations";
ALTER TABLE "new_reservations" RENAME TO "reservations";
CREATE UNIQUE INDEX "reservations_code_key" ON "reservations"("code");
CREATE INDEX "reservations_unit_id_priority_idx" ON "reservations"("unit_id", "priority");
CREATE INDEX "reservations_ctv_id_idx" ON "reservations"("ctv_id");
CREATE INDEX "reservations_status_idx" ON "reservations"("status");
CREATE INDEX "reservations_code_idx" ON "reservations"("code");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
