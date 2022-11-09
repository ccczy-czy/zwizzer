import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const app = express();
const registerRouter = express.Router();

app.set('view engine', 'hbs');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

//------------Route Handler------------
registerRouter.get('/', (req, res, next) => {
    res.render('register', {pageTitle: 'Register', layout: 'layouts/login-layout'});
});

registerRouter.post('/', (req, res, next) => {
    //------------validation------------
    let firstName = req.body.firstName.trim();
    let lastName = req.body.lastName.trim();
    let username = req.body.username.trim();
    let email = req.body.email.trim();
    let password = req.body.password;

    const context = req.body;

    if (firstName && lastName && username && email && password) {

    }
    else {
        context.errorMessage = "Make sure each field is valid.";
        res.render('register', {pageTitle: 'Register', context: context, layout: 'layouts/login-layout'});
    }
});

export {
    registerRouter
}