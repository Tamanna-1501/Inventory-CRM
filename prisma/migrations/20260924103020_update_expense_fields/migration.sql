-- AlterTable
ALTER TABLE `expense` ADD COLUMN `expenseType` ENUM('direct', 'indirect') NOT NULL DEFAULT 'direct',
    ADD COLUMN `voucherNo` VARCHAR(191) NULL,
    ADD COLUMN `warehouseId` INTEGER NULL;

-- AlterTable
ALTER TABLE `expensepayment` ADD COLUMN `cardLast4` VARCHAR(191) NULL,
    ADD COLUMN `note` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `Warehouse`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
