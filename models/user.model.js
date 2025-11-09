import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    // Core Profile & Auth
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, select: false }, // password_hash
    verify_email: { type: Boolean, default: false },

    // Academic Profile
    college: { type: String, required: true },
    college_branch: { type: String, required: true }, // 'branch' from table
    graduation_year: { type: Number, required: true }, // 'year' from table

    // Detailed Profile
    skills: { type: [String], default: [] },
    interests: { type: [String], default: [] },
    github_url: { type: String, default: '' },
    linkedin_url: { type: String, default: '' },
    portfolio_url: { type: String, default: '' },
    bio: { type: String, default: '' },
    avatar_url: { type: String, default: 'https://default-avatar-url.com/profile.png' },

    // Relationships & Activity
    posted_projects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    joined_teams: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Project' }],
    participated_events: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Event' }], // New reference

    // Security & Status (Kept from previous version)
    otp: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    role: { type: String, enum: ["ADMIN", "USER", "MODERATOR"], default: "USER" },
    status: { type: String, enum: ["Active", "Inactive", "Suspended"], default: "Active" },
    access_token: { type: String, select: false },
    refresh_token: { type: String, select: false },
    last_login_date: { type: Date, default: null },

}, { timestamps: true });

const UserModel = mongoose.model("User", userSchema);
export default UserModel;