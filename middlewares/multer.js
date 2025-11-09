// middlewares/multer.js (CLEANED UP)

import multer from 'multer';
// Removed: import dotenv from 'dotenv';
// Removed: import fs from 'fs';
// Removed: import path from 'path'; // path is not defined/needed here

// 1. Storage Configuration: Use memoryStorage for read-only serverless environments.
// This stores the uploaded file as a Buffer in memory.
const storage = multer.memoryStorage(); 

// 2. File Filter (Optional but good practice to keep validation)
// NOTE: Since 'path' is not available here, file validation should ideally 
// happen *after* the file is uploaded, or the logic must be simplified.
// We will remove the validation here to prevent a ReferenceError.

const upload = multer({ 
    storage: storage,
    limits: { 
        // Set a suitable limit, e.g., 5MB 
        fileSize: 5242880 
    } 
    // Removed: fileFilter: fileFilter,
});

export default upload;