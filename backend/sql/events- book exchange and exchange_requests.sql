-- 1. The main listings for the exchange event
CREATE TABLE events.book_exchanges (
    id SERIAL PRIMARY KEY,
    user_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE,
    book_title VARCHAR(255) NOT NULL,
    book_author VARCHAR(255),
    condition VARCHAR(50) CHECK (condition IN ('New', 'Like New', 'Good', 'Fair', 'Worn')),
    location_city VARCHAR(100) NOT NULL,
    description TEXT,
    image_url TEXT,
    status VARCHAR(20) DEFAULT 'available', -- 'available', 'exchanged', 'hidden'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. To track when someone wants to swap
CREATE TABLE events.exchange_requests (
    id SERIAL PRIMARY KEY,
    sender_id INTEGER REFERENCES auth.users(id),
    receiver_id INTEGER REFERENCES auth.users(id),
    listing_id INTEGER REFERENCES events.book_exchanges(id),
    message TEXT,
    status VARCHAR(20) DEFAULT 'pending', -- 'pending', 'accepted', 'declined'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);