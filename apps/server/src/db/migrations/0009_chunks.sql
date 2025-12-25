-- Enable pgvector extension (Supabase already has this)
CREATE EXTENSION IF NOT EXISTS vector;

-- Create chunks table
CREATE TABLE IF NOT EXISTS "chunks" (
  "id" serial PRIMARY KEY NOT NULL,
  "chapter_id" integer NOT NULL REFERENCES "chapters"("id") ON DELETE CASCADE,
  "book_id" integer NOT NULL REFERENCES "books"("id") ON DELETE CASCADE,
  "order" integer NOT NULL,
  "content" text NOT NULL,
  "token_count" integer,
  "embedding" vector(1536),
  "created_at" timestamp with time zone DEFAULT now() NOT NULL
);

-- Create indexes for efficient querying
CREATE INDEX IF NOT EXISTS "chunks_book_id_idx" ON "chunks" ("book_id");
CREATE INDEX IF NOT EXISTS "chunks_chapter_id_idx" ON "chunks" ("chapter_id");

-- Create HNSW index for vector similarity search (better performance than IVFFlat for most cases)
CREATE INDEX IF NOT EXISTS "chunks_embedding_idx" ON "chunks" 
USING hnsw ("embedding" vector_cosine_ops);

-- RPC function to update chunk embedding
CREATE OR REPLACE FUNCTION update_chunk_embedding(chunk_id integer, embedding_vector vector(1536))
RETURNS void AS $$
BEGIN
  UPDATE chunks SET embedding = embedding_vector WHERE id = chunk_id;
END;
$$ LANGUAGE plpgsql;

