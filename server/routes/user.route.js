import express from "express";
import { protect } from "../middlewares/auth.middleware.js";
import { getUsers } from "../controllers/users.controller.js";
import { getOnlineUsers } from "../controllers/users.controller.js";
const router = express.Router();

router.get("/all", protect, getUsers);
router.get("/online", protect, getOnlineUsers);

export default router;