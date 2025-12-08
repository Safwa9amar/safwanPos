/*
  Warnings:

  - Added the required column `categoryId` to the `CapitalEntry` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `CapitalEntry` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `CapitalEntry` ADD COLUMN `categoryId` VARCHAR(191) NOT NULL,
    ADD COLUMN `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `updatedAt` DATETIME(3) NOT NULL,
    ALTER COLUMN `entryDate` DROP DEFAULT;

-- CreateTable
CREATE TABLE `IncomeCategory` (
    `id` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `userId` VARCHAR(191) NOT NULL,

    UNIQUE INDEX `IncomeCategory_name_userId_key`(`name`, `userId`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `CapitalEntry` ADD CONSTRAINT `CapitalEntry_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `IncomeCategory`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `IncomeCategory` ADD CONSTRAINT `IncomeCategory_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
