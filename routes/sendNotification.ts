import db from "../conn";
import webPush from 'web-push';
import { publicKey, privateKey } from '../vapid-keys.json';

async function sendNotification(username: string, title: string, message: string, url: string='/', icon: string="/public/img/icon.png", ttl: number=60) {

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

export default sendNotification;