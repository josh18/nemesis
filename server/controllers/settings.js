const db = require('../db');

class SettingsController {
    get dbKey() {
        return 'settings';
    }

    get() {
        return db.get(this.dbKey)
            .value();
    }

    set(patch) {
        this.patch(patch);

        cameraController.setIdleState();

        return this.get();
    }

    patch(data) {
        db.get(this.dbKey)
            .assign(data)
            .write();
    }
}

module.exports = new SettingsController();

const cameraController = require('./camera');
