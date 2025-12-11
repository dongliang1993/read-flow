CREATE TABLE "chapter_summaries" (
	"id" serial PRIMARY KEY NOT NULL,
	"book_id" integer NOT NULL,
	"chapter_index" integer NOT NULL,
	"chapter_href" text NOT NULL,
	"chapter_title" text,
	"content_hash" text NOT NULL,
	"summary_type" text DEFAULT 'brief' NOT NULL,
	"summary_content" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "chapter_summaries" ADD CONSTRAINT "chapter_summaries_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;