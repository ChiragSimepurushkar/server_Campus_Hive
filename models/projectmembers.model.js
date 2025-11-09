import mongoose from "mongoose";
const projectMemberSchema = new mongoose.Schema({
    project_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    user_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    role: { 
        type: String, 
        enum: ['Owner', 'Collaborator', 'Viewer'], 
        default: 'Collaborator' 
    },
}, { timestamps: { createdAt: 'joined_at' } });

// Enforce unique combination of user and project
projectMemberSchema.index({ project_id: 1, user_id: 1 }, { unique: true });

export const ProjectMemberModel = mongoose.model("ProjectMember", projectMemberSchema);