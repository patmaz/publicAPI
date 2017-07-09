/**
 * Created by patrykmazurkiewicz on 15/06/2017.
 */
const User = require('../models/user').UserModelClass;
const jwt = require('jwt-simple');
const config = require('../config');
const getHashed = require('../services/bcrypt').getHashed;

function getToken(user) {
    return jwt.encode({
        sub: user.id,
        iat: Date.now(),
    }, config.secret);
}

exports.signin = function (req, res, next) {
    res.send({ token: getToken(req.user) });
};

exports.signup = function (req, res, next) {

    const email = req.body.email;
    const password = req.body.password;
    const status = req.body.status;

    if (!email || !password ) {
        return res.status(422).json({ error: 'provide email and password' });
    }

    User.findOne({ email: email }, function (err, existingUser) {

        if (err) { next(err); }

        if (existingUser) {
            return res.status(422).json({ error: 'email in use' });
        }

        getHashed(password, function(error, hashedPassword){
            if (error) { return res.json(500).json({ data: 'OMFG fakap' }); }

            const newUser = new User({
                email: email,
                password: hashedPassword,
                status: status,
            });

            newUser.save(function (err) {
                if (err) { return next(err); }

                res.json({ token: getToken(newUser) });
            });
        });

    });

};