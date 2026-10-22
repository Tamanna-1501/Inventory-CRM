/*
  Warnings:

  - A unique constraint covering the columns `[reference]` on the table `Expense` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE `expense` ADD COLUMN `reference` VARCHAR(191) NULL;

-- CreateTable
CREATE TABLE `ExpensePayment` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
     `expenseId` INTEGER NOT NULL,
    `amountPaid` DECIMAL(10, 2) NOT NULL,
    `paymentMethod` ENUM('cash', 'card', 'upi', 'bank_transfer', 'credit') NOT NULL,
    `paidAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateIndex
CREATE UNIQUE INDEX `Expense_reference_key` ON `Expense`(`reference`);

-- AddForeignKey
ALTER TABLE `ExpensePayment` ADD CONSTRAINT `ExpensePayment_expenseId_fkey` FOREIGN KEY (`expenseId`) REFERENCES `Expense`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
