import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    content: { type: String, trim: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pinned: Boolean,
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    retweetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    retweetData: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    replyTo: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    pinned: Boolean
}, { timestamps: true });

// Register models
const Post = mongoose.model('Post', PostSchema);

export {
  Post
};