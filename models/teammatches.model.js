import mongoose from "mongoose";
const teamMatchSchema = new mongoose.Schema({
    user_id: { // The user who is being recommended
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    recommended_user_id: { // The potential teammate
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    },
    project_id: { // Recommendation generated specifically for this project
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Project', 
        required: true 
    },
    score: { // Numerical score indicating match strength (0.0 to 1.0)
        type: Number, 
        required: true, 
        min: 0, 
        max: 1 
    },
    reasoning: { // Brief text explaining the match (e.g., 'Required skill: React match')
        type: String,
        default: ''
    }
}, { timestamps: { createdAt: 'created_at' } });

const TeamMatchModel = mongoose.model("TeamMatch", teamMatchSchema);
export default TeamMatchModel;