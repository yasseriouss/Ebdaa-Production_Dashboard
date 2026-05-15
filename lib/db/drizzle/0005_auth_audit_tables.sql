CREATE TABLE IF NOT EXISTS `auth_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`label_ar` text,
	`label_en` text,
	UNIQUE(`slug`)
);

CREATE TABLE IF NOT EXISTS `auth_permissions` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`description` text,
	UNIQUE(`key`)
);

CREATE TABLE IF NOT EXISTS `auth_users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`employee_id` text,
	`is_active` integer DEFAULT 1 NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	UNIQUE(`email`),
	FOREIGN KEY (`employee_id`) REFERENCES `employees`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `auth_role_permissions` (
	`role_id` text NOT NULL,
	`permission_id` text NOT NULL,
	PRIMARY KEY(`role_id`, `permission_id`),
	FOREIGN KEY (`role_id`) REFERENCES `auth_roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`permission_id`) REFERENCES `auth_permissions`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `auth_user_roles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text NOT NULL,
	`role_id` text NOT NULL,
	`factory_id` text,
	`department_id` text,
	FOREIGN KEY (`user_id`) REFERENCES `auth_users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`role_id`) REFERENCES `auth_roles`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`factory_id`) REFERENCES `factories`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`department_id`) REFERENCES `departments`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE TABLE IF NOT EXISTS `audit_events` (
	`id` text PRIMARY KEY NOT NULL,
	`occurred_at` text NOT NULL,
	`actor_user_id` text,
	`actor_label` text DEFAULT 'guest' NOT NULL,
	`actor_employee_id` text,
	`department_id` text,
	`action` text NOT NULL,
	`resource_type` text,
	`resource_id` text,
	`route` text NOT NULL,
	`method` text NOT NULL,
	`status_code` integer,
	`ip` text,
	`user_agent` text,
	`payload_summary` text,
	FOREIGN KEY (`actor_user_id`) REFERENCES `auth_users`(`id`) ON UPDATE no action ON DELETE no action
);

CREATE INDEX IF NOT EXISTS `audit_events_occurred_at_idx` ON `audit_events` (`occurred_at`);
CREATE INDEX IF NOT EXISTS `audit_events_actor_user_id_idx` ON `audit_events` (`actor_user_id`);
