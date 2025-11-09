import { CommentModel } from '../models/comments.model.js';
import { ProjectModel } from '../models/project.model.js';

// 1. CREATE Comment
export async function createCommentController(request, response) {
    try {
        const user_id = request.userId;
        const { project_id, content, parent_comment_id } = request.body;

        if (!project_id || !content) {
            return response.status(400).json({ message: "Project ID and content are required." });
        }
        
        const newComment = await CommentModel.create({
            project_id,
            user_id,
            content,
            parent_comment_id: parent_comment_id || null
        });

        // Update comment count on Project document
        await ProjectModel.findByIdAndUpdate(project_id, { $inc: { comment_count: 1 } });

        // Optional: Trigger a notification for the project owner

        return response.status(201).json({ success: true, message: "Comment posted.", data: newComment });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 2. READ (Get Comments for a Project)
export async function getProjectCommentsController(request, response) {
    try {
        const { project_id } = request.params;

        const comments = await CommentModel.find({ project_id })
            .sort({ created_at: 1 }) // Chronological order
            .populate('user_id', 'name avatar_url'); // Show who posted

        return response.status(200).json({ success: true, data: comments });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 3. DELETE Comment
export async function deleteCommentController(request, response) {
    try {
        const user_id = request.userId;
        const { comment_id } = request.params;

        const comment = await CommentModel.findById(comment_id);

        if (!comment) {
            return response.status(404).json({ message: "Comment not found." });
        }

        // Authorization: Only the original poster can delete the comment
        if (comment.user_id.toString() !== user_id.toString()) {
            return response.status(403).json({ message: "Unauthorized to delete this comment." });
        }

        await CommentModel.deleteOne({ _id: comment_id });
        await ProjectModel.findByIdAndUpdate(comment.project_id, { $inc: { comment_count: -1 } });

        return response.status(200).json({ success: true, message: "Comment deleted successfully." });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}