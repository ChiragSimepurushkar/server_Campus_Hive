import cloudinary from 'cloudinary';
import multer from 'multer';

// Configure Cloudinary
cloudinary.v2.config({
    cloud_name: process.env.CLOUDINARY_CONFIG_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_CONFIG_API_KEY,
    api_secret: process.env.CLOUDINARY_CONFIG_API_SECRET
});

const storage = multer.memoryStorage();
const upload = multer({ 
    storage,
    limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Upload Image Controller
export async function uploadImageController(request, response) {
    try {
        if (!request.file) {
            return response.status(400).json({ 
                success: false, 
                message: "No image file provided" 
            });
        }

        // Upload to Cloudinary
        const result = await new Promise((resolve, reject) => {
            const uploadStream = cloudinary.v2.uploader.upload_stream(
                { folder: 'events' },
                (error, result) => {
                    if (error) reject(error);
                    else resolve(result);
                }
            );
            uploadStream.end(request.file.buffer);
        });

        return response.status(200).json({
            success: true,
            message: "Image uploaded successfully",
            imageUrl: result.secure_url,
            publicId: result.public_id
        });
    } catch (error) {
        console.error('Upload error:', error);
        return response.status(500).json({ 
            success: false, 
            message: error.message || "Failed to upload image" 
        });
    }
}

export const uploadMiddleware = upload.single('image');