const moment = require('moment');
const { makeExecutableSchema } = require('graphql-tools');
const { PubSub } = require('graphql-subscriptions');
const pubsub = new PubSub();

const firebaseApi = require('./services/firebaseApi');
const scrape = require('./services/dataScraping').scrape;

const listenForNewRank = () => {
    const { streamBeerWords } = firebaseApi.forWs();
    streamBeerWords.on('value', (snapshot) => {
        const rank = snapshot.val();
        pubsub.publish('newRank', { newRank: {
                date: moment().format(),
                words: rank[0].rank,
            } });
    });
};

const typeDefs = `
    type Query {
        scrape(phrase: String): Rank
    }
    type Words {
        count: Int
        name: String
    }
    type Rank {
        date: String
        words: [Words]
    }
    type Subscription {
        newRank: Rank
    }
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
    },
    Rank: {
        date: () => moment().format(),
    },
    Subscription: {
        newRank: {
            subscribe: () => pubsub.asyncIterator('newRank')
        },
    }
};

const schema = makeExecutableSchema({
    typeDefs,
    resolvers,
});

module.exports = {
    schema,
    listenForNewRank,
};