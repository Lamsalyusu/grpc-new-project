import express from 'express';
const taskrouter = express.Router();

import taskController from '../controllers/taskController';
import authMiddleware from '../middlewares/authmiddleware';
import {validation,validateQuery, validateParams} from '../middlewares/validatemiddleware';
import { taskSchema, taskQuery } from '../validators/taskValidator';
import { taskIdParamSchema } from '../validators/paramValidator';

taskrouter.post('/', authMiddleware, validation(taskSchema), taskController.create);
taskrouter.get('/', authMiddleware, validateQuery(taskQuery), taskController.getAll);
taskrouter.get('/:id', authMiddleware,validateParams(taskIdParamSchema), taskController.getone);
taskrouter.put('/:id', authMiddleware, validation(taskSchema),validateParams(taskIdParamSchema), taskController.update);
taskrouter.delete('/:id', authMiddleware, validateParams(taskIdParamSchema),taskController.remove);   

export default taskrouter;