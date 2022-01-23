const { exec } = require('child_process');
const fs = require('fs');
const mkdirp = require('mkdirp');
const os = require('os');
const path = require('path');
const Promise = require('bluebird');

Promise.promisifyAll(fs);
Promise.promisifyAll(mkdirp);

class ActionController {
    get inputFilePath() {
        return path.resolve(__dirname, '../../raspimjpeg/input.txt');
    }

    get cliActions() {
        const commands = {
            createDir: 'mkdir -p /dev/shm/nemesis',
            sleep: 'sleep 1',
            startService: 'raspimjpeg > /dev/null 2>&1',
            stopService: 'killall raspimjpeg'
        };

        const actions = {
            startService: [
                commands.stopService,
                commands.createDir,
                commands.sleep,
                commands.startService
            ],
            stopService: commands.stopService
        };

        Object.entries(actions).forEach(([key, value]) => {
            if (Array.isArray(value)) {
                actions[key] = value.join('; ');
            }
        });

        return actions;
    }

    get raspimjpegActions() {
        return {
            resetService: {
                command: 'ru',
                input: 1
            },
            pauseService: {
                command: 'ru',
                input: 0
            },
            captureImage: {
                command: 'im',
                input: 1
            },
            startVideo: {
                command: 'ca',
                input: 1
            },
            stopVideo: {
                command: 'ca',
                input: 0
            },
            startMotion: {
                command: 'md',
                input: 1
            },
            stopMotion: {
                command: 'md',
                input: 0
            }
        };
    }

    get validExternalActions() {
        return [
            'captureImage',
            'startVideo',
            'stopVideo',
            'startService',
            'stopService',
            'resetService',
            'pauseService'
        ];
    }

    async do(action) {
        try {
            const isServiceAction = ['startService', 'stopService'].includes(action);

            if (isServiceAction) {
                statusController.startProgress();
            }

            if (action === 'startService') {
                await Promise.all([
                    fs.writeFileAsync(this.inputFilePath, ''),
                    fs.writeFileAsync(cameraController.motionTriggerFilePath, '')
                ]);
            }

            const cliAction = this.cliActions[action];
            if (cliAction) {
                exec(cliAction);
            }

            const raspimjpegAction = this.raspimjpegActions[action];
            if (raspimjpegAction) {
                await this.raspimjpegInput(raspimjpegAction.command, raspimjpegAction.input);
            }

            if (action === 'startService') {
                await cameraController.setIdleState();
            }

            if (isServiceAction) {
                statusController.stopProgress();
            }
        } catch (error) {
            logController.log('app', error);
        }
    }

    async raspimjpegInput(command, input) {
        try {
            const data = `${command} ${input}${os.EOL}`;
            return await fs.appendFileAsync(this.inputFilePath, data);
        } catch (error) {
            logController.log('app', error);
        }
    }
}

module.exports = new ActionController();

const cameraController = require('./camera');
const logController = require('./log');
const statusController = require('./status');
