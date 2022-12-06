import express from 'express';
import bodyParser from 'body-parser';
import { User } from '../../schemas/User.mjs';
import { Post } from '../../schemas/Post.mjs';
import { Chat } from '../../schemas/Chat.mjs';
import { Message } from '../../schemas/Message.mjs';

const app = express();
const chatsAPI = express.Router();


app.use(bodyParser.urlencoded({ extended: false }));

chatsAPI.post('/', async (req, res) => {
    if(!req.body.users) {
        console.log('No users sent');
        return res.sendStatus(400);
    }

    const users = JSON.parse(req.body.users);

    if(users.length == 0) {
        console.log('Empty users');
        return res.sendStatus(400);
    }

    users.push(req.session.user);

    const chatData = {
        users: users,
        isGroupChat: true
    };

    Chat.create(chatData)
    .then(chat => res.send(chat))
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
});

chatsAPI.get('/', async (req, res) => {
    Chat.find({users: {$elemMatch: {$eq: req.session.user._id}}})
    .populate('users')
    .populate('latestMessage')
    .sort({ updatedAt: -1 })
    .then(async chats => {
        chats = await User.populate(chats, { path: 'latestMessage.sender' });
        res.send(chats);
    })
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
});

chatsAPI.get('/:chatId', async (req, res) => {
    Chat.findOne({_id: req.params.chatId, users: {$elemMatch: {$eq: req.session.user._id}}})
    .populate('users')
    .then(chats => res.send(chats))
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
});

chatsAPI.put('/:chatId', async (req, res) => {
    Chat.findByIdAndUpdate(req.params.chatId, req.body)
    .then(chats => res.sendStatus(204))
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
});

chatsAPI.get('/:chatId/messages', async (req, res) => {
    Message.find({ chat: req.params.chatId })
    .populate('sender')
    .then(chats => res.send(chats))
    .catch((err) => {
        console.log(err);
        res.sendStatus(400);
    });
});

export {
    chatsAPI
};