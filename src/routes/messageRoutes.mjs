import express from 'express';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { User } from '../schemas/User.mjs';
import { Chat } from '../schemas/Chat.mjs';

const app = express();
const messageRouter = express.Router();

messageRouter.get('/', (req, res) => {
    res.render('inboxPage', {
        pageTitle: "Inbox",
        userLoggedIn: req.session.user,
        userLoggedInJs: JSON.stringify(req.session.user)
    });
})