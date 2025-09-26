-- AlterTable
ALTER TABLE "shooooo_schema"."User" ADD COLUMN     "defaultGrade" TEXT,
ADD COLUMN     "defaultStandard" TEXT,
ADD COLUMN     "defaultSubject" TEXT,
ADD COLUMN     "onboardingStep" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "profileComplete" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "role" TEXT;
