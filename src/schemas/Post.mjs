import mongoose from 'mongoose';

const PostSchema = new mongoose.Schema({
    content: { type: String, trim: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    pinned: { type: Boolean },
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    retweetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    retweetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
    replyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post' },
}, {timestamps: true});

// Register models
const Post = mongoose.model('Post', PostSchema);

export {
  Post
};