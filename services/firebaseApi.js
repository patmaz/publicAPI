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