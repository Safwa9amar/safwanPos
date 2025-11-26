/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Expense` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX `Customer_name_userId_key` ON `Customer`;

-- DropIndex
DROP INDEX `Supplier_name_userId_key` ON `Supplier`;

-- AlterTable
ALTER TABLE `Expense` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `PurchaseOrder` ALTER COLUMN `status` DROP DEFAULT;

-- AlterTable
ALTER TABLE `RepairJob` MODIFY `reportedProblem` VARCHAR(191) NOT NULL,
    MODIFY `notes` VARCHAR(191) NULL,
    ALTER COLUMN `status` DROP DEFAULT;

-- AlterTable
ALTER TABLE `User` MODIFY `name` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `Report` (
    `id` VARCHAR(191) NOT NULL,
    `title` VARCHAR(191) NOT NULL,
    `content` TEXT NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,

    INDEX `Report_userId_idx`(`userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Category_userId_idx` ON `Category`(`userId`);

-- CreateIndex
CREATE INDEX `Customer_userId_idx` ON `Customer`(`userId`);

-- CreateIndex
CREATE INDEX `Expense_userId_idx` ON `Expense`(`userId`);

-- CreateIndex
CREATE INDEX `Expense_categoryId_idx` ON `Expense`(`categoryId`);

-- CreateIndex
CREATE INDEX `ExpenseCategory_userId_idx` ON `ExpenseCategory`(`userId`);

-- CreateIndex
CREATE INDEX `Payment_userId_idx` ON `Payment`(`userId`);

-- CreateIndex
CREATE INDEX `Payment_customerId_idx` ON `Payment`(`customerId`);

-- CreateIndex
CREATE INDEX `Product_userId_idx` ON `Product`(`userId`);

-- CreateIndex
CREATE INDEX `Product_categoryId_idx` ON `Product`(`categoryId`);

-- CreateIndex
CREATE INDEX `PurchaseOrder_userId_idx` ON `PurchaseOrder`(`userId`);

-- CreateIndex
CREATE INDEX `PurchaseOrder_supplierId_idx` ON `PurchaseOrder`(`supplierId`);

-- CreateIndex
CREATE INDEX `PurchaseOrderItem_purchaseOrderId_idx` ON `PurchaseOrderItem`(`purchaseOrderId`);

-- CreateIndex
CREATE INDEX `PurchaseOrderItem_productId_idx` ON `PurchaseOrderItem`(`productId`);

-- CreateIndex
CREATE INDEX `RepairJob_userId_idx` ON `RepairJob`(`userId`);

-- CreateIndex
CREATE INDEX `Sale_userId_idx` ON `Sale`(`userId`);

-- CreateIndex
CREATE INDEX `Sale_customerId_idx` ON `Sale`(`customerId`);

-- CreateIndex
CREATE INDEX `SaleItem_saleId_idx` ON `SaleItem`(`saleId`);

-- CreateIndex
CREATE INDEX `SaleItem_productId_idx` ON `SaleItem`(`productId`);

-- CreateIndex
CREATE INDEX `Supplier_userId_idx` ON `Supplier`(`userId`);

-- CreateIndex
CREATE INDEX `User_email_idx` ON `User`(`email`);
