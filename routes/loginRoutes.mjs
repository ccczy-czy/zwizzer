import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const loginRouter = express.Router();

app.set('view engine', 'hbs');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

//------------Route Handler------------
loginRouter.get('/', (req, res, next) => {
    res.render('login', {pageTitle: 'Login', layout: 'layouts/login-layout'});
});

export {
    loginRouter
}