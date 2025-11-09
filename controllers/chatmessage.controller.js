import { ChatMessageModel } from '../models/chatmessages.model.js';
import { ChatRoomModel } from '../models/chatroom.model.js';
// import { NotificationModel } from '../models/notifications.model.js'; // Optional import for generating notifications

// 1. CREATE Message (Used for initial creation/testing, typically replaced by a Socket.io event)
export async function postMessageController(request, response) {
    try {
        const sender_id = request.userId;
        const { room_id, content, file_url } = request.body;

        if (!room_id || !content) {
            return response.status(400).json({ message: "Room ID and content are required." });
        }

        // 1. Check if the room exists and if the user is a member
        const room = await ChatRoomModel.findById(room_id);
        if (!room) {
            return response.status(404).json({ message: "Chat room not found." });
        }
        
        // In a full implementation, you'd check membership here:
        // if (!room.members.includes(sender_id)) { 
        //     return response.status(403).json({ message: "You are not a member of this chat room." }); 
        // }

        // 2. Create the message
        const newMessage = await ChatMessageModel.create({
            room_id,
            sender_id,
            content,
            file_url
        });

        // 3. Optional: Trigger notifications for other members of the room
        // await createNotificationForRoomMembers(room_id, sender_id, newMessage);

        // 4. Send response (typically, the WebSocket acknowledgment handles the immediate update)
        return response.status(201).json({ success: true, message: "Message sent (to history).", data: newMessage });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 2. READ Message History (Used for scrolling up/loading previous messages)
export async function getMessageHistoryController(request, response) {
    try {
        const userId = request.userId;
        const { roomId } = request.params;
        const { limit = 50, skip = 0 } = request.query;

        // Authorization: Check if the user is authorized to view this room
        const room = await ChatRoomModel.findById(roomId);
        if (!room) {
            return response.status(404).json({ message: "Chat room not found." });
        }
        
        // Placeholder for membership check
        // if (!room.members.some(member => member._id.toString() === userId.toString())) {
        //     return response.status(403).json({ message: "Access denied." });
        // }

        const messages = await ChatMessageModel.find({ room_id: roomId })
            .sort({ sent_at: -1 }) // Get newest messages first
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate('sender_id', 'name avatar_url');

        // Note: You usually reverse the order on the client side to show oldest at the top of the view.
        return response.status(200).json({ 
            success: true, 
            data: messages.reverse(), 
            message: "Message history fetched."
        });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}