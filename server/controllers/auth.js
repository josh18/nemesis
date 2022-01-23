const crypto = require('crypto');
const Promise = require('bluebird');
const schedule = require('node-schedule');

const db = require('../db');

Promise.promisifyAll(crypto);

class AuthController {
    get dbKey() {
        return 'auth';
    }

    start() {
        // Every day
        const rule = new schedule.RecurrenceRule();
        rule.hour = 0;
        rule.minute = 0;

        schedule.scheduleJob(rule, () => {
            this.removeExpiredTokens();
        });
    }

    async signIn(password) {
        const authenticated = await this.checkPassword(password);

        if (authenticated) {
            return this.createToken();
        }

        throw 'Wrong password';
    }

    async checkPassword(password) {
        const auth = db.get(this.dbKey)
            .value();

        if (!auth.password || !auth.salt) {
            throw 'No password set';
        }

        password = await this.hashPassword(password, auth.salt);
        return password === auth.password;
    }

    async setPassword(password) {
        const salt = crypto.randomBytes(256).toString('hex');

        password = await this.hashPassword(password, salt);

        const auth = {
            password,
            salt
        };

        db.get(this.dbKey)
            .assign(auth)
            .write();

        this.deleteTokens();
    }

    async hashPassword(password, salt) {
        try {
            const derivedKey = await crypto.pbkdf2Async(password, salt, 100000, 64, 'sha512');
            return derivedKey.toString('hex');
        } catch (error) {
            logController.log('app', error);
        }
    }

    createToken() {
        const token = crypto.randomBytes(256).toString('hex');
        const expiryDate = this.createTokenExpiryDate();

        db.set([this.dbKey, 'tokens', token], expiryDate.toISOString())
            .write();

        return {
            token,
            expiryDate
        };
    }

    createTokenExpiryDate() {
        // 30 days from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 30);

        return expiryDate;
    }

    checkToken(token) {
        const now = new Date();

        let expiryDate = db.get([this.dbKey, 'tokens', token])
            .value();

        expiryDate = new Date(expiryDate);

        return expiryDate && expiryDate > now;
    }

    refreshToken(token) {
        const now = new Date();

        let refreshDate = db.get([this.dbKey, 'tokens', token])
            .value();

        refreshDate = new Date(refreshDate);
        refreshDate.setDate(refreshDate.getDate() - 29);

        if (now > refreshDate) {
            const expiryDate = this.createTokenExpiryDate();
            db.set([this.dbKey, 'tokens', token], expiryDate.toISOString())
                .write();

            return expiryDate;
        }
    }

    deleteToken(token) {
        db.get([this.dbKey, 'tokens'])
            .unset(token)
            .write();
    }

    deleteTokens(currentUserToken) {
        const newTokens = db.get([this.dbKey, 'tokens'])
            .pick([currentUserToken])
            .value();

        db.set([this.dbKey, 'tokens'], newTokens)
            .write();
    }

    createCookie(res, token, expiryDate) {
        res.cookie('token', token, {
            expires: expiryDate,
            httpOnly: true,
            sameSite: true
            // secure: true
        });
    }

    removeExpiredTokens() {
        const now = new Date();

        const newTokens = db.get([this.dbKey, 'tokens'])
            .pickBy((expiryDate) => {
                expiryDate = new Date(expiryDate);
                return expiryDate > now;
            })
            .value();

        db.set([this.dbKey, 'tokens'], newTokens)
            .write();
    }

    validateRequest(req, token) {
        let error;

        if (!token) {
            error = 'Unauthorised';
        }

        if (!this.checkToken(token)) {
            error = 'Invalid token';
        }

        if (error) {
            this.logAccess(req, error);
        }

        return error;
    }

    logAccess(req, message) {
        message = `${req.path} | ${req.connection.remoteAddress} | ${message}`;
        logController.log('access', message);
    }
}

const authController = new AuthController();

module.exports = authController;

const logController = require('./log');

authController.start();
