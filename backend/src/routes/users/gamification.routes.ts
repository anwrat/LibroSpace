import { Router } from "express";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";
import { evaluateDailyGoal, syncStreak, getUserStreakandGoal, adjustDailyGoal, getAchievementThisMonth, challengeFriend, respondToChallenge, getUserFriendChallenges } from "../../controllers/users/gamification.controller.js";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { updateGoalSchema, challengeFriendSchema, respondToChallengeSchema } from "../../schemas/gamification.schema.js";

const router = Router();

//For daily goal and streak related routes
router.post('/daily-goal', authenticateToken, evaluateDailyGoal);
router.post('/sync-streak', authenticateToken, syncStreak);
router.get('/info', authenticateToken, getUserStreakandGoal);
router.patch('/update-goal', authenticateToken, validate(updateGoalSchema), adjustDailyGoal);
router.get('/daily-goal/month', authenticateToken, getAchievementThisMonth);

//For friend challenges
router.post('/challenge-friend', authenticateToken, validate(challengeFriendSchema), challengeFriend);
router.post('/respond-to-challenge', authenticateToken, validate(respondToChallengeSchema), respondToChallenge);
router.get('/challenges', authenticateToken, getUserFriendChallenges);

export default router;