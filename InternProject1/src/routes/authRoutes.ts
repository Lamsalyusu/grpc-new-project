import express from "express";
const router = express.Router();
import { authLimiter } from "../middlewares/rateLimiter";
import authController from "../controllers/authController";
import authMiddleware from "../middlewares/authmiddleware";
import { validation } from "../middlewares/validatemiddleware";
import { registerSchema, loginSchema } from "../validators/authValidator";

router.post("/register", authLimiter, validation(registerSchema), authController.register);
router.post("/login", authLimiter, validation(loginSchema), authController.login);
router.get("/me", authMiddleware, authController.me);

export default router;
