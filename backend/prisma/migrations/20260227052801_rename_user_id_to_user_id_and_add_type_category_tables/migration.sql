/*
  Warnings:

  - You are about to drop the column `category` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `transactions` table. All the data in the column will be lost.
  - You are about to drop the column `userId` on the `transactions` table. All the data in the column will be lost.
  - Added the required column `category_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `createdBy` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `type_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedBy` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `transactions` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `user` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "transactions" DROP CONSTRAINT "transactions_userId_fkey";

-- AlterTable
ALTER TABLE "transactions" DROP COLUMN "category",
DROP COLUMN "type",
DROP COLUMN "userId",
ADD COLUMN     "category_id" INTEGER NOT NULL,
ADD COLUMN     "createdBy" INTEGER NOT NULL,
ADD COLUMN     "type_id" INTEGER NOT NULL,
ADD COLUMN     "updatedBy" INTEGER NOT NULL,
ADD COLUMN     "user_id" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "user" ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "transaction_type" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "transaction_type_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transaction_category" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "transaction_category_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "transaction_type_name_key" ON "transaction_type"("name");

-- CreateIndex
CREATE UNIQUE INDEX "transaction_category_name_key" ON "transaction_category"("name");

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_type_id_fkey" FOREIGN KEY ("type_id") REFERENCES "transaction_type"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_category_id_fkey" FOREIGN KEY ("category_id") REFERENCES "transaction_category"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
