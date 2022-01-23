const express = require('express');
const { body, validationResult } = require('express-validator/check');
const { matchedData } = require('express-validator/filter');

const actionController = require('../controllers/action');
const assetController = require('../controllers/asset');
const authController = require('../controllers/auth');
const clientController = require('../controllers/client');
const homeController = require('../controllers/home');
const logController = require('../controllers/log');
const settingsController = require('../controllers/settings');
const statusController = require('../controllers/status');

const router = express.Router();

function logAuth(req, message) {
    message = `${req.connection.remoteAddress} | ${message}`;
    logController.log('auth', message);
}

router.post('/action', [
    body('action').isIn(actionController.validExternalActions)
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors.mapped());
    }

    const action = matchedData(req).action;
    await actionController.do(action);

    res.status(202).json('');
});

router.get('/assets', async (req, res) => {
    const data = await assetController.get();
    res.json(data);
});

router.get('/client', async (req, res) => {
    const data = await clientController.get();
    res.json(data);
});

router.get('/home', (req, res) => {
    const data = homeController.get();
    res.json(data);
});

router.get('/settings', (req, res) => {
    const data = settingsController.get();
    res.json(data);
});

router.patch('/settings', [
    body('homeDetection').optional().isBoolean(),
    body('motionDetection').optional().isBoolean()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(422).json(errors.mapped());
    }

    const patch = matchedData(req);
    const data = settingsController.set(patch);
    res.json(data);
});

router.get('/status', async (req, res) => {
    const data = await statusController.get();
    res.json(data);
});

router.post('/sign-in', [
    body('password').exists()
], async (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        return res.status(401).json(errors.mapped());
    }

    const password = matchedData(req).password;
    try {
        const { token, expiryDate } = await authController.signIn(password);

        authController.createCookie(res, token, expiryDate);
        res.json('');

        logAuth(req, 'Sign in');
    } catch(error) {
        logAuth(req, 'Sign in failed');
        res.status(401).json(error);
    }
});

router.delete('/sign-out', (req, res) => {
    const token = req.cookies.token;
    if (token) {
        authController.deleteToken(token);
    }

    res.clearCookie('token');
    res.json('');

    logAuth(req, 'Sign out');
});

router.delete('/sign-out-sessions', (req, res) => {
    const token = req.cookies.token;

    authController.deleteTokens(token);

    res.json('');

    logAuth(req, 'Sign out sessions');
});

module.exports = router;
