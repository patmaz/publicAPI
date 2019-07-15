const axios = require('axios');
const moment = require('moment');

const CODEBOOYAH_URL = 'https://codebooyah.com/api/ping';

exports.ping = async (req, res) => {
  try {
    const codebooyah = await axios.get(CODEBOOYAH_URL);
    res.json({
      codebooyahAPI: 'pong',
      codebooyah: codebooyah.data,
      uptime: moment.utc(process.uptime()*1000).format('HH:mm:ss'),
      memo: process.memoryUsage().rss,
      platform: process.platform,
    });
  } catch (error) {
    res.json({
      codebooyahAPI: 'pong',
      codebooyah: error.message,
    });
  }
};