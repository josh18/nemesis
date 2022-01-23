const Promise = require('bluebird');

class ClientController {
    async get() {
        const data = {};

        data.home = homeController.get();
        data.settings = settingsController.get();

        const [assets, status] = await Promise.all([
            assetController.get(),
            statusController.get()
        ]);
        data.assets = assets;
        data.status = status;

        return data;
    }
}

module.exports = new ClientController();

const assetController = require('../controllers/asset');
const homeController = require('../controllers/home');
const settingsController = require('../controllers/settings');
const statusController = require('../controllers/status');
