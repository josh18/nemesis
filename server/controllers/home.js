const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const schedule = require('node-schedule');
const util = require('util');

const exec = util.promisify(require('child_process').exec);

const db = require('../db');

Promise.promisifyAll(fs);

class HomeController {
    constructor() {
        try {
            const data  = fs.readFileSync(this.devicesPath, 'utf-8');

            if (data) {
                this.devices = JSON.parse(data);
            }
        } catch (error) {
            if (error.code !== 'ENOENT') {
                logController.log('app', error);
            }
        }
    }

    get dbKey() {
        return 'home';
    }

    get devicesPath() {
        return path.resolve(__dirname, '../data/devices.json');
    }

    start() {
        if (this.devices) {
            this.startSchedule();
        }
    }

    get() {
        return db.get(this.dbKey)
            .value();
    }

    startSchedule() {
        // Every minute
        const rule = new schedule.RecurrenceRule();
        rule.minute = new schedule.Range(0, 59);

        schedule.scheduleJob(rule, () => {
            this.testDevices();
        });
    }

    async testDevices() {
        const deviceTests = this.devices.map(async ({name, ip}) => {
            const result = await this.testDevice(ip);
            if (result) {
                return name;
            }
        });

        let activeDevices = await Promise.all(deviceTests);

        // Filter null values
        activeDevices = activeDevices.filter(result => result);

        logController.log('home', activeDevices);

        if (this.hasChanged(activeDevices)) {
            this.write(activeDevices);
            cameraController.setIdleState();

            socketController.sendAll('home', activeDevices);
        }
    }

    async testDevice(ip) {
        try {
            const result = await exec(`sudo arping -c 10 -C 1 -r ${ip}`);

            if (result) {
                if (result.stderr) {
                    logController.log('app', result.stderr);
                    return false;
                }

                return !!result.stdout;
            }

            return false;
        } catch (error) {
            if (error.code === 1) {
                return false;
            }

            logController.log('app', error);
        }
    }

    write(data) {
        db.set(this.dbKey, data)
            .write();
    }

    hasChanged(newDevices) {
        const currentDevices = this.get();

        if (currentDevices.length !== newDevices.length) {
            return true;
        }

        return !!currentDevices.find((value, i) => {
            return value !== newDevices[i];
        });
    }
}

const homeController = new HomeController();

module.exports = homeController;

const cameraController = require('./camera');
const logController = require('./log');
const socketController = require('./socket');

homeController.start();
