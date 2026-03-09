-- AlterTable
ALTER TABLE "transaction_category" ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "transaction_type" ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 1;

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "status" INTEGER NOT NULL DEFAULT 1;

-- CreateIndex
CREATE INDEX "transactions_type_id_idx" ON "transactions"("type_id");

-- CreateIndex
CREATE INDEX "transactions_category_id_idx" ON "transactions"("category_id");
