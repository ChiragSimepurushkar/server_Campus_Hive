import { BookmarkModel } from '../models/bookmark.model.js';
import { ProjectModel } from '../models/project.model.js';

// 1. Toggle Bookmark (Add or Remove)
export async function toggleBookmarkController(request, response) {
    try {
        const user_id = request.userId;
        const { project_id } = request.body;

        if (!project_id) {
            return response.status(400).json({ message: "Project ID is required." });
        }

        const existingBookmark = await BookmarkModel.findOne({ project_id, user_id });
        let message;

        if (existingBookmark) {
            // Remove bookmark
            await BookmarkModel.deleteOne({ _id: existingBookmark._id });
            message = "Project removed from bookmarks.";
        } else {
            // Add bookmark
            await BookmarkModel.create({ project_id, user_id });
            message = "Project bookmarked successfully.";
        }

        // Note: No need to update Project count, as bookmarks are user-specific data.

        return response.status(200).json({ success: true, message: message, bookmarked: !existingBookmark });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 2. GET User's Bookmarked Projects
export async function getBookmarksController(request, response) {
    try {
        const user_id = request.userId;

        const bookmarks = await BookmarkModel.find({ user_id })
            .sort({ created_at: -1 })
            .populate('project_id'); // Populate the full project object

        // Extract just the project data
        const bookmarkedProjects = bookmarks.map(bookmark => bookmark.project_id);

        return response.status(200).json({ success: true, data: bookmarkedProjects });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}