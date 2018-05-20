/**
 * Created by patrykmazurkiewicz on 15/06/2017.
 */
const Auth = require('./controllers/auth');
const Lorem = require('./controllers/lorem');
const Users = require('./controllers/users');
const Items = require('./controllers/items');
const push = require('./controllers/push').push;
const savePushSub = require('./controllers/push').savePushSub;
const Beer = require('./controllers/beer');
const passportService = require('./services/passport');
const passport = require('passport');

const requireToken = passport.authenticate('jwtApi', { session: false });
const requireSignIn = passport.authenticate('local', { session: false });

const redis = require('./services/redis');

module.exports = function(app) {

    app.get('/lorem/:number', Lorem.lorem);

    app.post('/v1/signup', Auth.signup);

    app.post('/v1/signin', requireSignIn, Auth.signin);

    app.get('/v1/users', requireToken, Users.getAllUsers);

    app.get('/v1/user', requireToken, Users.getUser);

    app.put('/v1/user', requireToken, Users.updateUser);

    app.get('/v1/items', requireToken, Items.getItems);

    app.post('/v1/items', requireToken, Items.addItem);

    app.put('/v1/items/:id', requireToken, Items.updateItem);

    app.delete('/v1/items/:id', requireToken, Items.deleteItem);

    //app.get('/push', push);

    app.post('/push/sub', savePushSub);

    app.get('/beer', redis.checkCache, Beer.getBeerRank);
};