-- AlterTable
ALTER TABLE `category` ADD COLUMN `image` VARCHAR(191) NULL,
    ADD COLUMN `parentId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `Category` ADD CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `Category`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
