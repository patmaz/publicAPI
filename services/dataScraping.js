const request = require('request');
const cheerio = require('cheerio');

const saveUrl = require('./firebaseApi').saveUrl;
const config = require('../config');

exports.getFirstTweet = (url) => {
    let counter = 0;
    setInterval(() => {
        request(url, (err, res, html) => {
            counter = counter + 1;
            if (!err) {
                const $ = cheerio.load(html);

                try {
                    const tweetID = $('li.js-stream-item')['0'].attribs['data-item-id'];

                    if (tweetID) saveUrl(tweetID);
                } catch(err) {
                    console.error('markup changed');
                }
            }
        });
        console.log(url + ' scraping ' + counter);
    }, config.scrapingInterval);
};