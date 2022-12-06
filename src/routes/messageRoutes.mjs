import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { Chat } from '../schemas/Chat.mjs';
import { User } from '../schemas/User.mjs';
import mongoose from 'mongoose';

const app = express();
const messageRouter = express.Router();

app.set('view engine', 'pug');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

messageRouter.get('/', (req, res) => {
    const context = {
        pageTitle: 'Inbox',
        userLoggedIn: req.session.user,
        clientUser: JSON.stringify(req.session.user)
    };
    res.render('inbox', context);
});

messageRouter.get('/new', (req, res) => {
    const context = {
        pageTitle: 'New message',
        userLoggedIn: req.session.user,
        clientUser: JSON.stringify(req.session.user)
    };
    res.render('newMessage', context);
});

messageRouter.get('/:chatId', async (req, res) => {
    const userId = req.session.user._id;
    const chatId = req.params.chatId;
    const isValidId = mongoose.isValidObjectId(chatId);

    const context = {
        pageTitle: 'Chat',
        userLoggedIn: req.session.user,
        clientUser: JSON.stringify(req.session.user)
    };

    if(!isValidId) {
        context.errorMessage = "No chat to show.";
        return res.render('chat', context);
    }

    let chat = await Chat.findOne({_id: chatId, users: {$elemMatch: {$eq: userId}}})
    .populate('users');

    if(chat == null) {
        //check if chat id is user id
        const user = await User.findById(chatId);

        if(user != null) {
            chat = await getChatByUserId(userId, user._id);
        }
    }
    if (chat == null){
        context.errorMessage = "No chat to show.";
    }
    else {
        context.chat = chat;
    }

    res.render('chat', context);
});

function getChatByUserId(userLoggedInId, memberId) {
    return Chat.findOneAndUpdate({
        isGroupChat: false,
        users: {
            $size: 2,
            $all: [
                {$elemMatch: {$eq: mongoose.Types.ObjectId(userLoggedInId)}},
                {$elemMatch: {$eq: mongoose.Types.ObjectId(memberId)}}
            ]
        }
    },
    {
        $setOnInsert: {
            users: [userLoggedInId, memberId]
        }
    },
    {
        new: true,
        upsert: true
    }).populate('users');
}

export {
    messageRouter
};