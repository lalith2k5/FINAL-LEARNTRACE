-- AlterTable
ALTER TABLE "Attempt" ADD COLUMN     "justification" TEXT,
ADD COLUMN     "misconceptionJson" JSONB;
