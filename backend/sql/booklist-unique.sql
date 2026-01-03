-- Combination of title and author should be unique
ALTER TABLE books.booklist ADD CONSTRAINT unique_book_entry UNIQUE (title, author);