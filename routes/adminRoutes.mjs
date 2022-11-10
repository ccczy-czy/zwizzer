import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';
import { User } from '../db.mjs';
import bcrypt from 'bcryptjs';

const app = express();
const adminRouter = express.Router();

app.set('view engine', 'hbs');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

let users1 = [];

User.find({}, (err, users) => {
    console.log(users);
    users1.push(...users);
});

//------------Route Handler------------
adminRouter.get('/', (req, res) => {
    console.log(users1);
    res.render('admin', {pageTitle: 'Admin', users: users1});
});

adminRouter.post('/', async (req, res) => {
    //------------validation------------
    if (req.body.firstName && req.body.lastName && req.body.username && req.body.email && req.body.password) {
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
                res.render('admin', {pageTitle: 'Admin', context: context, users: users1});
            });

            if (user) { //user found
                if (email === user.email) {
                    context.errorMessage = "Email already in use.";
                }
                else {
                    context.errorMessage = "Username already in use.";
                }
                res.render('admin', {pageTitle: 'Admin', context: context, users: users1});
            }
            else { //no user found
                req.body.password = await bcrypt.hash(password, 10);
                
                User.create(req.body).then((user) => {
                    console.log(user);
                    users1.push(user);
                    res.render('admin', {pageTitle: 'Admin', context: context, users: users1});
                });
            }
        }
        else {
            context.errorMessage = "Make sure each field is valid.";
            res.render('admin', {pageTitle: 'Admin', context: context, users: users1});
        }
    }
    else if (req.body.username) {
        const username = req.body.username.trim();

        const context = req.body;

        if (username) {
            User.findOneAndDelete({username: username}, (err) => {
                if(err) {
                    console.log(err);
                    context.errorMessage = "Oops, something went wrong.";
                    res.render('admin', {pageTitle: 'Admin', context: context, users: users1});
                }
                else {
                    for (let i = 0; i < users1.length; i++) {
                        if (users1[i].username === username) {
                            context.errorMessage = "Successfully deleted";
                            users1.splice(i,1);
                            break;
                        }
                    }
                    if (context.errorMessage === "Successfully deleted") {
                        res.render('admin', {pageTitle: 'Admin', context: context, users: users1});
                    }
                    else {
                        context.errorMessage = "No user found";
                        res.render('admin', {pageTitle: 'Admin', context: context, users: users1});
                    }
                }
            });
        }
        else {
            context.errorMessage = "Make sure each field is valid.";
            res.render('admin', {pageTitle: 'Admin', context: context, users: users1});
        }
    }
    
});

export {
    adminRouter
};