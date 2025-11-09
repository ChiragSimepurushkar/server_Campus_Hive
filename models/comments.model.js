import mongoose from "mongoose";
const commentSchema = new mongoose.Schema({
    project_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content: { type: String, required: true },
    // Optional: for nested replies
    parent_comment_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Comment', 
        default: null 
    },
}, { timestamps: { createdAt: 'created_at' } });

export const CommentModel = mongoose.model("Comment", commentSchema);