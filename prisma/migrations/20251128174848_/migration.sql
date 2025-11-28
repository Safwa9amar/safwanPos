/*
  Warnings:

  - You are about to drop the column `updatedAt` on the `Barcode` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `PurchaseOrder` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Sale` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Sale` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[stripeCustomerId]` on the table `User` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[stripeSubscriptionId]` on the table `User` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE `PurchaseOrder` DROP FOREIGN KEY `PurchaseOrder_supplierId_fkey`;

-- AlterTable
ALTER TABLE `Barcode` DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `Payment` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `Product` MODIFY `costPrice` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `stock` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `PurchaseOrder` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    MODIFY `status` ENUM('PENDING', 'PARTIALLY_RECEIVED', 'COMPLETED', 'CANCELLED') NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `PurchaseOrderItem` ADD COLUMN `receivedQuantity` INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `RepairJob` MODIFY `reportedProblem` TEXT NOT NULL,
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `Report` MODIFY `content` LONGTEXT NOT NULL;

-- AlterTable
ALTER TABLE `Sale` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`,
    ALTER COLUMN `paymentType` DROP DEFAULT,
    MODIFY `amountPaid` DOUBLE NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE `Supplier` ADD COLUMN `balance` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `User` ADD COLUMN `stripeCurrentPeriodEnd` DATETIME(3) NULL,
    ADD COLUMN `stripeCustomerId` VARCHAR(191) NULL,
    ADD COLUMN `stripePriceId` VARCHAR(191) NULL,
    ADD COLUMN `stripeSubscriptionId` VARCHAR(191) NULL,
    MODIFY `subscriptionStatus` ENUM('TRIAL', 'ACTIVE', 'INACTIVE', 'CANCELED') NULL DEFAULT 'TRIAL';

-- CreateTable
CREATE TABLE `SupplierPayment` (
    `id` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `paymentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `notes` TEXT NULL,

    INDEX `SupplierPayment_supplierId_idx`(`supplierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `SupplierCredit` (
    `id` VARCHAR(191) NOT NULL,
    `supplierId` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `adjustmentDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `reason` VARCHAR(191) NOT NULL,

    INDEX `SupplierCredit_supplierId_idx`(`supplierId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Barcode_userId_idx` ON `Barcode`(`userId`);

-- CreateIndex
CREATE INDEX `Sale_userId_saleDate_idx` ON `Sale`(`userId`, `saleDate`);

-- CreateIndex
CREATE UNIQUE INDEX `User_stripeCustomerId_key` ON `User`(`stripeCustomerId`);

-- CreateIndex
CREATE UNIQUE INDEX `User_stripeSubscriptionId_key` ON `User`(`stripeSubscriptionId`);

-- AddForeignKey
ALTER TABLE `Barcode` ADD CONSTRAINT `Barcode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplierPayment` ADD CONSTRAINT `SupplierPayment_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplierPayment` ADD CONSTRAINT `SupplierPayment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplierCredit` ADD CONSTRAINT `SupplierCredit_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplierCredit` ADD CONSTRAINT `SupplierCredit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `PurchaseOrder` ADD CONSTRAINT `PurchaseOrder_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `Supplier`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
