-- Additive: two nullable columns on Product
ALTER TABLE `Product` ADD COLUMN `promotionalPrice` DECIMAL(10, 2) NULL,
    ADD COLUMN `batchNo` VARCHAR(191) NULL;
