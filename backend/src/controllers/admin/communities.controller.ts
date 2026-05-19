import type{ Request, Response } from "express";
import pool from "../../config/db.js";

export const getAllCommunitiesAdmin = async (req: Request, res: Response) => {
    try {
        // Query to get community details plus the count of members
        const query = `
            SELECT 
                c.id, 
                c.name, 
                c.description, 
                c.photo_url AS image_url, 
                c.created_at, 
                c.level,
                c.xp,
                COUNT(m.user_id)::INT AS member_count
            FROM communities.communities c
            LEFT JOIN communities.community_members m ON c.id = m.community_id
            GROUP BY c.id
            ORDER BY c.created_at DESC
        `;

        const result = await pool.query(query);

        res.status(200).json({
            success: true,
            data: result.rows
        });
    } catch (err) {
        console.error("Admin Communities Error:", err);
        res.status(500).json({ 
            success: false, 
            message: "Internal server error" 
        });
    }
};