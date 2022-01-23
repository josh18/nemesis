const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');
const util = require('util');

const exec = util.promisify(require('child_process').exec);

const db = require('../db');

Promise.promisifyAll(fs);

class AssetController {
    get liveFilePath() {
        return '/dev/shm/nemesis/live.jpg';
    }

    get liveFps() {
        return 30;
    }

    get imagesDirectory() {
        return path.resolve(__dirname, '../../assets/images');
    }

    get thumbnailsDirectory() {
        return path.resolve(__dirname, '../../assets');
    }

    get videosDirectory() {
        return path.resolve(__dirname, '../../assets/videos');
    }

    get cacheDbKey() {
        return 'cache';
    }

    start() {
        this.startAssetWatcher();
    }

    startAssetWatcher() {
        fs.watch(this.thumbnailsDirectory, async (eventType, fileName) => {
            if (eventType !== 'rename') {
                return;
            }

            const filePath = `${this.thumbnailsDirectory}/${fileName}`;
            const stats = await fs.statAsync(filePath);

            if (stats.isDirectory()) {
                return;
            }

            const file = await this.getFileInfo(fileName);

            if (file) {
                socketController.sendAll('asset:add', file);
            } else {
                socketController.sendAll('asset:remove', `${this.thumbnailsDirectory}/${fileName}`);
            }
        });
    }

    async get() {
        try {
            let files = await fs.readdirAsync(this.thumbnailsDirectory);

            files = await Promise.all(files.map(async (fileName) => {
                return this.getFileInfo(fileName);
            }));

            // Remove any undefined files (directories)
            files = files.filter(file => file);

            // Sort by created date descending
            files = files.sort((a, b) => {
                return b.created - a.created;
            });

            return files;
        } catch (error) {
            logController.log('app', error);
        }
    }

    async getFileInfo(fileName) {
        try {
            const filePath = `${this.thumbnailsDirectory}/${fileName}`;

            const stats = await fs.statAsync(filePath);

            if (stats.isDirectory()) {
                return;
            }

            let [type, name] = fileName.split('@');
            type = type.slice(0, -1);
            name = name.split('.').slice(0, -3).join('.');

            const fileDetails = {
                created: stats.birthtime,
                path: `/assets/${type}s/${name}`,
                thumbnailPath: `/assets/thumbnails/${fileName}`,
                type
            };

            if (type === 'image') {
                fileDetails.width = 3280;
                fileDetails.height = 2464;
            }

            if (type === 'video') {
                fileDetails.length = await this.getVideoLength(name);
            }

            return fileDetails;
        } catch (error) {
            if (error.code !== 'ENOENT') {
                logController.log('app', error);
            }
        }
    }

    async getVideoLength(fileName) {
        try {
            const cacheLocation = [this.cacheDbKey, 'videoLength', fileName];
            const cachedLength = db.get(cacheLocation)
                .value();

            if (cachedLength) {
                return cachedLength;
            }

            const file = `${this.videosDirectory}/${fileName}`;
            const result = await exec(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 -sexagesimal ${file}`);
            if (result.stderr) {
                logController.log('app', result.stderr);
                return;
            }

            let videoLength = result.stdout;
            videoLength = videoLength.replace(/\n/, '');

            videoLength = videoLength.split(':');
            videoLength[videoLength.length - 1] = Math.round(videoLength[videoLength.length - 1]);
            videoLength = videoLength.join(':');

            db.set(cacheLocation, videoLength)
                .write();

            return videoLength;
        } catch (error) {
            logController.log('app', error);
        }
    }
}

const assetController = new AssetController();

module.exports = assetController;

const logController = require('./log');
const socketController = require('./socket');

assetController.start();
