const bcrypt = require('bcrypt-nodejs');

exports.getHashed = function(string, clb) {
    bcrypt.genSalt(10, function (err, salt) {
        if (err) { return clb(err, false); }

        bcrypt.hash(string, salt, null, function (err, hash) {
            if (err) { return clb(err, false); }

            clb(false, hash);
        });

    });
};