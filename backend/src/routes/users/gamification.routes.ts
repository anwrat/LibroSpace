import { Router } from "express";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { evaluateDailyGoal, syncStreak, getUserStreakandGoal, adjustDailyGoal } from "../../controllers/users/gamification.controller.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { updateGoalSchema } from "../../schemas/gamification.schema.js";

const router = Router();

router.post('/daily-goal', authenticateToken, evaluateDailyGoal);
router.post('/sync-streak', authenticateToken, syncStreak);
router.get('/info', authenticateToken, getUserStreakandGoal);
router.patch('/update-goal', authenticateToken, validate(updateGoalSchema), adjustDailyGoal);

export default router;