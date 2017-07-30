const webPush = require('web-push');

const config = require('../config');

const pushSubscription = config.pushSubscription;
const pushSubscription2 = config.pushSubscription2;

const payload = 'Here is a payload 66666!';

const options = {
    gcmAPIKey: config.gcmAPIKey,
    vapidDetails: config.vapidDetails,
    TTL: 60,
};


exports.push = () => {
    webPush.sendNotification(
        pushSubscription,
        payload,
        options
    ).catch((err) => console.log(err));
  webPush.sendNotification(
    pushSubscription2,
    payload,
    options
  ).catch((err) => console.log(err));
};