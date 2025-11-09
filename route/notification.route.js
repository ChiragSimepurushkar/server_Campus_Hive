import { Router } from 'express';
import { 
    getNotificationsController, 
    markNotificationAsReadController, 
    markAllAsReadController 
} from '../controllers/notifications.controller.js';
import auth from '../middlewares/auth.js';

const notificationRouter = Router();

// GET /api/notifications (Fetch user notifications, filterable by read status)
notificationRouter.get('/', auth, getNotificationsController);

// PUT /api/notifications/:notificationId/read (Mark a single notification as read)
notificationRouter.put('/:notificationId/read', auth, markNotificationAsReadController);

// PUT /api/notifications/read-all (Mark all notifications as read)
notificationRouter.put('/read-all', auth, markAllAsReadController);

export default notificationRouter;