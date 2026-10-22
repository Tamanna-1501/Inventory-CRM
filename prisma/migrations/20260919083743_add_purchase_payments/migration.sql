/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Purchase` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `purchase` ADD COLUMN `note` VARCHAR(191) NULL,
    ADD COLUMN `reference` VARCHAR(191) NULL,
    ADD COLUMN `shippingCharge` DECIMAL(10, 2) NOT NULL DEFAULT 0,
    ADD COLUMN `status` ENUM('pending', 'completed', 'cancelled') NOT NULL DEFAULT 'pending';

-- CreateTable
CREATE TABLE `PurchasePayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `purchaseId` INTEGER NOT NULL,
    `amountPaid` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` ENUM('cash', 'card', 'upi', 'bank_transfer', 'credit') NOT NULL,
    `paidAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Purchase_reference_key` ON `Purchase`(`reference`);

-- AddForeignKey
ALTER TABLE `PurchasePayment` ADD CONSTRAINT `PurchasePayment_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `Purchase`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
