CREATE TABLE communities.community_members (
    community_id INTEGER REFERENCES communities.communities(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(50) DEFAULT 'member', -- 'mentor' or 'member'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (community_id, user_id)
);