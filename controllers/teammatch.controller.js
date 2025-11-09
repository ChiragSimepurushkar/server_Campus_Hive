import TeamMatchModel  from '../models/teammatches.model.js';
import UserModel from '../models/user.model.js';

// 1. GET Project Match Recommendations
export async function getRecommendationsController(request, response) {
    try {
        const userId = request.userId;
        const { projectId } = request.params;

        // NOTE: The actual matching logic (AI/Algorithm) is generally run offline 
        // and its results are stored in the TeamMatchModel. 
        // This controller just queries those pre-calculated results.

        const matches = await TeamMatchModel.find({ project_id: projectId })
            .sort({ score: -1 }) // Highest score first
            .limit(10)
            .populate('recommended_user_id', 'name avatar_url college_branch skills bio');

        return response.status(200).json({
            success: true,
            message: "Team recommendations fetched.",
            data: matches
        });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 2. Get User's Dashboard Recommendations (Optional: if the algorithm recommends projects to users)
export async function getUserProjectRecommendations(request, response) {
    // This would likely involve a separate model or query but uses similar logic.
    // For simplicity, let's return a list of recommended users for the user's *own* projects.
    try {
        const userId = request.userId;
        const userProjects = await UserModel.findById(userId).select('posted_projects');

        const projectIds = userProjects.posted_projects;

        const allMatches = await TeamMatchModel.find({ project_id: { $in: projectIds } })
            .limit(20)
            .populate('recommended_user_id', 'name avatar_url skills');

        // Logic here to deduplicate and organize the matches by project
        
        return response.status(200).json({
            success: true,
            message: "Candidate recommendations for your projects.",
            data: allMatches
        });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}
