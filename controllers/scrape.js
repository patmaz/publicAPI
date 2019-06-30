const scrape = require('../services/dataScraping').scrape;
const scrapeWithPuppeteer = require('../services/dataScraping').scrapeWithPuppeteer;

let isScraping = false;
let lastScraping = Date.now();

exports.scrape = async (req, res) => {
    req.setTimeout(0);

    const { phrase } = req.body;
    if (!phrase) {
        res.status(422).json({ data: 'no "phrase" field' });
        return;
    }
    if (isScraping === true) {
        res.status(409).json({ data: 'concurrency error' });
        return;
    }
    if (Date.now() - lastScraping < 1000*15) {
        res.status(500).json({ data: 'retry later' });
        return;
    }
    try {
        lastScraping = Date.now();
        isScraping = true;
        const result = await scrape(phrase);
        isScraping = false;
        res.status(200).json({ data: result });
    } catch(err) {
        isScraping = false;
        res.status(500).json({ data: 'OMFG error', error: err.message });
    }
};

exports.scrapeWithPuppeteer = async (req, res) => {
    req.setTimeout(0);

    const { phrase } = req.body;
    if (!phrase) {
        res.status(422).json({ data: 'no "phrase" field' });
        return;
    }
    if (Date.now() - lastScraping < 1000*15) {
        res.status(500).json({ data: 'retry later' });
        return;
    }
    try {
        lastScraping = Date.now();
        const result = await scrapeWithPuppeteer(phrase);
        res.status(200).json({ data: result });
    } catch(err) {
        console.error(err.message);
        res.status(500).json({ data: 'OMFG error', error: err.message });
    }
};