/*
  Warnings:

  - A unique constraint covering the columns `[billerCode]` on the table `Biller` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `biller` ADD COLUMN `billerCode` VARCHAR(191) NULL,
    ADD COLUMN `dateOfJoin` DATETIME(3) NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `nidPassport` VARCHAR(191) NULL,
    ADD COLUMN `warehouseId` INTEGER NULL,
    ADD COLUMN `zipCode` VARCHAR(191) NULL;

-- CreateIndex
CREATE UNIQUE INDEX `Biller_billerCode_key` ON `Biller`(`billerCode`);

-- AddForeignKey
ALTER TABLE `Biller` ADD CONSTRAINT `Biller_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
