import express from 'express';
import bodyParser from 'body-parser';
import path from 'path';
import { fileURLToPath } from 'url';
//import bcrypt from 'bcryptjs';
//import mongoose from 'mongoose';
//import { User } from '../schemas/User.mjs';
//import { Chat } from '../schemas/Chat.mjs';

const app = express();
const messageRouter = express.Router();

app.set('view engine', 'hbs');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

messageRouter.get('/', (req, res) => {
    res.render('inboxPage', {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
    });
})

export {
    messageRouter
}