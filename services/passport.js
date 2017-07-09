/**
 * Created by patrykmazurkiewicz on 15/06/2017.
 */
const passport = require('passport');
const JwtStrategy = require('passport-jwt').Strategy;
const extractJwt = require('passport-jwt').ExtractJwt;
const LocalStrategy = require('passport-local');
const config = require('../config');
const User = require('../models/user').UserModelClass;

const localOptions = {
    usernameField: 'email',
};

const localLogin = new LocalStrategy(localOptions, function(email, password, done) {
    User.findOne( {email: email }, function (err, user) {
        if (err) { return done(err); }

        if (!user) { return done(null, false); }

        user.comparePassword(password, function (err, isMatch) {
            if (err) { return done(err); }

            if (!isMatch) { return done(null, false); }

            return done(null, user);
        });
    });
});

const jwtOptions = {
    jwtFromRequest: extractJwt.fromHeader('authorization'),
    secretOrKey: config.secret,
};

const jwtLogin = new JwtStrategy(jwtOptions, function (payload, done) {
    User.findById(payload.sub, function (err, user) {
        if (err) { return done(err, false); }

        if (user) {
            return done(null, user);
        } else {
            return done(null, false);
        }
    });
});

passport.use(jwtLogin);
passport.use(localLogin);