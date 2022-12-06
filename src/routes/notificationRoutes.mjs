import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { Chat } from '../schemas/Chat.mjs';
import { User } from '../schemas/User.mjs';
import mongoose from 'mongoose';

const app = express();
const notificationRouter = express.Router();

app.set('view engine', 'pug');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

notificationRouter.get('/', (req, res) => {
    const context = {
        pageTitle: 'Notifications',
        userLoggedIn: req.session.user,
        clientUser: JSON.stringify(req.session.user)
    };
    res.render('notification', context);
});

export {
    notificationRouter
};