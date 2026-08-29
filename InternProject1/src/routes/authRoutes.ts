import express from 'express';
const router = express.Router();
import limit from '../middlewares/rateLimiter';
import authController from '../controllers/authController';
import authMiddleware from '../middlewares/authmiddleware';
import {validation} from '../middlewares/validatemiddleware'
import { registerSchema,loginSchema } from '../validators/authValidator';

// import { registerSchema, loginSchema } from '../validators/authValidator';
router.post('/register',validation(registerSchema),authController.register);
router.post('/login',validation(loginSchema),authController.login);
// router.get('/me',authMiddleware,authController.me)

export default router;