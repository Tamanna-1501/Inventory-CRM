-- AlterTable
ALTER TABLE `user` MODIFY `role` ENUM('owner', 'admin', 'manager', 'staff') NOT NULL DEFAULT 'staff';
