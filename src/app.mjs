import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import session from 'express-session';
import './db.mjs';
import { loginRouter } from './routes/loginRoutes.mjs';
import { registerRouter } from './routes/registerRoutes.mjs';
import { requireLogin, logRequest } from './middleware.mjs';


const app = express();
const port = process.env.PORT || 3000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'hbs');
app.set('views', path.join(__dirname, 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(path.join(__dirname, "public")));

app.use(session({
  secret: "some secret choco chip cookies",
  resave: true,
  saveUninitialized: false
}));

app.use(logRequest);
app.use('/login', loginRouter);
app.use('/register', registerRouter);

app.get('/', requireLogin, (req, res) => {
  res.render('index', {pageTitle: 'Home', userLoggedIn: req.session.user});
});

app.listen(port, () => {
  console.log('Server listening on port: ' + port);
});
