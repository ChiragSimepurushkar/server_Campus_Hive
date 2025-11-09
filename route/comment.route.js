import { Router } from 'express';
import { 
    createCommentController, 
    getProjectCommentsController, 
    deleteCommentController 
} from '../controllers/comments.controller.js';
import auth from '../middlewares/auth.js';

const commentRouter = Router();

// POST /api/comments
commentRouter.post('/', auth, createCommentController); 

// GET /api/comments/:projectId - Get all comments for a specific project
commentRouter.get('/:projectId', getProjectCommentsController); 

// DELETE /api/comments/:commentId
commentRouter.delete('/:commentId', auth, deleteCommentController); 

export default commentRouter;