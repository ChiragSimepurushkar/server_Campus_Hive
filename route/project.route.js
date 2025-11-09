import { Router } from 'express';
import { 
    createProjectController, 
    getProjectsController, 
    getProjectByIdController, // Assumed controller
    updateProjectController, // Assumed controller
    deleteProjectController,
} from '../controllers/project.controller.js';
import auth from '../middlewares/auth.js'; 

const projectRouter = Router();

// CRUD Operations for Projects
projectRouter.post('/', auth, createProjectController); // POST /api/projects
projectRouter.get('/', getProjectsController);         // GET /api/projects (with filtering/search in query params)
projectRouter.get('/:projectId', getProjectByIdController); // GET /api/projects/:projectId
projectRouter.put('/:projectId', auth, updateProjectController); // PUT /api/projects/:projectId
projectRouter.delete('/:projectId', auth, deleteProjectController); // DELETE /api/projects/:projectId

export default projectRouter;
//dummy