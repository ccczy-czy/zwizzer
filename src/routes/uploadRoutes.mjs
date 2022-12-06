import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import bodyParser from 'body-parser';

const app = express();
const uploadRouter = express.Router();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.set('view engine', 'pug');
app.set('views', path.join(path.dirname(fileURLToPath(import.meta.url)), 'views'));

app.use(bodyParser.urlencoded({ extended: false }));

uploadRouter.get('/images/:picPath', (req, res) => {
    res.sendFile(path.join(__dirname, `../uploads/images/${req.params.picPath}`));
});

export {
    uploadRouter
};