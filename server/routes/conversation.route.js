import express from "express"
import { protect } from "../middlewares/auth.middleware.js";
import { createConversation, getYourConversations } from "../controllers/conversation.controller.js";

const router = express.Router();

router.post('/', protect, createConversation);
router.get('/', protect, getYourConversations);

export default router;