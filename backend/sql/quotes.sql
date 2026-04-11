-- Table to store quotes added by admin
CREATE TABLE books.book_quotes (
    id SERIAL PRIMARY KEY,
    book_id INT REFERENCES books.booklist(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    page_number INT, -- Optional
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table for users to save their favorite quotes
CREATE TABLE books.saved_quotes (
    id SERIAL PRIMARY KEY,
    user_id INT REFERENCES auth.users(id) ON DELETE CASCADE,
    quote_id INT REFERENCES books.book_quotes(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, quote_id) -- Prevents saving the same quote twice
);