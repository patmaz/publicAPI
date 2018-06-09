const { buildSchema } = require('graphql');

const scrape = require('./services/dataScraping').scrape;

const schema = buildSchema(`
    type Query {
        scrape(phrase: String): Rank
    },
    type Words {
        count: Int
        name: String
    },
    type Rank {
        date: String
        words: [Words]
    },
`);

const root = {
    scrape: async (args) => {
        try {
            const result = await scrape(args.phrase);
            return { date: Date.now(), words: result }
        } catch(err) {
            console.error(err);
        }
    },
};

module.exports = {
    schema,
    root,
};