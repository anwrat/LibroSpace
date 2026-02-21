import { Router } from "express";
import { validate } from "../../middleware/validation/validate.middleware.js";
import { startReadingSession, updateSessionNotes, endReadingSession, getSession } from "../../controllers/users/reading.controller.js";
import { StartSessionSchema, UpdateNotesSchema, EndSessionSchema } from "../../schemas/reading.schema.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";

const router = Router();

router.post('/start', authenticateToken, validate(StartSessionSchema), startReadingSession);
router.patch('/notes',authenticateToken,validate(UpdateNotesSchema), updateSessionNotes);
router.post('/end',authenticateToken,validate(EndSessionSchema), endReadingSession);
router.get('/:session_id',authenticateToken,getSession);

export default router;