const { makeExecutableSchema } = require('graphql-tools');

const scrape = require('./services/dataScraping').scrape;

const typeDefs = `
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
`;

const resolvers = {
    Query: {
        scrape: async (_, args) => {
            try {
                const result = await scrape(args.phrase);
                return { date: Date.now(), words: result }
            } catch(err) {
                console.error(err);
            }
        },
    }
};

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

module.exports = {
    schema,
};