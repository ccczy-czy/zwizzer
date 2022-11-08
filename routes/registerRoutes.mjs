import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const registerRouter = express.Router();

app.set('view engine', 'hbs');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

registerRouter.get('/', (req, res, next) => {
    res.render('register', {layout: 'layouts/login-layout'});
});

export {
    registerRouter
}