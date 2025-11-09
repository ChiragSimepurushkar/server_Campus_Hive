import express from 'express';
import { uploadImageController, uploadMiddleware } from '../controllers/upload.controller.js';
import auth from '../middlewares/auth.js';

const uploadRoutes = express.Router();

uploadRoutes.post('/event-image', auth, uploadMiddleware, uploadImageController);

export default uploadRoutes;