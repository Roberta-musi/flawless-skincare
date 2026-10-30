CREATE TABLE `account` (
	`id` text PRIMARY KEY NOT NULL,
	`account_id` text NOT NULL,
	`provider_id` text NOT NULL,
	`user_id` text NOT NULL,
	`access_token` text,
	`refresh_token` text,
	`id_token` text,
	`access_token_expires_at` integer,
	`refresh_token_expires_at` integer,
	`scope` text,
	`password` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `account_user_idx` ON `account` (`user_id`);--> statement-breakpoint
CREATE TABLE `bookings` (
	`id` text PRIMARY KEY NOT NULL,
	`service_id` text,
	`service_name` text NOT NULL,
	`name` text NOT NULL,
	`phone` text NOT NULL,
	`email` text,
	`preferred_slots` text NOT NULL,
	`first_visit` integer DEFAULT true NOT NULL,
	`notes` text,
	`locale` text DEFAULT 'en' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`scheduled_at` integer,
	`admin_note` text,
	`policy_accepted_at` integer NOT NULL,
	`consent_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `bookings_status_idx` ON `bookings` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `brand_profile` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`ceo_name` text,
	`ceo_title_en` text,
	`ceo_title_fr` text,
	`portrait_key` text,
	`short_bio_en` text,
	`short_bio_fr` text,
	`story_en` text,
	`story_fr` text,
	`quote_en` text,
	`quote_fr` text,
	`brand_story_en` text,
	`brand_story_fr` text,
	`founded_year` integer,
	`ceo_socials` text DEFAULT '{}' NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `categories` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_fr` text,
	`intro_en` text,
	`intro_fr` text,
	`image_key` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL,
	`seo_title_en` text,
	`seo_title_fr` text,
	`seo_description_en` text,
	`seo_description_fr` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `categories_slug_unique` ON `categories` (`slug`);--> statement-breakpoint
CREATE TABLE `concerns` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_fr` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `concerns_slug_unique` ON `concerns` (`slug`);--> statement-breakpoint
CREATE TABLE `content_pages` (
	`slug` text PRIMARY KEY NOT NULL,
	`title_en` text NOT NULL,
	`title_fr` text,
	`body_en` text NOT NULL,
	`body_fr` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `faqs` (
	`id` text PRIMARY KEY NOT NULL,
	`topic` text DEFAULT 'general' NOT NULL,
	`question_en` text NOT NULL,
	`question_fr` text,
	`answer_en` text NOT NULL,
	`answer_fr` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`is_published` integer DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE `messages` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`contact` text NOT NULL,
	`subject` text,
	`body` text NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`is_read` integer DEFAULT false NOT NULL,
	`consent_at` integer NOT NULL,
	`created_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `product_concerns` (
	`product_id` text NOT NULL,
	`concern_id` text NOT NULL,
	PRIMARY KEY(`product_id`, `concern_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`concern_id`) REFERENCES `concerns`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_images` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`key` text NOT NULL,
	`width` integer NOT NULL,
	`height` integer NOT NULL,
	`alt_en` text,
	`alt_fr` text,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_images_product_idx` ON `product_images` (`product_id`);--> statement-breakpoint
CREATE TABLE `product_pairings` (
	`product_id` text NOT NULL,
	`paired_product_id` text NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`product_id`, `paired_product_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`paired_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_set_items` (
	`set_product_id` text NOT NULL,
	`item_product_id` text NOT NULL,
	`quantity` integer DEFAULT 1 NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	PRIMARY KEY(`set_product_id`, `item_product_id`),
	FOREIGN KEY (`set_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`item_product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_skin_types` (
	`product_id` text NOT NULL,
	`skin_type_id` text NOT NULL,
	PRIMARY KEY(`product_id`, `skin_type_id`),
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade,
	FOREIGN KEY (`skin_type_id`) REFERENCES `skin_types`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE TABLE `product_variants` (
	`id` text PRIMARY KEY NOT NULL,
	`product_id` text NOT NULL,
	`label_en` text NOT NULL,
	`label_fr` text,
	`price_xaf` integer,
	`compare_at_price_xaf` integer,
	`in_stock` integer DEFAULT true NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE INDEX `product_variants_product_idx` ON `product_variants` (`product_id`);--> statement-breakpoint
CREATE TABLE `products` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`category_id` text,
	`name_en` text NOT NULL,
	`name_fr` text,
	`short_description_en` text,
	`short_description_fr` text,
	`description_en` text,
	`description_fr` text,
	`benefits_en` text DEFAULT '[]' NOT NULL,
	`benefits_fr` text DEFAULT '[]' NOT NULL,
	`how_to_use_en` text,
	`how_to_use_fr` text,
	`key_ingredients_en` text,
	`key_ingredients_fr` text,
	`inci` text,
	`is_published` integer DEFAULT false NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`is_bestseller` integer DEFAULT false NOT NULL,
	`is_new` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`seo_title_en` text,
	`seo_title_fr` text,
	`seo_description_en` text,
	`seo_description_fr` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`category_id`) REFERENCES `categories`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE UNIQUE INDEX `products_slug_unique` ON `products` (`slug`);--> statement-breakpoint
CREATE INDEX `products_category_idx` ON `products` (`category_id`);--> statement-breakpoint
CREATE TABLE `rate_limit` (
	`id` text PRIMARY KEY NOT NULL,
	`key` text NOT NULL,
	`count` integer NOT NULL,
	`last_request` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `rate_limit_key_unique` ON `rate_limit` (`key`);--> statement-breakpoint
CREATE TABLE `reviews` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`location` text,
	`rating` integer,
	`body` text NOT NULL,
	`product_id` text,
	`service_id` text,
	`source` text DEFAULT 'website' NOT NULL,
	`status` text DEFAULT 'pending' NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`locale` text DEFAULT 'en' NOT NULL,
	`consent_at` integer,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	FOREIGN KEY (`product_id`) REFERENCES `products`(`id`) ON UPDATE no action ON DELETE set null,
	FOREIGN KEY (`service_id`) REFERENCES `services`(`id`) ON UPDATE no action ON DELETE set null
);
--> statement-breakpoint
CREATE INDEX `reviews_status_idx` ON `reviews` (`status`,`created_at`);--> statement-breakpoint
CREATE TABLE `services` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_fr` text,
	`short_description_en` text,
	`short_description_fr` text,
	`description_en` text,
	`description_fr` text,
	`what_to_expect_en` text,
	`what_to_expect_fr` text,
	`preparation_en` text,
	`preparation_fr` text,
	`aftercare_en` text,
	`aftercare_fr` text,
	`duration_minutes` integer,
	`price_xaf` integer,
	`price_type` text DEFAULT 'fixed' NOT NULL,
	`mode` text DEFAULT 'in_shop' NOT NULL,
	`image_key` text,
	`is_published` integer DEFAULT false NOT NULL,
	`is_featured` integer DEFAULT false NOT NULL,
	`sort_order` integer DEFAULT 0 NOT NULL,
	`seo_title_en` text,
	`seo_title_fr` text,
	`seo_description_en` text,
	`seo_description_fr` text,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `services_slug_unique` ON `services` (`slug`);--> statement-breakpoint
CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`expires_at` integer NOT NULL,
	`token` text NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL,
	`ip_address` text,
	`user_agent` text,
	`user_id` text NOT NULL,
	FOREIGN KEY (`user_id`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE cascade
);
--> statement-breakpoint
CREATE UNIQUE INDEX `session_token_unique` ON `session` (`token`);--> statement-breakpoint
CREATE INDEX `session_user_idx` ON `session` (`user_id`);--> statement-breakpoint
CREATE TABLE `settings` (
	`id` integer PRIMARY KEY DEFAULT 1 NOT NULL,
	`business_name` text NOT NULL,
	`slogan_en` text,
	`slogan_fr` text,
	`announcement_en` text,
	`announcement_fr` text,
	`whatsapp` text,
	`phone` text,
	`email` text,
	`street_address` text,
	`landmark_en` text,
	`landmark_fr` text,
	`city` text DEFAULT 'Limbe' NOT NULL,
	`region` text DEFAULT 'South West' NOT NULL,
	`country` text DEFAULT 'CM' NOT NULL,
	`latitude` real,
	`longitude` real,
	`map_url` text,
	`shop_photo_key` text,
	`opening_hours` text,
	`socials` text DEFAULT '{}' NOT NULL,
	`seo_title_en` text,
	`seo_title_fr` text,
	`seo_description_en` text,
	`seo_description_fr` text,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `skin_types` (
	`id` text PRIMARY KEY NOT NULL,
	`slug` text NOT NULL,
	`name_en` text NOT NULL,
	`name_fr` text,
	`sort_order` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `skin_types_slug_unique` ON `skin_types` (`slug`);--> statement-breakpoint
CREATE TABLE `user` (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text NOT NULL,
	`email_verified` integer DEFAULT false NOT NULL,
	`image` text,
	`role` text DEFAULT 'manager' NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_email_unique` ON `user` (`email`);--> statement-breakpoint
CREATE TABLE `verification` (
	`id` text PRIMARY KEY NOT NULL,
	`identifier` text NOT NULL,
	`value` text NOT NULL,
	`expires_at` integer NOT NULL,
	`created_at` integer NOT NULL,
	`updated_at` integer NOT NULL
);
--> statement-breakpoint
CREATE INDEX `verification_identifier_idx` ON `verification` (`identifier`);