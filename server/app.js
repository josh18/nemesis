const bodyParser = require('body-parser');
const compression = require('compression');
const cookie = require('cookie');
const cookieParser = require('cookie-parser');
const express = require('express');
const mkdirp = require('mkdirp');
const path = require('path');
const WebSocket = require('ws');

const dataDirectory = path.resolve(__dirname, './data');
mkdirp(dataDirectory);

const actionController = require('./controllers/action');
const authController = require('./controllers/auth');
const socketController = require('./controllers/socket');
const apiRouter = require('./routes/api');
const assetsRouter = require('./routes/assets');
const { auth, noCache } = require('./routes/middleware');

actionController.do('startService');

const app = express();
app.use(compression());
app.use(cookieParser());
app.use(bodyParser.json());
app.use(auth);

app.get('/', (req, res) => {
    res.send('API is running');
});

app.use('/api', noCache, apiRouter);
app.use('/assets', assetsRouter);

const server = app.listen(8080, () => {
    console.log(`API is running on port ${server.address().port}`);
});
const wss = new WebSocket.Server({
    server,
    verifyClient: ({req}) => {
        if (!req.headers.cookie) {
            return false;
        }

        const token = cookie.parse(req.headers.cookie).token;
        const error = authController.validateRequest(req, token);

        return !error;
    }
});

socketController.start(wss);

wss.on('connection', (ws) => {
    socketController.handleConnection(ws);
});
