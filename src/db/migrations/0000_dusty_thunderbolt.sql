CREATE TABLE `session` (
	`id` varchar(255) NOT NULL,
	`user_id` int NOT NULL,
	`expires_at` datetime NOT NULL,
	CONSTRAINT `session_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` int AUTO_INCREMENT NOT NULL,
	`email` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`created_at` datetime NOT NULL DEFAULT '2025-03-03 17:56:34.662',
	`updated_at` datetime NOT NULL DEFAULT '2025-03-03 17:56:34.662',
	CONSTRAINT `user_id` PRIMARY KEY(`id`),
	CONSTRAINT `user_email_unique` UNIQUE(`email`)
);
--> statement-breakpoint
CREATE TABLE `databases` (
	`id` int AUTO_INCREMENT NOT NULL,
	`host` varchar(255) NOT NULL,
	`user` varchar(255) NOT NULL,
	`password` varchar(255) NOT NULL,
	`database` varchar(255) NOT NULL,
	`folder_id` varchar(255),
	`backup` enum('daily','weekly') DEFAULT 'daily',
	`created_at` datetime NOT NULL DEFAULT '2025-03-03 17:56:34.669',
	`updated_at` datetime NOT NULL DEFAULT '2025-03-03 17:56:34.669',
	CONSTRAINT `databases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
CREATE TABLE `settings` (
	`id` int AUTO_INCREMENT NOT NULL,
	`name` varchar(255),
	`value` varchar(255),
	`description` varchar(255),
	`updated_at` timestamp DEFAULT (now()),
	CONSTRAINT `settings_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;