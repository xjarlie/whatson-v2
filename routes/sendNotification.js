const db = require("../conn");
const webPush = require('web-push');
const { publicKey, privateKey } = require('../vapid-keys.json');

async function sendNotification(username, title, message, url='/', icon="/public/img/icon.png", ttl=60) {

    const subscription = await db.get(`auth/users/${username}/push/subscription`);
    if (!subscription) {
        return false;
    }

    const options = {
        vapidDetails: {
            subject: 'mailto:xjarlie@gmail.com',
            publicKey,
            privateKey
        },
        TTL: ttl
    };

    const payload = {
        title,
        message,
        icon,
        url
    }

    const notification = await webPush.sendNotification(subscription, JSON.stringify(payload), options);
    return notification;
}

module.exports = sendNotification;