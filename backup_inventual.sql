-- MySQL dump 10.13  Distrib 8.0.46, for Win64 (x86_64)
--
-- Host: localhost    Database: inventual_db
-- ------------------------------------------------------
-- Server version	8.0.46

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
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `_prisma_migrations`
--

LOCK TABLES `_prisma_migrations` WRITE;
/*!40000 ALTER TABLE `_prisma_migrations` DISABLE KEYS */;
INSERT INTO `_prisma_migrations` VALUES ('0519c557-c039-4c95-8774-65f7f9a47c44','b8a77990b24b91b728438b2f1141725e3419b1e6270401548873d5208f7b410b','2026-10-07 05:36:15.801','20260921072405_add_brand_unit_adjustment','',NULL,'2026-10-07 05:36:15.801',0),('0b0804cf-c5eb-40cb-9ff6-d688ea742c1b','a96a2da308f3f5c29ca21583ee45563e54ec4a9f25945e8a3288236d61cce419','2026-10-07 05:36:35.069','20260926045630_add_user_profile_fields','',NULL,'2026-10-07 05:36:35.069',0),('210be993-abe4-45a6-a517-7328608f9597','75541a71b950a500dfffd371e2cad7eda4d8756c8fc7fdc49c885663f6d79f1a','2026-10-07 05:35:56.155','20260919052035_add_all_modules','',NULL,'2026-10-07 05:35:56.155',0),('2bdfacd5-0d6f-4619-84fb-e44604f5e403','dc5b3cb0e067118d559f3bf1e5a402a9a865db55ab743800511187c216ad895a','2026-10-07 05:36:05.892','20260919101150_add_purchase_return_reference','',NULL,'2026-10-07 05:36:05.892',0),('57fd6fc5-0728-496b-95c2-27fd41e9482f','b6ce33e3b49ef834ff5fd2f03351d4b2c46eca2786dfdb7e28d463fe490cc903','2026-10-07 05:35:52.721','20260917111951_add_owner_role','',NULL,'2026-10-07 05:35:52.721',0),('6e407f79-7574-4d0a-9390-3d0bef251f45','25eec8adc2775f7ce49036b01b50efcdfca4fb2200cfbe97a61a5434e0ec8564','2026-10-07 07:15:07.558','20261007120000_add_product_promo_batch',NULL,NULL,'2026-10-07 07:15:06.138',1),('771ecfec-a5f3-4f5d-819a-44202b3c38b7','0edd1eae5202cf35f2b6724e220b39e29bf0358b34e8d8645847bd7f06c54779','2026-10-07 05:36:28.660','20260925050242_add_payment_status','',NULL,'2026-10-07 05:36:28.660',0),('77b979e8-bf8f-4f89-b8ff-5d3c98f183bd','c4d1ab436de7dc1e9d65fcbc684a15dc8a984d0d40ba628e9e4d32dfd008df87','2026-10-07 05:36:38.541','20260928070015_extend_transfer_fields','',NULL,'2026-10-07 05:36:38.541',0),('8513bf97-6f30-4b91-9fc4-0bb66ad9fb8c','8b65dd10de19ad0945481469781c2c469ab89baa1f6c8f9acb3b8d848d330ed8','2026-10-07 05:36:09.109','20260919105911_update_sale_full_fields','',NULL,'2026-10-07 05:36:09.109',0),('8876ff07-90fe-498b-b7ea-f0a72748546a','a475b5d963e0789e7c4faa97aab61092fc069037692fc6cbd42809fecd7a70a5','2026-10-07 05:35:59.320','20260919071255_add_warehouse_phone_email','',NULL,'2026-10-07 05:35:59.320',0),('8dbde566-a2b8-4fb4-b641-0a4d01ae5220','4451abda14c758420c05da5da98c9fd8544f033744c9d7fdd1b88e1a0df4d9d5','2026-10-07 05:35:48.697','20260917051133_init','',NULL,'2026-10-07 05:35:48.697',0),('aa33e3bc-c23b-4e26-b0ca-e9fb020cbed9','983dc67a40218a470712fd339f83a33856abcd3d01fb302362c75b5de45d52a8','2026-10-07 05:36:31.807','20260925061425_convert_role_to_table','',NULL,'2026-10-07 05:36:31.807',0),('b0a1766c-1a42-4db7-ac6c-495ca2382a33','652e740c7a411b7caad283babc21c73cace913ce246ed8544b1da8c0c4a5a24e','2026-10-07 05:36:12.550','20260921052109_add_sale_returns','',NULL,'2026-10-07 05:36:12.550',0),('b74b456c-403a-432f-8e73-2dd663ddfa98','f645d653cbcce2981f43acb0fcad2996d0907dc0027259773c9cb2ae0066a267','2026-10-07 05:36:41.627','20260929112909_add_date_of_join','',NULL,'2026-10-07 05:36:41.627',0),('de4350b8-f103-4cf1-ae65-392fe5bb0134','9d2eb415fba8e0bdb9e5ef91c899bfb20ad1f75477ee8d35797a681fe4a3fde8','2026-10-07 05:36:19.127','20260922054139_add_category_hierarchy','',NULL,'2026-10-07 05:36:19.127',0),('e69b997d-b813-42d7-8328-cd07fb486fa6','66853701d811e63ebd2044ae8972ea05e875e320a9b44e471868587a20ac6f32','2026-10-07 05:36:22.458','20260924052248_add_expense_payments','',NULL,'2026-10-07 05:36:22.458',0),('e8f9770a-2625-4053-ba38-c0b940336a78','7d72c646b63a961ef2f8cf4393bdb6e9b0317fe0b942c2617b219b7300d9cb97','2026-10-07 05:36:02.596','20260919083743_add_purchase_payments','',NULL,'2026-10-07 05:36:02.596',0),('f1ffe7c2-9365-44bd-b191-42a2e1ba25e1','3c14abd917b51b69e5778fa9679eb1295a58b3458513f0bb44bada2c8d76e2b6','2026-10-07 05:36:25.591','20260924103020_update_expense_fields','',NULL,'2026-10-07 05:36:25.591',0);
/*!40000 ALTER TABLE `_prisma_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adjustment`
--

DROP TABLE IF EXISTS `adjustment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adjustment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouseId` int NOT NULL,
  `remarks` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Adjustment_reference_key` (`reference`),
  KEY `Adjustment_warehouseId_fkey` (`warehouseId`),
  CONSTRAINT `Adjustment_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adjustment`
--

LOCK TABLES `adjustment` WRITE;
/*!40000 ALTER TABLE `adjustment` DISABLE KEYS */;
INSERT INTO `adjustment` VALUES (1,NULL,1,'','2026-10-01 09:29:23.460');
/*!40000 ALTER TABLE `adjustment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `adjustmentitem`
--

DROP TABLE IF EXISTS `adjustmentitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `adjustmentitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `adjustmentId` int NOT NULL,
  `productId` int NOT NULL,
  `batchNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `type` enum('addition','subtraction') COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`),
  KEY `AdjustmentItem_adjustmentId_fkey` (`adjustmentId`),
  KEY `AdjustmentItem_productId_fkey` (`productId`),
  CONSTRAINT `AdjustmentItem_adjustmentId_fkey` FOREIGN KEY (`adjustmentId`) REFERENCES `adjustment` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `AdjustmentItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `adjustmentitem`
--

LOCK TABLES `adjustmentitem` WRITE;
/*!40000 ALTER TABLE `adjustmentitem` DISABLE KEYS */;
INSERT INTO `adjustmentitem` VALUES (1,1,6,NULL,5,'addition');
/*!40000 ALTER TABLE `adjustmentitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `biller`
--

DROP TABLE IF EXISTS `biller`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `biller` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `dateOfJoin` datetime(3) DEFAULT CURRENT_TIMESTAMP(3),
  `nidPassport` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `warehouseId` int DEFAULT NULL,
  `zipCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `billerCode` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Biller_billerCode_key` (`billerCode`),
  KEY `Biller_warehouseId_fkey` (`warehouseId`),
  CONSTRAINT `Biller_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouse` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `biller`
--

LOCK TABLES `biller` WRITE;
/*!40000 ALTER TABLE `biller` DISABLE KEYS */;
INSERT INTO `biller` VALUES (1,'preet','8989898989','preet@gmail.com','noida','2026-09-30 00:00:00.000','909890989098',1,'250001','BTR-90879'),(2,'Jyoti','7890987890','jyoti@gmail.com','mithapur, delhi','2026-10-01 00:00:00.000','8908908908',3,'250001','tre-908'),(3,'kriti','7897897890','kriti@gmail.com','new york','2026-10-02 00:00:00.000','78901234567',1,'1234567','TRE-098'),(4,'rajeev','9890980098',NULL,NULL,'2026-10-03 09:31:58.213',NULL,NULL,NULL,NULL);
/*!40000 ALTER TABLE `biller` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `brand`
--

DROP TABLE IF EXISTS `brand`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `brand` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `brand`
--

LOCK TABLES `brand` WRITE;
/*!40000 ALTER TABLE `brand` DISABLE KEYS */;
INSERT INTO `brand` VALUES (3,'Iphone',NULL),(4,'Nike',NULL),(5,'Dell',NULL),(6,'samsung',NULL),(7,'sony',NULL);
/*!40000 ALTER TABLE `brand` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `category`
--

DROP TABLE IF EXISTS `category`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `category` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `image` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `parentId` int DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `Category_parentId_fkey` (`parentId`),
  CONSTRAINT `Category_parentId_fkey` FOREIGN KEY (`parentId`) REFERENCES `category` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `category`
--

LOCK TABLES `category` WRITE;
/*!40000 ALTER TABLE `category` DISABLE KEYS */;
INSERT INTO `category` VALUES (1,'clothes',NULL,NULL),(2,'dress',NULL,1),(3,'Electronics',NULL,NULL),(4,'smart phone',NULL,3),(5,'Fruits',NULL,NULL),(6,'apple',NULL,5);
/*!40000 ALTER TABLE `category` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `company`
--

DROP TABLE IF EXISTS `company`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `company` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `domain` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Company_domain_key` (`domain`),
  KEY `Company_status_idx` (`status`),
  KEY `Company_createdAt_idx` (`createdAt`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `company`
--

LOCK TABLES `company` WRITE;
/*!40000 ALTER TABLE `company` DISABLE KEYS */;
/*!40000 ALTER TABLE `company` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `customer`
--

DROP TABLE IF EXISTS `customer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `customer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `customer`
--

LOCK TABLES `customer` WRITE;
/*!40000 ALTER TABLE `customer` DISABLE KEYS */;
INSERT INTO `customer` VALUES (1,'Raj','7890987890','Raj@gmail.com',''),(2,'sonal','9090909090','sonal@gmail.com','');
/*!40000 ALTER TABLE `customer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expense`
--

DROP TABLE IF EXISTS `expense`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expense` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `voucherNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `categoryId` int NOT NULL,
  `warehouseId` int DEFAULT NULL,
  `expenseType` enum('direct','indirect') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'direct',
  `amount` decimal(10,2) NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Expense_reference_key` (`reference`),
  KEY `Expense_categoryId_fkey` (`categoryId`),
  KEY `Expense_warehouseId_fkey` (`warehouseId`),
  CONSTRAINT `Expense_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `expensecategory` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Expense_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouse` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expense`
--

LOCK TABLES `expense` WRITE;
/*!40000 ALTER TABLE `expense` DISABLE KEYS */;
INSERT INTO `expense` VALUES (4,'EXP-000001','003',1,2,'direct',500.00,NULL,'2026-10-07 00:00:00.000');
/*!40000 ALTER TABLE `expense` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expensecategory`
--

DROP TABLE IF EXISTS `expensecategory`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expensecategory` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `subCategory` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expensecategory`
--

LOCK TABLES `expensecategory` WRITE;
/*!40000 ALTER TABLE `expensecategory` DISABLE KEYS */;
INSERT INTO `expensecategory` VALUES (1,'charges','Bill'),(2,'tax','Cloth'),(3,'Rent','Home');
/*!40000 ALTER TABLE `expensecategory` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `expensepayment`
--

DROP TABLE IF EXISTS `expensepayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `expensepayment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `expenseId` int NOT NULL,
  `status` enum('pending','completed') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `amountPaid` decimal(10,2) NOT NULL,
  `paymentMethod` enum('cash','card','upi','bank_transfer','credit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `cardLast4` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paidAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `ExpensePayment_expenseId_fkey` (`expenseId`),
  CONSTRAINT `ExpensePayment_expenseId_fkey` FOREIGN KEY (`expenseId`) REFERENCES `expense` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `expensepayment`
--

LOCK TABLES `expensepayment` WRITE;
/*!40000 ALTER TABLE `expensepayment` DISABLE KEYS */;
/*!40000 ALTER TABLE `expensepayment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `invoice`
--

DROP TABLE IF EXISTS `invoice`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `invoice` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoiceNumber` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `saleId` int NOT NULL,
  `subtotal` decimal(10,2) NOT NULL,
  `taxAmount` decimal(10,2) NOT NULL,
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  `grandTotal` decimal(10,2) NOT NULL,
  `paymentStatus` enum('unpaid','partial','paid') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'unpaid',
  `issuedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Invoice_invoiceNumber_key` (`invoiceNumber`),
  UNIQUE KEY `Invoice_saleId_key` (`saleId`),
  CONSTRAINT `Invoice_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `invoice`
--

LOCK TABLES `invoice` WRITE;
/*!40000 ALTER TABLE `invoice` DISABLE KEYS */;
INSERT INTO `invoice` VALUES (1,'INV-2026-001',1,5000.00,0.00,0.00,5050.00,'paid','2026-09-30 06:57:43.424'),(2,'INV-2026-002',2,2000000.00,0.00,0.00,2000050.00,'paid','2026-10-01 05:03:21.536'),(3,'INV-2026-003',3,2000.00,0.00,0.00,2000.00,'paid','2026-10-01 08:48:30.107'),(4,'INV-2026-004',4,2000.00,0.00,0.00,2020.00,'paid','2026-10-01 09:30:10.130'),(5,'INV-2026-005',5,2000000.00,0.00,0.00,2000000.00,'paid','2026-10-07 09:04:51.088'),(6,'INV-2026-006',6,400000.00,0.00,0.00,400000.00,'paid','2026-10-07 09:05:33.399'),(7,'INV-2026-007',7,100500.00,0.00,0.00,100500.00,'paid','2026-10-07 09:10:51.280'),(9,'INV-2026-008',9,2000.00,0.00,0.00,2050.00,'paid','2026-10-07 09:36:56.655'),(10,'INV-2026-009',10,2000.00,0.00,0.00,2000.00,'unpaid','2026-10-08 04:59:17.818');
/*!40000 ALTER TABLE `invoice` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `message`
--

DROP TABLE IF EXISTS `message`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `message` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `senderId` int NOT NULL,
  `recipientId` int NOT NULL,
  `subject` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `body` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `isStarred` tinyint(1) NOT NULL DEFAULT '0',
  `isDraft` tinyint(1) NOT NULL DEFAULT '0',
  `senderDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `recipientDeleted` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Message_recipientId_isRead_idx` (`recipientId`,`isRead`),
  KEY `Message_senderId_fkey` (`senderId`),
  CONSTRAINT `Message_recipientId_fkey` FOREIGN KEY (`recipientId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Message_senderId_fkey` FOREIGN KEY (`senderId`) REFERENCES `user` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `message`
--

LOCK TABLES `message` WRITE;
/*!40000 ALTER TABLE `message` DISABLE KEYS */;
INSERT INTO `message` VALUES ('cmuuzgnjq0001waqzmydol7kt',10,16,'test','hii',1,0,0,0,0,'2026-10-05 08:23:49.030'),('cmuv0cdkk0005waqzzxj9f9gi',10,11,'tested','hii',1,0,0,0,0,'2026-10-05 08:48:29.099'),('cmuv0dh9i0009waqzuc1uh7z0',11,10,'tested','hii',0,0,1,0,0,'2026-10-05 08:49:20.550');
/*!40000 ALTER TABLE `message` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notification`
--

DROP TABLE IF EXISTS `notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `notification` (
  `id` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `userId` int NOT NULL,
  `title` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `message` text COLLATE utf8mb4_unicode_ci NOT NULL,
  `type` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `link` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `isRead` tinyint(1) NOT NULL DEFAULT '0',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Notification_userId_isRead_idx` (`userId`,`isRead`),
  CONSTRAINT `Notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user` (`id`) ON DELETE CASCADE ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notification`
--

LOCK TABLES `notification` WRITE;
/*!40000 ALTER TABLE `notification` DISABLE KEYS */;
INSERT INTO `notification` VALUES ('cmuuzgnnh0003waqz0g7l4bci',16,'Naya message','Tamanna: test','MESSAGE','/email',0,'2026-10-05 08:23:49.181'),('cmuv0cdld0007waqz84x0j3np',11,'Naya message','Tamanna: tested','MESSAGE','/email',0,'2026-10-05 08:48:29.135');
/*!40000 ALTER TABLE `notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payment`
--

DROP TABLE IF EXISTS `payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `payment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `invoiceId` int NOT NULL,
  `amountPaid` decimal(10,2) NOT NULL,
  `paymentMethod` enum('cash','card','upi','bank_transfer','credit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `referenceNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paidAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Payment_invoiceId_fkey` (`invoiceId`),
  CONSTRAINT `Payment_invoiceId_fkey` FOREIGN KEY (`invoiceId`) REFERENCES `invoice` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payment`
--

LOCK TABLES `payment` WRITE;
/*!40000 ALTER TABLE `payment` DISABLE KEYS */;
INSERT INTO `payment` VALUES (1,1,5050.00,'cash',NULL,'2026-09-30 06:57:43.424'),(2,2,2000050.00,'upi',NULL,'2026-10-01 05:03:21.536'),(3,3,2000.00,'cash',NULL,'2026-10-01 08:48:30.107'),(4,4,2020.00,'upi',NULL,'2026-10-01 09:30:10.130'),(5,5,2000000.00,'cash',NULL,'2026-10-07 09:04:51.106'),(6,6,400000.00,'cash',NULL,'2026-10-07 09:05:33.410'),(7,7,100500.00,'cash',NULL,'2026-10-07 09:10:51.293'),(9,9,35.00,'cash',NULL,'2026-10-07 09:36:56.665'),(10,9,2000.00,'cash',NULL,'2026-10-07 09:37:16.855'),(11,9,15.00,'cash',NULL,'2026-10-07 09:37:23.649');
/*!40000 ALTER TABLE `payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `plan`
--

DROP TABLE IF EXISTS `plan`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `plan` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(12,2) NOT NULL,
  `billingCycle` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'monthly',
  `maxUsers` int NOT NULL DEFAULT '5',
  `maxWarehouses` int NOT NULL DEFAULT '1',
  `maxProducts` int NOT NULL DEFAULT '100',
  `features` json DEFAULT NULL,
  `isActive` tinyint(1) NOT NULL DEFAULT '1',
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Plan_name_key` (`name`),
  KEY `Plan_billingCycle_isActive_idx` (`billingCycle`,`isActive`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `plan`
--

LOCK TABLES `plan` WRITE;
/*!40000 ALTER TABLE `plan` DISABLE KEYS */;
INSERT INTO `plan` VALUES (1,'Free',0.00,'monthly',2,1,100,'[\"Dashboard\", \"Products\", \"Basic Reports\"]',1,'2026-10-05 11:18:22.620','2026-10-05 11:18:22.620'),(2,'Starter',999.00,'monthly',10,2,1000,'[\"Dashboard\", \"Products\", \"POS\", \"Reports\"]',1,'2026-10-05 11:18:22.723','2026-10-05 11:18:22.723'),(3,'Pro',2499.00,'monthly',30,10,10000,'[\"All Starter\", \"Multi Warehouse\", \"Transfers\", \"Advanced Reports\"]',1,'2026-10-05 11:18:22.737','2026-10-05 11:18:22.737'),(4,'Enterprise',6999.00,'monthly',100,50,100000,'[\"All Pro\", \"SaaS Controls\", \"Priority Support\"]',1,'2026-10-05 11:18:22.749','2026-10-05 11:18:22.749');
/*!40000 ALTER TABLE `plan` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `product`
--

DROP TABLE IF EXISTS `product`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `product` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `sku` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `costPrice` decimal(10,2) NOT NULL,
  `categoryId` int NOT NULL,
  `brandId` int DEFAULT NULL,
  `unitId` int DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `promotionalPrice` decimal(10,2) DEFAULT NULL,
  `batchNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Product_sku_key` (`sku`),
  KEY `Product_categoryId_fkey` (`categoryId`),
  KEY `Product_brandId_fkey` (`brandId`),
  KEY `Product_unitId_fkey` (`unitId`),
  CONSTRAINT `Product_brandId_fkey` FOREIGN KEY (`brandId`) REFERENCES `brand` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Product_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Product_unitId_fkey` FOREIGN KEY (`unitId`) REFERENCES `unit` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `product`
--

LOCK TABLES `product` WRITE;
/*!40000 ALTER TABLE `product` DISABLE KEYS */;
INSERT INTO `product` VALUES (2,'Floral dress','123',200.00,200.00,2,NULL,1,'2026-09-30 06:47:04.187',NULL,NULL),(3,'jeans','12',500.00,500.00,2,NULL,1,'2026-09-30 06:57:00.698',NULL,NULL),(5,'Real me','1234',100000.00,10000.00,4,NULL,NULL,'2026-10-01 05:02:25.710',NULL,NULL),(6,'top','007',400.00,400.00,2,NULL,NULL,'2026-10-01 08:44:49.006',NULL,NULL),(7,'I Phone 17','12345',500000.00,700000.00,4,3,1,'2026-10-02 08:47:02.960',400000.00,'B-909'),(8,'HP Laptop','009',500000.00,700000.00,3,5,1,'2026-10-07 08:36:06.324',400000.00,'B-101');
/*!40000 ALTER TABLE `product` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchase`
--

DROP TABLE IF EXISTS `purchase`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchase` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `supplierId` int NOT NULL,
  `warehouseId` int NOT NULL,
  `shippingCharge` decimal(10,2) NOT NULL DEFAULT '0.00',
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `totalAmount` decimal(10,2) NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Purchase_reference_key` (`reference`),
  KEY `Purchase_supplierId_fkey` (`supplierId`),
  KEY `Purchase_warehouseId_fkey` (`warehouseId`),
  CONSTRAINT `Purchase_supplierId_fkey` FOREIGN KEY (`supplierId`) REFERENCES `supplier` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Purchase_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchase`
--

LOCK TABLES `purchase` WRITE;
/*!40000 ALTER TABLE `purchase` DISABLE KEYS */;
INSERT INTO `purchase` VALUES (6,'P-000001',2,1,0.00,'','pending',7000000.00,'2026-10-08 05:21:53.413'),(7,'P-000002',2,3,0.00,'','pending',2500.00,'2026-10-08 05:22:17.644'),(8,'P-000003',1,4,0.00,'','pending',3500000.00,'2026-10-08 05:22:36.885');
/*!40000 ALTER TABLE `purchase` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchaseitem`
--

DROP TABLE IF EXISTS `purchaseitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchaseitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchaseId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PurchaseItem_purchaseId_fkey` (`purchaseId`),
  KEY `PurchaseItem_productId_fkey` (`productId`),
  CONSTRAINT `PurchaseItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PurchaseItem_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchase` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchaseitem`
--

LOCK TABLES `purchaseitem` WRITE;
/*!40000 ALTER TABLE `purchaseitem` DISABLE KEYS */;
INSERT INTO `purchaseitem` VALUES (5,6,8,10,700000.00),(6,7,3,5,500.00),(7,8,7,5,700000.00);
/*!40000 ALTER TABLE `purchaseitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchasepayment`
--

DROP TABLE IF EXISTS `purchasepayment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchasepayment` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchaseId` int NOT NULL,
  `amountPaid` decimal(10,2) NOT NULL,
  `paymentMethod` enum('cash','card','upi','bank_transfer','credit') COLLATE utf8mb4_unicode_ci NOT NULL,
  `paidAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `PurchasePayment_purchaseId_fkey` (`purchaseId`),
  CONSTRAINT `PurchasePayment_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchase` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchasepayment`
--

LOCK TABLES `purchasepayment` WRITE;
/*!40000 ALTER TABLE `purchasepayment` DISABLE KEYS */;
INSERT INTO `purchasepayment` VALUES (4,7,2500.00,'card','2026-10-08 05:23:29.641');
/*!40000 ALTER TABLE `purchasepayment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchasereturn`
--

DROP TABLE IF EXISTS `purchasereturn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchasereturn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `purchaseId` int NOT NULL,
  `warehouseId` int NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `PurchaseReturn_reference_key` (`reference`),
  KEY `PurchaseReturn_purchaseId_fkey` (`purchaseId`),
  KEY `PurchaseReturn_warehouseId_fkey` (`warehouseId`),
  CONSTRAINT `PurchaseReturn_purchaseId_fkey` FOREIGN KEY (`purchaseId`) REFERENCES `purchase` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PurchaseReturn_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchasereturn`
--

LOCK TABLES `purchasereturn` WRITE;
/*!40000 ALTER TABLE `purchasereturn` DISABLE KEYS */;
INSERT INTO `purchasereturn` VALUES (3,'PR-000001',8,1,3500000.00,'tested','2026-10-08 05:23:56.636');
/*!40000 ALTER TABLE `purchasereturn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `purchasereturnitem`
--

DROP TABLE IF EXISTS `purchasereturnitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `purchasereturnitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `purchaseReturnId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `PurchaseReturnItem_purchaseReturnId_fkey` (`purchaseReturnId`),
  KEY `PurchaseReturnItem_productId_fkey` (`productId`),
  CONSTRAINT `PurchaseReturnItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `PurchaseReturnItem_purchaseReturnId_fkey` FOREIGN KEY (`purchaseReturnId`) REFERENCES `purchasereturn` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `purchasereturnitem`
--

LOCK TABLES `purchasereturnitem` WRITE;
/*!40000 ALTER TABLE `purchasereturnitem` DISABLE KEYS */;
INSERT INTO `purchasereturnitem` VALUES (3,3,8,5,700000.00);
/*!40000 ALTER TABLE `purchasereturnitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `role`
--

DROP TABLE IF EXISTS `role`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `role` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `description` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `permissions` json DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `Role_name_key` (`name`)
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `role`
--

LOCK TABLES `role` WRITE;
/*!40000 ALTER TABLE `role` DISABLE KEYS */;
INSERT INTO `role` VALUES (1,'ADMIN','Full administrative access','{\"wh\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"pos\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"prod\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"unit\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"user\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"brand\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"sales\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"biller\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"barcode\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"exp_cat\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"expense\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Language\": true, \"Send SMS\": true, \"category\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"customer\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"purchase\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"supplier\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Send Mail\": true, \"quotation\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Create SMS\": true, \"Due Report\": true, \"Tax Report\": true, \"adjustment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Create Role\": true, \"Mail Create\": true, \"POS Setting\": true, \"SMS Setting\": true, \"Time & Date\": true, \"User Report\": true, \"exp_invoice\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"exp_payment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"sale_return\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Best Sellers\": true, \"Sales Report\": true, \"Stock Report\": true, \"sale_invoice\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"sale_payment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Biller Report\": true, \"Mail Settings\": true, \"Payment Report\": true, \"System Setting\": true, \"customer_group\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Backup Database\": true, \"Customer Report\": true, \"Discount Report\": true, \"Products Report\": true, \"Purchase Report\": true, \"Shipping Charge\": true, \"Supplier Report\": true, \"purchase_return\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Currency Setting\": true, \"Warehouse Report\": true, \"purchase_invoice\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"purchase_payment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Send Notification\": true, \"Newsletter Setting\": true}'),(2,'MANAGER','Managerial operations','{\"pos\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"prod\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"unit\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"user\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"brand\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"sales\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"biller\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"barcode\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"exp_cat\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"expense\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Language\": true, \"Send SMS\": true, \"category\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"customer\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"purchase\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"supplier\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Send Mail\": true, \"quotation\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Create SMS\": true, \"Due Report\": true, \"Tax Report\": true, \"adjustment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Create Role\": true, \"Mail Create\": true, \"POS Setting\": true, \"SMS Setting\": true, \"Time & Date\": true, \"User Report\": true, \"exp_invoice\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"exp_payment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"sale_return\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Best Sellers\": true, \"Sales Report\": true, \"Stock Report\": true, \"sale_invoice\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"sale_payment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Biller Report\": true, \"Mail Settings\": true, \"Payment Report\": true, \"System Setting\": true, \"customer_group\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Backup Database\": true, \"Customer Report\": true, \"Discount Report\": true, \"Products Report\": true, \"Purchase Report\": true, \"Shipping Charge\": true, \"Supplier Report\": true, \"purchase_return\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Currency Setting\": true, \"Warehouse Report\": true, \"purchase_invoice\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"purchase_payment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"Send Notification\": true, \"Newsletter Setting\": true}'),(3,'SUPERVISOR','Supervisory control','{\"wh\": {\"add\": false, \"edit\": false, \"view\": true, \"delete\": false}, \"pos\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"prod\": {\"add\": false, \"edit\": false, \"view\": true, \"delete\": false}, \"unit\": {\"add\": false, \"edit\": false, \"view\": true, \"delete\": false}, \"user\": {\"add\": false, \"edit\": false, \"view\": false, \"delete\": false}, \"brand\": {\"add\": false, \"edit\": false, \"view\": true, \"delete\": false}, \"sales\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": false}, \"biller\": {\"add\": false, \"edit\": true, \"view\": true, \"delete\": false}, \"barcode\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"exp_cat\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"expense\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"category\": {\"add\": false, \"edit\": false, \"view\": true, \"delete\": false}, \"customer\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": false}, \"purchase\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"supplier\": {\"add\": false, \"edit\": true, \"view\": true, \"delete\": false}, \"quotation\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"Due Report\": true, \"Tax Report\": true, \"adjustment\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"User Report\": true, \"exp_invoice\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"exp_payment\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"sale_return\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"Best Sellers\": true, \"Sales Report\": true, \"Stock Report\": true, \"sale_invoice\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"sale_payment\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"Biller Report\": true, \"Payment Report\": true, \"customer_group\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": false}, \"Customer Report\": true, \"Discount Report\": true, \"Products Report\": true, \"Purchase Report\": true, \"Shipping Charge\": true, \"Supplier Report\": true, \"purchase_return\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"Warehouse Report\": true, \"purchase_invoice\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}, \"purchase_payment\": {\"add\": true, \"edit\": false, \"view\": true, \"delete\": false}}'),(4,'STAFF','General staff activities','{\"pos\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"prod\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"unit\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"brand\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"sales\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"barcode\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"exp_cat\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"expense\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"category\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"purchase\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"quotation\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"adjustment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"exp_invoice\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"exp_payment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"sale_return\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"sale_invoice\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"sale_payment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"purchase_return\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"purchase_invoice\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}, \"purchase_payment\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}}'),(5,'BILLER','Billing and POS operations','{\"biller\": {\"add\": true, \"edit\": true, \"view\": true, \"delete\": true}}'),(6,'Biller A','billing',NULL);
/*!40000 ALTER TABLE `role` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `sale`
--

DROP TABLE IF EXISTS `sale`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `sale` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `customerId` int NOT NULL,
  `warehouseId` int NOT NULL,
  `billerId` int DEFAULT NULL,
  `paymentMethod` enum('cash','card','upi','bank_transfer','credit') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'cash',
  `shippingCharge` decimal(10,2) NOT NULL DEFAULT '0.00',
  `status` enum('pending','completed','cancelled') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `staffRemark` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Sale_reference_key` (`reference`),
  KEY `Sale_customerId_fkey` (`customerId`),
  KEY `Sale_warehouseId_fkey` (`warehouseId`),
  KEY `Sale_billerId_fkey` (`billerId`),
  CONSTRAINT `Sale_billerId_fkey` FOREIGN KEY (`billerId`) REFERENCES `biller` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  CONSTRAINT `Sale_customerId_fkey` FOREIGN KEY (`customerId`) REFERENCES `customer` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Sale_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `sale`
--

LOCK TABLES `sale` WRITE;
/*!40000 ALTER TABLE `sale` DISABLE KEYS */;
INSERT INTO `sale` VALUES (1,'S-000001',1,1,1,'cash',50.00,'pending','','','2026-09-30 06:57:43.424'),(2,'S-000002',2,1,1,'upi',50.00,'pending','','','2026-10-01 05:03:21.536'),(3,'S-000003',1,1,1,'cash',0.00,'pending','','','2026-10-01 08:48:30.107'),(4,'S-000004',1,1,1,'upi',20.00,'completed','','','2026-10-01 09:30:10.130'),(5,'S-000005',1,2,4,'cash',0.00,'pending','','','2026-10-07 09:04:51.005'),(6,'S-000006',1,2,4,'cash',0.00,'pending',NULL,NULL,'2026-10-07 09:05:33.349'),(7,'S-000007',2,1,2,'cash',0.00,'pending',NULL,NULL,'2026-10-07 09:10:51.225'),(9,'S-000008',2,4,2,'cash',50.00,'pending','sales tested with due','','2026-10-07 09:36:56.617'),(10,'S-000009',1,1,4,'cash',0.00,'pending','','','2026-10-08 04:59:17.761');
/*!40000 ALTER TABLE `sale` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `saleitem`
--

DROP TABLE IF EXISTS `saleitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `saleitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `saleId` int NOT NULL,
  `productId` int NOT NULL,
  `batchNo` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `tax` decimal(10,2) NOT NULL DEFAULT '0.00',
  `discount` decimal(10,2) NOT NULL DEFAULT '0.00',
  PRIMARY KEY (`id`),
  KEY `SaleItem_saleId_fkey` (`saleId`),
  KEY `SaleItem_productId_fkey` (`productId`),
  CONSTRAINT `SaleItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SaleItem_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `saleitem`
--

LOCK TABLES `saleitem` WRITE;
/*!40000 ALTER TABLE `saleitem` DISABLE KEYS */;
INSERT INTO `saleitem` VALUES (1,1,3,'1',10,500.00,0.50,20.00),(2,2,5,'3',20,100000.00,2.50,50.00),(3,3,3,'',4,500.00,0.00,0.00),(4,4,6,'2345',5,400.00,0.40,50.00),(5,5,8,'',5,400000.00,0.00,0.00),(6,6,8,NULL,1,400000.00,0.00,0.00),(7,7,5,NULL,1,100000.00,0.00,0.00),(8,7,3,NULL,1,500.00,0.00,0.00),(10,9,6,'005',5,400.00,5.00,20.00),(11,10,6,'003',5,400.00,0.00,0.00);
/*!40000 ALTER TABLE `saleitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salereturn`
--

DROP TABLE IF EXISTS `salereturn`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salereturn` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `saleId` int NOT NULL,
  `warehouseId` int NOT NULL,
  `totalAmount` decimal(10,2) NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `SaleReturn_reference_key` (`reference`),
  KEY `SaleReturn_saleId_fkey` (`saleId`),
  KEY `SaleReturn_warehouseId_fkey` (`warehouseId`),
  CONSTRAINT `SaleReturn_saleId_fkey` FOREIGN KEY (`saleId`) REFERENCES `sale` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SaleReturn_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salereturn`
--

LOCK TABLES `salereturn` WRITE;
/*!40000 ALTER TABLE `salereturn` DISABLE KEYS */;
INSERT INTO `salereturn` VALUES (2,'SR-000001',9,1,2000.00,'tested','2026-10-08 04:55:15.006');
/*!40000 ALTER TABLE `salereturn` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `salereturnitem`
--

DROP TABLE IF EXISTS `salereturnitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `salereturnitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `saleReturnId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL,
  `price` decimal(10,2) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `SaleReturnItem_saleReturnId_fkey` (`saleReturnId`),
  KEY `SaleReturnItem_productId_fkey` (`productId`),
  CONSTRAINT `SaleReturnItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `SaleReturnItem_saleReturnId_fkey` FOREIGN KEY (`saleReturnId`) REFERENCES `salereturn` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `salereturnitem`
--

LOCK TABLES `salereturnitem` WRITE;
/*!40000 ALTER TABLE `salereturnitem` DISABLE KEYS */;
INSERT INTO `salereturnitem` VALUES (2,2,6,5,400.00);
/*!40000 ALTER TABLE `salereturnitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stock`
--

DROP TABLE IF EXISTS `stock`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `stock` (
  `id` int NOT NULL AUTO_INCREMENT,
  `productId` int NOT NULL,
  `warehouseId` int NOT NULL,
  `quantity` int NOT NULL DEFAULT '0',
  PRIMARY KEY (`id`),
  UNIQUE KEY `Stock_productId_warehouseId_key` (`productId`,`warehouseId`),
  KEY `Stock_warehouseId_fkey` (`warehouseId`),
  CONSTRAINT `Stock_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Stock_warehouseId_fkey` FOREIGN KEY (`warehouseId`) REFERENCES `warehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stock`
--

LOCK TABLES `stock` WRITE;
/*!40000 ALTER TABLE `stock` DISABLE KEYS */;
INSERT INTO `stock` VALUES (1,3,1,35),(2,2,1,0),(3,5,1,79),(4,6,4,95),(5,6,1,0),(6,7,2,200),(7,8,2,94),(8,3,3,5),(9,2,2,0),(10,8,1,5),(11,7,4,5);
/*!40000 ALTER TABLE `stock` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscription`
--

DROP TABLE IF EXISTS `subscription`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscription` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyId` int NOT NULL,
  `planId` int NOT NULL,
  `startDate` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `endDate` datetime(3) DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  `paymentMethod` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `Subscription_companyId_status_idx` (`companyId`,`status`),
  KEY `Subscription_endDate_idx` (`endDate`),
  KEY `Subscription_planId_fkey` (`planId`),
  CONSTRAINT `Subscription_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `Subscription_planId_fkey` FOREIGN KEY (`planId`) REFERENCES `plan` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscription`
--

LOCK TABLES `subscription` WRITE;
/*!40000 ALTER TABLE `subscription` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscription` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `subscriptiontransaction`
--

DROP TABLE IF EXISTS `subscriptiontransaction`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `subscriptiontransaction` (
  `id` int NOT NULL AUTO_INCREMENT,
  `companyId` int NOT NULL,
  `subscriptionId` int DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `transactionId` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'paid',
  `invoiceNumber` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `paidAt` datetime(3) DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  KEY `SubscriptionTransaction_companyId_createdAt_idx` (`companyId`,`createdAt`),
  KEY `SubscriptionTransaction_status_idx` (`status`),
  KEY `SubscriptionTransaction_subscriptionId_fkey` (`subscriptionId`),
  CONSTRAINT `SubscriptionTransaction_companyId_fkey` FOREIGN KEY (`companyId`) REFERENCES `company` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `SubscriptionTransaction_subscriptionId_fkey` FOREIGN KEY (`subscriptionId`) REFERENCES `subscription` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `subscriptiontransaction`
--

LOCK TABLES `subscriptiontransaction` WRITE;
/*!40000 ALTER TABLE `subscriptiontransaction` DISABLE KEYS */;
/*!40000 ALTER TABLE `subscriptiontransaction` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `supplier`
--

DROP TABLE IF EXISTS `supplier`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `supplier` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `supplier`
--

LOCK TABLES `supplier` WRITE;
/*!40000 ALTER TABLE `supplier` DISABLE KEYS */;
INSERT INTO `supplier` VALUES (1,'shiv','7600887909','Shiv@gmail.com',''),(2,'shruti','9090909090','shruti@gmail.com','Meerut');
/*!40000 ALTER TABLE `supplier` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transfer`
--

DROP TABLE IF EXISTS `transfer`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transfer` (
  `id` int NOT NULL AUTO_INCREMENT,
  `reference` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `date` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `fromWarehouseId` int NOT NULL,
  `toWarehouseId` int NOT NULL,
  `reason` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `authorizedBy` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `status` enum('pending','completed','rejected') COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'completed',
  `note` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`),
  UNIQUE KEY `Transfer_reference_key` (`reference`),
  KEY `Transfer_fromWarehouseId_fkey` (`fromWarehouseId`),
  KEY `Transfer_toWarehouseId_fkey` (`toWarehouseId`),
  CONSTRAINT `Transfer_fromWarehouseId_fkey` FOREIGN KEY (`fromWarehouseId`) REFERENCES `warehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `Transfer_toWarehouseId_fkey` FOREIGN KEY (`toWarehouseId`) REFERENCES `warehouse` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transfer`
--

LOCK TABLES `transfer` WRITE;
/*!40000 ALTER TABLE `transfer` DISABLE KEYS */;
INSERT INTO `transfer` VALUES (1,'TRF-000001','2026-09-30 00:00:00.000',1,2,'testing',NULL,'pending',NULL,'2026-09-30 06:52:35.572');
/*!40000 ALTER TABLE `transfer` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `transferitem`
--

DROP TABLE IF EXISTS `transferitem`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `transferitem` (
  `id` int NOT NULL AUTO_INCREMENT,
  `transferId` int NOT NULL,
  `productId` int NOT NULL,
  `quantity` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `TransferItem_transferId_fkey` (`transferId`),
  KEY `TransferItem_productId_fkey` (`productId`),
  CONSTRAINT `TransferItem_productId_fkey` FOREIGN KEY (`productId`) REFERENCES `product` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE,
  CONSTRAINT `TransferItem_transferId_fkey` FOREIGN KEY (`transferId`) REFERENCES `transfer` (`id`) ON DELETE RESTRICT ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `transferitem`
--

LOCK TABLES `transferitem` WRITE;
/*!40000 ALTER TABLE `transferitem` DISABLE KEYS */;
INSERT INTO `transferitem` VALUES (1,1,2,10);
/*!40000 ALTER TABLE `transferitem` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `unit`
--

DROP TABLE IF EXISTS `unit`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `unit` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `shortName` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `unit`
--

LOCK TABLES `unit` WRITE;
/*!40000 ALTER TABLE `unit` DISABLE KEYS */;
INSERT INTO `unit` VALUES (1,'Quantity','Q'),(2,'kilogram','kg');
/*!40000 ALTER TABLE `unit` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `user`
--

DROP TABLE IF EXISTS `user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `user` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `password` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `createdAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` datetime(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `roleId` int DEFAULT NULL,
  `status` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'active',
  PRIMARY KEY (`id`),
  UNIQUE KEY `User_email_key` (`email`),
  KEY `User_roleId_fkey` (`roleId`),
  CONSTRAINT `User_roleId_fkey` FOREIGN KEY (`roleId`) REFERENCES `role` (`id`) ON DELETE SET NULL ON UPDATE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `user`
--

LOCK TABLES `user` WRITE;
/*!40000 ALTER TABLE `user` DISABLE KEYS */;
INSERT INTO `user` VALUES (8,'suraj7530993204@gmail.com','suraj','$2b$10$7GZuRDle7NkwykjRDCroUeK3vOTFfgeFzFLEL2C/lLznojkLw00e2','2026-09-30 14:53:14.637','2026-10-05 08:45:38.598','','',2,'online'),(10,'aryatamanna15@gmail.com','Tamanna','$2b$10$fbwjNTfL8Hi/DZ71/SmYE.HuuZWBXSb46aT.ZCX2MD/c/Yb9c2Izu','2026-10-01 05:49:34.268','2026-10-05 08:45:30.155','','',1,'online'),(11,'preet@gmail.com','preet','$2b$10$dyUAYuD8kGc5Z.ybtrhEWe.OTItSSmGGo9vwA4qX5HLFNXyrYn1XG','2026-10-01 05:50:33.256','2026-10-05 08:45:22.854','','',3,'online'),(12,'renu@gmail.com','renu','$2b$10$OvSGYZG35l7RbLbwDRDnW.wP38glUnU/LXOX9B/sbPqAOVBDvU5tW','2026-10-01 05:51:42.122','2026-10-05 08:45:15.342','','',4,'online'),(16,'sonal@gmail.com','Sonal','$2b$10$bzADZWxTjf5cVrTPivxKBOo9NZDMQDfsnl06hnes2TtgBTb82bxzS','2026-10-02 05:31:08.435','2026-10-05 08:45:08.196','','',5,'online');
/*!40000 ALTER TABLE `user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `warehouse`
--

DROP TABLE IF EXISTS `warehouse`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!50503 SET character_set_client = utf8mb4 */;
CREATE TABLE `warehouse` (
  `id` int NOT NULL AUTO_INCREMENT,
  `name` varchar(191) COLLATE utf8mb4_unicode_ci NOT NULL,
  `phone` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `email` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  `address` varchar(191) COLLATE utf8mb4_unicode_ci DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `warehouse`
--

LOCK TABLES `warehouse` WRITE;
/*!40000 ALTER TABLE `warehouse` DISABLE KEYS */;
INSERT INTO `warehouse` VALUES (1,'Warehouse 1','9878909879','warehouse1@gmail.com',''),(2,'warehouse 2','9090909090','warehouse2@gmail.com',''),(3,'warehouse 3','8989898989','warehouse3@gmail.com','New York'),(4,'warehouse 4','8790979098','warehouse4@gmail.com','Noida');
/*!40000 ALTER TABLE `warehouse` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-10-08 11:19:14
