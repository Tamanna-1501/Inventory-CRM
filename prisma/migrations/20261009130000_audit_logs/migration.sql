CREATE TABLE `AuditLog` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `companyId` INTEGER NULL,
  `userId` INTEGER NULL,
  `actorName` VARCHAR(191) NULL,
  `actorEmail` VARCHAR(191) NULL,
  `action` VARCHAR(191) NOT NULL,
  `entity` VARCHAR(191) NOT NULL,
  `entityId` VARCHAR(191) NULL,
  `details` JSON NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  INDEX `AuditLog_companyId_createdAt_idx`(`companyId`, `createdAt`),
  INDEX `AuditLog_userId_createdAt_idx`(`userId`, `createdAt`),
  INDEX `AuditLog_entity_entityId_idx`(`entity`, `entityId`),
  PRIMARY KEY (`id`),
  CONSTRAINT `AuditLog_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `Company`(`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `AuditLog_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
