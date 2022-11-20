/*import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { User } from '../db.mjs';
import bcrypt from 'bcryptjs';

const app = express();
const loginRouter = express.Router();

app.set('view engine', 'hbs');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

//------------Route Handler------------
loginRouter.get('/', (req, res) => {
    res.render('login', {pageTitle: 'Login', layout: 'layouts/login-layout'});
});

loginRouter.post('/', async (req, res) => {
    //------------validation------------
    const logUsername = req.body.logUsername.trim();
    const password = req.body.password;

    const context = req.body;

    if (logUsername && password) {
        const user = await User.findOne({
            $or: [ //https://www.mongodb.com/docs/manual/reference/operator/query/or/
                {username: logUsername},
                {email: logUsername}
            ]
        }).catch((err) => {
            console.log(err);
            context.errorMessage = "Oops, something went wrong.";
            res.render('login', {pageTitle: 'Login', context: context, layout: 'layouts/login-layout'});
        });

        if (user) { //user found
            bcrypt.compare(password, user.password, (err, passwordMatch) => {
                if (err) {
                  console.log(err);
                  context.errorMessage = "Oops, something went wrong.";
                  res.render('login', {pageTitle: 'Login', context: context, layout: 'layouts/login-layout'});
                }
                else if (passwordMatch) { //password match
                  res.render('index');
                }
                else { //password doesn't match
                    context.errorMessage = "Wrong password.";
                    res.render('login', {pageTitle: 'Login', context: context, layout: 'layouts/login-layout'});
                }
            });
        }
        else { //no user found
            context.errorMessage = "User not found.";
            res.render('login', {pageTitle: 'Login', context: context, layout: 'layouts/login-layout'});
        }
    }
    else {
        context.errorMessage = "Make sure each field is valid.";
        res.render('login', {pageTitle: 'Login', context: context, layout: 'layouts/login-layout'});
    }
});

export {
    loginRouter
};
*/

import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const app = express();
const loginRouter = express.Router();

app.set('view engine', 'hbs');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

loginRouter.get('/', (req, res) => {
    res.render('login', {pageTitle: 'Login', layout: 'layouts/login-layout'});
});

export {
    loginRouter
};