import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { User } from '../schemas/User.mjs';

const app = express();
const profileRouter = express.Router();

app.set('view engine', 'pug');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

profileRouter.get('/', (req, res) => {
    res.render('profilePage', {pageTitle: req.session.user.username, userLoggedIn: req.session.user, clientUser: JSON.stringify(req.session.user), profileUser: req.session.user});
});

profileRouter.get('/:username', async (req, res) => {
    const context = await getContext(req.params.username, req.session.user);

    res.render('profilePage', context);
});

profileRouter.get('/:username/replies', async (req, res) => {
    const context = await getContext(req.params.username, req.session.user);
    context.tab = 'replies';

    res.render('profilePage', context);
});

profileRouter.get('/:username/following', async (req, res) => {
    const context = await getContext(req.params.username, req.session.user);
    context.tab = 'following';

    res.render('follow', context);
});

profileRouter.get('/:username/followers', async (req, res) => {
    const context = await getContext(req.params.username, req.session.user);
    context.tab = 'followers';

    res.render('follow', context);
});

async function getContext(username, userLoggedIn) {
    let user = await User.findOne({username: username});

    if (!user) {
        user = User.findById(username);

        if (!user) {
            return {
                pageTitle: 'User not found',
                userLoggedIn: userLoggedIn,
                clientUser: JSON.stringify(userLoggedIn)
            };
        }
    }

    return {
        pageTitle: user.username,
        userLoggedIn: userLoggedIn,
        clientUser: JSON.stringify(userLoggedIn),
        profileUser: user
    };
}

export {
    profileRouter
};