const firebase = require('firebase');

const config = require('../config');

exports.init = () => {
    firebase.initializeApp(config.firebase);

    const streamingUrl = firebase.database().ref('streaming/' + 'url');

    return streamingUrl;
};

exports.saveUrl = (url) => {
    firebase.database()
        .ref('streaming/' + 'url')
        .set({
            url,
        });
};

exports.saveUser = (user) => {
    firebase.database()
        .ref('stats/' + + Date.now())
        .set(user);
};

exports.savePushSub = (sub) => {
    firebase.database()
        .ref('sub/' + + Date.now())
        .set(sub);
};

exports.fetchPushSub = (cb) => {
    const ref = firebase.database().ref('sub');

    ref.once('value')
        .then((snapshot) => {
            const subs = snapshot.val();

            for (let key in subs) {
                if (subs.hasOwnProperty(key)) {
                    cb(subs[key]);
                }
            }
        })
        .catch((err) => console.error(err));
};