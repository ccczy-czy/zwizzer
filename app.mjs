import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import './db.mjs';
import bodyParser from 'body-parser';
import session from 'express-session';

const app = express();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const sessionOptions = {
    secret: 'some secret cookie',
    resave: true,
    saveUninitialized: true
};

app.use(session(sessionOptions));

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'public')));

app.set('view engine', 'hbs');

app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index');
});

app.listen(process.env.PORT || 3000);
