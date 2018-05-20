const redis = require('redis');
const util = require('util');
const lodash = require('lodash');

const redisUrl = 'redis://127.0.0.1:6379';
const client = redis.createClient(redisUrl);
client.get = util.promisify(client.get);
client.hget = util.promisify(client.hget);

const checkCache = async (req, res, next) => {
    const cachedStuff = await get(req.route.path);

    if (!lodash.isEmpty(cachedStuff)) {
        console.log('from cache');
        return res.status(200).json(cachedStuff);
    }

    next();
};

const get = async (key, hash) => {
    if (hash) {
        const result = await client.hget(key, hash);
        return JSON.parse(result);
    }

    const result = await client.get(key);
    return JSON.parse(result);
};

const set = (key, hash, value) => {
    if (hash) {
        client.hset(key, hash, JSON.stringify(value));
        return;
    }

    client.set(key, JSON.stringify(value));
};

module.exports = {
    checkCache,
    get,
    set,
};