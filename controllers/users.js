const User = require('../models/user').UserModelClass;

exports.getAllUsers = function(req, res) {
    if (req.user.status !== 'admin') { return res.status(403).json({ data: 'OMFG not an admin'}); }

    User.find({}, function(err, data) {
        if (err) { return res.status(500).json({ data: err }); }

        res.json({ data: data });
    });
};

exports.getUser = function(req, res) {
    User.findById(req.user.id, function(err, user) {
        if (err) { return res.status(500).json({ data: err }); }

        if (!user) { return res.status(404).json({ data: 'OMFG user not found'}); }

        res.json({ data: user });
    });
};


exports.updateUser = function(req, res) {
    const name = req.body.name;
    const lname = req.body.lname;

    if (!name || !lname) { return res.status(422).json({ data: 'OMFG wrong data' }); }

    User.findByIdAndUpdate(req.user.id, {
        name: name,
        lname: lname,
    }, {new: true}, function(err, updatedUser) {
        if (err) { return res.status(500).json({ data: 'OMFG update failed'}); }

        res.json({ data: updatedUser });
    });
};