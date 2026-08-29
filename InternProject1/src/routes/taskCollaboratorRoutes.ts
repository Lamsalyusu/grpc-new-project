import express from 'express';
const taskCollaboratorRouter = express.Router();
import taskCollaboratorController from '../controllers/taskCollaboratorController';
import { collaboratorschema } from '../validators/taskCollaboratorValidator';
import { validateParams, validation } from '../middlewares/validatemiddleware';
import authMiddleware from '../middlewares/authmiddleware';
import { collaboratorParamsSchema, taskIdParamSchema } from '../validators/paramValidator';

taskCollaboratorRouter.post('/:id/collaborators', authMiddleware, validateParams(taskIdParamSchema), validation(collaboratorschema), taskCollaboratorController.create);
taskCollaboratorRouter.get('/:id/collaborators', authMiddleware, validateParams(taskIdParamSchema), taskCollaboratorController.getCollaborator);
taskCollaboratorRouter.delete('/:id/collaborators/:userId', authMiddleware, validateParams(collaboratorParamsSchema), taskCollaboratorController.deleteCollaborators);
taskCollaboratorRouter.get('/shared-with-me', authMiddleware, taskCollaboratorController.getSharedTasks);
export default taskCollaboratorRouter;