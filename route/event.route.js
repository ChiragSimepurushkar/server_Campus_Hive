import { Router } from 'express';
import { 
    createEventController, 
    getEventsController,
    getEventByIdController, // Assumed controller
    updateEventController, // Assumed controller
    deleteEventController, // Assumed controller
    uploadEventImageController
} from '../controllers/events.controller.js';
import auth from '../middlewares/auth.js';
import upload from '../middlewares/multer.js';

const eventRouter = Router();

// Event CRUD
eventRouter.post('/', auth, createEventController); // POST /api/events
eventRouter.get('/', getEventsController);          // GET /api/events (with filtering by domain, location, date)
eventRouter.get('/:eventId', getEventByIdController); // GET /api/events/:eventId
eventRouter.put('/:eventId', auth, updateEventController); // PUT /api/events/:eventId
eventRouter.delete('/:eventId', auth, deleteEventController); // DELETE /api/events/:eventId
eventRouter.put('/events/:eventId/upload-image', auth, upload.single('image'), uploadEventImageController);
export default eventRouter;