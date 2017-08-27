const webPush = require('web-push');

const config = require('../config');
const fetchPushSub = require('../services/firebaseApi').fetchPushSub;

const payload = 'Here is a payload 66666!';

const options = {
    gcmAPIKey: config.gcmAPIKey,
    vapidDetails: config.vapidDetails,
    TTL: 60,
};

const sendPush = (sub) => {
    webPush.sendNotification(
        sub,
        payload,
        options
    ).catch((err) => console.log(err));
};

exports.push = () => {
    fetchPushSub(sendPush);
};