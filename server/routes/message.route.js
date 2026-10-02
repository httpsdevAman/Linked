import express from "express"
import { protect } from "../middlewares/auth.middleware.js";
import { sendMessage, getMessages } from "../controllers/message.controller.js";
import { upload } from "../config/multer.js";

const router = express.Router();

router.post('/', protect, upload.array('files', 5), sendMessage);
router.get('/:convID', protect, getMessages);

export default router;