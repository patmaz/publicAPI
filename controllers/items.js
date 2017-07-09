const User = require('../models/user').UserModelClass;
const Item = require('../models/user').ItemModelClass;

exports.getItems = function(req, res) {
    User.findById(req.user.id, function(err, user){
        if (err) { return res.status(500).json({ data: err }); }

        if (!user) { return res.status(422).json({ data: 'OMFG user not found' }); }

        res.json({ data: user.items });
    });
};

exports.addItem = function(req, res) {
    const name = req.body.name;

    if (!name) { return res.status(422).json({ data: 'OMFG insufficient data provided' }); }

    User.findById(req.user.id, function(err, user){
        if (err) { return res.status(500).json({ data: err }); }

        if (!user) { return res.status(422).json({ data: 'OMFG user not found' }); }

        const newItem = new Item({
            name: name,
        });

        user.items.push(newItem);

        user.save(function(err) {
            if (err) { return res.status(500).json({ data: 'OMFG error during saving changes' });}

            res.json({ data: user.items });
        });
    });
};

exports.updateItem = function(req, res) {
    const id = req.params.id;
    const newName = req.body.name;

    if (!id || !newName) { return res.status(422).json({ data: 'OMFG insufficient data provided' }); }

    User.findById(req.user.id, function(err, user){
        if (err) { return res.status(500).json({ data: err }); }

        if (!user) { return res.status(404).json({ data: 'OMFG user not found' }); }

        if (!user.items.id(id)) { return res.status(404).json({ data: 'OMFG item not found' }); }

        user.items.id(id).name = newName;

        user.save(function(err) {
            if (err) { return res.status(500).json({ data: 'OMFG error during saving changes' });}

            res.json({ data: user.items });
        });
    });
};

exports.deleteItem = function(req, res) {
    const id = req.params.id;
    if (!id) { return res.status(422).json({ data: 'OMFG insufficient data provided' }); }

    User.findById(req.user.id, function(err, user) {
        if (err) { return res.status(500).json({ data: err }); }

        if (!user) { return res.status(404).json({ data: 'OMFG user not found' }); }

        if (!user.items.id(id)) { return res.status(404).json({ data: 'OMFG item not found' }); }

        user.items.id(id).remove();

        user.save(function(err) {
            if (err) { return res.status(500).json({ data: 'OMFG error during data removing' }); }

            res.json({ data: 'data removed' });
        });
    });
};