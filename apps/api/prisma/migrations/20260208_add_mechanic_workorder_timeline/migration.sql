-- Add mechanic role to UserRole enum
ALTER TYPE "UserRole" ADD VALUE 'mechanic';

-- AlterEnum
ALTER TABLE "Account" ADD COLUMN "workOrderSettings" JSONB;

-- AlterTable: Deal
ALTER TABLE "Deal" ADD COLUMN "assignedResourceId" TEXT;
ALTER TABLE "Deal" ADD COLUMN "estimatedHours" DOUBLE PRECISION;

-- AddForeignKey for Deal.assignedResourceId
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_assignedResourceId_fkey" FOREIGN KEY ("assignedResourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- CreateIndex for Deal.assignedResourceId
CREATE INDEX "Deal_assignedResourceId_idx" ON "Deal"("assignedResourceId");

-- CreateTable DealItem
CREATE TABLE "DealItem" (
    "id" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DealItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for DealItem
CREATE INDEX "DealItem_dealId_idx" ON "DealItem"("dealId");
CREATE INDEX "DealItem_serviceId_idx" ON "DealItem"("serviceId");

-- AddForeignKey for DealItem
ALTER TABLE "DealItem" ADD CONSTRAINT "DealItem_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "DealItem" ADD CONSTRAINT "DealItem_serviceId_fkey" FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- CreateTable TimeEntry
CREATE TABLE "TimeEntry" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "durationMinutes" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TimeEntry_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for TimeEntry
CREATE INDEX "TimeEntry_accountId_idx" ON "TimeEntry"("accountId");
CREATE INDEX "TimeEntry_dealId_idx" ON "TimeEntry"("dealId");
CREATE INDEX "TimeEntry_resourceId_idx" ON "TimeEntry"("resourceId");
CREATE INDEX "TimeEntry_startedAt_idx" ON "TimeEntry"("startedAt");

-- AddForeignKey for TimeEntry
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "TimeEntry" ADD CONSTRAINT "TimeEntry_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateTable WorkOrder
CREATE TABLE "WorkOrder" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "orderNumber" INTEGER NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "pdfUrl" TEXT,
    "customerName" TEXT NOT NULL,
    "carModel" TEXT,
    "licensePlate" TEXT,
    "vin" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex for WorkOrder
CREATE UNIQUE INDEX "WorkOrder_dealId_key" ON "WorkOrder"("dealId");
CREATE INDEX "WorkOrder_accountId_idx" ON "WorkOrder"("accountId");
CREATE INDEX "WorkOrder_orderNumber_idx" ON "WorkOrder"("orderNumber");
CREATE INDEX "WorkOrder_dealId_idx" ON "WorkOrder"("dealId");

-- AddForeignKey for WorkOrder
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkOrder" ADD CONSTRAINT "WorkOrder_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
