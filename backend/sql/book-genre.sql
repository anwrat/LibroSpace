-- 1. Create the Genres table
CREATE TABLE books.genres (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create the Junction Table (links books and genres)
CREATE TABLE books.book_genres (
    book_id INT REFERENCES books.booklist(id) ON DELETE CASCADE,
    genre_id INT REFERENCES books.genres(id) ON DELETE CASCADE,
    PRIMARY KEY (book_id, genre_id)
);