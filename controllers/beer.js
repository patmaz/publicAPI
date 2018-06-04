const getBeerRank = require('../services/firebaseApi').fetchBeerWords;
const redis = require('../services/redis');

exports.getBeerRank = async (req, res) => {
    try {
        const rank = await getBeerRank();

        console.log('from db + set to cache');
        redis.set(req.route.path, null, rank[0].rank);
        res.status(200).json(rank[0].rank);
    } catch (err) {
        res.status(500).json({ data: 'OMFG error' });
    }
};

exports.getBeerRankWs = async (req, res) => {
    try {
        const rank = await getBeerRank();
        return rank[0].rank;
    } catch (err) {
        console.error('Errrr');
    }
};