const getBeerRanks = require('../services/firebaseApi').fetchBeerWords;
const redis = require('../services/redis');

exports.getBeerRank = async (req, res, returnVal) => {
    try {
        const ranks = await getBeerRanks();
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

        const sortedGreatRank = greatRank.sort((a, b) =>  b.count - a.count);

        if (returnVal) {
            return sortedGreatRank;
        }

        console.log('from db + set to cache');
        redis.set(req.route.path, null, sortedGreatRank);
        res.status(200).json(sortedGreatRank);
    } catch (err) {
        res.status(500).json({ data: 'OMFG error' });
    }
};