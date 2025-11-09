import { Router } from 'express';
import { 
    getChatRoomController,
    getMessageHistoryController,
    postMessageController,
    deleteMessageController // Assuming a delete message controller exists
} from '../controllers/chatroom.controller.js'; // Assuming chat controllers are in one place
import auth from '../middlewares/auth.js';

const chatRouter = Router();

// --- CHAT ROOM Endpoints ---

// GET /api/chat/rooms/:projectId - Get the chat room details for a project
chatRouter.get('/rooms/:projectId', auth, getChatRoomController); 

// --- CHAT MESSAGE Endpoints ---

// GET /api/chat/messages/:roomId - Fetch message history (pagination via query params)
chatRouter.get('/messages/:roomId', auth, getMessageHistoryController); 

// POST /api/chat/messages - Send a new message (for history logging/testing)
chatRouter.post('/messages', auth, postMessageController); 

// DELETE /api/chat/messages/:messageId - Delete a specific message
chatRouter.delete('/messages/:messageId', auth, deleteMessageController);

export default chatRouter;