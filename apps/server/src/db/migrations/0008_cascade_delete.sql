-- 修改外键约束，添加级联删除

-- reading_progress
ALTER TABLE reading_progress 
DROP CONSTRAINT IF EXISTS reading_progress_book_id_books_id_fk;

ALTER TABLE reading_progress 
ADD CONSTRAINT reading_progress_book_id_books_id_fk 
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

-- chat_history
ALTER TABLE chat_history 
DROP CONSTRAINT IF EXISTS chat_history_book_id_books_id_fk;

ALTER TABLE chat_history 
ADD CONSTRAINT chat_history_book_id_books_id_fk 
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

-- annotations
ALTER TABLE annotations 
DROP CONSTRAINT IF EXISTS annotations_book_id_books_id_fk;

ALTER TABLE annotations 
ADD CONSTRAINT annotations_book_id_books_id_fk 
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

-- chapter_summaries
ALTER TABLE chapter_summaries 
DROP CONSTRAINT IF EXISTS chapter_summaries_book_id_books_id_fk;

ALTER TABLE chapter_summaries 
ADD CONSTRAINT chapter_summaries_book_id_books_id_fk 
FOREIGN KEY (book_id) REFERENCES books(id) ON DELETE CASCADE;

