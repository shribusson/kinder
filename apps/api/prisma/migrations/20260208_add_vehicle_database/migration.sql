-- Phase 0: Vehicle Database & Knowledge Base
-- Migration created manually due to DATABASE_URL environment variable not being found
-- Date: 2026-02-08

-- Create VehicleBrand table
CREATE TABLE "VehicleBrand" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "cyrillicName" TEXT,
    "numericId" INTEGER,
    "country" TEXT,
    "popular" BOOLEAN NOT NULL DEFAULT false,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for VehicleBrand
CREATE INDEX "VehicleBrand_popular_idx" ON "VehicleBrand"("popular");
CREATE INDEX "VehicleBrand_name_idx" ON "VehicleBrand"("name");

-- Create VehicleModel table
CREATE TABLE "VehicleModel" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "brandId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "cyrillicName" TEXT,
    "class" TEXT,
    "yearFrom" INTEGER,
    "yearTo" INTEGER,
    "technicalData" JSONB,
    "partsData" JSONB,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleModel_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "VehicleBrand"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for VehicleModel
CREATE INDEX "VehicleModel_brandId_idx" ON "VehicleModel"("brandId");
CREATE INDEX "VehicleModel_name_idx" ON "VehicleModel"("name");

-- Create Vehicle table
CREATE TABLE "Vehicle" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "modelId" TEXT NOT NULL,
    "year" INTEGER,
    "vin" TEXT,
    "licensePlate" TEXT,
    "color" TEXT,
    "mileage" INTEGER,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Vehicle_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Vehicle_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "VehicleBrand"("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vehicle_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VehicleModel"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- Create indexes and unique constraints for Vehicle
CREATE UNIQUE INDEX "Vehicle_accountId_vin_key" ON "Vehicle"("accountId", "vin");
CREATE UNIQUE INDEX "Vehicle_accountId_licensePlate_key" ON "Vehicle"("accountId", "licensePlate");
CREATE INDEX "Vehicle_accountId_idx" ON "Vehicle"("accountId");
CREATE INDEX "Vehicle_brandId_idx" ON "Vehicle"("brandId");
CREATE INDEX "Vehicle_modelId_idx" ON "Vehicle"("modelId");
CREATE INDEX "Vehicle_vin_idx" ON "Vehicle"("vin");
CREATE INDEX "Vehicle_licensePlate_idx" ON "Vehicle"("licensePlate");

-- Create VehicleServiceHistory table
CREATE TABLE "VehicleServiceHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "accountId" TEXT NOT NULL,
    "vehicleId" TEXT NOT NULL,
    "dealId" TEXT,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "mileageAtService" INTEGER,
    "description" TEXT NOT NULL,
    "notes" TEXT,
    "cost" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "VehicleServiceHistory_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleServiceHistory_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "VehicleServiceHistory_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- Create indexes for VehicleServiceHistory
CREATE INDEX "VehicleServiceHistory_accountId_idx" ON "VehicleServiceHistory"("accountId");
CREATE INDEX "VehicleServiceHistory_vehicleId_idx" ON "VehicleServiceHistory"("vehicleId");
CREATE INDEX "VehicleServiceHistory_dealId_idx" ON "VehicleServiceHistory"("dealId");
CREATE INDEX "VehicleServiceHistory_serviceDate_idx" ON "VehicleServiceHistory"("serviceDate");

-- Create VehicleExternalId table (for future API integrations)
CREATE TABLE "VehicleExternalId" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "modelId" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "VehicleExternalId_modelId_fkey" FOREIGN KEY ("modelId") REFERENCES "VehicleModel"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes and unique constraint for VehicleExternalId
CREATE UNIQUE INDEX "VehicleExternalId_source_externalId_key" ON "VehicleExternalId"("source", "externalId");
CREATE INDEX "VehicleExternalId_modelId_idx" ON "VehicleExternalId"("modelId");

-- Add vehicleId column to Deal table
ALTER TABLE "Deal" ADD COLUMN "vehicleId" TEXT;

-- Create foreign key constraint for Deal.vehicleId
ALTER TABLE "Deal" ADD CONSTRAINT "Deal_vehicleId_fkey" FOREIGN KEY ("vehicleId") REFERENCES "Vehicle"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Create index for Deal.vehicleId
CREATE INDEX "Deal_vehicleId_idx" ON "Deal"("vehicleId");
