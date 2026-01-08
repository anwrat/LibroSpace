CREATE TABLE books.user_shelves (
  id SERIAL PRIMARY KEY,
  user_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id INTEGER REFERENCES books.booklist(id) ON DELETE CASCADE,
  shelf books.shelf_type NOT NULL,
  progress INTEGER DEFAULT 0, -- percentage (0–100)
  started_at TIMESTAMPTZ,
  finished_at TIMESTAMPTZ,
  UNIQUE (user_id, book_id)
);