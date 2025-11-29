/*
  Warnings:

  - You are about to drop the column `date` on the `CapitalEntry` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `CapitalEntry` DROP COLUMN `date`,
    ADD COLUMN `entryDate` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
