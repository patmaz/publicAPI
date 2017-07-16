const _size = require('lodash/collection').size;
const jwt = require('jwt-simple');
const User = require('../models/user').UserModelClass;

const saveUser = require('../services/firebaseApi').saveUser;
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

exports.private = (io) => {
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

    privateWs.on('connection', (socket) => {
        socket.emit('priv', { data: 'priv access granated' });
    });
};