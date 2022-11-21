import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    username: { type: String, required: true, trim: true, unique: true },
    email: { type: String, required: true, trim: true, unique: true },
    password: { type: String, required: true },
    profilePic: { type: String, default: '/images/profilePic.jpeg' }, //lead to the location of a default profile picture if a user didn't set up one
    coverPhoto: { type: String },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    retweets: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    followers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
}, {timestamps: true});

// Register models
const User = mongoose.model('User', UserSchema);

export {
  User
};