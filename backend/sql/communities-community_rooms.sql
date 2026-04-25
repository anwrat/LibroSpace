CREATE TABLE communities.community_rooms (
    id SERIAL PRIMARY KEY,
    community_id INTEGER REFERENCES communities.communities(id),
    host_id INTEGER REFERENCES auth.users(id),
    book_id INTEGER REFERENCES books.booklist(id),
    is_active BOOLEAN DEFAULT true,
    started_at TIMESTAMP DEFAULT NOW()
);