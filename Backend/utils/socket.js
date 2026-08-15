let io = null;
const Notification = require('../models/NotificationModel');

function init(server) {
    const { Server } = require('socket.io');
    io = new Server(server, {
        cors: {
            origin: [
                'http://localhost:5173',
                'http://localhost:5174',
                'http://localhost:5175',
                'http://127.0.0.1:5173',
                'http://127.0.0.1:5174',
                'http://127.0.0.1:5175',
                'https://tripup-travel-app-eight.vercel.app',
                /^https:\/\/[a-z0-9-]+\.vercel\.app$/i,
            ],
            credentials: true,
        },
    });

    io.on('connection', (socket) => {
        // expect client to join a room named after their user id
        socket.on('join', (userId) => {
            try { socket.join(String(userId)); } catch (e) { }
        });

        socket.on('disconnect', () => { });
    });
}

async function sendNotification(userId, payload) {
    try {
        const notificationPayload = {
            type: payload.type || 'info',
            title: payload.title || '',
            message: payload.message || '',
            meta: payload.meta || {},
        };

        if (!userId) {
            if (io) {
                if (notificationPayload.type === 'admin_announcement') {
                    io.emit('notification:announcement', { ...notificationPayload, createdAt: new Date() });
                } else {
                    io.emit('notification', { ...notificationPayload, createdAt: new Date() });
                }
            }
            return null;
        }

        const n = await Notification.create({ user: userId, ...notificationPayload, read: false });
        if (io) {
            io.to(String(userId)).emit('notification', { id: n._id, type: n.type, title: n.title, message: n.message, meta: n.meta, createdAt: n.createdAt });
        }
        return n;
    } catch (err) {
        console.error('sendNotification error', err.message);
        return null;
    }
}

function getIO() { return io; }

module.exports = { init, sendNotification, getIO };
