-- Statuses: 0 = Pending, 1 = Accepted, 2 = Blocked
CREATE TABLE friends.friendships (
    id SERIAL PRIMARY KEY,
    requester_id INTEGER NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    addressee_id INTEGER NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    status SMALLINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    -- Prevents duplicate requests/friendships between the same two people
    UNIQUE (requester_id, addressee_id),
    -- Ensure a user can't friend themselves
    CHECK (requester_id <> addressee_id)
);