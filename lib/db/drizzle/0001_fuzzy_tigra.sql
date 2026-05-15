PRAGMA foreign_keys=OFF;--> statement-breakpoint
CREATE TABLE `__new_metal_production_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`metal_order_id` text NOT NULL,
	`mo_number` text NOT NULL,
	`stage_name` text NOT NULL,
	`stage_order` integer NOT NULL,
	`qty_target` text NOT NULL,
	`qty_done` text DEFAULT '0' NOT NULL,
	`status` text DEFAULT 'لم يتم البدء' NOT NULL,
	`notes` text,
	FOREIGN KEY (`metal_order_id`) REFERENCES `metal_work_orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_metal_production_stages`("id", "metal_order_id", "mo_number", "stage_name", "stage_order", "qty_target", "qty_done", "status", "notes") SELECT "id", "metal_order_id", "mo_number", "stage_name", "stage_order", "qty_target", "qty_done", "status", "notes" FROM `metal_production_stages`;--> statement-breakpoint
DROP TABLE `metal_production_stages`;--> statement-breakpoint
ALTER TABLE `__new_metal_production_stages` RENAME TO `metal_production_stages`;--> statement-breakpoint
PRAGMA foreign_keys=ON;--> statement-breakpoint
CREATE TABLE `__new_wooden_production_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`wooden_order_id` text NOT NULL,
	`stage_name` text NOT NULL,
	`stage_order` integer NOT NULL,
	`qty_done` text DEFAULT '0' NOT NULL,
	`status` text DEFAULT 'لم يتم البدء' NOT NULL,
	FOREIGN KEY (`wooden_order_id`) REFERENCES `wooden_work_orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
INSERT INTO `__new_wooden_production_stages`("id", "wooden_order_id", "stage_name", "stage_order", "qty_done", "status") SELECT "id", "wooden_order_id", "stage_name", "stage_order", "qty_done", "status" FROM `wooden_production_stages`;--> statement-breakpoint
DROP TABLE `wooden_production_stages`;--> statement-breakpoint
ALTER TABLE `__new_wooden_production_stages` RENAME TO `wooden_production_stages`;