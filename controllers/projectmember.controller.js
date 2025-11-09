import { ProjectMemberModel } from '../models/projectmembers.model.js';
import { ProjectModel } from '../models/project.model.js';
import UserModel from '../models/user.model.js';

// 1. GET Members of a Specific Project
export async function getProjectMembersController(request, response) {
    try {
        const { projectId } = request.params;

        const members = await ProjectMemberModel.find({ project_id: projectId })
            .populate('user_id', 'name avatar_url college_branch skills');

        return response.status(200).json({ success: true, data: members });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 2. REMOVE a Member from a Project
export async function removeProjectMemberController(request, response) {
    try {
        const ownerId = request.userId;
        const { projectId, userIdToRemove } = request.body;

        // 1. Authorization: Verify the request maker (ownerId) is the project owner
        const project = await ProjectModel.findById(projectId);
        if (!project || project.owner_id.toString() !== ownerId.toString()) {
            return response.status(403).json({ message: "Only the project owner can remove members." });
        }

        // 2. Remove from ProjectMember table
        const result = await ProjectMemberModel.deleteOne({ 
            project_id: projectId, 
            user_id: userIdToRemove 
        });

        if (result.deletedCount === 0) {
            return response.status(404).json({ message: "Member not found in project." });
        }

        // 3. Update Project and User documents
        await ProjectModel.findByIdAndUpdate(projectId, { $inc: { member_count: -1 } });
        await UserModel.findByIdAndUpdate(userIdToRemove, {
             $pull: { joined_teams: projectId }
        });

        return response.status(200).json({ success: true, message: "Member removed successfully." });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

export async function addProjectMemberController(request, response) {
    try {
        const ownerId = request.userId; // The user initiating the action
        const { projectId, userIdToAdd, role = 'Collaborator' } = request.body;

        // 1. Authorization: Verify the request maker (ownerId) is the project owner
        const project = await ProjectModel.findById(projectId);
        if (!project || project.owner_id.toString() !== ownerId.toString()) {
            return response.status(403).json({ message: "Only the project owner can add members." });
        }

        // 2. Check if user is already a member
        const existingMember = await ProjectMemberModel.findOne({ project_id: projectId, user_id: userIdToAdd });
        if (existingMember) {
            return response.status(409).json({ message: "User is already a member of this project." });
        }
        
        // 3. Create the membership record
        await ProjectMemberModel.create({ 
            project_id: projectId, 
            user_id: userIdToAdd, 
            role 
        });

        // 4. Update Project and User documents
        await ProjectModel.findByIdAndUpdate(projectId, { $inc: { member_count: 1 } });
        await UserModel.findByIdAndUpdate(userIdToAdd, {
             $push: { joined_teams: projectId }
        });
        
        // Optional: Trigger notification to the added user
        
        return response.status(200).json({ success: true, message: "Member added successfully." });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}