ALTER TABLE auth.users
ADD CONSTRAINT users_name_unique UNIQUE (name);
