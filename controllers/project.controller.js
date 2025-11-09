import { ProjectModel } from '../models/project.model.js';
import UserModel  from '../models/user.model.js';
import { ProjectMemberModel } from '../models/projectmembers.model.js';

// 1. CREATE Project
export async function createProjectController(request, response) {
    try {
        const owner_id = request.userId;
        const { title, description, tags, required_skills, status } = request.body;

        if (!title || !description || !required_skills) {
            return response.status(400).json({ 
                success: false,
                message: "Title, description, and required skills are mandatory." 
            });
        }

        const newProject = await ProjectModel.create({
            owner_id,
            title,
            description,
            tags,
            required_skills,
            status,
            member_count: 1
        });

        // Add owner to ProjectMembers table
        await ProjectMemberModel.create({ 
            project_id: newProject._id, 
            user_id: owner_id, 
            role: 'Owner' 
        });

        // Update User's posted_projects array (only if field exists)
        try {
            await UserModel.findByIdAndUpdate(owner_id, {
                $addToSet: { posted_projects: newProject._id } // Use $addToSet to avoid duplicates
            });
        } catch (userUpdateError) {
            console.log('Note: Could not update user posted_projects:', userUpdateError.message);
            // Don't fail the entire request if this update fails
        }

        return response.status(201).json({ 
            success: true, 
            message: "Project created successfully.", 
            data: newProject 
        });
    }  catch (error) {
        console.error('=== PROJECT CREATION ERROR ===');
        console.error('Error name:', error.name);
        console.error('Error message:', error.message);
        console.error('Error stack:', error.stack);
        
        return response.status(500).json({ 
            success: false,
            error: true, 
            message: error.message || "Failed to create project" 
        });
    }
}
// 2. READ (Get All Projects with Filtering)
export async function getProjectsController(request, response) {
    try {
        // Implement filtering by tags, skills, and status using request.query
        const { tag, skill, search, status, limit = 10, page = 1 } = request.query;
        const query = {};

        if (tag) query.tags = tag;
        if (skill) query.required_skills = skill;
        if (status) query.status = status;
        if (search) query.title = { $regex: search, $options: 'i' }; // Case-insensitive search

        const projects = await ProjectModel.find(query)
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit))
            .sort({ created_at: -1 })
            .populate('owner_id', 'name avatar_url college_branch'); // Populate owner details

        const totalCount = await ProjectModel.countDocuments(query);

        return response.status(200).json({ 
            success: true, 
            data: projects,
            meta: { totalCount, page: parseInt(page), limit: parseInt(limit) }
        });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 3. Project Membership/Join Request (Uses ProjectMemberModel logic)
export async function addProjectMemberController(request, response) {
    // This controller would handle adding a member (e.g., accepting a team invite or processing a join request)
    // For simplicity here, we assume the user is approved and added.
    try {
        const { project_id, user_id } = request.body;
        const authUserId = request.userId; // The user making the request (e.g., the owner)

        // 1. Check if user is already a member
        const existingMember = await ProjectMemberModel.findOne({ project_id, user_id });
        if (existingMember) {
            return response.status(409).json({ message: "User is already a member of this project." });
        }
        
        // 2. Create the membership record
        await ProjectMemberModel.create({ project_id, user_id, role: 'Collaborator' });

        // 3. Update Project and User documents
        await ProjectModel.findByIdAndUpdate(project_id, { $inc: { member_count: 1 } });
        // Optional: Update the new member's joined_teams array in the UserModel

        return response.status(200).json({ success: true, message: "Member added successfully." });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 3. READ (Get Single Project)
export async function getProjectByIdController(request, response) {
    try {
        const { projectId } = request.params;
        const project = await ProjectModel.findById(projectId)
            .populate('owner_id', 'name avatar_url college_branch');
        
        if (!project) {
            return response.status(404).json({ message: "Project not found." });
        }
        return response.status(200).json({ success: true, data: project });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 4. UPDATE Project
export async function updateProjectController(request, response) {
    try {
        const { projectId } = request.params;
        const userId = request.userId; // Current logged-in user

        // Authorization check (Ensure only the owner can update)
        const project = await ProjectModel.findById(projectId);
        if (!project || project.owner_id.toString() !== userId.toString()) {
            return response.status(403).json({ message: "Unauthorized to update this project." });
        }

        const updatedProject = await ProjectModel.findByIdAndUpdate(
            projectId, 
            request.body, 
            { new: true, runValidators: true }
        );

        return response.status(200).json({ success: true, message: "Project updated.", data: updatedProject });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}

// 5. DELETE Project
export async function deleteProjectController(request, response) {
    try {
        const { projectId } = request.params;
        const userId = request.userId; 

        // Authorization check (Ensure only the owner can delete)
        const project = await ProjectModel.findById(projectId);
        if (!project || project.owner_id.toString() !== userId.toString()) {
            return response.status(403).json({ message: "Unauthorized to delete this project." });
        }

        // --- Perform cascading deletes (remove members, comments, upvotes, etc.) ---
        await ProjectModel.deleteOne({ _id: projectId });
        // NOTE: In a complete application, you must run cleanup logic here:
        // await ProjectMemberModel.deleteMany({ project_id: projectId });
        // await CommentModel.deleteMany({ project_id: projectId });
        // ...

        return response.status(200).json({ success: true, message: "Project deleted successfully." });
    } catch (error) {
        return response.status(500).json({ error: true, message: error.message });
    }
}