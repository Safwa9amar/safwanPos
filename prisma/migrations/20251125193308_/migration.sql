/*
  Warnings:

  - A unique constraint covering the columns `[name,userId]` on the table `Customer` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[name,userId]` on the table `Supplier` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `updatedAt` to the `Customer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Expense` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Supplier` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `Customer_email_key` ON `Customer`;

-- DropIndex
DROP INDEX `Supplier_email_key` ON `Supplier`;

-- AlterTable
ALTER TABLE `Customer` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `Expense` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    MODIFY `expenseDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);

-- AlterTable
ALTER TABLE `Payment` MODIFY `notes` TEXT NULL;

-- AlterTable
ALTER TABLE `Product` MODIFY `costPrice` DOUBLE NOT NULL DEFAULT 0,
    MODIFY `image` VARCHAR(1024) NULL;

-- AlterTable
ALTER TABLE `RepairJob` MODIFY `reportedProblem` TEXT NOT NULL,
    MODIFY `notes` TEXT NULL,
    MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE `Supplier` ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL;

-- AlterTable
ALTER TABLE `User` MODIFY `email` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Customer_name_userId_key` ON `Customer`(`name`, `userId`);

-- CreateIndex
CREATE UNIQUE INDEX `Supplier_name_userId_key` ON `Supplier`(`name`, `userId`);
