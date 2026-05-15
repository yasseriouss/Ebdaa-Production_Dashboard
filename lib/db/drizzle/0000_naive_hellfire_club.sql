CREATE TABLE `metal_work_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`mo_number` text NOT NULL,
	`project` text NOT NULL,
	`client` text NOT NULL,
	`product` text NOT NULL,
	`qty` text NOT NULL,
	`unit` text DEFAULT 'Unit' NOT NULL,
	`status` text DEFAULT 'تحت التصنيع' NOT NULL,
	`completion_pct` text DEFAULT '0' NOT NULL,
	`delivered_qty` text DEFAULT '0' NOT NULL,
	`backlog_qty` text DEFAULT '0' NOT NULL,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `metal_work_orders_mo_number_unique` ON `metal_work_orders` (`mo_number`);--> statement-breakpoint
CREATE TABLE `metal_production_stages` (
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
CREATE TABLE `metal_stage_log` (
	`id` text PRIMARY KEY NOT NULL,
	`stage_id` text NOT NULL,
	`action` text NOT NULL,
	`qty_delta` integer DEFAULT 0 NOT NULL,
	`performed_by` text,
	`timestamp` text NOT NULL,
	`notes` text,
	FOREIGN KEY (`stage_id`) REFERENCES `metal_production_stages`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `wooden_work_orders` (
	`id` text PRIMARY KEY NOT NULL,
	`order_no` text NOT NULL,
	`extension` text DEFAULT '' NOT NULL,
	`client` text NOT NULL,
	`order_date` text NOT NULL,
	`sub_project` text NOT NULL,
	`product` text NOT NULL,
	`qty` text NOT NULL,
	`done` text DEFAULT '0' NOT NULL,
	`rem` text DEFAULT '0' NOT NULL,
	`status` text DEFAULT 'تحت التصنيع' NOT NULL,
	`prod_date_end` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `wooden_work_orders_order_no_unique` ON `wooden_work_orders` (`order_no`);--> statement-breakpoint
CREATE TABLE `wooden_production_stages` (
	`id` text PRIMARY KEY NOT NULL,
	`wooden_order_id` text NOT NULL,
	`stage_name` text NOT NULL,
	`stage_order` integer NOT NULL,
	`qty_done` text DEFAULT '0' NOT NULL,
	`status` text DEFAULT 'لم يتم البدء' NOT NULL,
	FOREIGN KEY (`wooden_order_id`) REFERENCES `wooden_work_orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `shared_projects` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text,
	`client` text,
	`status` text DEFAULT 'active' NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `shared_projects_name_unique` ON `shared_projects` (`name`);--> statement-breakpoint
CREATE TABLE `departments` (
	`id` text PRIMARY KEY NOT NULL,
	`factory_id` text NOT NULL,
	`name` text NOT NULL,
	`process_step` integer NOT NULL,
	FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `factories` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `tasks` (
	`id` text PRIMARY KEY NOT NULL,
	`department_id` text NOT NULL,
	`name` text NOT NULL,
	`type` text NOT NULL,
	`unit_of_measure` text NOT NULL,
	`cycle_time_seconds` real NOT NULL,
	`setup_time_minutes` real NOT NULL,
	`batch_size` integer NOT NULL,
	`efficiency_factor` text NOT NULL,
	`max_capacity_per_hour` text NOT NULL,
	`hourly_operating_cost` text NOT NULL,
	`labor_required` integer NOT NULL,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action
);
