const schedule = require('node-schedule');
const WebSocket = require('ws');

class SocketController {
    start(wss) {
        this.wss = wss;
    }

    handleConnection(ws) {
        // 1 day from now
        const expiryDate = new Date();
        expiryDate.setDate(expiryDate.getDate() + 1);
        ws.expiryDate = expiryDate;

        this.handleMessage(ws);
        this.startSchedule();
    }

    startSchedule() {
        // Every minute
        const rule = new schedule.RecurrenceRule();
        rule.minute = new schedule.Range(0, 59);

        schedule.scheduleJob(rule, () => {
            this.expireClients();
        });
    }

    expireClients() {
        if (!this.wss) {
            return;
        }

        const now = new Date();

        this.wss.clients.forEach((client) => {
            if (client.expiryDate < now) {
                client.close(1011, 'Authentication expired');
            }
        });
    }

    handleMessage(ws) {
        ws.on('message', (message) => {
            const { data, type } = JSON.parse(message);
            switch (type) {
                case 'settings': {
                    this.patchSettings(data, ws);
                    break;
                }
            }
        });
    }

    patchSettings(data, ws) {
        const validatedData = {};

        Object.entries(data).forEach(([key, value]) => {
            if (['homeDetection', 'motionDetection'].includes(key) && typeof value === 'boolean') {
                validatedData[key] = value;
            }
        });

        const settings = settingsController.set(validatedData);
        this.sendAll('settings', settings, ws);
    }

    sendAll(type, data, ws) {
        if (!this.wss) {
            return;
        }

        this.wss.clients.forEach((client) => {
            if (
                client.readyState === WebSocket.OPEN &&
                (!ws || client !== ws)
            ) {
                client.send(JSON.stringify({
                    type,
                    data
                }));
            }
        });
    }
}

module.exports = new SocketController();

const settingsController = require('./settings');
