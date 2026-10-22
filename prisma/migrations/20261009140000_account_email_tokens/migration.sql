ALTER TABLE `User` ADD COLUMN `emailVerifiedAt` DATETIME(3) NULL;

UPDATE `User` SET `emailVerifiedAt` = `createdAt` WHERE `emailVerifiedAt` IS NULL;

CREATE TABLE `AccountToken` (
  `id` INTEGER NOT NULL AUTO_INCREMENT,
  `userId` INTEGER NOT NULL,
  `tokenHash` CHAR(64) NOT NULL,
  `type` ENUM('EMAIL_VERIFICATION', 'PASSWORD_RESET') NOT NULL,
  `expiresAt` DATETIME(3) NOT NULL,
  `consumedAt` DATETIME(3) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  UNIQUE INDEX `AccountToken_tokenHash_key`(`tokenHash`),
  INDEX `AccountToken_userId_type_expiresAt_idx`(`userId`, `type`, `expiresAt`),
  PRIMARY KEY (`id`),
  CONSTRAINT `AccountToken_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
