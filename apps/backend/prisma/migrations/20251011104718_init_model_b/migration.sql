-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar" TEXT,
    "role" TEXT NOT NULL DEFAULT 'CTV',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" DATETIME NOT NULL,
    "verified_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'UPCOMING',
    "developer" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "total_area" REAL,
    "total_buildings" INTEGER,
    "total_units" INTEGER,
    "price_from" REAL,
    "price_to" REAL,
    "description" TEXT,
    "amenities" TEXT,
    "images" TEXT,
    "master_plan" TEXT,
    "floor_plan" TEXT,
    "open_date" DATETIME,
    "commission_rate" REAL NOT NULL DEFAULT 2.0,
    "created_by" TEXT NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "floors" INTEGER NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "buildings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "floors" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "building_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "floors_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "project_id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "floor_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "unit_type_id" TEXT,
    "status" TEXT NOT NULL DEFAULT 'AVAILABLE',
    "price" REAL NOT NULL,
    "area" REAL NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "direction" TEXT,
    "balcony" BOOLEAN NOT NULL DEFAULT false,
    "view" TEXT,
    "description" TEXT,
    "floor_plan_image" TEXT,
    "images" TEXT,
    "commission_rate" REAL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "units_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "units_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "units_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "units_unit_type_id_fkey" FOREIGN KEY ("unit_type_id") REFERENCES "unit_types" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "unit_types" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT,
    "notes" TEXT,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "reserved_until" DATETIME NOT NULL,
    "extend_count" INTEGER NOT NULL DEFAULT 0,
    "cancelled_by" TEXT,
    "cancelled_reason" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "reservations_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "reservations_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT,
    "customer_id_card" TEXT NOT NULL,
    "customer_address" TEXT NOT NULL,
    "booking_amount" REAL NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "payment_proof" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "expires_at" DATETIME NOT NULL,
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "cancelled_reason" TEXT,
    "refund_amount" REAL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "bookings_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "bookings_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "code" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT,
    "customer_id_card" TEXT NOT NULL,
    "customer_address" TEXT NOT NULL,
    "deposit_amount" REAL NOT NULL,
    "deposit_percentage" REAL NOT NULL,
    "deposit_date" DATETIME NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "payment_proof" TEXT,
    "contract_url" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "cancelled_by" TEXT,
    "cancelled_reason" TEXT,
    "refund_amount" REAL,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "deposits_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "deposits_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "deposits_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "deposits_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_schedules" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deposit_id" TEXT NOT NULL,
    "installment" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" REAL NOT NULL,
    "amount" REAL NOT NULL,
    "due_date" DATETIME,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paid_amount" REAL NOT NULL DEFAULT 0,
    "paid_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "payment_schedules_deposit_id_fkey" FOREIGN KEY ("deposit_id") REFERENCES "deposits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "deposit_id" TEXT NOT NULL,
    "payment_schedule_id" TEXT,
    "amount" REAL NOT NULL,
    "payment_date" DATETIME NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "payment_proof" TEXT,
    "transaction_ref" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "confirmed_at" DATETIME,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "transactions_deposit_id_fkey" FOREIGN KEY ("deposit_id") REFERENCES "deposits" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "transactions_payment_schedule_id_fkey" FOREIGN KEY ("payment_schedule_id") REFERENCES "payment_schedules" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "unit_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "deposit_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "rate" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "paid_at" DATETIME,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "commissions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "commissions_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "commissions_deposit_id_fkey" FOREIGN KEY ("deposit_id") REFERENCES "deposits" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "payment_requests" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "commission_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "amount" REAL NOT NULL,
    "bank_name" TEXT,
    "bank_account" TEXT,
    "bank_account_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'PENDING',
    "requested_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" TEXT,
    "approved_at" DATETIME,
    "rejected_reason" TEXT,
    "notes" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL,
    CONSTRAINT "payment_requests_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commissions" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payment_requests_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "payment_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "editable_by" TEXT NOT NULL DEFAULT 'ADMIN',
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "pdf_templates" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template_url" TEXT,
    "variables" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "otps_phone_purpose_idx" ON "otps"("phone", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code");

-- CreateIndex
CREATE INDEX "projects_code_idx" ON "projects"("code");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_city_idx" ON "projects"("city");

-- CreateIndex
CREATE INDEX "buildings_project_id_idx" ON "buildings"("project_id");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_project_id_code_key" ON "buildings"("project_id", "code");

-- CreateIndex
CREATE INDEX "floors_building_id_idx" ON "floors"("building_id");

-- CreateIndex
CREATE UNIQUE INDEX "floors_building_id_number_key" ON "floors"("building_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "units_code_key" ON "units"("code");

-- CreateIndex
CREATE INDEX "units_project_id_idx" ON "units"("project_id");

-- CreateIndex
CREATE INDEX "units_building_id_idx" ON "units"("building_id");

-- CreateIndex
CREATE INDEX "units_floor_id_idx" ON "units"("floor_id");

-- CreateIndex
CREATE INDEX "units_status_idx" ON "units"("status");

-- CreateIndex
CREATE INDEX "units_unit_type_id_idx" ON "units"("unit_type_id");

-- CreateIndex
CREATE UNIQUE INDEX "unit_types_name_key" ON "unit_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unit_types_code_key" ON "unit_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_code_key" ON "reservations"("code");

-- CreateIndex
CREATE INDEX "reservations_unit_id_idx" ON "reservations"("unit_id");

-- CreateIndex
CREATE INDEX "reservations_ctv_id_idx" ON "reservations"("ctv_id");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- CreateIndex
CREATE INDEX "reservations_code_idx" ON "reservations"("code");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_code_key" ON "bookings"("code");

-- CreateIndex
CREATE INDEX "bookings_unit_id_idx" ON "bookings"("unit_id");

-- CreateIndex
CREATE INDEX "bookings_ctv_id_idx" ON "bookings"("ctv_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_code_idx" ON "bookings"("code");

-- CreateIndex
CREATE UNIQUE INDEX "deposits_code_key" ON "deposits"("code");

-- CreateIndex
CREATE INDEX "deposits_unit_id_idx" ON "deposits"("unit_id");

-- CreateIndex
CREATE INDEX "deposits_ctv_id_idx" ON "deposits"("ctv_id");

-- CreateIndex
CREATE INDEX "deposits_status_idx" ON "deposits"("status");

-- CreateIndex
CREATE INDEX "deposits_code_idx" ON "deposits"("code");

-- CreateIndex
CREATE INDEX "payment_schedules_deposit_id_idx" ON "payment_schedules"("deposit_id");

-- CreateIndex
CREATE INDEX "payment_schedules_status_idx" ON "payment_schedules"("status");

-- CreateIndex
CREATE INDEX "transactions_deposit_id_idx" ON "transactions"("deposit_id");

-- CreateIndex
CREATE INDEX "transactions_payment_schedule_id_idx" ON "transactions"("payment_schedule_id");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_deposit_id_key" ON "commissions"("deposit_id");

-- CreateIndex
CREATE INDEX "commissions_unit_id_idx" ON "commissions"("unit_id");

-- CreateIndex
CREATE INDEX "commissions_ctv_id_idx" ON "commissions"("ctv_id");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "commissions"("status");

-- CreateIndex
CREATE INDEX "payment_requests_commission_id_idx" ON "payment_requests"("commission_id");

-- CreateIndex
CREATE INDEX "payment_requests_ctv_id_idx" ON "payment_requests"("ctv_id");

-- CreateIndex
CREATE INDEX "payment_requests_status_idx" ON "payment_requests"("status");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "system_configs_category_idx" ON "system_configs"("category");

-- CreateIndex
CREATE INDEX "system_configs_key_idx" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "pdf_templates_type_idx" ON "pdf_templates"("type");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");
