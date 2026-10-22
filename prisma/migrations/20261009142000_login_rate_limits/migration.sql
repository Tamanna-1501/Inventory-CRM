CREATE TABLE `LoginAttempt` (
  `bucketKey` CHAR(64) NOT NULL,
  `failedAttempts` INTEGER NOT NULL DEFAULT 0,
  `maxAttempts` INTEGER NOT NULL,
  `windowStartedAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `blockedUntil` DATETIME(3) NULL,
  `updatedAt` DATETIME(3) NOT NULL,
  INDEX `LoginAttempt_updatedAt_idx`(`updatedAt`),
  INDEX `LoginAttempt_blockedUntil_idx`(`blockedUntil`),
  PRIMARY KEY (`bucketKey`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
