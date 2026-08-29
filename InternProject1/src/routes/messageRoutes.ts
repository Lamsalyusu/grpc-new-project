import express from 'express';
const messageRoutes = express.Router();
import messageControllers from '../controllers/messageController';
import authMiddleware from '../middlewares/authmiddleware';
import { validateParams, validation } from '../middlewares/validatemiddleware';
import { messageValidationSchema } from '../validators/messageValidators';
import { taskIdParamSchema } from '../validators/paramValidator';

messageRoutes.get('/:id/messages', authMiddleware, validateParams(taskIdParamSchema),messageControllers.get);
messageRoutes.post('/:id/messages', authMiddleware, validateParams(taskIdParamSchema),validation(messageValidationSchema), messageControllers.send);

export default messageRoutes;