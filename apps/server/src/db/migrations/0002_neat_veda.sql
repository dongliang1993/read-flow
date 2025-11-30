ALTER TABLE "books" ADD COLUMN "format" text NOT NULL;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "language" text;--> statement-breakpoint
ALTER TABLE "books" ADD COLUMN "cover_path" text;