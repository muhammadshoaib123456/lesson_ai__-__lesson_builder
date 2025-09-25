-- CreateTable
CREATE TABLE "shooooo_schema"."SavedPresentation" (
    "userId" TEXT NOT NULL,
    "presentationId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SavedPresentation_pkey" PRIMARY KEY ("userId","presentationId")
);

-- CreateIndex
CREATE INDEX "SavedPresentation_presentationId_idx" ON "shooooo_schema"."SavedPresentation"("presentationId");

-- AddForeignKey
ALTER TABLE "shooooo_schema"."SavedPresentation" ADD CONSTRAINT "SavedPresentation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "shooooo_schema"."User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shooooo_schema"."SavedPresentation" ADD CONSTRAINT "SavedPresentation_presentationId_fkey" FOREIGN KEY ("presentationId") REFERENCES "shooooo_schema"."Presentation"("id") ON DELETE CASCADE ON UPDATE CASCADE;
