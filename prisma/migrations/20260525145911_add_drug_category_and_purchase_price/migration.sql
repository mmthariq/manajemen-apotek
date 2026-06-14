-- CreateEnum
CREATE TYPE "DrugCategory" AS ENUM ('BEBAS', 'BEBAS_TERBATAS', 'KERAS');

-- AlterTable
ALTER TABLE "drugs" ADD COLUMN     "category" "DrugCategory" NOT NULL DEFAULT 'BEBAS',
ADD COLUMN     "purchasePrice" DOUBLE PRECISION;
