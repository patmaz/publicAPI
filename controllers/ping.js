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

    res.json({
      codebooyahAPI: 'pong',
      ...results,
      uptime: moment.utc(process.uptime()*1000).format('HH:mm:ss'),
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