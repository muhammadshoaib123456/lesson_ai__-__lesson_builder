-- AlterTable
ALTER TABLE "shooooo_schema"."User" ADD COLUMN     "lastSlideCreated" TIMESTAMP(3),
ADD COLUMN     "planId" TEXT,
ADD COLUMN     "slidesCreated" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "subscriptionActive" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "subscriptionEnds" TIMESTAMP(3),
ADD COLUMN     "subscriptionType" TEXT DEFAULT 'free';

-- CreateTable
CREATE TABLE "shooooo_schema"."CreatedLesson" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "subject" TEXT NOT NULL,
    "grade" TEXT NOT NULL,
    "slideCount" INTEGER NOT NULL DEFAULT 9,
    "outline" TEXT,
    "slides" TEXT,
    "downloadCount" INTEGER NOT NULL DEFAULT 0,
    "jobId" TEXT,
    "status" TEXT NOT NULL DEFAULT 'processing',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatedLesson_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CreatedLesson_userId_idx" ON "shooooo_schema"."CreatedLesson"("userId");

-- CreateIndex
CREATE INDEX "CreatedLesson_status_idx" ON "shooooo_schema"."CreatedLesson"("status");

-- AddForeignKey
ALTER TABLE "shooooo_schema"."CreatedLesson" ADD CONSTRAINT "CreatedLesson_userId_fkey" FOREIGN KEY ("userId") REFERENCES "shooooo_schema"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
