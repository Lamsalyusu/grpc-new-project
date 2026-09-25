import express from 'express';
const collaborationrouter = express.Router();
import CollaborationController from '../controllers/collaborationControllers';
// import CollaborationClient from '../grpc-client/collaborationClient';

collaborationrouter.get('/requests',CollaborationController.seeReq)
collaborationrouter.post('/request', CollaborationController.sendReq);
collaborationrouter.patch('/request/:id/accept',CollaborationController.acceptReq)
collaborationrouter.patch('/request/:id/reject',CollaborationController.rejectReq)
collaborationrouter.delete('/:id',CollaborationController.deleteCol)
collaborationrouter.get('/collaborators',CollaborationController.viewCollaborators);

export default collaborationrouter;