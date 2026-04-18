import pool from "../config/db.js";

const XP_CONFIG: { [key: string]: { user: number; community: number } } = {
    'QUOTE_SUBMISSION': { user: 50, community: 0 },
};

export const awardActivityXP = async (userId: number, activityType: string, communityId: number | null = null) => {
    const reward = XP_CONFIG[activityType] || { user: 0, community: 0 };

    try {
        await pool.query('BEGIN');

        // 1. Update User XP
        const userResult = await pool.query(
            `UPDATE auth.users SET xp = xp + $1 WHERE id = $2 
             RETURNING id, level, xp, next_level_xp`,
            [reward.user, userId]
        );

        // 2. Update Community XP (Only if communityId is provided and reward > 0)
        let communityData = null;
        if (communityId && reward.community > 0) {
            const communityResult = await pool.query(
                `UPDATE communities.communities SET xp = xp + $1 WHERE id = $2 
                 RETURNING id, level, xp, next_level_xp`,
                [reward.community, communityId]
            );
            communityData = communityResult.rows[0];
        }

        // 3. Log the contribution
        await pool.query(
            `INSERT INTO events.activity_log 
             (user_id, community_id, activity_type, user_xp_earned, community_xp_earned, is_community_contribution) 
             VALUES ($1, $2, $3, $4, $5, $6)`,
            [
                userId, 
                communityId, 
                activityType, 
                reward.user, 
                reward.community, 
                !!(communityId && reward.community > 0)
            ]
        );

        await pool.query('COMMIT');

        return {
            user: userResult.rows[0],
            community: communityData,
            rewardEarned: reward
        };
    } catch (error) {
        await pool.query('ROLLBACK');
        console.error("Gamification Error:", error);
        throw error;
    }
};