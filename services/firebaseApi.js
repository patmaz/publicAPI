global.XMLHttpRequest = require('xhr2');
const firebase = require('firebase');
require('firebase/storage');
let storage;
let storageRef;
const redis = require('../services/redis');

const config = require('../config');

exports.init = () => {
    const app = firebase.initializeApp(config.firebase);
    storage = firebase.storage(app);
    storageRef = storage.ref();
};

exports.saveImg = base64 => {
    return new Promise((resolve, reject) => {
        const base64Data = base64.replace(/^data:image\/png;base64,/, '');
        const file = Buffer.from(base64Data, 'base64');
        const imagesRef = storageRef.child(`${Date.now()}images.png`);

        if (file.length > 1000*1000) {
            reject();
        }

        imagesRef.put(file, {
            contentType: 'image/png',
        }).then(
            snapshot => {
                resolve();
            }
        );
    });
};

exports.forWs = () => {
    return {
        streamBeerWords: firebase.database().ref('beerWords'),
        streamingUrl: firebase.database().ref('streaming/' + 'url'),
    };
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

exports.saveBeerWords = (beerWords) => {
    console.log('######### scraping clear cache');
    redis.set('/beer', null, []);
    firebase.database()
        .ref('beerWords/' + + 0)
        .set(beerWords);
};

exports.fetchBeerWords = () => {
    return new Promise((resolve, reject) => {
        firebase.database()
            .ref('beerWords')
            .once('value')
            .then((snapshot) => {
                const ranks = snapshot.val();
                resolve(ranks);
            });
    });
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