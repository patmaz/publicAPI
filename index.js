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
const express_graphql = require('express-graphql');

const graphQl = require('./graphql');
const initFirebase = require('./services/firebaseApi').init;
const saveBeerWords = require('./services/firebaseApi').saveBeerWords;
const router = require('./router');
const websockets = require('./controllers/ws').websockets;
const getFirstTweetId = require('./services/dataScraping').getFirstTweet;
const scrape = require('./services/dataScraping').scrape;
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

//db

if (process.env.NODE_ENV === 'docker') {
    mongoose.connect('mongodb://mongo:auth/public-api');
} else if (process.env.NODE_ENV === 'local') {
    mongoose.connect('mongodb://localhost/public-api');
} else {
    mongoose.connect(config.mLabMyApi, {
        useMongoClient: true,
    });
}

router(app);

//graphql
app.use('/graphql', express_graphql({
    schema: graphQl.schema,
    rootValue: graphQl.root,
    graphiql: true,
}));

//server
const port = process.env.PORT || 3090;
const server = http.createServer(app);

//firebase
initFirebase();

//websocket
websockets(server);

//scraping
// getFirstTweetId(config.scrapingTargetUrl);
// setInterval(() => {
//     scrape('piwo kraftowe', 1, saveBeerWords);
// }, config.scrapingInterval);

server.listen(port);
console.log('Server listen on port: ', port);