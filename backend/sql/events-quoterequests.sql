CREATE TABLE events.quote_requests (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(id) ON DELETE CASCADE,
    book_id INT REFERENCES books.booklist(id) ON DELETE CASCADE,
    text TEXT NOT NULL,
    page_number INTEGER,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    admin_feedback TEXT, -- Optional: why it was rejected
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);