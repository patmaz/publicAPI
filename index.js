/**
 * Created by patrykmazurkiewicz on 15/06/2017.
 */
const express = require('express');
const http = require('http');
const bodyParser = require('body-parser');
const morgan = require('morgan');
const router = require('./router');
const mongoose = require('mongoose');
const toobusy = require('toobusy-js');
const helmet = require('helmet');

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
app.use(function(req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE');
    next();
});
app.use(morgan('combined'));
app.use(bodyParser.json({ type: '*/*' }));
router(app);

//db
mongoose.connect('mongodb://mongo:auth/public-api');

//server
const port = process.env.PORT || 3090;
const server = http.createServer(app);
server.listen(port);
console.log('Server listen on port: ', port);