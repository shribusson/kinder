-- Create WorkLog table
CREATE TABLE "WorkLog" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "dealId" TEXT NOT NULL,
    "resourceId" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'open',
    "checklist" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkLog_pkey" PRIMARY KEY ("id")
);

-- Indexes for WorkLog
CREATE INDEX "WorkLog_accountId_idx" ON "WorkLog"("accountId");
CREATE INDEX "WorkLog_dealId_idx" ON "WorkLog"("dealId");
CREATE INDEX "WorkLog_resourceId_idx" ON "WorkLog"("resourceId");
CREATE INDEX "WorkLog_createdAt_idx" ON "WorkLog"("createdAt");

-- Foreign keys for WorkLog
ALTER TABLE "WorkLog" ADD CONSTRAINT "WorkLog_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkLog" ADD CONSTRAINT "WorkLog_dealId_fkey" FOREIGN KEY ("dealId") REFERENCES "Deal"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkLog" ADD CONSTRAINT "WorkLog_resourceId_fkey" FOREIGN KEY ("resourceId") REFERENCES "Resource"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Create WorkLogMedia table
CREATE TABLE "WorkLogMedia" (
    "id" TEXT NOT NULL,
    "workLogId" TEXT NOT NULL,
    "mediaFileId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "WorkLogMedia_pkey" PRIMARY KEY ("id")
);

-- Indexes for WorkLogMedia
CREATE INDEX "WorkLogMedia_workLogId_idx" ON "WorkLogMedia"("workLogId");
CREATE INDEX "WorkLogMedia_mediaFileId_idx" ON "WorkLogMedia"("mediaFileId");

-- Foreign keys for WorkLogMedia
ALTER TABLE "WorkLogMedia" ADD CONSTRAINT "WorkLogMedia_workLogId_fkey" FOREIGN KEY ("workLogId") REFERENCES "WorkLog"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "WorkLogMedia" ADD CONSTRAINT "WorkLogMedia_mediaFileId_fkey" FOREIGN KEY ("mediaFileId") REFERENCES "MediaFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
