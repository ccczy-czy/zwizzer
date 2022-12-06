import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const app = express();
const postRouter = express.Router();

app.set('view engine', 'pug');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

postRouter.get('/:postId', (req, res) => {
    res.render('postPage', {pageTitle: 'View Post', userLoggedIn: req.session.user, clientUser: JSON.stringify(req.session.user), postId: req.params.postId});
});

export {
    postRouter
};