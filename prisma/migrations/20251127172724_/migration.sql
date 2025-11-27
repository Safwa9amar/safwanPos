/*
  Warnings:

  - You are about to alter the column `unit` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.
  - A unique constraint covering the columns `[email]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Barcode` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `ExpenseCategory` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Payment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PurchaseOrder` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PurchaseOrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Sale` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `SaleItem` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `PurchaseOrderItem` DROP FOREIGN KEY `PurchaseOrderItem_productId_fkey`;

-- DropForeignKey
ALTER TABLE `Sale` DROP FOREIGN KEY `Sale_customerId_fkey`;

-- DropIndex
DROP INDEX `Customer_name_userId_key` ON `Customer`;

-- DropIndex
DROP INDEX `Product_name_userId_key` ON `Product`;

-- DropIndex
DROP INDEX `Supplier_name_userId_key` ON `Supplier`;

-- AlterTable
ALTER TABLE `Barcode` ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Expense` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `ExpenseCategory` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Payment` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `Product` MODIFY `stock` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `unit` VARCHAR(191) NOT NULL DEFAULT 'EACH',
    MODIFY `image` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `PurchaseOrder` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `PurchaseOrderItem` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `RepairJob` MODIFY `reportedProblem` TEXT NOT NULL,
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `Report` MODIFY `content` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Sale` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ALTER COLUMN `paymentType` DROP DEFAULT;

-- AlterTable
ALTER TABLE `SaleItem` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `createdById` VARCHAR(191) NULL,
    MODIFY `role` ENUM('ADMIN', 'CASHIER') NOT NULL DEFAULT 'CASHIER';

-- CreateIndex
CREATE UNIQUE INDEX `Customer_email_key` ON `Customer`(`email`);

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderItem` ADD CONSTRAINT `PurchaseOrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
