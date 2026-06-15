-- ====================================================================
-- SCRIPT DI CREAZIONE E POPOLAMENTO DATABASE
-- Progetto: Studio Medico
-- ====================================================================

CREATE DATABASE IF NOT EXISTS `studio_medico` DEFAULT CHARACTER SET utf16;
USE `studio_medico`;

SET FOREIGN_KEY_CHECKS = 0;

-- ====================================================================
-- PARTE 1: CREAZIONE TABELLE (DDL)
-- ====================================================================

-- 1. Tabella UTENTI: credenziali e ruolo di accesso
CREATE TABLE IF NOT EXISTS `utenti` (
  `id` int NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `ruolo` enum('medico','paziente') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

-- 2. Tabella MEDICI: anagrafica medici, collegata a utenti
CREATE TABLE IF NOT EXISTS `medici` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utente_id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `cognome` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `utente_id` (`utente_id`),
  CONSTRAINT `medici_ibfk_1` FOREIGN KEY (`utente_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

-- 3. Tabella PAZIENTI: anagrafica pazienti, collegata a utenti e medici
CREATE TABLE IF NOT EXISTS `pazienti` (
  `id` int NOT NULL AUTO_INCREMENT,
  `utente_id` int NOT NULL,
  `medico_id` int NOT NULL,
  `nome` varchar(100) NOT NULL,
  `cognome` varchar(100) NOT NULL,
  `data_nascita` date DEFAULT NULL,
  `altezza` int DEFAULT NULL,
  `obiettivo` varchar(255) DEFAULT NULL,
  `anamnesi` text,
  PRIMARY KEY (`id`),
  KEY `utente_id` (`utente_id`),
  KEY `medico_id` (`medico_id`),
  CONSTRAINT `pazienti_ibfk_1` FOREIGN KEY (`utente_id`) REFERENCES `utenti` (`id`) ON DELETE CASCADE,
  CONSTRAINT `pazienti_ibfk_2` FOREIGN KEY (`medico_id`) REFERENCES `medici` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

-- 4. Tabella PIANI ALIMENTARI: piani generati dall'AI in formato JSON
CREATE TABLE IF NOT EXISTS `piani_alimentari` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paziente_id` int NOT NULL,
  `medico_id` int NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `piano_json` longtext,
  `generato_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `paziente_id` (`paziente_id`),
  KEY `medico_id` (`medico_id`),
  CONSTRAINT `piani_alimentari_ibfk_1` FOREIGN KEY (`paziente_id`) REFERENCES `pazienti` (`id`) ON DELETE CASCADE,
  CONSTRAINT `piani_alimentari_ibfk_2` FOREIGN KEY (`medico_id`) REFERENCES `medici` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

-- 5. Tabella VISITE: storico misurazioni dei pazienti
CREATE TABLE IF NOT EXISTS `visite` (
  `id` int NOT NULL AUTO_INCREMENT,
  `paziente_id` int NOT NULL,
  `data_visita` date NOT NULL DEFAULT (curdate()),
  `peso` float NOT NULL,
  `bmi` float NOT NULL,
  `bf` float NOT NULL,
  `note_visita` text,
  `created_at` timestamp NULL DEFAULT CURRENT_TIMESTAMP,
  `medico_id` int NOT NULL,
  PRIMARY KEY (`id`),
  KEY `paziente_id` (`paziente_id`),
  KEY `visite_ibfk_2` (`medico_id`),
  CONSTRAINT `visite_ibfk_1` FOREIGN KEY (`paziente_id`) REFERENCES `pazienti` (`id`) ON DELETE CASCADE,
  CONSTRAINT `visite_ibfk_2` FOREIGN KEY (`medico_id`) REFERENCES `medici` (`id`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf16;

-- ====================================================================
-- PARTE 2: POPOLAMENTO (DML)
-- ====================================================================

-- Utenti di esempio
-- Credenziali demo:
--   medico:   luca.ferrari@studio.it  / password123
--   paziente: mario.rossi@email.it    / password123
--   paziente: Test@email.it           / password123
INSERT INTO `utenti` (`id`, `email`, `password_hash`, `ruolo`) VALUES
	(1,  'luca.ferrari@studio.it', '$2b$10$OAf1KSQb02gLPivcahzcCuO5DZUFPvXFr8ApFPCOiB0H7wTqI1DHm', 'medico'),
	(2,  'mario.rossi@email.it',   '$2b$10$HiAIVI1C9Ncwh7pvEb4a/eO/wu7w7UJZ7DllekTMgGZc63mPLdYOi', 'paziente'),
	(19, 'Test@email.it',          '$2b$10$Jn0ferwoqMMh8uvfwT1df./DBI7e3GVG3Gb6axSrurdiI22OIplVy', 'paziente');

-- Medico di esempio
INSERT INTO `medici` (`id`, `utente_id`, `nome`, `cognome`) VALUES
	(2, 1, 'Luca', 'Ferrari');

-- Pazienti di esempio
INSERT INTO `pazienti` (`id`, `utente_id`, `medico_id`, `nome`, `cognome`, `data_nascita`, `altezza`, `obiettivo`, `anamnesi`) VALUES
	(1,  2,  2, 'Mario', 'Rossi',     '1960-05-09', 175, 'Perdita di peso',  'Intollerante al lattosio. Ipertensione lieve.'),
	(19, 19, 2, 'test1', 'paziente2', '1998-06-02', 180, 'Guadagnare massa', 'Nessuna intolleranza o patologia.');

-- Visite di esempio - Mario Rossi (andamento dimagrimento su 5 mesi)
INSERT INTO `visite` (`id`, `paziente_id`, `data_visita`, `peso`, `bmi`, `bf`, `note_visita`, `medico_id`) VALUES
	(1, 1, '2026-06-08', 92.0, 29.5, 28.0, NULL, 2),
	(2, 1, '2026-07-01', 89.0, 28.4, 25.5, NULL, 2),
	(3, 1, '2026-08-01', 87.0, 27.8, 24.0, NULL, 2),
	(4, 1, '2026-09-01', 85.5, 27.2, 22.5, NULL, 2),
	(5, 1, '2026-10-01', 84.0, 26.8, 21.0, NULL, 2);

-- Visite di esempio - test1 paziente2 (andamento guadagno massa)
INSERT INTO `visite` (`id`, `paziente_id`, `data_visita`, `peso`, `bmi`, `bf`, `note_visita`, `medico_id`) VALUES
	(26, 19, '2026-06-11', 70.0, 21.6, 30.0, NULL, 2),
	(27, 19, '2026-07-11', 73.0, 22.5, 27.0, NULL, 2),
	(28, 19, '2026-08-11', 76.0, 23.5, 24.0, NULL, 2),
	(29, 19, '2026-09-11', 79.0, 24.4, 21.0, NULL, 2),
	(30, 19, '2026-10-11', 80.0, 24.7, 17.0, NULL, 2);

SET FOREIGN_KEY_CHECKS = 1;