const fs = require('fs');
const Promise = require('bluebird');
const schedule = require('node-schedule');
const util = require('util');

const exec = util.promisify(require('child_process').exec);

Promise.promisifyAll(fs);

class StatusController {
    get statusFilePath() {
        return '/dev/shm/nemesis/status.txt';
    }

    start() {
        this.startSchedule();
        this.startCameraStatusWatcher();
    }

    startSchedule() {
        // Every minute
        const rule = new schedule.RecurrenceRule();
        rule.minute = new schedule.Range(0, 59);

        schedule.scheduleJob(rule, () => {
            // Check if status has changed
            this.get();
        });
    }

    async startCameraStatusWatcher() {
        try {
            fs.watch(this.statusFilePath, () => {
                // Check if status has changed
                this.get();
            });
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFileAsync(this.statusFilePath, '');
                this.startCameraStatusWatcher();
                return;
            }

            logController.log('app', error);
        }
    }

    async get() {
        const [camera, service] = await Promise.all([
            this.cameraStatus(),
            this.serviceStatus()
        ]);

        const data = {
            service
        };

        if (service === 'started') {
            data.camera = camera;
        }

        if (this.hasChanged(data)) {
            this.currentStatus = data;

            socketController.sendAll('status', data);
        }

        return data;
    }

    async cameraStatus() {
        try {
            const statusMap = {
                md_video: 'motionVideo',
                md_ready: 'motion',
                ready: 'idle'
            };

            const status = await fs.readFileAsync(this.statusFilePath, 'utf-8');

            return statusMap[status] || status;
        } catch (error) {
            logController.log('app', error);
        }
    }

    async serviceStatus() {
        try {
            if (this.serviceInProgress) {
                return 'inProgress';
            }

            let result = await exec('ps -A | grep raspimjpeg');

            if (result) {
                if (result.stderr) {
                    logController.log('app', result.stderr);
                } else if (result.stdout) {
                    return 'started';
                }
            }

            return 'stopped';
        } catch (error) {
            if (error.code === 1) {
                return false;
            }

            logController.log('app', error);
        }
    }

    startProgress() {
        this.serviceInProgress = true;

        const status = {
            service: 'inProgress'
        };

        this.currentStatus = status;

        socketController.sendAll('status', status);
    }

    async stopProgress() {
        this.serviceInProgress = false;
        this.get();
    }

    hasChanged(newStatus) {
        if (!this.currentStatus) {
            return true;
        }

        return this.currentStatus.service !== newStatus.service ||
            this.currentStatus.camera !== newStatus.camera;
    }
}

const statusController = new StatusController();

module.exports = statusController;

const logController = require('./log');
const socketController = require('./socket');

statusController.start();
