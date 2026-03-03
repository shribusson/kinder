-- Rename old enum
ALTER TYPE "DealStage" RENAME TO "DealStage_old";

-- Create new enum with auto repair stages
CREATE TYPE "DealStage" AS ENUM ('на_диагностике', 'запланирована', 'в_работе', 'готова', 'закрыта', 'отменена');

-- Update the column to use the new enum (with default value for any existing records)
ALTER TABLE "Deal" ALTER COLUMN stage SET DEFAULT 'на_диагностике'::text;

-- Create a CAST to convert old values to new (if any data exists)
ALTER TABLE "Deal" 
  ALTER COLUMN stage TYPE "DealStage" USING 'на_диагностике'::"DealStage";

-- Drop the old enum
DROP TYPE "DealStage_old";
