import mongoose from "mongoose";
const upvoteSchema = new mongoose.Schema({
    project_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
}, { timestamps: { createdAt: 'created_at' } });
upvoteSchema.index({ project_id: 1, user_id: 1 }, { unique: true });
export const UpvoteModel = mongoose.model("Upvote", upvoteSchema);