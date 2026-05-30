import { Router } from "express";
import {
  getCharacterGreeting,
  getCharacterResponse,
} from "../../controllers/users/ollama.controller.js";
import { authenticateToken } from "../../middleware/auth/auth.middleware.js";

const aiRouter = Router();

aiRouter.post("/greeting", authenticateToken, getCharacterGreeting);
aiRouter.post("/response", authenticateToken, getCharacterResponse);

export default aiRouter;
