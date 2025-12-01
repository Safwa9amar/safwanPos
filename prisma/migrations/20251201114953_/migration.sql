/*
  Warnings:

  - Added the required column `updatedAt` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Sale_customerId_idx` ON `Sale`;

-- DropIndex
DROP INDEX `Sale_userId_idx` ON `Sale`;

-- DropIndex
DROP INDEX `SaleItem_productId_idx` ON `SaleItem`;

-- DropIndex
DROP INDEX `SaleItem_saleId_idx` ON `SaleItem`;

-- AlterTable
ALTER TABLE `Sale` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `SaleItem` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;
