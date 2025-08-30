import express from 'express'
import { authJWT } from '../middlewares/auth.middleware.js'
import { getMessages , sendMessage } from '../controllers/message.controller.js';

const router = express.Router();

router.post("/getMessages",authJWT,getMessages);
router.post("/sendMessage",authJWT,sendMessage);

export default router;