/*
  Warnings:

  - You are about to drop the column `endedAt` on the `AssessmentSession` table. All the data in the column will be lost.
  - You are about to drop the column `pdfUrl` on the `Material` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "AssessmentSession" DROP COLUMN "endedAt";

-- AlterTable
ALTER TABLE "Material" DROP COLUMN "pdfUrl";
