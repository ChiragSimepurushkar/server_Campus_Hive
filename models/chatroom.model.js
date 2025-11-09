import mongoose from "mongoose";
const chatRoomSchema = new mongoose.Schema({
    project_id: { // Room associated directly with a project
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        unique: true, 
        required: true 
    },
    // Optional: Array of user IDs for quick membership checks
    members: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }], 
}, { timestamps: { createdAt: 'created_at' } });
export const ChatRoomModel = mongoose.model("ChatRoom", chatRoomSchema);