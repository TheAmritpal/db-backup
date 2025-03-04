ALTER TABLE `user` MODIFY COLUMN `created_at` datetime NOT NULL DEFAULT '2025-03-04 16:51:55.283';--> statement-breakpoint
ALTER TABLE `user` MODIFY COLUMN `updated_at` datetime NOT NULL DEFAULT '2025-03-04 16:51:55.283';--> statement-breakpoint
ALTER TABLE `databases` MODIFY COLUMN `created_at` datetime NOT NULL DEFAULT '2025-03-04 16:51:55.289';--> statement-breakpoint
ALTER TABLE `databases` MODIFY COLUMN `updated_at` datetime NOT NULL DEFAULT '2025-03-04 16:51:55.289';--> statement-breakpoint
ALTER TABLE `databases` ADD `last_backup_date` datetime;