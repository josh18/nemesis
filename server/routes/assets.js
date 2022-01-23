const express = require('express');
const fs = require('fs');
const Promise = require('bluebird');

const assetController = require('../controllers/asset');
const { noSubdirectories } = require('./middleware');

Promise.promisifyAll(fs);

const router = express.Router();

router.get('/stream.mjpeg', (req, res) => {
    async function writeJpeg() {
        const data = await fs.readFileAsync(assetController.liveFilePath);
        res.write('--' + boundary + '\r\n');
        res.write('Content-Type: image/jpeg\r\n');
        res.write('Content-Length: ' + data.length + '\r\n');
        res.write('\r\n');
        res.write(data);
        res.write('\r\n');

        setTimeout(() => {
            writeJpeg();
        }, 1000 / assetController.liveFps);
    }

    const boundary = 'streamBoundary';
    res.set('Content-Type', `multipart/x-mixed-replace; boundary=${boundary}`);

    writeJpeg();
});

router.use('/images', express.static(assetController.imagesDirectory));
router.use('/thumbnails', noSubdirectories, express.static(assetController.thumbnailsDirectory));
router.use('/videos', express.static(assetController.videosDirectory));

module.exports = router;
