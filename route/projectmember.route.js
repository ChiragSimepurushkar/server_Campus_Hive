import { Router } from 'express';
import { 
    addProjectMemberController,
    removeProjectMemberController,
    getProjectMembersController
} from '../controllers/projectmember.controller.js';
import auth from '../middlewares/auth.js'; 

const memberRouter = Router();

// GET /api/members/:projectId - Get all members for a project
memberRouter.get('/:projectId', getProjectMembersController); 

// POST /api/members/add - Add a member to a project (Owner action)
memberRouter.post('/add', auth, addProjectMemberController); 

// DELETE /api/members/remove - Remove a member from a project (Owner action)
memberRouter.delete('/remove', auth, removeProjectMemberController); 

export default memberRouter;