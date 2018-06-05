const scrape = require('../services/dataScraping').scrape;

let isScraping = false;
let lastScraping = Date.now();

exports.scrape = async (req, res) => {
    const { phrase } = req.body;
    if (!phrase) {
        res.status(422).json({ data: 'no "phrase" field' });
    }
    if (isScraping === true) {
        res.status(409).json({ data: 'concurrency error' });
    }
    if (Date.now() - lastScraping < 1000*60) {
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
        res.status(500).json({ data: 'OMFG error' });
    }
};