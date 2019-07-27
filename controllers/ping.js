const axios = require('axios');
const moment = require('moment');

const CODEBOOYAH_URL = 'https://codebooyah.com/api/ping';
const CHAT_URL = 'https://chat.codebooyah.com/ping';

exports.ping = async (req, res) => {
  try {
    const results = await axios.all([
      axios.get(CODEBOOYAH_URL),
      axios.get(CHAT_URL),
    ]).then(axios.spread((codebooyah, chat) => ({
      codebooyah: codebooyah.data,
      chat: chat.data,
    })));

    const uptimeInMs = process.uptime() * 1000;

    res.json({
      codebooyahAPI: 'pong',
      ...results,
      uptime: `${moment.duration(uptimeInMs).days()} : ${moment
        .duration(uptimeInMs)
        .hours()} : ${moment
        .duration(uptimeInMs)
        .minutes()} : ${moment.duration(uptimeInMs).seconds()}`,
      serverTime: moment().format(),
      memo: process.memoryUsage().rss,
      platform: process.platform,
    });
  } catch (error) {
    res.json({
      codebooyahAPI: 'pong',
      rest: error.message,
    });
  }
};
