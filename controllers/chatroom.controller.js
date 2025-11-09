import { ChatRoomModel } from '../models/chatroom.model.js';
import { ChatMessageModel } from '../models/chatmessages.model.js';
import { ProjectModel } from '../models/project.model.js';
// NOTE: For a production app, real-time message handling (send/receive) 
// is managed by a WebSocket framework like Socket.io, not standard REST controllers.
// These controllers handle initial fetching and history retrieval.

// 1. CREATE Chat Room (Called when a Project is created)
export async function createChatRoomController(project_id, member_ids) {
    try {
        const existingRoom = await ChatRoomModel.findOne({ project_id });
        if (existingRoom) {
            return { success: false, message: "Room already exists." };
        }

        const newRoom = await ChatRoomModel.create({
            project_id: project_id,
            members: member_ids // Initial members (e.g., the owner)
        });

        return { success: true, room: newRoom };
    } catch (error) {
        console.error("Error creating chat room:", error.message);
        return { success: false, message: "Failed to create chat room." };
    }
}

// 2. GET Chat Room Details
export async function getChatRoomController(request, response) {
    try {
        const { projectId } = request.params;
        const room = await ChatRoomModel.findOne({ project_id: projectId })
            .populate('members', 'name avatar_url');

        if (!room) {
            return response.status(404).json({ message: "Chat room not found for this project." });
        }
        
        // Authorization check: Ensure the request.userId is one of the room members before returning
        if (!room.members.some(member => member._id.toString() === request.userId.toString())) {
             return response.status(403).json({ message: "Access denied." });
        }

        return response.status(200).json({ success: true, data: room });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 3. GET Message History (`chat_messages` table logic)
export async function getMessageHistoryController(request, response) {
    try {
        const { roomId } = request.params;
        const { limit = 50, skip = 0 } = request.query;

        // Note: You should authorize access here first (check if request.userId is in the room)

        const messages = await ChatMessageModel.find({ room_id: roomId })
            .sort({ sent_at: -1 }) // Newest first
            .limit(parseInt(limit))
            .skip(parseInt(skip))
            .populate('sender_id', 'name avatar_url');

        return response.status(200).json({ success: true, data: messages.reverse() }); // Reverse for chronological view
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

export async function postMessageController(request, response) {
    try {
        const sender_id = request.userId;
        const { room_id, content, file_url } = request.body;

        if (!room_id || !content) {
            return response.status(400).json({ message: "Room ID and content are required." });
        }

        // 1. Basic check if the room exists
        const room = await ChatRoomModel.findById(room_id);
        if (!room) {
            return response.status(404).json({ message: "Chat room not found." });
        }
        
        // 2. Create the message using the ChatMessageModel
        const newMessage = await ChatMessageModel.create({
            room_id,
            sender_id,
            content,
            file_url
        });

        // 3. Success response
        return response.status(201).json({ success: true, message: "Message sent (logged).", data: newMessage });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

export async function deleteMessageController(request, response) {
    try {
        const userId = request.userId;
        const { messageId } = request.params;

        const message = await ChatMessageModel.findById(messageId);
        
        if (!message) {
            return response.status(404).json({ message: "Message not found." });
        }

        // Authorization: Only the sender can delete the message
        if (message.sender_id.toString() !== userId.toString()) {
            // Optional: You could allow Admins/Project Owners to delete messages here too
            return response.status(403).json({ message: "You can only delete your own messages." });
        }

        await ChatMessageModel.deleteOne({ _id: messageId });

        return response.status(200).json({ success: true, message: "Message deleted successfully." });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}