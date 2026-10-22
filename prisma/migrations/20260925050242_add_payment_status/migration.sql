-- AlterTable
ALTER TABLE `expensepayment` ADD COLUMN `status` ENUM('pending', 'completed') NOT NULL DEFAULT 'completed';
