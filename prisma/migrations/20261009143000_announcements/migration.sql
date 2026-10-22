CREATE TABLE `Announcement` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(191) NOT NULL,
  `body` TEXT NOT NULL,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `startsAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `expiresAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,
  `createdById` INTEGER NULL,
  PRIMARY KEY (`id`),
  INDEX `Announcement_isActive_startsAt_expiresAt_idx` (`isActive`, `startsAt`, `expiresAt`),
  INDEX `Announcement_createdAt_idx` (`createdAt`),
  INDEX `Announcement_createdById_idx` (`createdById`),
  CONSTRAINT `Announcement_createdById_fkey` FOREIGN KEY (`createdById`) REFERENCES `User`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
