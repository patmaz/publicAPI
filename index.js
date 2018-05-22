/**
 * Created by patrykmazurkiewicz on 15/06/2017.
 */
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const mongoose = require('mongoose');
const toobusy = require('toobusy-js');
const helmet = require('helmet');

const router = require('./router');
const publicWs = require('./controllers/ws').public;
const privateWs = require('./controllers/ws').private;
const firebase = require('./services/firebaseApi');
const getFirstTweetId = require('./services/dataScraping').getFirstTweet;
const beer = require('./services/dataScraping').beer;
const config = require('./config');

//app
const app = express();
app.use(function(req, res, next) {
    if (toobusy()) {
        res.status(503).send('Too much pressure!');
    } else {
        next();
    }
});
app.use(helmet());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});
app.use(morgan('combined'));
app.use(bodyParser.json({ type: '*/*' }));
router(app);

//db
const options = { server: { socketOptions: { keepAlive: 300000, connectTimeoutMS: 30000 } },
    replset: { socketOptions: { keepAlive: 300000, connectTimeoutMS : 30000 } } };

if (process.env.NODE_ENV === 'docker') {
    mongoose.connect('mongodb://mongo:auth/public-api');
} else if (process.env.NODE_ENV === 'local') {
    mongoose.connect('mongodb://localhost/public-api');
} else {
    mongoose.connect(config.mLabMyApi, options);
}

//server
const port = process.env.PORT || 3090;
const server = http.createServer(app);

//firebase
const streamingUrl = firebase.init();

//websocket
const io = require('socket.io')(server);
publicWs(io, streamingUrl);
privateWs(io, firebase.streamBeerWords());

//scraping
getFirstTweetId(config.scrapingTargetUrl);
setInterval(beer, config.scrapingInterval);

server.listen(port);
console.log('Server listen on port: ', port);