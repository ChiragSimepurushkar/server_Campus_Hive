import mongoose from "mongoose";
const projectSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    tags: { type: [String], default: [] },
    required_skills: { type: [String], default: [] },
    
    owner_id: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    
    status: { 
        type: String, 
        enum: ['Hiring', 'In Progress', 'Completed', 'Idea'], 
        default: 'Hiring' 
    },
    // References to related data (useful for lookups)
    member_count: { type: Number, default: 1 }, 
    comment_count: { type: Number, default: 0 }, 
    upvote_count: { type: Number, default: 0 }, 
}, { timestamps: { createdAt: 'created_at' } });

export const ProjectModel = mongoose.model("Project", projectSchema);