const request = require('request');
const promise = require('request-promise');
const q = require('q');
const cheerio = require('cheerio');

const saveUrl = require('./firebaseApi').saveUrl;
const config = require('../config');

let filterWords = [];
const getWordsFilter = async () => {
    try {
        const result = await promise({
            uri: `https://us-central1-${config.firebase.projectId}.cloudfunctions.net/filterWords`,
            method: 'POST',
            json: true,
        });
        filterWords = Object.values(result.data);
        console.log('filter words:', filterWords);
    } catch(err) {
        console.error('google functions error');
    }
};
getWordsFilter();

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

exports.scrape = (phrase, batchSize = 1, cb) => {
    return new Promise((resolve, reject) => {
        const searchPhrase = phrase.trim().split(' ').join('+');

        const options = {
            uri: `https://www.google.pl/search?q=${searchPhrase}`,
            transform: body => {
                return cheerio.load(body);
            },
        };

        console.log(`${searchPhrase} scraping`, Date().toString());
        promise(options)
            .then(async $ => {
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

                console.log(promises.length);
                const pages = await runInBatches(promises, batchSize);
                const wordsRank = countWordsInPages(pages).slice(0, 1000);
                cb && cb({
                    date: Date().toString(),
                    rank: wordsRank,
                });
                resolve(wordsRank);
            })
            .catch(err => {
                console.error('google markup changed');
                reject(err);
            });
    });
};

const runInBatches = (promises, batchSize) => {
    return new Promise((resolve, reject) => {
        const result = [];
        let resolvedBatchesCounter = 0;

        setTimeout(() => {
            console.log('resolved prematurely');
            resolve(result);
        }, 1000*30);

        for (let i = 0; i < promises.length; i = i + batchSize) {
            const start = i;
            const end = i + batchSize;
            console.log(`START: start ${start} end ${end}`, promises.slice(start, end).length);
            q.all(promises.slice(start, end)).then(
                data => {
                    console.log(`RESOLVED: start ${start} end ${end}`);
                    data.forEach(i => result.push(i));
                    resolvedBatchesCounter++;
                    if (resolvedBatchesCounter === Math.ceil(promises.length / batchSize)) {
                        resolve(result);
                    }
                },
                err => {
                    resolvedBatchesCounter++;
                    console.log(`ERROR for start ${start} end ${end}`, err.status);
                    if (resolvedBatchesCounter === Math.ceil(promises.length / batchSize)) {
                        resolve(result);
                    }
                }
            );
        }
    });
};

const countWordsInPages = pages => {
    const words = [];
    const ranking = [];

    pages.forEach(page => {
        const $page = cheerio.load(page);
        try {
            $page('body').text()
                .replace(/[\W_]+/g, ' ')
                .replace(/\s+/g, ' ')
                .split(' ')
                .filter(word => word.indexOf('http') === -1)
                .filter(word => word.length > 1)
                .filter(word => !filterWords.includes(word.toLowerCase()))
                .forEach(word => words.push(word.toLowerCase()));
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

    return ranking.sort((a, b) =>  b.count - a.count);
};