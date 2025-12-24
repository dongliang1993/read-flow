CREATE TABLE IF NOT EXISTS "chapters" (
  "id" serial PRIMARY KEY,
  "book_id" integer NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
  "title" text,
  "href" text,
  "order" integer NOT NULL,
  "content" text,
  "html_content" text,
  "word_count" integer,
  "created_at" timestamp with time zone NOT NULL DEFAULT now()
);

-- 索引：按书籍查询章节
CREATE INDEX IF NOT EXISTS "chapters_book_id_idx" ON "chapters" ("book_id");
-- 索引：按顺序排序
CREATE INDEX IF NOT EXISTS "chapters_book_id_order_idx" ON "chapters" ("book_id", "order");

