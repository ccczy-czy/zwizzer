import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { User } from '../db.mjs';

const app = express();
const registerRouter = express.Router();

app.set('view engine', 'hbs');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

//------------Route Handler------------
registerRouter.get('/', (req, res) => {
    res.render('register', {pageTitle: 'Register', layout: 'layouts/login-layout'});
});

registerRouter.post('/', async (req, res) => {
    //------------validation------------
    const firstName = req.body.firstName.trim();
    const lastName = req.body.lastName.trim();
    const username = req.body.username.trim();
    const email = req.body.email.trim();
    const password = req.body.password;

    const context = req.body;

    if (firstName && lastName && username && email && password) {
        const user = await User.findOne({
            $or: [ //https://www.mongodb.com/docs/manual/reference/operator/query/or/
                {username: username},
                {email: email}
            ]
        }).catch((err) => {
            console.log(err);
            context.errorMessage = "Oops, something went wrong.";
            res.render('register', {pageTitle: 'Register', context: context, layout: 'layouts/login-layout'});
        });

        if (user) { //user found
            if (email === user.email) {
                context.errorMessage = "Email already in use.";
            }
            else {
                context.errorMessage = "Username already in use.";
            }
            res.render('register', {pageTitle: 'Register', context: context, layout: 'layouts/login-layout'});
        }
        else { //no user found
            User.create(req.body).then((user) => {
                console.log(user);
            });
        }
    }
    else {
        context.errorMessage = "Make sure each field is valid.";
        res.render('register', {pageTitle: 'Register', context: context, layout: 'layouts/login-layout'});
    }
});

export {
    registerRouter
};