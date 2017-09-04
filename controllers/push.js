const webPush = require('web-push');

const config = require('../config');
const fetchSub = require('../services/firebaseApi').fetchPushSub;
const saveSub = require('../services/firebaseApi').savePushSub;
const subMsg = require('../services/firebaseApi').getSubMsg;

const options = {
    gcmAPIKey: config.gcmAPIKey,
    vapidDetails: config.vapidDetails,
    TTL: 60,
};

exports.sendPush = (sub, payload) => {
    webPush.sendNotification(
        sub,
        payload,
        options
    ).catch((err) => console.log(err));
};

exports.savePushSub = (req, res) => {
    const sub = req.body;

    if (!sub) {
        return res.status(422).json({ data: 'no data provided' });
    }

    saveSub(sub, (success, data) => {
        if (!success) {
            return res.status(500).json(data);
        }

        if (success) {
            return res.status(200).json(data);
        }
    });
};