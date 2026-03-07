import express from "express"
import { protect } from "../middlewares/auth.middleware.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";

const router = express.Router();

router.post('/', protect, sendMessage);
router.get('/:convID', protect, getMessages);

export default router;