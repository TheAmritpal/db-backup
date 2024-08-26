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
	`created_at` datetime NOT NULL DEFAULT '2024-08-26 15:01:00.429',
	`updated_at` datetime NOT NULL DEFAULT '2024-08-26 15:01:00.429',
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
	`created_at` datetime NOT NULL DEFAULT '2024-08-26 15:01:00.433',
	`updated_at` datetime NOT NULL DEFAULT '2024-08-26 15:01:00.433',
	CONSTRAINT `databases_id` PRIMARY KEY(`id`)
);
--> statement-breakpoint
ALTER TABLE `session` ADD CONSTRAINT `session_user_id_user_id_fk` FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON DELETE no action ON UPDATE no action;