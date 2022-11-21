import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import session from 'express-session';
import hbs from 'hbs';
import fs from 'fs';
import { createServer } from 'http';
import { Server } from 'socket.io';
import './db.mjs';
import { loginRouter } from './routes/loginRoutes.mjs';
import { registerRouter } from './routes/registerRoutes.mjs';
import { adminRouter } from './routes/adminRoutes.mjs';
import { messageRouter } from './routes/messageRoutes.mjs';
/*import { postRouter } from './routes/postRoutes.mjs';
import { profileRouter } from './routes/profileRoutes.mjs';
import { uploadRouter } from './routes/uploadRoutes.mjs';
import { searchRouter } from './routes/searchRoutes.mjs';
import { messagesRouter } from './routes/messagesRoutes.mjs';
*/
import { requireLogin, logRequest } from './middleware.mjs';

/*import { postsApiRouter } from './routes/api/posts';
import { usersApiRouter } from './routes/api/users';
import { chatsApiRouter } from './routes/api/chats';
import { messagesApiRouter } from './routes/api/messages';
*/

const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const server = createServer(app);
const io = new Server(server);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

// use partials in handlebars, help code from stackoverflow ==> https://stackoverflow.com/questions/8059914/express-js-hbs-module-register-partials-from-hbs-file
const partialsDir = __dirname + '/views/partials';
const partials = fs.readdirSync(partialsDir);

partials.forEach(function (p) {
  const matches = /^([^.]+).hbs$/.exec(p);
  if (!matches) {
    return;
  }
  const template = fs.readFileSync(partialsDir + '/' + p, 'utf8');
  hbs.registerPartial(matches[1], template);
});

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
app.use('/admin', adminRouter);
app.use('/messages', requireLogin, messageRouter);
/*app.use('/posts', requireLogin, postRouter);
app.use('/profile', requireLogin, profileRouter);
app.use('/uploads', uploadRouter);
app.use('/search', requireLogin, searchRouter);
app.use('/messages', requireLogin, messagesRouter);

app.use('/api/posts', postsApiRouter);
app.use('/api/users', usersApiRouter);
app.use('/api/chats', chatsApiRouter);
app.use('/api/messages', messagesApiRouter);
*/

app.get('/', requireLogin, (req, res) => {
  res.render('index', {pageTitle: 'Home', userLoggedIn: req.session.user});
});

io.on('connection', (socket) => {
  socket.on('chat message', (msg) => {
    io.emit('chat message', msg);
  });
});

/*io.on('connection', socket => {

  socket.on('setup', userData => {
      socket.join(userData._id);
      socket.emit('connected');
  });

  socket.on('join room', room => socket.join(room));
  socket.on('typing', room => socket.in(room).emit('typing'));
  socket.on('stop typing', room => socket.in(room).emit('stop typing'));


  socket.on('new message', newMessage => {
      const chat = newMessage.chat;

      if(!chat.users) {
        console.log('Chat users not defined');
      }

      chat.users.forEach(user => {
          if(user._id === newMessage.sender._id){
            return;
          }
          console.log(user);
          socket.in(user._id).emit('message received', newMessage);
      });
  });
});*/

server.listen(port, () => {
  console.log('Server listening on port: ' + port);
});
