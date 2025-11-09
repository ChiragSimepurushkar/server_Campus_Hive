import mongoose from "mongoose";
const notificationSchema = new mongoose.Schema({
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    type: { // e.g., 'new_comment', 'team_invite', 'upvote'
        type: String, 
        required: true 
    },
    data: { // Stores specific data like project_id, comment_id, etc.
        type: mongoose.Schema.Types.Mixed, 
        default: {} 
    }, 
    read: { 
        type: Boolean, 
        default: false 
    },
    target_link: { // URL to redirect user when clicking the notification
        type: String, 
        required: true 
    }
}, { timestamps: { createdAt: 'created_at' } });

// Index for fast lookup of a user's unread notifications
notificationSchema.index({ user_id: 1, read: 1 });
export const NotificationModel = mongoose.model("Notification", notificationSchema);