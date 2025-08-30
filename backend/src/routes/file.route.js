import express from 'express';
import { uploadFile, deleteFile } from '../controllers/file.controller.js';
import { authJWT } from '../middlewares/auth.middleware.js';
import upload from '../config/multer.js';

const router = express.Router();

// File upload route with Multer middleware
router.post('/upload', authJWT, upload.single('file'), uploadFile);

// File delete route
router.delete('/delete/:publicId', authJWT, deleteFile);

export default router;
