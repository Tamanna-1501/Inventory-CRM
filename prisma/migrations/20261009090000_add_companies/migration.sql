CREATE TABLE `Company` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `phone` VARCHAR(191) NULL,
  `address` VARCHAR(191) NULL,
  `status` ENUM('active', 'suspended') NOT NULL DEFAULT 'active',
  `source` ENUM('self', 'superadmin') NOT NULL DEFAULT 'self',
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `Company_email_key`(`email`),
  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

INSERT INTO `Company` (`id`, `name`, `email`, `status`, `source`)
VALUES (1, 'Default Company', 'default-company@inventual.local', 'active', 'self');

ALTER TABLE `Role` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `User` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Category` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Warehouse` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Product` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Stock` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Customer` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Supplier` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Purchase` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Sale` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Invoice` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Expense` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `ExpenseCategory` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Transfer` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `PurchaseReturn` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `SaleReturn` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Biller` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Brand` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Unit` ADD COLUMN `companyId` INTEGER NULL;
ALTER TABLE `Adjustment` ADD COLUMN `companyId` INTEGER NULL;

UPDATE `Role` SET `companyId` = 1;
UPDATE `User` SET `companyId` = 1;
UPDATE `Category` SET `companyId` = 1;
UPDATE `Warehouse` SET `companyId` = 1;
UPDATE `Product` SET `companyId` = 1;
UPDATE `Stock` SET `companyId` = 1;
UPDATE `Customer` SET `companyId` = 1;
UPDATE `Supplier` SET `companyId` = 1;
UPDATE `Purchase` SET `companyId` = 1;
UPDATE `Sale` SET `companyId` = 1;
UPDATE `Invoice` SET `companyId` = 1;
UPDATE `Expense` SET `companyId` = 1;
UPDATE `ExpenseCategory` SET `companyId` = 1;
UPDATE `Transfer` SET `companyId` = 1;
UPDATE `PurchaseReturn` SET `companyId` = 1;
UPDATE `SaleReturn` SET `companyId` = 1;
UPDATE `Biller` SET `companyId` = 1;
UPDATE `Brand` SET `companyId` = 1;
UPDATE `Unit` SET `companyId` = 1;
UPDATE `Adjustment` SET `companyId` = 1;

ALTER TABLE `Role` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `User` MODIFY `companyId` INTEGER NULL;
ALTER TABLE `Category` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Warehouse` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Product` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Stock` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Customer` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Supplier` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Purchase` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Sale` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Invoice` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Expense` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `ExpenseCategory` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Transfer` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `PurchaseReturn` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `SaleReturn` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Biller` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Brand` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Unit` MODIFY `companyId` INTEGER NOT NULL;
ALTER TABLE `Adjustment` MODIFY `companyId` INTEGER NOT NULL;

ALTER TABLE `Role` DROP INDEX `Role_name_key`, ADD UNIQUE INDEX `Role_companyId_name_key`(`companyId`, `name`);
ALTER TABLE `Product` DROP INDEX `Product_sku_key`, ADD UNIQUE INDEX `Product_companyId_sku_key`(`companyId`, `sku`);
ALTER TABLE `Stock` ADD INDEX `Stock_productId_idx`(`productId`), DROP INDEX `Stock_productId_warehouseId_key`, ADD UNIQUE INDEX `Stock_companyId_productId_warehouseId_key`(`companyId`, `productId`, `warehouseId`);
ALTER TABLE `Supplier` DROP INDEX `Supplier_supplierCode_key`, ADD UNIQUE INDEX `Supplier_companyId_supplierCode_key`(`companyId`, `supplierCode`);
ALTER TABLE `Purchase` DROP INDEX `Purchase_reference_key`, ADD UNIQUE INDEX `Purchase_companyId_reference_key`(`companyId`, `reference`);
ALTER TABLE `Sale` DROP INDEX `Sale_reference_key`, ADD UNIQUE INDEX `Sale_companyId_reference_key`(`companyId`, `reference`);
ALTER TABLE `Invoice` DROP INDEX `Invoice_invoiceNumber_key`, ADD UNIQUE INDEX `Invoice_companyId_invoiceNumber_key`(`companyId`, `invoiceNumber`);
ALTER TABLE `Expense` DROP INDEX `Expense_reference_key`, ADD UNIQUE INDEX `Expense_companyId_reference_key`(`companyId`, `reference`);
ALTER TABLE `Transfer` DROP INDEX `Transfer_reference_key`, ADD UNIQUE INDEX `Transfer_companyId_reference_key`(`companyId`, `reference`);
ALTER TABLE `PurchaseReturn` DROP INDEX `PurchaseReturn_reference_key`, ADD UNIQUE INDEX `PurchaseReturn_companyId_reference_key`(`companyId`, `reference`);
ALTER TABLE `SaleReturn` DROP INDEX `SaleReturn_reference_key`, ADD UNIQUE INDEX `SaleReturn_companyId_reference_key`(`companyId`, `reference`);
ALTER TABLE `Biller` DROP INDEX `Biller_billerCode_key`, ADD UNIQUE INDEX `Biller_companyId_billerCode_key`(`companyId`, `billerCode`);
ALTER TABLE `Adjustment` DROP INDEX `Adjustment_reference_key`, ADD UNIQUE INDEX `Adjustment_companyId_reference_key`(`companyId`, `reference`);

ALTER TABLE `User` ADD CONSTRAINT `User_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Role` ADD CONSTRAINT `Role_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Category` ADD CONSTRAINT `Category_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Warehouse` ADD CONSTRAINT `Warehouse_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Product` ADD CONSTRAINT `Product_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Stock` ADD CONSTRAINT `Stock_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Customer` ADD CONSTRAINT `Customer_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Supplier` ADD CONSTRAINT `Supplier_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Purchase` ADD CONSTRAINT `Purchase_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Sale` ADD CONSTRAINT `Sale_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Invoice` ADD CONSTRAINT `Invoice_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Expense` ADD CONSTRAINT `Expense_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `ExpenseCategory` ADD CONSTRAINT `ExpenseCategory_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Transfer` ADD CONSTRAINT `Transfer_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `PurchaseReturn` ADD CONSTRAINT `PurchaseReturn_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `SaleReturn` ADD CONSTRAINT `SaleReturn_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Biller` ADD CONSTRAINT `Biller_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Brand` ADD CONSTRAINT `Brand_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Unit` ADD CONSTRAINT `Unit_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE `Adjustment` ADD CONSTRAINT `Adjustment_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

