import express from 'express';
import { protect } from '../middlewares/auth.middleware.js';
import { getFile } from '../controllers/file.controller.js';

const router = express.Router();

router.get('/:filename', protect, getFile);

export default router;