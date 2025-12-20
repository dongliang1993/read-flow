-- 创建 reading_sessions 表
CREATE TABLE reading_sessions (
  id SERIAL PRIMARY KEY,
  book_id INTEGER NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  user_id TEXT NOT NULL DEFAULT 'default-user',
  started_at TIMESTAMP WITH TIME ZONE NOT NULL,
  ended_at TIMESTAMP WITH TIME ZONE,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- 创建索引，加速按 book_id 和 user_id 查询
CREATE INDEX idx_reading_sessions_book_id ON reading_sessions(book_id);
CREATE INDEX idx_reading_sessions_user_id ON reading_sessions(user_id);
CREATE INDEX idx_reading_sessions_started_at ON reading_sessions(started_at DESC);

-- 添加注释
COMMENT ON TABLE reading_sessions IS '阅读会话记录表，用于统计阅读时长';
COMMENT ON COLUMN reading_sessions.book_id IS '关联的书籍ID';
COMMENT ON COLUMN reading_sessions.user_id IS '用户ID';
COMMENT ON COLUMN reading_sessions.started_at IS '会话开始时间';
COMMENT ON COLUMN reading_sessions.ended_at IS '会话结束时间（可为空表示进行中）';
COMMENT ON COLUMN reading_sessions.duration_seconds IS '阅读时长（秒）';