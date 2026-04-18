-- 1. Function for User Leveling
CREATE OR REPLACE FUNCTION auth.handle_user_level_up()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if current XP has reached or exceeded the threshold
    WHILE NEW.xp >= NEW.next_level_xp LOOP
        NEW.level := NEW.level + 1;
        NEW.next_level_xp := NEW.next_level_xp + 100;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Trigger for User Table
DROP TRIGGER IF EXISTS trigger_user_level_up ON auth.users;
CREATE TRIGGER trigger_user_level_up
BEFORE UPDATE OF xp ON auth.users
FOR EACH ROW
EXECUTE FUNCTION auth.handle_user_level_up();

-- 3. Function for Community Leveling
CREATE OR REPLACE FUNCTION communities.handle_community_level_up()
RETURNS TRIGGER AS $$
BEGIN
    WHILE NEW.xp >= NEW.next_level_xp LOOP
        NEW.level := NEW.level + 1;
        NEW.next_level_xp := NEW.next_level_xp + 500;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 4. Trigger for Community Table
DROP TRIGGER IF EXISTS trigger_community_level_up ON communities.communities;
CREATE TRIGGER trigger_community_level_up
BEFORE UPDATE OF xp ON communities.communities
FOR EACH ROW
EXECUTE FUNCTION communities.handle_community_level_up();