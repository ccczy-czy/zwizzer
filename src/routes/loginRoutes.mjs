import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import { User } from '../schemas/User.mjs';

const app = express();
const loginRouter = express.Router();

app.set('view engine', 'hbs');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

loginRouter.get('/', (req, res) => {
    res.render('login', {pageTitle: 'Login', layout: 'layouts/login-layout'});
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
            res.render('login', {pageTitle: 'Login', context: context, layout: 'layouts/login-layout'});
        });

        if (user) { //user found
            const result = await bcrypt.compare(req.body.password, user.password);

            if(result === true) {
                req.session.user = user;
                return res.redirect('/');
            }

        }
        context.errorMessage = 'Password or username incorrect.';
        return res.render('login', {pageTitle: 'Login', context: context, layout: 'layouts/login-layout'});
    }
    context.errorMessage = 'Make sure each field is valid.';
    res.render('login', {pageTitle: 'Login', context: context, layout: 'layouts/login-layout'});
});

export {
    loginRouter
};