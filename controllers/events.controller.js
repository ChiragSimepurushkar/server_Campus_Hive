import { EventModel } from '../models/events.model.js';

// // 1. CREATE Event
// export async function createEventController(request, response) {
//     try {
//         const created_by = request.userId;
//         const { title, description, url, domain, location, start_datetime, end_datetime, image_url } = request.body;

//         if (!title || !description || !start_datetime) {
//             return response.status(400).json({ message: "Title, description, and start date/time are required." });
//         }

//         const newEvent = await EventModel.create({
//             title, description, url, domain, location,
//             start_datetime, end_datetime, created_by, image_url
//         });

//         return response.status(201).json({ success: true, message: "Event created successfully.", data: newEvent });
//     } catch (error) {
//         return response.status(500).json({ error: true, message: error.message });
//     }
// }

// // 2. READ (Get Events with Filtering)
// export async function getEventsController(request, response) {
//     try {
//         const { domain, location, date, search, limit = 10, page = 1 } = request.query;
//         const query = {};

//         query.start_datetime = { $gte: new Date() }; // Only future events by default

//         if (domain) query.domain = domain;
//         if (location) query.location = location;
//         if (search) query.title = { $regex: search, $options: 'i' };

//         // Simple date filtering (e.g., filter events starting today or later)
//         if (date) {
//             const day = new Date(date);
//             const nextDay = new Date(day);
//             nextDay.setDate(day.getDate() + 1);
//             query.start_datetime = { $gte: day, $lt: nextDay };
//         }

//         const events = await EventModel.find(query)
//             .limit(parseInt(limit))
//             .skip((parseInt(page) - 1) * parseInt(limit))
//             .sort({ start_datetime: 1 }) // Sort by start date
//             .populate('created_by', 'name college');

//         return response.status(200).json({
//             success: true,
//             data: events
//         });
//     } catch (error) {
//         return response.status(500).json({ error: true, message: error.message });
//     }
// }

// // 3. READ (Get Single Event by ID)
// export async function getEventByIdController(request, response) {
//     try {
//         const { eventId } = request.params;
//         const event = await EventModel.findById(eventId)
//             .populate('created_by', 'name college');

//         if (!event) {
//             return response.status(404).json({ message: "Event not found." });
//         }
//         return response.status(200).json({ success: true, data: event });
//     } catch (error) {
//         return response.status(500).json({ error: true, message: error.message });
//     }
// }

// // 4. UPDATE Event
// export async function updateEventController(request, response) {
//     try {
//         const { eventId } = request.params;
//         const userId = request.userId; // User performing the update

//         // Authorization: Ensure user is the creator (or an admin)
//         const event = await EventModel.findById(eventId);
//         if (!event || event.created_by.toString() !== userId.toString()) {
//             return response.status(403).json({ message: "Unauthorized to update this event." });
//         }

//         const updatedEvent = await EventModel.findByIdAndUpdate(
//             eventId,
//             request.body,
//             { new: true, runValidators: true }
//         );

//         return response.status(200).json({ success: true, message: "Event updated.", data: updatedEvent });
//     } catch (error) {
//         return response.status(500).json({ error: true, message: error.message });
//     }
// }

// // 5. DELETE Event
// export async function deleteEventController(request, response) {
//     try {
//         const { eventId } = request.params;
//         const userId = request.userId;

//         // Authorization: Ensure user is the creator (or an admin)
//         const event = await EventModel.findById(eventId);
//         if (!event || event.created_by.toString() !== userId.toString()) {
//             return response.status(403).json({ message: "Unauthorized to delete this event." });
//         }

//         await EventModel.deleteOne({ _id: eventId });

//         // Note: Cleanup logic (e.g., removing registrations if you had a registration model) would go here.

//         return response.status(200).json({ success: true, message: "Event deleted successfully." });
//     } catch (error) {
//         return response.status(500).json({ error: true, message: error.message });
//     }
// }






// ============================================
// 3. EVENT CONTROLLER (controllers/eventController.js)
// ============================================

// Create Event
export const createEventController = async (req, res) => {
    console.log('✅ Controller reached');
    console.log('req.user:', req.user);
    console.log('req.user._id:', req.user?._id);
    try {
        // Check if user is authenticated
        if (!req.user || !req.user._id) {
            return res.status(401).json({
                success: false,
                message: 'Authentication required. User not found.'
            });
        }

        const eventData = {
            ...req.body,
            created_by: req.user._id
        };

        // Parse JSON fields if they come as strings
        if (typeof eventData.tags === 'string') {
            eventData.tags = JSON.parse(eventData.tags);
        }
        if (typeof eventData.schedule === 'string') {
            eventData.schedule = JSON.parse(eventData.schedule);
        }
        if (typeof eventData.prizes === 'string') {
            eventData.prizes = JSON.parse(eventData.prizes);
        }
        if (typeof eventData.speakers === 'string') {
            eventData.speakers = JSON.parse(eventData.speakers);
        }

        const newEvent = await EventModel.create(eventData);
        
        res.status(201).json({
            success: true,
            message: 'Event created successfully',
            data: newEvent
        });
    } catch (error) {
        console.error('Create event error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to create event'
        });
    }
};

// Upload Event Image
export const uploadEventImageController = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!req.file) {
            return res.status(400).json({
                success: false,
                message: 'No image file provided'
            });
        }

        // Construct image URL
        const image_url = `/uploads/events/${req.file.filename}`;

        // Update event with new image
        const updatedEvent = await EventModel.findByIdAndUpdate(
            eventId,
            { image_url },
            { new: true }
        ).populate('created_by', 'name email');

        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event image uploaded successfully',
            data: updatedEvent
        });
    } catch (error) {
        console.error('Upload event image error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to upload image'
        });
    }
};

// Get Event by ID
export const getEventByIdController = async (req, res) => {
    try {
        const { id, eventId } = req.params; // Accept both
        const eventIdToUse = id || eventId; // Use whichever is provided

        const event = await EventModel.findById(eventIdToUse)
            .populate('created_by', 'name email');

        if (!event) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            data: event
        });
    } catch (error) {
        console.error('Get event error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch event'
        });
    }
};

// Get All Events
export const getEventsController = async (req, res) => {
    try {
        const events = await EventModel.find()
            .populate('created_by', 'name email')
            .sort({ start_datetime: 1 });

        res.json({
            success: true,
            data: events
        });
    } catch (error) {
        console.error('Get events error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to fetch events'
        });
    }
};

// Update Event
export const updateEventController = async (req, res) => {
    try {
        const { id } = req.params;
        const updateData = req.body;

        // Parse JSON fields if they come as strings
        if (typeof updateData.tags === 'string') {
            updateData.tags = JSON.parse(updateData.tags);
        }
        if (typeof updateData.schedule === 'string') {
            updateData.schedule = JSON.parse(updateData.schedule);
        }
        if (typeof updateData.prizes === 'string') {
            updateData.prizes = JSON.parse(updateData.prizes);
        }
        if (typeof updateData.speakers === 'string') {
            updateData.speakers = JSON.parse(updateData.speakers);
        }

        const updatedEvent = await EventModel.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('created_by', 'name email');

        if (!updatedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event updated successfully',
            data: updatedEvent
        });
    } catch (error) {
        console.error('Update event error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to update event'
        });
    }
};

// Delete Event
export const deleteEventController = async (req, res) => {
    try {
        const { id } = req.params;

        const deletedEvent = await EventModel.findByIdAndDelete(id);

        if (!deletedEvent) {
            return res.status(404).json({
                success: false,
                message: 'Event not found'
            });
        }

        res.json({
            success: true,
            message: 'Event deleted successfully'
        });
    } catch (error) {
        console.error('Delete event error:', error);
        res.status(500).json({
            success: false,
            message: error.message || 'Failed to delete event'
        });
    }
};