/*
  Warnings:

  - You are about to drop the column `confidence` on the `Mastery` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Mastery" DROP COLUMN "confidence",
ADD COLUMN     "evidenceCount" DOUBLE PRECISION NOT NULL DEFAULT 0;
