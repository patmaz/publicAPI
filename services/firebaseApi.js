const firebase = require('firebase');

const config = require('../config');

exports.init = () => {
    firebase.initializeApp(config.firebase);

    const streamingUrl = firebase.database().ref('streaming/' + 'url');

    return streamingUrl;
};

exports.saveUrl = (url) => {
    const streamingUrl = firebase.database().ref('streaming/' + 'url');
    const sendPush = require('../controllers/push').sendPush;

    streamingUrl.once('value')
        .then((urlInDb) => {
            if (urlInDb.val().url != url) {
                streamingUrl.set({
                    url,
                });
                this.fetchPushSub(sendPush);
            }
        })
        .catch((err) => console.log(err));
};

exports.saveUser = (user) => {
    firebase.database()
        .ref('stats/' + + Date.now())
        .set(user);
};

exports.fetchPushSub = (cb) => {
    const ref = firebase.database().ref('sub');
    const refMsg = firebase.database().ref('subMsg');

    refMsg.once('value')
        .then((msg) => {

            ref.once('value')
                .then((snapshot) => {
                    const subs = snapshot.val();

                    for (let key in subs) {
                        if (subs.hasOwnProperty(key)) {
                            cb(subs[key], msg.val());
                        }
                    }
                })
                .catch((err) => console.error(err));

        })
        .catch((err) => console.error(err));
};

exports.savePushSub = ({ sub, key }, cb) => {
    const ref = firebase.database().ref('sub');

    if (key !== null) {
        const item = ref.child(key);
        item.update({
            endpoint: sub.endpoint,
            keys: sub.keys,
        }, (err) => {
            if (err) {
                return cb(false, err);
            }
            cb(true, { data: 'success' });
        });
        return;
    }

    const refPush = firebase.database().ref('sub').push();
    refPush.set({
        endpoint: sub.endpoint,
        keys: sub.keys,
    }, (err) => {
        if (err) {
            return cb(false, err);
        }

        cb(true, { subDbKey: refPush.key });
    });
};