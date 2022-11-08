import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import './db.mjs';
import bodyParser from 'body-parser';
import session from 'express-session';
import * as auth from './auth.mjs';
import { loginRouter } from './routes/loginRoutes.mjs';
import { registerRouter } from './routes/registerRoutes.mjs';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = process.env.PORT || 3000;

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(express.static(path.join(__dirname, 'public')));

app.use(bodyParser.urlencoded({ extended: false }));

const sessionOptions = {
    secret: 'some secret cookie',
    resave: true,
    saveUninitialized: true
};
app.use(session(sessionOptions));

//------------Custom Middleware------------
app.use(auth.authRequired(['/']));

app.use((req, res, next) => {
  console.log(req.method, req.path, req.body);
  next();
});

app.use('/login', loginRouter);

app.use('/register', registerRouter);

//------------Route Handler------------
app.get('/', (req, res) => {
  res.render('index', {pageTitle: 'Home'});
});

app.listen(port, () => {
  console.log('Server listening on port: ' + port);
});
