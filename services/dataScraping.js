const request = require('request');
const promise = require('request-promise');
const q = require('q');
const cheerio = require('cheerio');

const saveUrl = require('./firebaseApi').saveUrl;
const saveBeerWords = require('./firebaseApi').saveBeerWords;
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

exports.beer = () => {
    const options = {
        uri: 'https://www.google.pl/search?q=piwo+kraftowe',
        transform: body => {
            return cheerio.load(body);
        },
    };

    console.log('beer scraping ', Date().toString());
    promise(options)
        .then($ => {
            const links = $('.r a');
            const promises = [];
            links.each((index, link) => {
                const nakedLink = $(link).attr('href').replace('/url?q=', '').split('&')[0];
                if (nakedLink.indexOf('http') === 0) {
                    promises.push(
                        promise(nakedLink)
                    );
                }
            });

            q.all(promises.splice(0, 5)).then(data => {
                processData(data);
            });
            q.all(promises.splice(5, 5)).then(data => {
                processData(data);
            });
        })
        .catch(err => {
            console.error('google markup changed');
        });
};

const processData = (data) => {
    const words = [];
    const ranking = [];

    data.forEach(page => {
        const $page = cheerio.load(page);
        try {
            $page('body').text()
                .replace(/\s+/g, ' ')
                .split(' ')
                .filter(word => word.length > 0)
                .forEach(word => words.push(word.toLowerCase()));

            console.log(words.length);
        } catch(err) {
            console.error('markup problem on specific page');
        }
    });

    words.forEach(word => {
        const index = ranking.findIndex(item => item.name === word);
        if (index > -1) {
            ranking[index].count++;
        } else {
            ranking.push({
                name: word,
                count: 1,
            });
        }
    });
    console.log('beer scraping ', words.length);

    saveBeerWords({
        date: Date().toString(),
        rank: ranking.sort((a, b) =>  b.count - a.count).slice(0, 50)
    });
    console.log('beer scraping END' + Date().toString());
};