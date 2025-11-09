import mongoose from "mongoose";
const chatMessageSchema = new mongoose.Schema({
    room_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'ChatRoom', 
        required: true 
    },
    sender_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    content: { type: String, required: true },
    file_url: { type: String, default: '' },
    // Use timestamps for 'sent_at'
}, { timestamps: { createdAt: 'sent_at' } });
export const ChatMessageModel = mongoose.model("ChatMessage", chatMessageSchema);