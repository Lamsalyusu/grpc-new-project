import express from 'express';
const collaborationrouter = express.Router();
import CollaborationController from '../controllers/collaborationControllers';

collaborationrouter.get('/requests',CollaborationController.seeReq)
collaborationrouter.post('/request', CollaborationController.sendReq);
collaborationrouter.patch('/request/:id/accept',CollaborationController.acceptReq)
collaborationrouter.patch('/request/:id/reject',CollaborationController.rejectReq)

export default collaborationrouter;