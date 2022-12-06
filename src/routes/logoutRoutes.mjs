import express from 'express';
import bodyParser from 'body-parser';

const app = express();
const logoutRouter = express.Router();


app.use(bodyParser.urlencoded({ extended: false }));

logoutRouter.get('/', (req, res) => {
    if (req.session) {
        req.session.destroy(() => {
            res.redirect('/login');
        });
    }
});


export {
    logoutRouter
};