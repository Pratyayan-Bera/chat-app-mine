import cloudinary from "../config/cloudinary.js";

export const uploadFile = async (req, res) => {
  try {
    // File is now available through Multer in req.file
    if (!req.file) {
      return res.status(400).json({
        message: "No file uploaded"
      });
    }

    const { buffer, mimetype, originalname, size } = req.file;

    // Upload to Cloudinary based on file type
    const uploadOptions = {
      resource_type: "auto", // Automatically detect file type
      folder: "chat-app-files", // Organize files in a folder
      public_id: `${Date.now()}-${originalname.split('.')[0]}`, // Unique filename
    };

    // For images, add additional options
    if (mimetype.startsWith('image/')) {
      uploadOptions.transformation = [
        { quality: "auto", fetch_format: "auto" }
      ];
    }

    // Upload buffer to Cloudinary
    const uploadResponse = await new Promise((resolve, reject) => {
      cloudinary.uploader.upload_stream(uploadOptions, (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }).end(buffer);
    });

    res.status(200).json({
      url: uploadResponse.secure_url,
      publicId: uploadResponse.public_id,
      resourceType: uploadResponse.resource_type,
      format: uploadResponse.format,
      bytes: uploadResponse.bytes,
      originalName: originalname
    });

  } catch (error) {
    console.error("Error uploading file to Cloudinary:", error);
    res.status(500).json({
      message: "File upload failed",
      error: error.message
    });
  }
};

export const deleteFile = async (req, res) => {
  try {
    const { publicId, resourceType = "image" } = req.body;
    
    if (!publicId) {
      return res.status(400).json({
        message: "Public ID is required"
      });
    }

    const deleteResponse = await cloudinary.uploader.destroy(publicId, {
      resource_type: resourceType
    });

    res.status(200).json({
      message: "File deleted successfully",
      result: deleteResponse.result
    });

  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    res.status(500).json({
      message: "File deletion failed",
      error: error.message
    });
  }
};
