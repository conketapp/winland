-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'CTV', 'USER');

-- CreateEnum
CREATE TYPE "ProjectStatus" AS ENUM ('UPCOMING', 'OPEN', 'CLOSED');

-- CreateEnum
CREATE TYPE "UnitStatus" AS ENUM ('AVAILABLE', 'RESERVED_BOOKING', 'DEPOSITED', 'SOLD');

-- CreateEnum
CREATE TYPE "ReservationStatus" AS ENUM ('ACTIVE', 'YOUR_TURN', 'MISSED', 'EXPIRED', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "BookingStatus" AS ENUM ('PENDING_PAYMENT', 'PENDING_APPROVAL', 'CONFIRMED', 'CANCELLED', 'EXPIRED', 'UPGRADED');

-- CreateEnum
CREATE TYPE "DepositStatus" AS ENUM ('PENDING_APPROVAL', 'CONFIRMED', 'OVERDUE', 'CANCELLED', 'COMPLETED');

-- CreateEnum
CREATE TYPE "PaymentScheduleStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING_CONFIRMATION', 'CONFIRMED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID');

-- CreateEnum
CREATE TYPE "PaymentRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('RESERVATION_CREATED', 'RESERVATION_YOUR_TURN', 'RESERVATION_EXPIRED', 'RESERVATION_MISSED', 'BOOKING_CREATED', 'BOOKING_APPROVED', 'BOOKING_REJECTED', 'BOOKING_CANCELLED', 'BOOKING_EXPIRED', 'DEPOSIT_CREATED', 'DEPOSIT_APPROVED', 'DEPOSIT_CANCELLED', 'DEPOSIT_OVERDUE', 'PAYMENT_OVERDUE', 'PAYMENT_CONFIRMED', 'UNIT_SOLD', 'COMMISSION_CREATED', 'PAYMENT_REQUEST_CREATED', 'PAYMENT_REQUEST_APPROVED', 'PAYMENT_REQUEST_REJECTED', 'QUEUE_PROCESSING_ERRORS', 'QUEUE_PROCESSING_COMPLETE');

-- CreateEnum
CREATE TYPE "NotificationChannel" AS ENUM ('IN_APP', 'SMS', 'EMAIL');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'QUEUED', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "phone" TEXT,
    "email" TEXT,
    "password" TEXT NOT NULL,
    "full_name" TEXT NOT NULL,
    "avatar" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CTV',
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "total_deals" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "otps" (
    "id" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "purpose" TEXT NOT NULL,
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "verified_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "projects" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "ProjectStatus" NOT NULL DEFAULT 'UPCOMING',
    "developer" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "total_area" DOUBLE PRECISION,
    "total_buildings" INTEGER,
    "total_units" INTEGER,
    "price_from" DOUBLE PRECISION,
    "price_to" DOUBLE PRECISION,
    "description" TEXT,
    "amenities" TEXT,
    "images" TEXT,
    "master_plan" TEXT,
    "floor_plan" TEXT,
    "open_date" TIMESTAMP(3),
    "commission_rate" DOUBLE PRECISION NOT NULL DEFAULT 2.0,
    "created_by" TEXT NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "floors" INTEGER NOT NULL,
    "description" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "floors" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "number" INTEGER NOT NULL,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "floors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "units" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "floor_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit_number" TEXT NOT NULL,
    "unit_type_id" TEXT,
    "status" "UnitStatus" NOT NULL DEFAULT 'AVAILABLE',
    "price" DOUBLE PRECISION NOT NULL,
    "area" DOUBLE PRECISION NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "direction" TEXT,
    "balcony" BOOLEAN NOT NULL DEFAULT false,
    "view" TEXT,
    "description" TEXT,
    "floor_plan_image" TEXT,
    "images" TEXT,
    "commission_rate" DOUBLE PRECISION,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "units_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "unit_types" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "unit_types_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reservations" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT,
    "notes" TEXT,
    "status" "ReservationStatus" NOT NULL DEFAULT 'ACTIVE',
    "priority" INTEGER NOT NULL DEFAULT 0,
    "reserved_until" TIMESTAMP(3) NOT NULL,
    "extend_count" INTEGER NOT NULL DEFAULT 0,
    "cancelled_by" TEXT,
    "cancelled_reason" TEXT,
    "notified_at" TIMESTAMP(3),
    "deposit_deadline" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reservations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bookings" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT,
    "booking_amount" DOUBLE PRECISION NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "payment_proof" TEXT,
    "status" "BookingStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "expires_at" TIMESTAMP(3) NOT NULL,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "cancelled_reason" TEXT,
    "refund_amount" DOUBLE PRECISION,
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bookings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "deposits" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "customer_phone" TEXT NOT NULL,
    "customer_email" TEXT,
    "customer_id_card" TEXT NOT NULL,
    "customer_address" TEXT NOT NULL,
    "deposit_amount" DOUBLE PRECISION NOT NULL,
    "deposit_percentage" DOUBLE PRECISION NOT NULL,
    "deposit_date" TIMESTAMP(3) NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "payment_proof" TEXT,
    "contract_url" TEXT,
    "final_price" DOUBLE PRECISION,
    "status" "DepositStatus" NOT NULL DEFAULT 'PENDING_APPROVAL',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "cancelled_by" TEXT,
    "cancelled_reason" TEXT,
    "refund_amount" DOUBLE PRECISION,
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deposits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_schedules" (
    "id" TEXT NOT NULL,
    "deposit_id" TEXT NOT NULL,
    "installment" INTEGER NOT NULL,
    "name" TEXT NOT NULL,
    "percentage" DOUBLE PRECISION NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "due_date" TIMESTAMP(3),
    "status" "PaymentScheduleStatus" NOT NULL DEFAULT 'PENDING',
    "paid_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "paid_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_schedules_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "id" TEXT NOT NULL,
    "deposit_id" TEXT NOT NULL,
    "payment_schedule_id" TEXT,
    "amount" DOUBLE PRECISION NOT NULL,
    "payment_date" TIMESTAMP(3) NOT NULL,
    "payment_method" TEXT NOT NULL DEFAULT 'BANK_TRANSFER',
    "payment_proof" TEXT,
    "transaction_ref" TEXT,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING_CONFIRMATION',
    "confirmed_at" TIMESTAMP(3),
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "commissions" (
    "id" TEXT NOT NULL,
    "unit_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "deposit_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "calculation_base" TEXT NOT NULL DEFAULT 'final_price',
    "base_price" DOUBLE PRECISION NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "paid_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "commissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "payment_requests" (
    "id" TEXT NOT NULL,
    "commission_id" TEXT NOT NULL,
    "ctv_id" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "bank_name" TEXT,
    "bank_account" TEXT,
    "bank_account_name" TEXT,
    "status" "PaymentRequestStatus" NOT NULL DEFAULT 'PENDING',
    "requested_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "rejected_reason" TEXT,
    "notes" TEXT,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "payment_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "system_configs" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "description" TEXT,
    "editable_by" TEXT NOT NULL DEFAULT 'ADMIN',
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "pdf_templates" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "template_url" TEXT,
    "variables" TEXT,
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "pdf_templates_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" TEXT NOT NULL,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "entity_type" TEXT,
    "entity_id" TEXT,
    "metadata" TEXT,
    "channel" "NotificationChannel" NOT NULL DEFAULT 'IN_APP',
    "status" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "is_read" BOOLEAN NOT NULL DEFAULT false,
    "read_at" TIMESTAMP(3),
    "sent_at" TIMESTAMP(3),
    "failed_at" TIMESTAMP(3),
    "error_message" TEXT,
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "next_retry_at" TIMESTAMP(3),
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sequences" (
    "id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "current" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sequences_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "queue_processing_logs" (
    "id" TEXT NOT NULL,
    "project_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "total_units" INTEGER NOT NULL,
    "processed" INTEGER NOT NULL DEFAULT 0,
    "skipped" INTEGER NOT NULL DEFAULT 0,
    "failed" INTEGER NOT NULL DEFAULT 0,
    "failed_units" TEXT,
    "error_message" TEXT,
    "started_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completed_at" TIMESTAMP(3),
    "retry_count" INTEGER NOT NULL DEFAULT 0,
    "deleted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "queue_processing_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_phone_key" ON "users"("phone");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_role_idx" ON "users"("role");

-- CreateIndex
CREATE INDEX "users_role_is_active_idx" ON "users"("role", "is_active");

-- CreateIndex
CREATE INDEX "users_is_active_idx" ON "users"("is_active");

-- CreateIndex
CREATE INDEX "users_created_at_idx" ON "users"("created_at");

-- CreateIndex
CREATE INDEX "users_deleted_at_idx" ON "users"("deleted_at");

-- CreateIndex
CREATE INDEX "users_full_name_idx" ON "users"("full_name");

-- CreateIndex
CREATE INDEX "users_phone_idx" ON "users"("phone");

-- CreateIndex
CREATE INDEX "users_email_idx" ON "users"("email");

-- CreateIndex
CREATE INDEX "otps_phone_purpose_idx" ON "otps"("phone", "purpose");

-- CreateIndex
CREATE UNIQUE INDEX "projects_code_key" ON "projects"("code");

-- CreateIndex
CREATE INDEX "projects_code_idx" ON "projects"("code");

-- CreateIndex
CREATE INDEX "projects_status_created_at_idx" ON "projects"("status", "created_at");

-- CreateIndex
CREATE INDEX "projects_city_status_idx" ON "projects"("city", "status");

-- CreateIndex
CREATE INDEX "projects_deleted_at_status_idx" ON "projects"("deleted_at", "status");

-- CreateIndex
CREATE INDEX "projects_status_idx" ON "projects"("status");

-- CreateIndex
CREATE INDEX "projects_city_idx" ON "projects"("city");

-- CreateIndex
CREATE INDEX "projects_deleted_at_idx" ON "projects"("deleted_at");

-- CreateIndex
CREATE INDEX "projects_name_idx" ON "projects"("name");

-- CreateIndex
CREATE INDEX "buildings_project_id_idx" ON "buildings"("project_id");

-- CreateIndex
CREATE INDEX "buildings_deleted_at_idx" ON "buildings"("deleted_at");

-- CreateIndex
CREATE INDEX "buildings_name_idx" ON "buildings"("name");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_project_id_code_key" ON "buildings"("project_id", "code");

-- CreateIndex
CREATE INDEX "floors_building_id_idx" ON "floors"("building_id");

-- CreateIndex
CREATE INDEX "floors_deleted_at_idx" ON "floors"("deleted_at");

-- CreateIndex
CREATE UNIQUE INDEX "floors_building_id_number_key" ON "floors"("building_id", "number");

-- CreateIndex
CREATE UNIQUE INDEX "units_code_key" ON "units"("code");

-- CreateIndex
CREATE INDEX "units_project_id_idx" ON "units"("project_id");

-- CreateIndex
CREATE INDEX "units_project_id_status_idx" ON "units"("project_id", "status");

-- CreateIndex
CREATE INDEX "units_project_id_status_price_idx" ON "units"("project_id", "status", "price");

-- CreateIndex
CREATE INDEX "units_status_created_at_idx" ON "units"("status", "created_at");

-- CreateIndex
CREATE INDEX "units_deleted_at_status_idx" ON "units"("deleted_at", "status");

-- CreateIndex
CREATE INDEX "units_building_id_idx" ON "units"("building_id");

-- CreateIndex
CREATE INDEX "units_floor_id_idx" ON "units"("floor_id");

-- CreateIndex
CREATE INDEX "units_status_idx" ON "units"("status");

-- CreateIndex
CREATE INDEX "units_unit_type_id_idx" ON "units"("unit_type_id");

-- CreateIndex
CREATE INDEX "units_price_idx" ON "units"("price");

-- CreateIndex
CREATE INDEX "units_created_at_idx" ON "units"("created_at");

-- CreateIndex
CREATE INDEX "units_deleted_at_idx" ON "units"("deleted_at");

-- CreateIndex
CREATE INDEX "units_code_idx" ON "units"("code");

-- CreateIndex
CREATE INDEX "units_unit_number_idx" ON "units"("unit_number");

-- CreateIndex
CREATE UNIQUE INDEX "unit_types_name_key" ON "unit_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "unit_types_code_key" ON "unit_types"("code");

-- CreateIndex
CREATE INDEX "unit_types_deleted_at_idx" ON "unit_types"("deleted_at");

-- CreateIndex
CREATE INDEX "unit_types_name_idx" ON "unit_types"("name");

-- CreateIndex
CREATE UNIQUE INDEX "reservations_code_key" ON "reservations"("code");

-- CreateIndex
CREATE INDEX "reservations_unit_id_priority_idx" ON "reservations"("unit_id", "priority");

-- CreateIndex
CREATE INDEX "reservations_unit_id_status_idx" ON "reservations"("unit_id", "status");

-- CreateIndex
CREATE INDEX "reservations_ctv_id_status_idx" ON "reservations"("ctv_id", "status");

-- CreateIndex
CREATE INDEX "reservations_ctv_id_status_created_at_idx" ON "reservations"("ctv_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "reservations_status_created_at_idx" ON "reservations"("status", "created_at");

-- CreateIndex
CREATE INDEX "reservations_deleted_at_status_idx" ON "reservations"("deleted_at", "status");

-- CreateIndex
CREATE INDEX "reservations_ctv_id_idx" ON "reservations"("ctv_id");

-- CreateIndex
CREATE INDEX "reservations_status_idx" ON "reservations"("status");

-- CreateIndex
CREATE INDEX "reservations_code_idx" ON "reservations"("code");

-- CreateIndex
CREATE INDEX "reservations_reserved_until_idx" ON "reservations"("reserved_until");

-- CreateIndex
CREATE INDEX "reservations_deposit_deadline_idx" ON "reservations"("deposit_deadline");

-- CreateIndex
CREATE INDEX "reservations_created_at_idx" ON "reservations"("created_at");

-- CreateIndex
CREATE INDEX "reservations_deleted_at_idx" ON "reservations"("deleted_at");

-- CreateIndex
CREATE INDEX "reservations_customer_name_idx" ON "reservations"("customer_name");

-- CreateIndex
CREATE INDEX "reservations_customer_phone_idx" ON "reservations"("customer_phone");

-- CreateIndex
CREATE UNIQUE INDEX "bookings_code_key" ON "bookings"("code");

-- CreateIndex
CREATE INDEX "bookings_unit_id_idx" ON "bookings"("unit_id");

-- CreateIndex
CREATE INDEX "bookings_unit_id_status_idx" ON "bookings"("unit_id", "status");

-- CreateIndex
CREATE INDEX "bookings_ctv_id_status_idx" ON "bookings"("ctv_id", "status");

-- CreateIndex
CREATE INDEX "bookings_ctv_id_status_created_at_idx" ON "bookings"("ctv_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "bookings_status_created_at_idx" ON "bookings"("status", "created_at");

-- CreateIndex
CREATE INDEX "bookings_deleted_at_status_idx" ON "bookings"("deleted_at", "status");

-- CreateIndex
CREATE INDEX "bookings_status_expires_at_idx" ON "bookings"("status", "expires_at");

-- CreateIndex
CREATE INDEX "bookings_ctv_id_idx" ON "bookings"("ctv_id");

-- CreateIndex
CREATE INDEX "bookings_status_idx" ON "bookings"("status");

-- CreateIndex
CREATE INDEX "bookings_code_idx" ON "bookings"("code");

-- CreateIndex
CREATE INDEX "bookings_expires_at_idx" ON "bookings"("expires_at");

-- CreateIndex
CREATE INDEX "bookings_created_at_idx" ON "bookings"("created_at");

-- CreateIndex
CREATE INDEX "bookings_deleted_at_idx" ON "bookings"("deleted_at");

-- CreateIndex
CREATE INDEX "bookings_customer_name_idx" ON "bookings"("customer_name");

-- CreateIndex
CREATE INDEX "bookings_customer_phone_idx" ON "bookings"("customer_phone");

-- CreateIndex
CREATE UNIQUE INDEX "deposits_code_key" ON "deposits"("code");

-- CreateIndex
CREATE INDEX "deposits_unit_id_idx" ON "deposits"("unit_id");

-- CreateIndex
CREATE INDEX "deposits_unit_id_status_idx" ON "deposits"("unit_id", "status");

-- CreateIndex
CREATE INDEX "deposits_ctv_id_status_idx" ON "deposits"("ctv_id", "status");

-- CreateIndex
CREATE INDEX "deposits_ctv_id_status_created_at_idx" ON "deposits"("ctv_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "deposits_status_created_at_idx" ON "deposits"("status", "created_at");

-- CreateIndex
CREATE INDEX "deposits_deleted_at_status_idx" ON "deposits"("deleted_at", "status");

-- CreateIndex
CREATE INDEX "deposits_ctv_id_idx" ON "deposits"("ctv_id");

-- CreateIndex
CREATE INDEX "deposits_status_idx" ON "deposits"("status");

-- CreateIndex
CREATE INDEX "deposits_code_idx" ON "deposits"("code");

-- CreateIndex
CREATE INDEX "deposits_created_at_idx" ON "deposits"("created_at");

-- CreateIndex
CREATE INDEX "deposits_deleted_at_idx" ON "deposits"("deleted_at");

-- CreateIndex
CREATE INDEX "deposits_customer_name_idx" ON "deposits"("customer_name");

-- CreateIndex
CREATE INDEX "deposits_customer_phone_idx" ON "deposits"("customer_phone");

-- CreateIndex
CREATE INDEX "deposits_customer_id_card_idx" ON "deposits"("customer_id_card");

-- CreateIndex
CREATE INDEX "payment_schedules_deposit_id_idx" ON "payment_schedules"("deposit_id");

-- CreateIndex
CREATE INDEX "payment_schedules_deposit_id_status_idx" ON "payment_schedules"("deposit_id", "status");

-- CreateIndex
CREATE INDEX "payment_schedules_status_due_date_idx" ON "payment_schedules"("status", "due_date");

-- CreateIndex
CREATE INDEX "payment_schedules_status_due_date_created_at_idx" ON "payment_schedules"("status", "due_date", "created_at");

-- CreateIndex
CREATE INDEX "payment_schedules_deleted_at_status_idx" ON "payment_schedules"("deleted_at", "status");

-- CreateIndex
CREATE INDEX "payment_schedules_status_idx" ON "payment_schedules"("status");

-- CreateIndex
CREATE INDEX "payment_schedules_due_date_idx" ON "payment_schedules"("due_date");

-- CreateIndex
CREATE INDEX "payment_schedules_deleted_at_idx" ON "payment_schedules"("deleted_at");

-- CreateIndex
CREATE INDEX "transactions_deposit_id_idx" ON "transactions"("deposit_id");

-- CreateIndex
CREATE INDEX "transactions_deposit_id_status_idx" ON "transactions"("deposit_id", "status");

-- CreateIndex
CREATE INDEX "transactions_deposit_id_status_payment_date_idx" ON "transactions"("deposit_id", "status", "payment_date");

-- CreateIndex
CREATE INDEX "transactions_payment_schedule_id_idx" ON "transactions"("payment_schedule_id");

-- CreateIndex
CREATE INDEX "transactions_payment_schedule_id_status_idx" ON "transactions"("payment_schedule_id", "status");

-- CreateIndex
CREATE INDEX "transactions_status_payment_date_idx" ON "transactions"("status", "payment_date");

-- CreateIndex
CREATE INDEX "transactions_status_created_at_idx" ON "transactions"("status", "created_at");

-- CreateIndex
CREATE INDEX "transactions_deleted_at_status_idx" ON "transactions"("deleted_at", "status");

-- CreateIndex
CREATE INDEX "transactions_status_idx" ON "transactions"("status");

-- CreateIndex
CREATE INDEX "transactions_payment_date_idx" ON "transactions"("payment_date");

-- CreateIndex
CREATE INDEX "transactions_created_at_idx" ON "transactions"("created_at");

-- CreateIndex
CREATE INDEX "transactions_deleted_at_idx" ON "transactions"("deleted_at");

-- CreateIndex
CREATE INDEX "transactions_transaction_ref_idx" ON "transactions"("transaction_ref");

-- CreateIndex
CREATE UNIQUE INDEX "commissions_deposit_id_key" ON "commissions"("deposit_id");

-- CreateIndex
CREATE INDEX "commissions_unit_id_idx" ON "commissions"("unit_id");

-- CreateIndex
CREATE INDEX "commissions_ctv_id_status_idx" ON "commissions"("ctv_id", "status");

-- CreateIndex
CREATE INDEX "commissions_ctv_id_status_created_at_idx" ON "commissions"("ctv_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "commissions_status_created_at_idx" ON "commissions"("status", "created_at");

-- CreateIndex
CREATE INDEX "commissions_deleted_at_status_idx" ON "commissions"("deleted_at", "status");

-- CreateIndex
CREATE INDEX "commissions_ctv_id_idx" ON "commissions"("ctv_id");

-- CreateIndex
CREATE INDEX "commissions_status_idx" ON "commissions"("status");

-- CreateIndex
CREATE INDEX "commissions_deleted_at_idx" ON "commissions"("deleted_at");

-- CreateIndex
CREATE INDEX "payment_requests_commission_id_idx" ON "payment_requests"("commission_id");

-- CreateIndex
CREATE INDEX "payment_requests_ctv_id_status_idx" ON "payment_requests"("ctv_id", "status");

-- CreateIndex
CREATE INDEX "payment_requests_ctv_id_status_created_at_idx" ON "payment_requests"("ctv_id", "status", "created_at");

-- CreateIndex
CREATE INDEX "payment_requests_status_created_at_idx" ON "payment_requests"("status", "created_at");

-- CreateIndex
CREATE INDEX "payment_requests_deleted_at_status_idx" ON "payment_requests"("deleted_at", "status");

-- CreateIndex
CREATE INDEX "payment_requests_ctv_id_idx" ON "payment_requests"("ctv_id");

-- CreateIndex
CREATE INDEX "payment_requests_status_idx" ON "payment_requests"("status");

-- CreateIndex
CREATE INDEX "payment_requests_deleted_at_idx" ON "payment_requests"("deleted_at");

-- CreateIndex
CREATE INDEX "payment_requests_bank_account_idx" ON "payment_requests"("bank_account");

-- CreateIndex
CREATE UNIQUE INDEX "system_configs_key_key" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "system_configs_category_idx" ON "system_configs"("category");

-- CreateIndex
CREATE INDEX "system_configs_key_idx" ON "system_configs"("key");

-- CreateIndex
CREATE INDEX "system_configs_deleted_at_idx" ON "system_configs"("deleted_at");

-- CreateIndex
CREATE INDEX "system_configs_label_idx" ON "system_configs"("label");

-- CreateIndex
CREATE INDEX "pdf_templates_type_idx" ON "pdf_templates"("type");

-- CreateIndex
CREATE INDEX "pdf_templates_deleted_at_idx" ON "pdf_templates"("deleted_at");

-- CreateIndex
CREATE INDEX "pdf_templates_name_idx" ON "pdf_templates"("name");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_idx" ON "audit_logs"("user_id");

-- CreateIndex
CREATE INDEX "audit_logs_user_id_created_at_idx" ON "audit_logs"("user_id", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_entity_id_idx" ON "audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "audit_logs_action_created_at_idx" ON "audit_logs"("action", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_created_at_idx" ON "audit_logs"("entity_type", "created_at");

-- CreateIndex
CREATE INDEX "audit_logs_action_idx" ON "audit_logs"("action");

-- CreateIndex
CREATE INDEX "audit_logs_created_at_idx" ON "audit_logs"("created_at");

-- CreateIndex
CREATE INDEX "audit_logs_entity_type_idx" ON "audit_logs"("entity_type");

-- CreateIndex
CREATE INDEX "audit_logs_entity_id_idx" ON "audit_logs"("entity_id");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_idx" ON "notifications"("user_id", "is_read");

-- CreateIndex
CREATE INDEX "notifications_user_id_is_read_created_at_idx" ON "notifications"("user_id", "is_read", "created_at");

-- CreateIndex
CREATE INDEX "notifications_user_id_status_idx" ON "notifications"("user_id", "status");

-- CreateIndex
CREATE INDEX "notifications_status_next_retry_at_idx" ON "notifications"("status", "next_retry_at");

-- CreateIndex
CREATE INDEX "notifications_entity_type_entity_id_idx" ON "notifications"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX "notifications_deleted_at_is_read_idx" ON "notifications"("deleted_at", "is_read");

-- CreateIndex
CREATE INDEX "notifications_deleted_at_idx" ON "notifications"("deleted_at");

-- CreateIndex
CREATE INDEX "notifications_status_idx" ON "notifications"("status");

-- CreateIndex
CREATE INDEX "notifications_title_idx" ON "notifications"("title");

-- CreateIndex
CREATE UNIQUE INDEX "sequences_type_key" ON "sequences"("type");

-- CreateIndex
CREATE INDEX "queue_processing_logs_project_id_idx" ON "queue_processing_logs"("project_id");

-- CreateIndex
CREATE INDEX "queue_processing_logs_status_idx" ON "queue_processing_logs"("status");

-- CreateIndex
CREATE INDEX "queue_processing_logs_status_created_at_idx" ON "queue_processing_logs"("status", "created_at");

-- CreateIndex
CREATE INDEX "queue_processing_logs_deleted_at_idx" ON "queue_processing_logs"("deleted_at");

-- CreateIndex
CREATE INDEX "queue_processing_logs_created_at_idx" ON "queue_processing_logs"("created_at");

-- AddForeignKey
ALTER TABLE "projects" ADD CONSTRAINT "projects_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "buildings" ADD CONSTRAINT "buildings_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "floors" ADD CONSTRAINT "floors_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_unit_type_id_fkey" FOREIGN KEY ("unit_type_id") REFERENCES "unit_types"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_floor_id_fkey" FOREIGN KEY ("floor_id") REFERENCES "floors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "units" ADD CONSTRAINT "units_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_cancelled_by_fkey" FOREIGN KEY ("cancelled_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "deposits" ADD CONSTRAINT "deposits_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_schedules" ADD CONSTRAINT "payment_schedules_deposit_id_fkey" FOREIGN KEY ("deposit_id") REFERENCES "deposits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_payment_schedule_id_fkey" FOREIGN KEY ("payment_schedule_id") REFERENCES "payment_schedules"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_deposit_id_fkey" FOREIGN KEY ("deposit_id") REFERENCES "deposits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_deposit_id_fkey" FOREIGN KEY ("deposit_id") REFERENCES "deposits"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "commissions" ADD CONSTRAINT "commissions_unit_id_fkey" FOREIGN KEY ("unit_id") REFERENCES "units"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_ctv_id_fkey" FOREIGN KEY ("ctv_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "payment_requests" ADD CONSTRAINT "payment_requests_commission_id_fkey" FOREIGN KEY ("commission_id") REFERENCES "commissions"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "queue_processing_logs" ADD CONSTRAINT "queue_processing_logs_project_id_fkey" FOREIGN KEY ("project_id") REFERENCES "projects"("id") ON DELETE CASCADE ON UPDATE CASCADE;

