import { Router } from 'express';
import { 
    createCommentController, 
    getProjectCommentsController, 
    deleteCommentController 
} from '../controllers/comments.controller.js';
import { toggleUpvoteController } from '../controllers/upvote.controller.js';
import { toggleBookmarkController, getBookmarksController } from '../controllers/bookmark.controller.js';
import auth from '../middlewares/auth.js';

const interactionRouter = Router();

// --- COMMENTS (Nested under Project) ---
// POST /api/interactions/comments
interactionRouter.post('/comments', auth, createCommentController); 
// GET /api/interactions/comments/:projectId
interactionRouter.get('/comments/:projectId', getProjectCommentsController);
// DELETE /api/interactions/comments/:commentId
interactionRouter.delete('/comments/:commentId', auth, deleteCommentController); 

// --- UPVOTES ---
// POST /api/interactions/upvote (Toggles the upvote status)
interactionRouter.post('/upvote', auth, toggleUpvoteController); 

// --- BOOKMARKS ---
// POST /api/interactions/bookmark (Toggles the bookmark status)
interactionRouter.post('/bookmark', auth, toggleBookmarkController); 
// GET /api/interactions/bookmarks/user
interactionRouter.get('/bookmarks/user', auth, getBookmarksController);

export default interactionRouter;