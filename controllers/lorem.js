/**
 * Created by patrykmazurkiewicz on 16/06/2017.
 */
const loremIpsum = require('lorem-ipsum');

exports.lorem = function(req, res, next) {
    const loremOptions = {
        count: req.params.number,
        units: 'words',
    };

    res.json({ data: loremIpsum(loremOptions) });
};