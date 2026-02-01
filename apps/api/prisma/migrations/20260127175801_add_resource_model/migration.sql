/*
  Warnings:

  - You are about to drop the column `key` on the `MediaFile` table. All the data in the column will be lost.
  - You are about to drop the column `size` on the `MediaFile` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "ResourceType" AS ENUM ('specialist', 'room', 'equipment');

-- DropForeignKey
ALTER TABLE "CallRecording" DROP CONSTRAINT "CallRecording_mediaFileId_fkey";

-- DropIndex
DROP INDEX "MediaFile_bucket_idx";

-- DropIndex
DROP INDEX "MediaFile_key_idx";

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN     "resourceId" TEXT;

-- AlterTable
ALTER TABLE "Call" ADD COLUMN     "externalId" TEXT,
ADD COLUMN     "from" TEXT,
ADD COLUMN     "to" TEXT;

-- AlterTable
ALTER TABLE "CallRecording" ADD COLUMN     "url" TEXT,
ALTER COLUMN "mediaFileId" DROP NOT NULL,
ALTER COLUMN "duration" SET DEFAULT 0;

-- AlterTable
ALTER TABLE "MediaFile" DROP COLUMN "key",
DROP COLUMN "size",
ADD COLUMN     "fileSize" INTEGER,
ADD COLUMN     "name" TEXT,
ADD COLUMN     "storageKey" TEXT,
ALTER COLUMN "bucket" DROP NOT NULL,
ALTER COLUMN "mimeType" DROP NOT NULL;

-- CreateTable
CREATE TABLE "Resource" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "type" "ResourceType" NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "workingHours" JSONB,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resource_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Resource_accountId_idx" ON "Resource"("accountId");

-- CreateIndex
CREATE INDEX "Resource_isActive_idx" ON "Resource"("isActive");

-- CreateIndex
CREATE INDEX "Resource_type_idx" ON "Resource"("type");

-- CreateIndex
CREATE INDEX "Booking_resourceId_idx" ON "Booking"("resourceId");

-- CreateIndex
CREATE INDEX "MediaFile_storageKey_idx" ON "MediaFile"("storageKey");

-- CreateIndex
CREATE INDEX "Message_conversationId_direction_readAt_idx" ON "Message"("conversationId", "direction", "readAt");

-- AddForeignKey
ALTER TABLE "Booking" ADD CONSTRAINT "Booking_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resource" ADD CONSTRAINT "Resource_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CallRecording" ADD CONSTRAINT "CallRecording_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "MediaFile"("id") ON DELETE SET NULL ON UPDATE CASCADE;
