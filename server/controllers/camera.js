const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

Promise.promisifyAll(fs);

class CameraController {
    get motionTriggerFilePath() {
        return path.resolve(__dirname, '../../raspimjpeg/motion-trigger.txt');
    }

    start() {
        this.startMotionWatcher();
    }

    async startMotionWatcher() {
        try {
            fs.watch(this.motionTriggerFilePath, async () => {
                try {
                    const data = await fs.readFileAsync(this.motionTriggerFilePath, 'utf-8');
                    this.handleMotionChange(data);
                } catch (error) {
                    logController.log('app', error);
                }
            });
        } catch (error) {
            if (error.code === 'ENOENT') {
                await fs.writeFileAsync(this.motionTriggerFilePath, '');
                this.startMotionWatcher();
                return;
            }

            logController.log('app', error);
        }
    }

    async handleMotionChange(data) {
        const status = await statusController.cameraStatus();

        if (data === '1' && status === 'motion') {
            return actionController.do('startVideo');
        } else if (data === '0' && status === 'motionVideo') {
            return actionController.do('stopVideo');
        }
    }

    async setIdleState() {
        const settings = settingsController.get();
        const homeCheck = settings.homeDetection && homeController.get().length;

        const status = await statusController.cameraStatus();

        // Motion
        if (settings.motionDetection && !homeCheck) {
            if (status !== 'motion') {
                actionController.do('startMotion');
            }
            return;
        }

        // Idle
        if (status === 'motion') {
            actionController.do('stopMotion');
        }
    }
}

const cameraController = new CameraController();

module.exports = cameraController;

const actionController = require('./action');
const statusController = require('./status');
const homeController = require('./home');
const logController = require('./log');
const settingsController = require('./settings');

cameraController.start();
