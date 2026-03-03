-- Add composite index for faster idempotency checks
CREATE INDEX "Message_accountId_externalId_idx" ON "Message"("accountId", "externalId");
