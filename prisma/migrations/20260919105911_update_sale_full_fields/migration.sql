/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Sale` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `sale` ADD COLUMN `billerId` INTEGER NULL,
    ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `reference` VARCHAR(191) NULL,
    ADD COLUMN `shippingCharge` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `staffRemark` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending';

-- AlterTable
ALTER TABLE `saleitem` ADD COLUMN `batchNo` VARCHAR(191) NULL,
    ADD COLUMN `discount` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `tax` DECIMAL(10, 2) NOT NULL DEFAULT 0;

-- CreateTable
CREATE TABLE `Biller` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `name` VARCHAR(191) NOT NULL,
    `phone` VARCHAR(191) NULL,
    `email` VARCHAR(191) NULL,
    `address` VARCHAR(191) NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Sale_reference_key` ON `Sale`(`reference`);

-- AddForeignKey
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_billerId_fkey` FOREIGN KEY (`billerId`) REFERENCES `Biller`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
