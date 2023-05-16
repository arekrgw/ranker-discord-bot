CREATE TABLE `ranking` (
	`id` integer PRIMARY KEY NOT NULL,
	`ranked_user_id` text NOT NULL,
	`ranking_user_id` text NOT NULL,
	`reason` text NOT NULL,
	`created_at` integer NOT NULL
);
