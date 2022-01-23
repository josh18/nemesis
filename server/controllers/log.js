const fs = require('fs');
const mkdirp = require('mkdirp');
const os = require('os');
const path = require('path');
const Promise = require('bluebird');
const schedule = require('node-schedule');

Promise.promisifyAll(fs);

class LogController {
    constructor() {
        mkdirp(this.logDirectory);
    }

    get debug() {
        return true;
    }

    get logDirectory() {
        return path.resolve(__dirname, '../data/logs');
    }

    start() {
        // Every day
        const rule = new schedule.RecurrenceRule();
        rule.hour = 0;
        rule.minute = 0;

        schedule.scheduleJob(rule, () => {
            this.trimLogs();
        });
    }

    async log(filename, data) {
        try {
            const now = new Date();
            const date = now.toLocaleDateString('en-nz');
            const time = now.toLocaleTimeString('en-nz');

            let logData = [
                date,
                time,
                data
            ].join('\t');

            logData += os.EOL;

            if (this.debug && filename === 'app') {
                console.error(data);
            }

            return await fs.appendFileAsync(`${this.logDirectory}/${filename}.txt`, logData);
        } catch (error) {
            console.error(error);
        }
    }

    async trimLogs() {
        try {
            let files = await fs.readdirAsync(this.logDirectory);

            files.forEach(async (fileName) => {
                const file = `${this.logDirectory}/${fileName}`;
                let data = await fs.readFileAsync(file, 'utf-8');
                data = data.split(os.EOL).slice(-5000).join(os.EOL);
                fs.writeFileAsync(file, data);
            });

            Promise.all(files);
        } catch (error) {
            this.log('app', error);
        }
    }
}

const logController = new LogController();

module.exports = logController;

logController.start();
