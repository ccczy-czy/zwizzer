import express from 'express';
import bodyParser from 'body-parser';
import { User } from '../../schemas/User.mjs';
import { Notification } from '../../schemas/Notification.mjs';
import multer from 'multer';
import path from 'path';
import { fileURLToPath } from 'url';
import * as fs from "fs";

const app = express();
const usersAPI = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const upload = multer({dest: 'src/uploads/'});


app.use(bodyParser.urlencoded({ extended: false }));

usersAPI.get('/', async (req, res) => {
    let search = req.query;

    if (req.query.search !== undefined) {
        search = {
            $or: [
                {firstName: {$regex: req.query.search, $options: 'i'}},
                {lastName: {$regex: req.query.search, $options: 'i'}},
                {username: {$regex: req.query.search, $options: 'i'}}
            ]
        };
    }

    User.find(search)
    .then((data) => {
        res.send(data);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
});

usersAPI.put('/:userId/follow', async (req, res) => {
    const userId = req.params.userId;

    const user = await User.findById(userId);
    if (user == null) {
        return res.sendStatus(404);
    }

    const isFollowing = user.followers && user.followers.includes(req.session.user._id);
    const action = isFollowing ? '$pull' : '$addToSet';

    req.session.user = await User.findByIdAndUpdate(req.session.user._id, {[action]: {following: userId}}, {new: true})
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });

    User.findByIdAndUpdate(userId, {[action]: {followers: req.session.user._id}})
    .catch(error => {
        console.log(error);
        res.sendStatus(400);
    });

    if(!isFollowing) {
        await Notification.insertNotification(userId, req.session.user._id, 'follow', req.session.user._id);
    }

    res.send(req.session.user);
});

usersAPI.get('/:userId/followers', async (req, res) => {
    User.findById(req.params.userId)
    .populate('followers')
    .then((data) => {
        res.send(data);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
});

usersAPI.get('/:userId/following', async (req, res) => {
    User.findById(req.params.userId)
    .populate('following')
    .then((data) => {
        res.send(data);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
});

usersAPI.post('/profilePic', upload.single('croppedImage'), async (req, res) => {
    if (!req.file) {
        console.log('No file uploaded');
        return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const targetPath = path.join(__dirname, `../../${filePath}`);
    fs.rename(req.file.path, targetPath, async (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, {profilePic: filePath}, {new: true});
        res.sendStatus(204);
    });
});

usersAPI.post('/coverPhoto', upload.single('croppedImage'), async (req, res) => {
    if (!req.file) {
        console.log('No file uploaded');
        return res.sendStatus(400);
    }

    const filePath = `/uploads/images/${req.file.filename}.png`;
    const targetPath = path.join(__dirname, `../../${filePath}`);
    fs.rename(req.file.path, targetPath, async (err) => {
        if (err) {
            console.log(err);
            return res.sendStatus(400);
        }

        req.session.user = await User.findByIdAndUpdate(req.session.user._id, {coverPhoto: filePath}, {new: true});
        res.sendStatus(204);
    });
});

export {
    usersAPI
};