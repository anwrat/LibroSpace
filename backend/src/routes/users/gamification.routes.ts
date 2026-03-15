import { Router } from "express";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { evaluateDailyGoal, syncStreak, getUserStreakandGoal } from "../../controllers/users/gamification.controller.js";

const router = Router();

router.post('/daily-goal', authenticateToken, evaluateDailyGoal);
router.post('/sync-streak', authenticateToken, syncStreak);
router.get('/info', authenticateToken, getUserStreakandGoal);

export default router;