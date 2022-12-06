import express from 'express';
import bodyParser from 'body-parser';
import { User } from '../../schemas/User.mjs';
import { Post } from '../../schemas/Post.mjs';
import { Chat } from '../../schemas/Chat.mjs';
import { Message } from '../../schemas/Message.mjs';
import { Notification } from '../../schemas/Notification.mjs';

const app = express();
const messagesAPI = express.Router();


app.use(bodyParser.urlencoded({ extended: false }));

messagesAPI.post('/', async (req, res) => {
    if(!req.body.content || !req.body.chatId) {
        console.log('Invalid request');
        return res.sendStatus(400);
    }

    const newMessage = {
        sender: req.session.user._id,
        content: req.body.content,
        chat: req.body.chatId
    };

    Message.create(newMessage)
    .then(async (message) => {
        message = await message.populate('sender');
        message = await message.populate('chat');
        message = await User.populate(message, { path: "chat.users" });
        
        const chat = await Chat.findByIdAndUpdate(req.body.chatId, { latestMessage: message })
        .catch((error) => {
            console.log(error);
        });

        insertNotification(chat, message);

        res.status(201).send(message);
    })
    .catch((error) => {
        console.log(error);
        res.sendStatus(400);
    });
});

function insertNotification(chat, message) {
    chat.users.forEach(userId => {
        if(userId == message.sender._id.toString()) {
            return;
        }
        Notification.insertNotification(userId, message.sender._id, 'newMessage', message.chat._id);
    });
}

export {
    messagesAPI
};