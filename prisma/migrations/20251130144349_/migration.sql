/*
  Warnings:

  - You are about to alter the column `status` on the `Supplier` table. The data in that column could be lost. The data in that column will be cast from `VarChar(191)` to `Enum(EnumId(0))`.

*/
-- AlterTable
ALTER TABLE `Supplier` ADD COLUMN `website` VARCHAR(191) NULL,
    MODIFY `status` ENUM('ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'ACTIVE';
