import express from 'express';
import userController from '../controller/userController.js'

const { 
    registerUser, 
    getUserByUsername,
    getNotificationsByUsername, 
} = userController;

const router = express.Router();

router.post('/register', registerUser);

router.get('/:username', getUserByUsername);

router.get('/:username/notifications', getNotificationsByUsername)

export default router; 
