const authController = require('../controllers/auth');

function auth(req, res, next) {
    function log(message) {
        message = `${req.path} | ${req.connection.remoteAddress} | ${message}`;
        logController.log('access', message);
    }

    if (req.path !== '/api/sign-in' && req.path !== '/api/sign-out') {
        const token = req.cookies.token;
        const error = authController.validateRequest(req, token);

        if (error) {
            return res.status(401).json(error);
        }

        const expiryDate = authController.refreshToken(token);

        if (expiryDate) {
            authController.createCookie(res, token, expiryDate);
        }
    }

    log('Successful');
    next();
}

function noCache(req, res, next) {
    res.set('Cache-Control', 'no-cache');
    next();
}

function noSubdirectories(req, res, next) {
    if ((req.path.match(/\//g) || []).length !== 1) {
        return res.sendStatus(404);
    }

    next();
}

module.exports = {
    auth,
    noCache,
    noSubdirectories
};

const logController = require('../controllers/log');
