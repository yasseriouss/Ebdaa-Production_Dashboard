ALTER TABLE `wooden_work_orders` ADD `factory_id` text REFERENCES `factories`(`id`);
--> statement-breakpoint
ALTER TABLE `wooden_work_orders` ADD `department_id` text REFERENCES `departments`(`id`);
--> statement-breakpoint
ALTER TABLE `metal_work_orders` ADD `factory_id` text REFERENCES `factories`(`id`);
--> statement-breakpoint
ALTER TABLE `metal_work_orders` ADD `department_id` text REFERENCES `departments`(`id`);
--> statement-breakpoint
ALTER TABLE `fh_wood_work_orders` ADD `factory_id` text REFERENCES `factories`(`id`);
--> statement-breakpoint
ALTER TABLE `fh_wood_work_orders` ADD `department_id` text REFERENCES `departments`(`id`);
