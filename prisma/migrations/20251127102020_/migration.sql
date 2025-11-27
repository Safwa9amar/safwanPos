/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Expense` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ExpenseCategory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ExpenseCategory` table. All the data in the column will be lost.
  - You are about to alter the column `unit` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(2))`.
  - A unique constraint covering the columns `[name,userId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `Product` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.

*/
-- DropIndex
DROP INDEX `Barcode_productId_idx` ON `Barcode`;

-- DropIndex
DROP INDEX `Barcode_userId_idx` ON `Barcode`;

-- DropIndex
DROP INDEX `Category_userId_idx` ON `Category`;

-- DropIndex
DROP INDEX `Customer_userId_idx` ON `Customer`;

-- DropIndex
DROP INDEX `Expense_categoryId_idx` ON `Expense`;

-- DropIndex
DROP INDEX `Expense_userId_idx` ON `Expense`;

-- DropIndex
DROP INDEX `ExpenseCategory_userId_idx` ON `ExpenseCategory`;

-- DropIndex
DROP INDEX `Payment_customerId_idx` ON `Payment`;

-- DropIndex
DROP INDEX `Payment_userId_idx` ON `Payment`;

-- DropIndex
DROP INDEX `Product_categoryId_idx` ON `Product`;

-- DropIndex
DROP INDEX `Product_userId_idx` ON `Product`;

-- DropIndex
DROP INDEX `PurchaseOrder_supplierId_idx` ON `PurchaseOrder`;

-- DropIndex
DROP INDEX `PurchaseOrder_userId_idx` ON `PurchaseOrder`;

-- DropIndex
DROP INDEX `PurchaseOrderItem_productId_idx` ON `PurchaseOrderItem`;

-- DropIndex
DROP INDEX `PurchaseOrderItem_purchaseOrderId_idx` ON `PurchaseOrderItem`;

-- DropIndex
DROP INDEX `RepairJob_userId_idx` ON `RepairJob`;

-- DropIndex
DROP INDEX `Report_userId_idx` ON `Report`;

-- DropIndex
DROP INDEX `Sale_customerId_idx` ON `Sale`;

-- DropIndex
DROP INDEX `Sale_userId_idx` ON `Sale`;

-- DropIndex
DROP INDEX `SaleItem_productId_idx` ON `SaleItem`;

-- DropIndex
DROP INDEX `SaleItem_saleId_idx` ON `SaleItem`;

-- DropIndex
DROP INDEX `Supplier_userId_idx` ON `Supplier`;

-- AlterTable
ALTER TABLE `Barcode` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Expense` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `ExpenseCategory` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `Payment` MODIFY `notes` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Product` MODIFY `unit` ENUM('EACH', 'KG', 'G', 'L', 'ML') NOT NULL DEFAULT 'EACH';

-- AlterTable
ALTER TABLE `RepairJob` MODIFY `reportedProblem` VARCHAR(191) NOT NULL,
    MODIFY `notes` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Report` MODIFY `content` TEXT NOT NULL;

-- AlterTable
ALTER TABLE `Sale` MODIFY `paymentType` ENUM('CASH', 'CARD', 'CREDIT') NOT NULL DEFAULT 'CASH';

-- AlterTable
ALTER TABLE `User` ADD COLUMN `subscriptionStatus` ENUM('TRIAL', 'ACTIVE', 'INACTIVE', 'CANCELED') NOT NULL DEFAULT 'TRIAL',
    ADD COLUMN `trialEndsAt` DATETIME(3) NULL,
    MODIFY `role` ENUM('ADMIN', 'CASHIER') NOT NULL DEFAULT 'CASHIER';

-- CreateIndex
CREATE UNIQUE INDEX `Customer_name_userId_key` ON `Customer`(`name`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Product_name_userId_key` ON `Product`(`name`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_name_userId_key` ON `Supplier`(`name`, `userId`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Barcode` ADD CONSTRAINT `Barcode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Barcode` ADD CONSTRAINT `Barcode_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `SaleItem` ADD CONSTRAINT `SaleItem_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `Sale`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SaleItem` ADD CONSTRAINT `SaleItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderItem` ADD CONSTRAINT `PurchaseOrderItem_purchaseOrderId_fkey` FOREIGN KEY (`purchaseOrderId`) REFERENCES `PurchaseOrder`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrderItem` ADD CONSTRAINT `PurchaseOrderItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Payment` ADD CONSTRAINT `Payment_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `Customer`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `ExpenseCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `ExpenseCategory` ADD CONSTRAINT `ExpenseCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `RepairJob` ADD CONSTRAINT `RepairJob_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Report` ADD CONSTRAINT `Report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
