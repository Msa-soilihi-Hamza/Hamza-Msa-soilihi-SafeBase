-- MySQL dump 10.13  Distrib 9.1.0, for Win64 (x86_64)
--
-- Host: localhost    Database: safebase
-- ------------------------------------------------------
-- Server version	9.1.0

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!50503 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `_prisma_migrations`
--

DROP TABLE IF EXISTS `_prisma_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `_prisma_migrations` (
  `id` varchar(36) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(64) COLLATE utf8mb4_unicode_ci NOT NULL,
  `finished_at` datetime(3) DEFAULT NULL,
  `migration_name` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `logs` text COLLATE utf8mb4_unicode_ci,
  `rolled_back_at` datetime(3) DEFAULT NULL,
  `started_at` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `applied_steps_count` int unsigned NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('ecb21270-b694-4282-80ff-fffe2c8d86c1','3c5c3da31e9a080aed660ffa3c200bb5aa164634212e95cf6adf738be51949aa','2025-09-24 14:19:04.683','20250924141904_init',NULL,NULL,'2025-09-24 14:19:04.540',1),('4da0d0a9-b0f4-4e1c-a0c9-db93629c3bc6','cfd59667e92ad92d84ff3b5af29af29043f295b385706524a803af0f2ad62cbc','2025-09-24 14:42:55.742','20250924144255_add_user_phone_and_backup_features',NULL,NULL,'2025-09-24 14:42:55.456',1);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `backups`
--

DROP TABLE IF EXISTS `backups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `backups` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `version` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `filePath` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `fileSize` bigint NOT NULL,
  `status` enum('PENDING','IN_PROGRESS','COMPLETED','FAILED') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'PENDING',
  `startedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` datetime(3) DEFAULT NULL,
  `errorMessage` text COLLATE utf8mb4_unicode_ci,
  `backupType` enum('MANUAL','SCHEDULED','AUTOMATIC') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'MANUAL',
  `retentionDays` int DEFAULT NULL,
  `databaseId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `checksum` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `compressed` tinyint(1) NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  KEY `backups_databaseId_fkey` (`databaseId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `backups`
--

LOCK TABLES `backups` WRITE;
/*!40000 ALTER TABLE `backups` DISABLE KEYS */;
INSERT INTO `backups` VALUES ('cmfz4sy7u0001eygsh1xxh4d1','v2025-09-25T08-08-50-487Z','C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-08-50-487Z.sql',0,'FAILED','2025-09-25 08:08:50.489',NULL,'Command failed: mysqldump -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-08-50-487Z.sql\"\n\'mysqldump\' n\'est pas reconnu en tant que commande interne\r\nou externe, un programme ex�cutable ou un fichier de commandes.\r\n','MANUAL',NULL,'cmfz4pbce0002eya008qedd0z',NULL,0),('cmfz4u6ec0001eyxs54f5ztvv','v2025-09-25T08-09-47-742Z','C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-09-47-742Z.sql',0,'FAILED','2025-09-25 08:09:47.748',NULL,'Command failed: \"C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe\" -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-09-47-742Z.sql\"\nLe chemin d\'acc�s sp�cifi� est introuvable.\r\n','MANUAL',NULL,'cmfz4pbce0002eya008qedd0z',NULL,0),('cmfz4u96t0005eyxsalqt40hj','v2025-09-25T08-09-51-360Z','C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-09-51-360Z.sql',0,'FAILED','2025-09-25 08:09:51.365',NULL,'Command failed: \"C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe\" -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-09-51-360Z.sql\"\nLe chemin d\'acc�s sp�cifi� est introuvable.\r\n','MANUAL',NULL,'cmfz4pbce0002eya008qedd0z',NULL,0),('cmfz4un2e0001eygs4i1magmb','v2025-09-25T08-10-09-339Z','C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-10-09-339Z.sql',0,'FAILED','2025-09-25 08:10:09.350',NULL,'Command failed: \"C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe\" -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-10-09-339Z.sql\"\nLe chemin d\'acc�s sp�cifi� est introuvable.\r\n','MANUAL',NULL,'cmfz4pbce0002eya008qedd0z',NULL,0),('cmfz4unm80005eygscvp8thiv','v2025-09-25T08-10-10-054Z','C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-10-10-054Z.sql',0,'FAILED','2025-09-25 08:10:10.064',NULL,'Command failed: \"C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe\" -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-10-10-054Z.sql\"\nLe chemin d\'acc�s sp�cifi� est introuvable.\r\n','MANUAL',NULL,'cmfz4pbce0002eya008qedd0z',NULL,0),('cmfz4unti0009eygsdbr5latp','v2025-09-25T08-10-10-317Z','C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-10-10-317Z.sql',0,'FAILED','2025-09-25 08:10:10.326',NULL,'Command failed: \"C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe\" -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-10-10-317Z.sql\"\nLe chemin d\'acc�s sp�cifi� est introuvable.\r\n','MANUAL',NULL,'cmfz4pbce0002eya008qedd0z',NULL,0),('cmfz4wwzd0001eyk4hk0arr6l','v2025-09-25T08-11-55-509Z','C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-11-55-509Z.sql',15639,'COMPLETED','2025-09-25 08:11:55.513','2025-09-25 08:11:56.008',NULL,'MANUAL',NULL,'cmfz4pbce0002eya008qedd0z','76033d4a691fd227fd3bd6637b8d8689b915bae96584be39b8ca3ec09296e47f',0),('cmfz4xwem0001eyjw608xj92g','v2025-09-25T08-12-41-419Z','C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-12-41-419Z.sql',0,'IN_PROGRESS','2025-09-25 08:12:41.422',NULL,NULL,'MANUAL',NULL,'cmfz4pbce0002eya008qedd0z',NULL,0);
/*!40000 ALTER TABLE `backups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `databases`
--

DROP TABLE IF EXISTS `databases`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `databases` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` enum('MYSQL','POSTGRESQL','MONGODB') COLLATE utf8mb4_unicode_ci NOT NULL,
  `host` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `port` int NOT NULL,
  `username` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `databaseName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `databases_userId_fkey` (`userId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `databases`
--

LOCK TABLES `databases` WRITE;
/*!40000 ALTER TABLE `databases` DISABLE KEYS */;
INSERT INTO `databases` VALUES ('cmfz4pbce0002eya008qedd0z','SafeBase Test DB','MYSQL','localhost',3308,'root','','safebase','Base de données de test pour SafeBase',1,'2025-09-25 08:06:00.879','2025-09-25 08:06:00.879','cmfz4pbc10000eya0wz5nbn1d'),('cmfz4pbcj0004eya0qovzpypc','PostgreSQL Test','POSTGRESQL','localhost',5432,'postgres','postgres','testdb','Base PostgreSQL pour tests',1,'2025-09-25 08:06:00.883','2025-09-25 08:06:00.883','cmfz4pbc10000eya0wz5nbn1d');
/*!40000 ALTER TABLE `databases` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `logs`
--

DROP TABLE IF EXISTS `logs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `logs` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `level` enum('INFO','WARNING','ERROR','CRITICAL') COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `action` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `metadata` json DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `userId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `databaseId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `logs_level_idx` (`level`),
  KEY `logs_createdAt_idx` (`createdAt`),
  KEY `logs_userId_fkey` (`userId`),
  KEY `logs_databaseId_fkey` (`databaseId`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `logs`
--

LOCK TABLES `logs` WRITE;
/*!40000 ALTER TABLE `logs` DISABLE KEYS */;
INSERT INTO `logs` VALUES ('cmfz4pbco0006eya07163ezup','INFO','Données de test initialisées','SEED_TEST_DATA','{\"users\": 1, \"databases\": 2}','2025-09-25 08:06:00.888','cmfz4pbc10000eya0wz5nbn1d',NULL),('cmfz4sy9z0003eygsq7xrnd3u','ERROR','�chec de la sauvegarde: Command failed: mysqldump -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-08-50-487Z.sql\"\n\'mysqldump\' n\'est pas reconnu en tant que commande interne\r\nou externe, un programme ex�cutable ou un fichier de commandes.\r\n','CREATE_BACKUP_FAILED','{\"backupId\": \"cmfz4sy7u0001eygsh1xxh4d1\", \"database\": \"SafeBase Test DB\"}','2025-09-25 08:08:50.568',NULL,'cmfz4pbce0002eya008qedd0z'),('cmfz4u6fp0003eyxsst2p4yqw','ERROR','�chec de la sauvegarde: Command failed: \"C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe\" -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-09-47-742Z.sql\"\nLe chemin d\'acc�s sp�cifi� est introuvable.\r\n','CREATE_BACKUP_FAILED','{\"backupId\": \"cmfz4u6ec0001eyxs54f5ztvv\", \"database\": \"SafeBase Test DB\"}','2025-09-25 08:09:47.797',NULL,'cmfz4pbce0002eya008qedd0z'),('cmfz4u98h0007eyxs649644vd','ERROR','�chec de la sauvegarde: Command failed: \"C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe\" -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-09-51-360Z.sql\"\nLe chemin d\'acc�s sp�cifi� est introuvable.\r\n','CREATE_BACKUP_FAILED','{\"backupId\": \"cmfz4u96t0005eyxsalqt40hj\", \"database\": \"SafeBase Test DB\"}','2025-09-25 08:09:51.424',NULL,'cmfz4pbce0002eya008qedd0z'),('cmfz4un3m0003eygsqpiwieai','ERROR','�chec de la sauvegarde: Command failed: \"C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe\" -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-10-09-339Z.sql\"\nLe chemin d\'acc�s sp�cifi� est introuvable.\r\n','CREATE_BACKUP_FAILED','{\"backupId\": \"cmfz4un2e0001eygs4i1magmb\", \"database\": \"SafeBase Test DB\"}','2025-09-25 08:10:09.395',NULL,'cmfz4pbce0002eya008qedd0z'),('cmfz4unnb0007eygsplymfifz','ERROR','�chec de la sauvegarde: Command failed: \"C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe\" -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-10-10-054Z.sql\"\nLe chemin d\'acc�s sp�cifi� est introuvable.\r\n','CREATE_BACKUP_FAILED','{\"backupId\": \"cmfz4unm80005eygscvp8thiv\", \"database\": \"SafeBase Test DB\"}','2025-09-25 08:10:10.103',NULL,'cmfz4pbce0002eya008qedd0z'),('cmfz4unul000beygs1lvm1ypi','ERROR','�chec de la sauvegarde: Command failed: \"C:\\wamp64\\bin\\mysql\\mysql8.0.31\\bin\\mysqldump.exe\" -h localhost -P 3308 -u root  safebase > \"C:\\wamp64\\www\\Hamza-Msa-soilihi-SafeBase\\backend\\backups\\SafeBase Test DB_v2025-09-25T08-10-10-317Z.sql\"\nLe chemin d\'acc�s sp�cifi� est introuvable.\r\n','CREATE_BACKUP_FAILED','{\"backupId\": \"cmfz4unti0009eygsdbr5latp\", \"database\": \"SafeBase Test DB\"}','2025-09-25 08:10:10.365',NULL,'cmfz4pbce0002eya008qedd0z'),('cmfz4wxdc0003eyk4fu3nn0zp','INFO','Sauvegarde cr��e avec succ�s: v2025-09-25T08-11-55-509Z','CREATE_BACKUP','{\"backupId\": \"cmfz4wwzd0001eyk4hk0arr6l\", \"database\": \"SafeBase Test DB\"}','2025-09-25 08:11:56.016',NULL,'cmfz4pbce0002eya008qedd0z');
/*!40000 ALTER TABLE `logs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `users` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `role` enum('ADMIN','USER') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'USER',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_email_key` (`email`)
) ENGINE=MyISAM DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES ('cmfz4pbc10000eya0wz5nbn1d','test@safebase.com','password123','Test User','ADMIN','2025-09-25 08:06:00.853','2025-09-25 08:06:00.853',1,'+33123456789');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-09-25 10:12:41
