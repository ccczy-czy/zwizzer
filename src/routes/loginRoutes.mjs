import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import { User } from '../schemas/User.mjs';

const app = express();
const loginRouter = express.Router();

app.set('view engine', 'pug');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

loginRouter.get('/', (req, res) => {
    res.render('login', {pageTitle: 'Login'});
});

loginRouter.post('/', async (req, res) => {
    const context = req.body;

    if (req.body.logUsername && req.body.password) {
        const user = await User.findOne({
            $or: [ //https://www.mongodb.com/docs/manual/reference/operator/query/or/
                {username: req.body.logUsername},
                {email: req.body.logUsername}
            ]
        }).catch((err) => {
            console.log(err);
            context.errorMessage = 'Oops, something went wrong.';
            context.pageTitle = 'Login';
            res.render('login', context);
        });

        if (user) { //user found
            const result = await bcrypt.compare(req.body.password, user.password);

            if(result === true) {
                req.session.user = user;
                return res.redirect('/');
            }

        }
        context.errorMessage = 'Password or username incorrect.';
        context.pageTitle = 'Login';
        return res.render('login', context);
    }
    context.errorMessage = 'Make sure each field is valid.';
    context.pageTitle = 'Login';
    res.render('login', context);
});

export {
    loginRouter
};