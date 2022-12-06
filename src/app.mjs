import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import session from 'express-session';
import { createServer } from 'http';
import { Server } from 'socket.io';
import './db.mjs';
import { loginRouter } from './routes/loginRoutes.mjs';
import { registerRouter } from './routes/registerRoutes.mjs';
import { logoutRouter } from './routes/logoutRoutes.mjs';
import { postRouter } from './routes/postRoutes.mjs';
import { profileRouter } from './routes/profileRoutes.mjs';
import { uploadRouter } from './routes/uploadRoutes.mjs';
import { searchRouter } from './routes/searchRoutes.mjs';
import { messageRouter } from './routes/messageRoutes.mjs';
import { notificationRouter } from './routes/notificationRoutes.mjs';
import { requireLogin, logRequest } from './middleware.mjs';

import { postsAPI } from './routes/api/posts.mjs';
import { usersAPI } from './routes/api/users.mjs';
import { chatsAPI } from './routes/api/chats.mjs';
import { messagesAPI } from './routes/api/messages.mjs';
import { notificationsAPI } from './routes/api/notifications.mjs';

const app = express();
const server = createServer(app);
const io = new Server(server);
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(session({
  secret: 'some secret choco chip cookies',
  resave: true,
  saveUninitialized: false
}));

app.use(logRequest);
app.use('/login', loginRouter);
app.use('/register', registerRouter);
app.use('/logout', logoutRouter);
app.use('/post', requireLogin, postRouter);
app.use('/profile', requireLogin, profileRouter);
app.use('/uploads', uploadRouter);
app.use('/search', requireLogin, searchRouter);
app.use('/messages', requireLogin, messageRouter);
app.use('/notifications', requireLogin, notificationRouter);


app.use('/api/posts', postsAPI);
app.use('/api/users', usersAPI);
app.use('/api/chats', chatsAPI);
app.use('/api/messages', messagesAPI);
app.use('/api/notifications', notificationsAPI);

app.get('/', requireLogin, (req, res) => {
  res.render('index', {pageTitle: 'Home', userLoggedIn: req.session.user, clientUser: JSON.stringify(req.session.user)});
});

io.on('connection', (socket)=>{
  socket.on('setup', user => {
    socket.join(user._id);
    socket.emit('connected');
  });

  socket.on('joinRoom', room => socket.join(room));
  socket.on('typing', room => socket.in(room).emit('typing'));
  socket.on('stopTyping', room => socket.in(room).emit('stopTyping'));

  socket.on('newMessage', newMessage => {
    const chat = newMessage.chat;

    if(!chat.users) return console.log('Empty chat');

    chat.users.forEach(user => {
        if(user._id == newMessage.sender._id) return;

        socket.in(user._id).emit('receive', newMessage);
    })
  });
  
});

server.listen(port, () => {
  console.log('Server listening on port: ' + port);
});
