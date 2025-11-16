-- Script SQL pour mettre à jour la base de données
-- Ajouter 'admin' au type enum userType

ALTER TABLE `users` MODIFY `userType` ENUM('student', 'owner', 'admin') NOT NULL;

-- Ajouter colonne avatar pour l'image de profil
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `avatar` VARCHAR(255) DEFAULT NULL AFTER `bio`;

-- Ajouter colonne pour stocker la date de création du compte pour vérification 24h
ALTER TABLE `users` ADD COLUMN IF NOT EXISTS `account_activation_deadline` DATETIME DEFAULT NULL AFTER `created_at`;

-- Créer table pour les rendez-vous (appointments)
CREATE TABLE IF NOT EXISTS `appointments` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `propertyId` int(11) NOT NULL,
  `studentId` int(11) NOT NULL,
  `ownerId` int(11) NOT NULL,
  `appointmentDate` datetime NOT NULL,
  `status` enum('pending','confirmed','cancelled','completed') NOT NULL DEFAULT 'pending',
  `message` text DEFAULT NULL,
  `createdAt` datetime DEFAULT current_timestamp(),
  `updatedAt` datetime DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `propertyId` (`propertyId`),
  KEY `studentId` (`studentId`),
  KEY `ownerId` (`ownerId`),
  CONSTRAINT `appointments_ibfk_1` FOREIGN KEY (`propertyId`) REFERENCES `properties` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_2` FOREIGN KEY (`studentId`) REFERENCES `users` (`id`) ON DELETE CASCADE,
  CONSTRAINT `appointments_ibfk_3` FOREIGN KEY (`ownerId`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

