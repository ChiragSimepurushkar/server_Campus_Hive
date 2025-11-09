import { Router } from 'express';
import { 
    getRecommendationsController, 
    getUserProjectRecommendations 
} from '../controllers/teammatch.controller.js';
import auth from '../middlewares/auth.js';

const matchRouter = Router();

// GET /api/matchmaking/project/:projectId (Get user recommendations for a specific project)
matchRouter.get('/project/:projectId', auth, getRecommendationsController);

// GET /api/matchmaking/user/projects (Get candidate recommendations for the logged-in user's projects)
matchRouter.get('/user/projects', auth, getUserProjectRecommendations);

export default matchRouter;