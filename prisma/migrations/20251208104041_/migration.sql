/*
  Warnings:

  - You are about to drop the column `categoryId` on the `CapitalEntry` table. All the data in the column will be lost.
  - Added the required column `IncomeCategoryId` to the `CapitalEntry` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `CapitalEntry` DROP FOREIGN KEY `CapitalEntry_categoryId_fkey`;

-- AlterTable
ALTER TABLE `CapitalEntry` DROP COLUMN `categoryId`,
    ADD COLUMN `IncomeCategoryId` VARCHAR(191) NOT NULL,
    ALTER COLUMN `entryDate` DROP DEFAULT;

-- AddForeignKey
ALTER TABLE `CapitalEntry` ADD CONSTRAINT `CapitalEntry_IncomeCategoryId_fkey` FOREIGN KEY (`IncomeCategoryId`) REFERENCES `IncomeCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
