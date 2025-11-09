import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import connectDB from './config/connectDb.js';

// Import ALL Route Files
import userRouter from './route/user.route.js';
import projectRouter from './route/project.route.js';
import eventRouter from './route/event.route.js';
import interactionRouter from './route/interaction.route.js'; // Handles Upvotes & Bookmarks
import chatRouter from './route/chat.route.js';           // Handles ChatRoom & ChatMessages
import notificationRouter from './route/notification.route.js';
import matchRouter from './route/matchmaking.route.js';
import memberRouter from './route/projectmember.route.js'; // Handles ProjectMember
import uploadRoutes from './route/upload.routes.js';

dotenv.config();

const app = express();

// --- Middleware Configuration ---
app.use(cors({
  // WARNING: '*' is insecure for production. Use a specific list of domains.
  origin: '*',
  credentials: true, // Crucial for sending cookies
}));
// app.options('/*',cors()); 

app.use(express.json()); // Parses incoming JSON payloads
app.use(cookieParser()); // Parses cookies from request headers
app.use(morgan('dev'));  // Added 'dev' format for better logging during development
app.use(helmet({
  crossOriginResourcePolicy: false // Allows resources like images from Cloudinary
}));

app.get("/", (request, response) => {
  response.json({
    message: "Campus Hive Server is running on port " + process.env.PORT
  });
});

app.use('/api/upload', uploadRoutes); // or '/upload' depending on your structure
app.use('/api/user', userRouter);
app.use('/api/projects', projectRouter); // Main project listings/CRUD
app.use('/api/members', memberRouter);   // Project member addition/removal
app.use('/api/events', eventRouter);
app.use('/api/interactions', interactionRouter); // Upvotes and Bookmarks
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/matchmaking', matchRouter);
// Note: Comments route can be separate or nested under interactions/projects
// app.use('/api/comments', commentRouter); // Use if you created a separate comments.route.js

connectDB().then(() => {
  app.listen(process.env.PORT, () => {
    console.log("Server is running on PORT:", process.env.PORT);
  });
}).catch(error => {
  console.error("Failed to connect to the database or start server:", error);
});