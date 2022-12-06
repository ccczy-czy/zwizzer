import express from 'express';
import bodyParser from 'body-parser';
import { User } from '../../schemas/User.mjs';
import { Post } from '../../schemas/Post.mjs';
import { Chat } from '../../schemas/Chat.mjs';
import { Message } from '../../schemas/Message.mjs';
import { Notification } from '../../schemas/Notification.mjs';

const app = express();
const notificationsAPI = express.Router();


app.use(bodyParser.urlencoded({ extended: false }));

notificationsAPI.get('/', async (req, res) => {
    Notification.find({userTo: req.session.user._id, notificationType: {$ne: 'newMessage'}})
    .populate('userTo')
    .populate('userFrom')
    .sort({createdAt: -1})
    .then((results) => {
        res.send(results);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    });
});

notificationsAPI.put('/:id/markasread', async (req, res) => {
    Notification.findByIdAndUpdate(req.params.id, {opened: true})
    .then(() => {
        res.sendStatus(204);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    });
});

notificationsAPI.put('/markasread', async (req, res) => {
    Notification.updateMany({userTo: req.session.user._id}, {opened: true})
    .then(() => {
        res.sendStatus(204);
    })
    .catch(err => {
        console.log(err);
        res.sendStatus(400);
    });
});

export {
    notificationsAPI
};