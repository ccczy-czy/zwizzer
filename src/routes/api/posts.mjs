import express from 'express';
import bodyParser from 'body-parser';
import { User } from '../../schemas/User.mjs';
import { Post } from '../../schemas/Post.mjs';
import { Notification } from '../../schemas/Notification.mjs';

const app = express();
const postsAPI = express.Router();


app.use(bodyParser.urlencoded({ extended: false }));

postsAPI.get('/', async (req, res) => {
    const search = req.query;
    if (search.isReply !== undefined) {
        const isReply = search.isReply == 'true';
        search.replyId = {$exists: isReply};
        delete search.isReply;
    }

    if (search.search !== undefined) {
        search.content = {$regex: search.search, $options: 'i'};
        delete search.search;
    }

    if (search.followingOnly !== undefined) {
        const followingOnly = search.followingOnly == 'true';
        if (followingOnly) {
            const postIds = [...req.session.user.following];
            postIds.push(req.session.user._id);
            search.postedBy = {$in: postIds};
        }
        delete search.followingOnly;
    }

    const data = await getPost(search);
    res.send(data);
});

postsAPI.get('/:postId', async (req, res) => {
    const postId = req.params.postId;
    const postData = await getPost({ _id: postId });

    const data = {
        postData: postData
    };

    if (postData[0].replyId) {
        data.replyId = postData[0].replyId;
    }

    data.replies = await getPost({ replyId: postId });

    res.send(data);
});

postsAPI.post('/', async (req, res) => {
    if (req.body.content) {
        const postData = {
            content: req.body.content,
            postedBy: req.session.user
        };

        if (req.body.replyTo) {
            postData.replyId = req.body.replyTo;
        }

        Post.create(postData)
        .then(async (post) => {
            post = await User.populate(post, {path: 'postedBy'});
            post = await Post.populate(post, {path: 'replyId'});

            if(post.replyId !== undefined) {
                await Notification.insertNotification(post.replyId.postedBy, req.session.user._id, 'reply', post._id);
            }

            res.send(post);
        })
        .catch((err) => {
            console.log(err);
            res.sendStatus(400);
        });
    }
    else {
        return res.sendStatus(400);
    }
});

postsAPI.put('/:postId/like', async (req, res) => {
    const postId = req.params.postId;
    const userId = req.session.user._id;

    const liked = req.session.user.likes && req.session.user.likes.includes(postId);

    const action = liked ? '$pull' : '$addToSet';
    //update user's likes
    req.session.user = await User.findByIdAndUpdate(userId, {[action]: {likes: postId}}, {new: true})
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
    //update post's likes
    const post = await Post.findByIdAndUpdate(postId, {[action]: {likes: userId}}, {new: true})
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });

    if(!liked) {
        await Notification.insertNotification(post.postedBy, req.session.user._id, 'like', post._id);
    }

    res.send(post);
});

postsAPI.post('/:postId/retweet', async (req, res) => {
    
    const postId = req.params.postId;
    const userId = req.session.user._id;

    //canDelete retweet
    const canDelete = await Post.findOneAndDelete({postedBy: userId, retweetId: postId})
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });

    const action = canDelete != null ? '$pull' : '$addToSet';

    let retweet = canDelete;

    if (retweet == null) {
        retweet = await Post.create({postedBy: userId, retweetId: postId})
        .catch((err) => {
            console.log(err);
            res.sendStatus(400);
        });
    }

    //update user's retweets
    req.session.user = await User.findByIdAndUpdate(userId, {[action]: {retweets: retweet._id}}, {new: true})
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });

    //update post's retweetUsers
    const post = await Post.findByIdAndUpdate(postId, {[action]: {retweetUsers: userId}}, {new: true})
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });

    if(!canDelete) {
        await Notification.insertNotification(post.postedBy, req.session.user._id, 'retweet', post._id);
    }

    res.send(post);
});

postsAPI.delete('/:postId', (req, res) => {
    Post.findByIdAndDelete(req.params.postId)
    .then(() => {res.sendStatus(202)})
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
});

postsAPI.put('/:postId', async (req, res) => {
    if (req.body.pinned !== undefined) {
        await Post.updateMany({postedBy: req.session.user}, {pinned: false})
        .catch((err) => {
            console.log(err);
            res.sendStatus(400);
        });
    }

    Post.findByIdAndUpdate(req.params.postId, req.body)
    .then(() => {res.sendStatus(204)})
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
});

async function getPost(target) {
    let data = await Post.find(target)
    .populate('postedBy')
    .populate('retweetId')
    .populate('replyId')
    .sort({createdAt: -1 })
    .catch((error) => {
        console.log(error)
    });

    data = await User.populate(data, { path: 'replyId.postedBy'});

    return await User.populate(data, { path: 'retweetId.postedBy'});
}

export {
    postsAPI
};