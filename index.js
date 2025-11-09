import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import path from 'path'; // <--- NEW: Import the path module
import connectDB from './config/connectDb.js';

// Import ALL Route Files
import userRouter from './route/user.route.js';
import projectRouter from './route/project.route.js';
import eventRouter from './route/event.route.js';
import interactionRouter from './route/interaction.route.js';
import chatRouter from './route/chat.route.js';
import notificationRouter from './route/notification.route.js';
import matchRouter from './route/matchmaking.route.js';
import memberRouter from './route/projectmember.route.js';
import uploadRoutes from './route/upload.routes.js';

dotenv.config();

const app = express();
const __dirname = path.resolve(); // <--- NEW: Define __dirname for ES Modules

// --- Middleware Configuration ---
app.use(cors({
  origin: '*',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// --- API Routes ---
app.use('/api/upload', uploadRoutes);
app.use('/api/user', userRouter);
app.use('/api/projects', projectRouter);
app.use('/api/members', memberRouter);
app.use('/api/events', eventRouter);
app.use('/api/interactions', interactionRouter);
app.use('/api/chat', chatRouter);
app.use('/api/notifications', notificationRouter);
app.use('/api/matchmaking', matchRouter);

// --- Deployment: Static File Service and Fallback ---
// Check if the environment is production (e.g., Vercel, Heroku, AWS)
if (process.env.NODE_ENV === 'production') {
    
    // 1. Serve the static build files from the React frontend (usually in '../client/dist' or '../client/build')
    // Assuming your React project is in a sibling 'client' folder and uses 'dist' as the build output.
    app.use(express.static(path.join(__dirname, '../client/dist'))); 
    
    // 2. Fallback route: For any requests not handled by the API (like /projects/123), 
    // send the main index.html file to let React Router handle the URL.
    app.get('*', (req, res) => {
        // Exclude the /api routes from being caught by the fallback
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.resolve(__dirname, '../client/dist', 'index.html'));
        } else {
            // If it's a non-matching API route, send a 404
            res.status(404).send('API route not found');
        }
    });
} else {
    // Development route
    app.get("/", (request, response) => {
        response.json({
            message: "Campus Hive Server is running on port " + process.env.PORT
        });
    });
}

// --- Database Connection and Server Start ---
connectDB().then(() => {
  app.listen(process.env.PORT || 5000, () => { // Use PORT from env or 5000 as default
    console.log("Server is running on PORT:", process.env.PORT || 5000);
  });
}).catch(error => {
  console.error("Failed to connect to the database or start server:", error);
});