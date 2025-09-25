-- DropIndex
DROP INDEX `backups_databaseId_fkey` ON `backups`;

-- DropIndex
DROP INDEX `databases_userId_fkey` ON `databases`;

-- DropIndex
DROP INDEX `logs_databaseId_fkey` ON `logs`;

-- DropIndex
DROP INDEX `logs_userId_fkey` ON `logs`;

-- AlterTable
ALTER TABLE `backups` ADD COLUMN `checksum` VARCHAR(191) NULL,
    ADD COLUMN `compressed` BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE `users` ADD COLUMN `isActive` BOOLEAN NOT NULL DEFAULT true,
    ADD COLUMN `phone` VARCHAR(191) NULL;

-- AddForeignKey
ALTER TABLE `databases` ADD CONSTRAINT `databases_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `backups` ADD CONSTRAINT `backups_databaseId_fkey` FOREIGN KEY (`databaseId`) REFERENCES `databases`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `logs` ADD CONSTRAINT `logs_databaseId_fkey` FOREIGN KEY (`databaseId`) REFERENCES `databases`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
