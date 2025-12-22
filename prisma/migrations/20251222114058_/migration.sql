-- AlterTable
ALTER TABLE `CapitalEntry` ALTER COLUMN `entryDate` DROP DEFAULT;

-- AlterTable
ALTER TABLE `PurchaseOrder` ADD COLUMN `notes` VARCHAR(191) NULL;
