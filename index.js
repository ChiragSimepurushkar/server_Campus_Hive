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
import interactionRouter from './route/interaction.route.js';
import chatRouter from './route/chat.route.js';
import notificationRouter from './route/notification.route.js';
import matchRouter from './route/matchmaking.route.js';
import memberRouter from './route/projectmember.route.js';
import uploadRoutes from './route/upload.routes.js';

dotenv.config();
const app = express();

// --- Middleware Configuration ---
app.use(cors({
  origin: process.env.CLIENT_URL || '*',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));
app.use(helmet({
  crossOriginResourcePolicy: false
}));

// --- Health Check Route ---
app.get('/', (req, res) => {
  res.json({
    message: "Campus Hive Server is running",
    status: "healthy",
    timestamp: new Date().toISOString()
  });
});

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

// --- 404 Handler for API routes ---
app.use('/api/*', (req, res) => {
  res.status(404).json({
    error: 'API endpoint not found',
    path: req.originalUrl
  });
});

// --- Database Connection and Server Start ---
const PORT = process.env.PORT || 5000;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server is running on PORT: ${PORT}`);
    console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}).catch(error => {
  console.error("Failed to connect to the database:", error);
  process.exit(1);
});

export default app;