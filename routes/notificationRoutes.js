import express from 'express';
import createNotification  from '../controller/notificationController.js';

const router = express.Router();

// POST /notification - create and queue notification
router.post('/notification', createNotification);

export default router;
