import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import bcrypt from 'bcryptjs';
import { User } from '../schemas/User.mjs';
import { requireLogin } from '../middleware.mjs';

const app = express();
const adminRouter = express.Router();

app.set('view engine', 'hbs');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));
app.use(requireLogin);

adminRouter.get('/', (req, res) => {
    User.find({}, (err, users) => {
        console.log(users);
    });

    User.find({}).sort('-createdAt').exec((err, users) => {
        res.render('admin', {pageTitle: 'Admin', users: users});
    });
});

adminRouter.post('/', (req, res) => {
    User.find({}, (err, users) => {
        if (req.body.firstName && req.body.lastName && req.body.username && req.body.email && req.body.password) {
            const firstName = req.body.firstName.trim();
            const lastName = req.body.lastName.trim();
            const username = req.body.username.trim();
            const email = req.body.email.trim();
            const password = req.body.password;

            const context = req.body;

            if (firstName && lastName && username && email && password) {
                User.findOne({
                    $or: [ //https://www.mongodb.com/docs/manual/reference/operator/query/or/
                        {username: username},
                        {email: email}
                    ]
                }, (err, user) => {
                    if (err) {
                        console.log(err);
                        context.errorMessage = "Oops, something went wrong.";
                        res.render('admin', {pageTitle: 'Admin', context: context, users: users});
                    }
                    else if (user) {
                        if (email === user.email) {
                            context.errorMessage = "Email already in use.";
                        }
                        else {
                            context.errorMessage = "Username already in use.";
                        }
                        res.render('admin', {pageTitle: 'Admin', context: context, users: users});
                    }
                    else { //no user found
                        bcrypt.hash(password, 10, (err, hash) => {
                            if (err) {
                                console.log(err);
                            }
                            else {
                                req.body.password = hash;

                            }
                        });
                        
                        User.create(req.body, (user) => {
                            console.log(user);
                            res.redirect('/admin');
                        });
                    }
                });
            }
            else {
                context.errorMessage = "Make sure each field is valid.";
                res.render('admin', {pageTitle: 'Admin', context: context, users: users});
            }
        }
        else if (req.body.username) {
            const username = req.body.username.trim();
            const context = req.body;

            if (username) {
                User.findOneAndDelete({username: username}, (err, user) => {
                    if(err) {
                        console.log(err);
                        context.errorMessage = "Oops, something went wrong.";
                        res.render('admin', {pageTitle: 'Admin', context: context, users: users});
                    }
                    else if(user) {
                        context.errorMessage = "Successfully deleted";
                        res.redirect('/admin');
                    }
                    else {
                        context.errorMessage = "No user found";
                        res.render('admin', {pageTitle: 'Admin', context: context, users: users});
                    }
                });
            }
            else {
                context.errorMessage = "Make sure each field is valid.";
                res.render('admin', {pageTitle: 'Admin', context: context, users: users});
            }
        }
    });
});

export {
    adminRouter
};