import pool from "../../config/db.js";

export const getAllMembersByCommunityId = async (community_id: number) => {
    const members = await pool.query('SELECT u.id, u.name, u.email, cm.role FROM communities.community_members cm JOIN auth.users u ON cm.user_id = u.id WHERE cm.community_id = $1', [community_id]);
    return members.rows;
}

export const checkMemberRole = async (user_id: number, community_id: number) => {
    const role = await pool.query('SELECT role FROM communities.community_members WHERE user_id = $1 AND community_id = $2', [user_id, community_id]);
    return role.rows[0]?.role;
}

export const assignRoleToMember = async (user_id: number, community_id: number, role: string) => {
    await pool.query('UPDATE communities.community_members SET role = $1 WHERE user_id = $2 AND community_id = $3', [role, user_id, community_id]);
}