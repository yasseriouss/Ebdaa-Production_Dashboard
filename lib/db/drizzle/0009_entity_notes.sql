CREATE TABLE IF NOT EXISTS `entity_notes` (
  `id` text PRIMARY KEY NOT NULL,
  `entity_type` text NOT NULL,
  `entity_id` text NOT NULL,
  `body` text NOT NULL,
  `created_at` text NOT NULL,
  `updated_at` text NOT NULL,
  `created_by_user_id` text,
  `updated_by_user_id` text
);--> statement-breakpoint
CREATE INDEX IF NOT EXISTS `idx_entity_notes_lookup` ON `entity_notes` (`entity_type`,`entity_id`);--> statement-breakpoint
