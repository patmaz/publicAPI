const getBeerRanks = require('../services/firebaseApi').fetchBeerWords;
const redis = require('../services/redis');

const processRanks = (ranks) => {
    const greatRank = [];

    for (const rank in ranks) {
        if (ranks.hasOwnProperty(rank)) {
            const tmpRank = ranks[rank].rank;
            tmpRank.forEach(item => {
                const index = greatRank.findIndex(greatItem => greatItem.name === item.name);

                if (index > -1) {
                    greatRank[index].count = greatRank[index].count + item.count;
                } else {
                    greatRank.push({
                        name: item.name,
                        count: item.count,
                    });
                }
            })
        }
    }

    return greatRank.sort((a, b) =>  b.count - a.count);
};

exports.getBeerRank = async (req, res) => {
    try {
        const ranks = await getBeerRanks();
        const sortedGreatRank = processRanks(ranks);

        console.log('from db + set to cache');
        redis.set(req.route.path, null, sortedGreatRank);
        res.status(200).json(sortedGreatRank);
    } catch (err) {
        res.status(500).json({ data: 'OMFG error' });
    }
};

exports.getBeerRankWs = async (req, res) => {
    try {
        const ranks = await getBeerRanks();
        return processRanks(ranks);
    } catch (err) {
        console.error('Errrr');
    }
};