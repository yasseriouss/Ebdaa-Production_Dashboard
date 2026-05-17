ALTER TABLE `wooden_work_orders` ADD `updated_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'));--> statement-breakpoint
ALTER TABLE `wooden_work_orders` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `metal_work_orders` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `wooden_production_stages` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `wooden_production_stages` ADD `updated_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'));--> statement-breakpoint
ALTER TABLE `metal_production_stages` ADD `deleted_at` text;--> statement-breakpoint
ALTER TABLE `metal_production_stages` ADD `updated_at` text NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ','now'));
