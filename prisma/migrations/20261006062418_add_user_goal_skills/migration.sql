-- AlterTable
ALTER TABLE "UserDomain" ADD COLUMN     "goalSkillIds" TEXT[] DEFAULT ARRAY[]::TEXT[];
