import { NotificationModel } from '../models/notifications.model.js';

// 1. GET User's Notifications
export async function getNotificationsController(request, response) {
    try {
        const userId = request.userId;
        const { isRead } = request.query;
        const query = { user_id: userId };

        // Filter by read status if provided in query params
        if (isRead !== undefined) {
            query.read = isRead === 'true';
        }

        const notifications = await NotificationModel.find(query)
            .sort({ created_at: -1 }) // Newest first
            .limit(20); // Limit to 20 for dashboard display

        return response.status(200).json({ 
            success: true, 
            message: "Notifications fetched.", 
            data: notifications 
        });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 2. MARK Notification as Read (Single)
export async function markNotificationAsReadController(request, response) {
    try {
        const userId = request.userId;
        const { notificationId } = request.params;

        const updatedNotification = await NotificationModel.findOneAndUpdate(
            { _id: notificationId, user_id: userId }, // Ensure user owns the notification
            { read: true },
            { new: true }
        );

        if (!updatedNotification) {
            return response.status(404).json({ message: "Notification not found or access denied." });
        }

        return response.status(200).json({ success: true, message: "Notification marked as read." });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 3. MARK ALL Notifications as Read
export async function markAllAsReadController(request, response) {
    try {
        const userId = request.userId;

        await NotificationModel.updateMany(
            { user_id: userId, read: false }, // Find all unread notifications for the user
            { read: true }
        );

        return response.status(200).json({ success: true, message: "All notifications marked as read." });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}