import asyncHandler from 'express-async-handler';
import bcrypt from 'bcrypt';
import User from '../schema/userSchema.js';
import Notification from '../schema/notificationSchema.js';


// @desc Register a user
// @route POST /user/register
// @access public
const registerUser = asyncHandler(async (req, res) => {
    const { username, email, phone, password } = req.body;
    if (!username || !email || !phone || !password) {
        res.status(400);
        throw new Error("All fields are mandatory");
    }

    const userAvailable = await User.findOne({ $or: [{ email }, { phone }, { username }] });
    if (userAvailable) {
        res.status(400);
        throw new Error("User with this email, phone or username already registered");
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
        username,
        email,
        phone,
        password: hashedPassword,
    });

    if (user) {
        res.status(201).json({
            _id: user._id,
            username: user.username,
            email: user.email,
            phone: user.phone,
        });
    } else {
        res.status(400);
        throw new Error("User data is not valid");
    }
});

// @desc Get user by username (public)
// @route GET /user/:username
// @access public
const getUserByUsername = asyncHandler(async (req, res) => {
    const username = req.params.username;
    const user = await User.findOne({ username }).select('-password');

    if (!user) {
        res.status(404);
        throw new Error('User not found');
    }

    res.status(200).json(user);
});

// @desc Get notifications by username
// @route GET /user/:username/notification
// @access public
const getNotificationsByUsername = asyncHandler(async (req, res) => {
  const username = req.params.username;

  // Find user first
  const user = await User.findOne({ username });
  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  // Fetch notifications for this user
  const notifications = await Notification.find({ userId: user._id }).sort({ createdAt: -1 });

  res.status(200).json(notifications);
});


export default {
    registerUser,
    getUserByUsername,
    getNotificationsByUsername,
};


