-- AddColumn discount dan subtotal ke transactions table
ALTER TABLE "transactions" ADD COLUMN "subtotal" DOUBLE PRECISION NOT NULL DEFAULT 0;
ALTER TABLE "transactions" ADD COLUMN "discount" DOUBLE PRECISION NOT NULL DEFAULT 0;

-- Migrasi data lama: subtotal = totalPrice (karena sebelumnya tidak ada diskon)
UPDATE "transactions" SET "subtotal" = "totalPrice" WHERE "subtotal" = 0;

-- Verifikasi data sudah termigrasi
SELECT COUNT(*) as migrated_transactions FROM "transactions" WHERE "subtotal" > 0;
