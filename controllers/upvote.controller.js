import { UpvoteModel } from '../models/upvote.model.js';
import { ProjectModel } from '../models/project.model.js';

// Toggle Upvote (Like/Unlike functionality)
export async function toggleUpvoteController(request, response) {
    try {
        const user_id = request.userId;
        const { project_id } = request.body;

        if (!project_id) {
            return response.status(400).json({ message: "Project ID is required." });
        }

        const existingUpvote = await UpvoteModel.findOne({ project_id, user_id });
        let message, change;

        if (existingUpvote) {
            // Remove upvote (Unlike)
            await UpvoteModel.deleteOne({ _id: existingUpvote._id });
            change = -1;
            message = "Project unvoted.";
        } else {
            // Add upvote (Like)
            await UpvoteModel.create({ project_id, user_id });
            change = 1;
            message = "Project upvoted successfully.";
        }

        // Update the upvote count on the Project document (Denormalization)
        await ProjectModel.findByIdAndUpdate(project_id, { $inc: { upvote_count: change } });

        return response.status(200).json({ success: true, message: message, upvoted: !existingUpvote });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// Get Upvote Status for a user/project
export async function getUpvoteStatusController(request, response) {
    try {
        const user_id = request.userId;
        const { project_id } = request.query;

        if (!project_id) {
            return response.status(400).json({ message: "Project ID is required." });
        }

        const isUpvoted = await UpvoteModel.exists({ project_id, user_id });

        return response.status(200).json({ 
            success: true, 
            isUpvoted: !!isUpvoted 
        });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}