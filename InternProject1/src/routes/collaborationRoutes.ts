import express from 'express';
const collaborationrouter = express.Router();
import collaborationController from '../controllers/collaborationControllers';
// import CollaborationClient from '../grpc-client/collaborationClient';

collaborationrouter.get('/requests',collaborationController.seeReq)
collaborationrouter.post('/request', collaborationController.sendReq);
collaborationrouter.patch('/request/:id/accept',collaborationController.acceptReq)
collaborationrouter.patch('/request/:id/reject',collaborationController.rejectReq)
collaborationrouter.delete('/:targetUserId',collaborationController.deleteCol)
collaborationrouter.get('/collaborators',collaborationController.viewCollaborators);

export default collaborationrouter;