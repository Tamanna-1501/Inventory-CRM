/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Transfer` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `transfer` ADD COLUMN `authorizedBy` VARCHAR(191) NULL,
    ADD COLUMN `date` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `reason` VARCHAR(191) NULL,
    ADD COLUMN `reference` VARCHAR(191) NULL,
    ADD COLUMN `status` ENUM('pending', 'completed', 'rejected') NOT NULL DEFAULT 'completed';

-- CreateIndex
CREATE UNIQUE INDEX `Transfer_reference_key` ON `Transfer`(`reference`);
