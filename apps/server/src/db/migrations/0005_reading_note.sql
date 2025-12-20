CREATE TABLE notes (
  id SERIAL PRIMARY KEY,
  book_id INTEGER REFERENCES books(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT 'default-user',
  title TEXT NOT NULL,
  author TEXT,
  source_plain TEXT NOT NULL,
  source_raw TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);