-- AlterTable
ALTER TABLE "drugs" ADD COLUMN     "supplierId" INTEGER;

-- CreateIndex
CREATE INDEX "drugs_supplierId_idx" ON "drugs"("supplierId");

-- AddForeignKey
ALTER TABLE "drugs" ADD CONSTRAINT "drugs_supplierId_fkey" FOREIGN KEY ("supplierId") REFERENCES "suppliers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
