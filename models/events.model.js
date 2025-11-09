
import mongoose from "mongoose";

const eventSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    url: { type: String }, // Registration/External link
    image_url: {
        type: String,
        default: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200'
    },
    domain: { type: String }, // e.g., 'Web Development', 'AI/ML'
    event_type: { 
        type: String, 
        enum: ['in-person', 'virtual', 'hybrid'],
        default: 'in-person'
    },
    location: { type: String }, // For in-person or hybrid events
    virtual_link: { type: String }, // For virtual or hybrid events
    start_datetime: { type: Date, required: true },
    end_datetime: { type: Date },
    duration: { type: Number }, // Duration in hours
    registration_deadline: { type: Date },
    max_participants: { type: Number },
    is_paid: { type: Boolean, default: false },
    price: { type: Number, default: 0 },
    prize: { type: String }, // e.g., "₹50,000 Total Prize Pool"
    tags: [{ type: String }], // e.g., ['JavaScript', 'React', 'Node.js']
    requirements: { type: String }, // Prerequisites or requirements
    agenda: { type: String }, // Event agenda or itinerary
    
    // Schedule array for multi-day events
    schedule: [{
        day: { type: String },
        date: { type: String },
        events: [{
            time: { type: String },
            title: { type: String }
        }]
    }],
    
    // Prizes array for detailed prize breakdown
    prizes: [{
        place: { type: String },
        amount: { type: String },
        description: { type: String }
    }],
    
    // Speakers array
    speakers: [{
        name: { type: String },
        role: { type: String },
        bio: { type: String },
        avatar: { type: String }
    }],
    
    created_by: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
    }
}, { timestamps: true });

export const EventModel = mongoose.model("Event", eventSchema);