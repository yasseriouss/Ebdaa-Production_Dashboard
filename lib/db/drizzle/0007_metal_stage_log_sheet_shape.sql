-- Reshape metal_stage_log to match metalStageLog.ts (Excel "متابعة" import shape).
-- Replaces legacy columns: stage_id, action, qty_delta, performed_by, timestamp.
-- Destructive: existing stage_log rows are dropped (historical audit shape was unrelated).

PRAGMA foreign_keys=OFF;--> statement-breakpoint
DROP TABLE IF EXISTS `metal_stage_log`;--> statement-breakpoint
CREATE TABLE `metal_stage_log` (
	`id` text PRIMARY KEY NOT NULL,
	`metal_order_id` text NOT NULL,
	`mo_number` text NOT NULL,
	`log_date` text NOT NULL,
	`stage_name` text NOT NULL,
	`input_qty` text DEFAULT '0' NOT NULL,
	`output_qty` text DEFAULT '0' NOT NULL,
	`waste_qty` text DEFAULT '0' NOT NULL,
	`operator` text,
	`notes` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`metal_order_id`) REFERENCES `metal_work_orders`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `metal_stage_log_order_date_stage_unq` ON `metal_stage_log` (`metal_order_id`,`log_date`,`stage_name`);--> statement-breakpoint
PRAGMA foreign_keys=ON;
