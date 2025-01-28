CREATE TABLE `admin_notes` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`admin_id` text,
	`content` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`admin_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `amenities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `amenities_name_unique` ON `amenities` (`name`);--> statement-breakpoint
CREATE TABLE `facilities` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`description` text
);
--> statement-breakpoint
CREATE TABLE `furniture_ads` (
	`id` text PRIMARY KEY NOT NULL,
	`seller_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`price` integer NOT NULL,
	`condition` text,
	`category` text NOT NULL,
	`location` text NOT NULL,
	`lat` real,
	`lng` real,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`seller_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `message_threads` (
	`id` text PRIMARY KEY NOT NULL,
	`participant_1` text,
	`participant_2` text,
	`last_message_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`participant_1`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`participant_2`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text,
	`sender_id` text,
	`content` text NOT NULL,
	`type` text DEFAULT 'text',
	`file_url` text,
	`read_at` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`thread_id`) REFERENCES `message_threads`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`sender_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payment_cycles` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text,
	`cycle_type` text NOT NULL,
	`discount_percentage` integer,
	FOREIGN KEY (`room_id`) REFERENCES `room_listings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payment_reminders` (
	`id` text PRIMARY KEY NOT NULL,
	`payment_id` text,
	`reminder_date` text NOT NULL,
	`status` text DEFAULT 'pending',
	`sent_at` text,
	FOREIGN KEY (`payment_id`) REFERENCES `payments`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `payments` (
	`id` text PRIMARY KEY NOT NULL,
	`tenant_id` text,
	`owner_id` text,
	`room_id` text,
	`amount` integer NOT NULL,
	`service_fee` integer NOT NULL,
	`cycle_type` text NOT NULL,
	`due_date` text NOT NULL,
	`paid_date` text,
	`status` text DEFAULT 'pending',
	`stripe_payment_id` text NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`tenant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`room_id`) REFERENCES `room_listings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `profiles` (
	`id` text PRIMARY KEY NOT NULL,
	`user_id` text,
	`display_name` text NOT NULL,
	`bio` text,
	`avatar_url` text,
	`budget_min` integer,
	`budget_max` integer,
	`preferred_location` text,
	`lifestyle_tags` text,
	`phone` text,
	`emergency_contact` text,
	`preferred_payment_method` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE UNIQUE INDEX `profiles_user_id_unique` ON `profiles` (`user_id`);--> statement-breakpoint
CREATE TABLE `reports` (
	`id` text PRIMARY KEY NOT NULL,
	`reporter_id` text,
	`target_type` text,
	`target_id` text NOT NULL,
	`category` text NOT NULL,
	`status` text DEFAULT 'open',
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`reporter_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `room_amenities` (
	`room_id` text,
	`amenity_id` text,
	FOREIGN KEY (`room_id`) REFERENCES `room_listings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`amenity_id`) REFERENCES `amenities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `room_facilities` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text,
	`facility_id` text,
	`included_in_rent` integer DEFAULT false,
	`additional_cost` integer,
	FOREIGN KEY (`room_id`) REFERENCES `room_listings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`facility_id`) REFERENCES `facilities`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `room_images` (
	`id` text PRIMARY KEY NOT NULL,
	`listing_id` text,
	`url` text NOT NULL,
	`caption` text,
	`order` integer NOT NULL,
	FOREIGN KEY (`listing_id`) REFERENCES `room_listings`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `room_listings` (
	`id` text PRIMARY KEY NOT NULL,
	`owner_id` text,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`type` text NOT NULL,
	`base_rent` integer NOT NULL,
	`security_deposit` integer,
	`available_from` text NOT NULL,
	`address` text NOT NULL,
	`lat` real NOT NULL,
	`lng` real NOT NULL,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`is_active` integer DEFAULT true,
	FOREIGN KEY (`owner_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `room_reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`room_id` text,
	`tenant_id` text,
	`rating` integer NOT NULL,
	`comment` text,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	FOREIGN KEY (`room_id`) REFERENCES `room_listings`(`id`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`tenant_id`) REFERENCES `users`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `users` (
	`id` text PRIMARY KEY NOT NULL,
	`email` text NOT NULL,
	`password_hash` text,
	`roles` text DEFAULT '["tenant"]' NOT NULL,
	`stripe_customer_id` text,
	`stripe_account_id` text,
	`email_verified` integer DEFAULT false,
	`created_at` text DEFAULT (CURRENT_TIMESTAMP),
	`last_login` text,
	`oauth_provider` text,
	`oauth_id` text
);
--> statement-breakpoint
CREATE UNIQUE INDEX `users_email_unique` ON `users` (`email`);