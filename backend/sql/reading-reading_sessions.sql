CREATE TABLE reading.reading_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id INTEGER REFERENCES books.booklist(id) ON DELETE CASCADE,
    start_time TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    end_time TIMESTAMPTZ,
    duration_seconds INTEGER DEFAULT 0, 
    start_page INTEGER,
    end_page INTEGER,
    notes TEXT DEFAULT '',
    status VARCHAR(20) DEFAULT 'active' -- 'active', 'paused', 'completed'
);