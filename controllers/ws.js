const _size = require('lodash/collection').size;
const jwt = require('jwt-simple');
const User = require('../models/user').UserModelClass;

const saveUser = require('../services/firebaseApi').saveUser;
const getBeerRankWs = require('./beer').getBeerRankWs;
const secret = require('../config').secret;

exports.public = (io, streamingUrl) => {
    const publicWs = io.of('/public');
    publicWs.on('connection', (socket) => {
        saveUser({
            id: socket.id,
            time: socket.handshake.time,
            userAgent: socket.handshake.headers['user-agent'],
        });

        publicWs.emit('new user', { data: _size(io.of('/public').clients().sockets) });

        socket.on('disconnect', () => {
            publicWs.emit('user left', { data: _size(io.of('/public').clients().sockets) });
        });

        socket.on('from client', (data) => {
            publicWs.emit('from server', data);
        });

        streamingUrl.on('value', (snapshot) => {
            publicWs.emit('from server', snapshot.val());
        });
    });
};

exports.private = (io, streamBeerWords) => {
    const privateWs = io.of('/priv');
    privateWs.use((socket, next) => {
        let token;
        try {
            token = jwt.decode(socket.handshake.query.token, secret);
        } catch (err) {
            return next(new Error('Access denied'));
        }
        User.findById(token.sub, (err, user) => {
            if (err) return next(new Error('Access denied'));

            if (!user || user.status !== 'admin') return next(new Error('Access denied'));

            next();
        });
    });

    privateWs.on('connection', async (socket) => {
        const data = await getBeerRankWs();
        socket.emit('data', { data });
        privateWs.emit('users', { data: _size(io.of('/priv').clients().sockets) });

        socket.on('disconnect', () => {
            privateWs.emit('users', { data: _size(io.of('/priv').clients().sockets) });
        });
    });

    streamBeerWords.on('value', (snapshot) => {
        const ranks = snapshot.val();
        const greatRank = [];

        for (const rank in ranks) {
            if (ranks.hasOwnProperty(rank)) {
                const tmpRank = ranks[rank].rank;
                tmpRank.forEach(item => {
                    const index = greatRank.findIndex(greatItem => greatItem.name === item.name);

                    if (index > -1) {
                        greatRank[index].count = greatRank[index].count + item.count;
                    } else {
                        greatRank.push({
                            name: item.name,
                            count: item.count,
                        });
                    }
                });
            }
        }
        console.log(`emit to ${_size(io.of('/priv').clients().sockets)}`);
        const sortedGreatRank = greatRank.sort((a, b) =>  b.count - a.count);
        privateWs.emit('data', { data: sortedGreatRank });
    });
};