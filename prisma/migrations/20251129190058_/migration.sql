/*
  Warnings:

  - You are about to drop the column `createdAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Category` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `Customer` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ExpenseCategory` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ExpenseCategory` table. All the data in the column will be lost.
  - You are about to alter the column `unit` on the `Product` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(2))` to `VarChar(191)`.
  - You are about to alter the column `status` on the `PurchaseOrder` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `VarChar(191)`.
  - You are about to alter the column `paymentType` on the `Sale` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(1))` to `VarChar(191)`.
  - You are about to alter the column `status` on the `Supplier` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(5))` to `VarChar(191)`.
  - You are about to drop the column `stripeCurrentPeriodEnd` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeCustomerId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripePriceId` on the `User` table. All the data in the column will be lost.
  - You are about to drop the column `stripeSubscriptionId` on the `User` table. All the data in the column will be lost.
  - You are about to alter the column `role` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(0))` to `VarChar(191)`.
  - Made the column `subscriptionStatus` on table `User` required. This step will fail if there are existing NULL values in that column.

*/
-- DropForeignKey
ALTER TABLE `Barcode` DROP FOREIGN KEY `Barcode_userId_fkey`;

-- DropForeignKey
ALTER TABLE `Product` DROP FOREIGN KEY `Product_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `SupplierCredit` DROP FOREIGN KEY `SupplierCredit_userId_fkey`;

-- DropForeignKey
ALTER TABLE `SupplierPayment` DROP FOREIGN KEY `SupplierPayment_userId_fkey`;

-- DropForeignKey
ALTER TABLE `User` DROP FOREIGN KEY `User_createdById_fkey`;

-- DropIndex
DROP INDEX `Sale_userId_saleDate_idx` ON `Sale`;

-- DropIndex
DROP INDEX `User_stripeCustomerId_key` ON `User`;

-- DropIndex
DROP INDEX `User_stripeSubscriptionId_key` ON `User`;

-- AlterTable
ALTER TABLE `Category` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `Customer` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `ExpenseCategory` DROP COLUMN `createdAt`,
    DROP COLUMN `updatedAt`;

-- AlterTable
ALTER TABLE `Payment` MODIFY `notes` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Product` ALTER COLUMN `stock` DROP DEFAULT,
    MODIFY `unit` VARCHAR(191) NOT NULL DEFAULT 'EACH';

-- AlterTable
ALTER TABLE `PurchaseOrder` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `RepairJob` MODIFY `reportedProblem` VARCHAR(191) NOT NULL,
    MODIFY `notes` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `Report` MODIFY `content` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Sale` MODIFY `paymentType` VARCHAR(191) NOT NULL,
    ALTER COLUMN `amountPaid` DROP DEFAULT;

-- AlterTable
ALTER TABLE `SaleItem` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Supplier` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'ACTIVE',
    MODIFY `notes` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `SupplierPayment` MODIFY `notes` VARCHAR(191) NULL;

-- AlterTable
ALTER TABLE `User` DROP COLUMN `stripeCurrentPeriodEnd`,
    DROP COLUMN `stripeCustomerId`,
    DROP COLUMN `stripePriceId`,
    DROP COLUMN `stripeSubscriptionId`,
    MODIFY `role` VARCHAR(191) NOT NULL DEFAULT 'CASHIER',
    MODIFY `subscriptionStatus` VARCHAR(191) NOT NULL DEFAULT 'TRIAL';

-- CreateTable
CREATE TABLE `CapitalEntry` (
    `id` VARCHAR(191) NOT NULL,
    `details` VARCHAR(191) NOT NULL,
    `amount` DOUBLE NOT NULL,
    `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `userId` VARCHAR(191) NOT NULL,
    `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectPurchase` (
    `id` VARCHAR(191) NOT NULL,
    `purchaseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `storeName` VARCHAR(191) NULL,
    `notes` VARCHAR(191) NULL,
    `totalCost` DOUBLE NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `DirectPurchaseItem` (
    `id` VARCHAR(191) NOT NULL,
    `directPurchaseId` VARCHAR(191) NOT NULL,
    `productId` VARCHAR(191) NOT NULL,
    `quantity` DOUBLE NOT NULL,
    `costPrice` DOUBLE NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE INDEX `Sale_saleDate_idx` ON `Sale`(`saleDate`);

-- AddForeignKey
ALTER TABLE `Product` ADD CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE `Barcode` ADD CONSTRAINT `Barcode_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE NO ACTION ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `CapitalEntry` ADD CONSTRAINT `CapitalEntry_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplierPayment` ADD CONSTRAINT `SupplierPayment_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `SupplierCredit` ADD CONSTRAINT `SupplierCredit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectPurchase` ADD CONSTRAINT `DirectPurchase_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectPurchaseItem` ADD CONSTRAINT `DirectPurchaseItem_directPurchaseId_fkey` FOREIGN KEY (`directPurchaseId`) REFERENCES `DirectPurchase`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `DirectPurchaseItem` ADD CONSTRAINT `DirectPurchaseItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `Product`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `User` ADD CONSTRAINT `User_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE NO ACTION;
