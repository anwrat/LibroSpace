import pool from "../../config/db.js";

export const createCommunity = async (
  name: string,
  description: string,
  photo_url: string,
  created_by: number,
) => {
  const result = await pool.query(
    "INSERT INTO communities.communities (name, description, photo_url, created_by) VALUES ($1,$2,$3,$4) RETURNING *",
    [name, description, photo_url, created_by],
  );
  const assignMentor = await pool.query(
    "INSERT INTO communities.community_members (community_id, user_id, role) VALUES ($1,$2,$3) RETURNING *",
    [result.rows[0].id, created_by, "mentor"],
  );
  return result.rows[0];
};

export const checkIfCommunityExists = async (name: string) => {
  const result = await pool.query(
    "SELECT * FROM communities.communities WHERE name = $1",
    [name],
  );
  return result.rows;
};

export const addMemberToCommunity = async (
  user_id: number,
  community_id: number,
) => {
  const result = await pool.query(
    "INSERT INTO communities.community_members (community_id, user_id, role) VALUES ($1,$2,$3) RETURNING *",
    [community_id, user_id, "member"],
  );
  return result.rows[0];
};

export const leaveCommunity = async (user_id: number, community_id: number) => {
  const result = await pool.query(
    "DELETE FROM communities.community_members WHERE user_id = $1 AND community_id = $2",
    [user_id, community_id],
  );
  return result.rows[0];
};

export const getAllCommunities = async () => {
  const queryText = `
        SELECT 
            c.*, 
            COUNT(cm.user_id)::INT AS member_count
        FROM communities.communities c
        LEFT JOIN communities.community_members cm ON c.id = cm.community_id
        GROUP BY c.id;
    `;
  const result = await pool.query(queryText);
  return result.rows;
};

export const joinedCommunities = async (user_id: number) => {
  const queryText = `
        SELECT 
            c.*, 
            membership.role,
            (
                SELECT COUNT(*)::INT 
                FROM communities.community_members 
                WHERE community_id = c.id
            ) AS member_count
        FROM communities.communities c 
        JOIN communities.community_members membership ON c.id = membership.community_id 
        WHERE membership.user_id = $1;
    `;
  const result = await pool.query(queryText, [user_id]);
  return result.rows;
};

export const getCommunitybyID = async (id: number) => {
  const queryText = `
        SELECT 
            *, 
            (
                SELECT COUNT(*)::INT 
                FROM communities.community_members 
                WHERE community_id = communities.id
            ) AS member_count
        FROM communities.communities 
        WHERE id = $1;
    `;
  const result = await pool.query(queryText, [id]);
  return result.rows[0];
};

export const isUserMember = async (user_id: number, community_id: number) => {
  const result = await pool.query(
    "SELECT * FROM communities.community_members WHERE user_id = $1 AND community_id = $2",
    [user_id, community_id],
  );
  return result.rows;
};
