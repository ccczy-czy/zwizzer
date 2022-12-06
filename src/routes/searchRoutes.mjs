import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const app = express();
const searchRouter = express.Router();

app.set('view engine', 'pug');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

searchRouter.get('/', (req, res) => {
    const context = getContext(req.session.user);
    res.render('searchPage', context);
});

searchRouter.get('/:tab', (req, res) => {
    const context = getContext(req.session.user);
    context.tab = req.params.tab;
    res.render('searchPage', context);
});

function getContext(userLoggedIn) {
    return {
        pageTitle: 'Search',
        userLoggedIn: userLoggedIn,
        clientUser: JSON.stringify(userLoggedIn)
    };
}

export {
    searchRouter
};