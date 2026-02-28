CREATE TABLE `gdelt_events` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`url` text NOT NULL,
	`title` text NOT NULL,
	`publish_date` text,
	`snippet` text,
	`raw_json` text,
	`created_at` integer DEFAULT (unixepoch()) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `gdelt_events_url_unique` ON `gdelt_events` (`url`);