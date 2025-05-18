import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, "Please add the username"],
    },
    email: {
        type: String,
        required: [true, "Please enter the user email address"],
        unique: [true, "Email address is already taken"],
    },
    phone: {
        type: String,
        required: [true, "Please enter the user phone number"],
        unique: [true, "Phone number is already taken"],
    },
    preferences: {
        email: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
        inApp: { type: Boolean, default: true }
    },
    password: {
        type: String,
        required: [true, "Please add the user password"],
    }
    }, 
    { 
        timestamps: true 
    }
);

export default mongoose.model('User', userSchema);
