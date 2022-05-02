async function main() {
    if ('serviceWorker' in navigator) {
        navigator.serviceWorker.register('/service-worker.js').then(function (reg) {
            console.log('Service Worker Registered!', reg);

            reg.pushManager.getSubscription().then(async function (sub) {
                if (sub === null) {
                    // Update UI to ask user to register for Push

                    const response = await fetch('/api/push/vapidPublicKey');
                    const vapidPublicKey = await response.text();
                    const convertedVapidKey = urlBase64ToUint8Array(vapidPublicKey);

                    console.log('Not subscribed to push service!');

                    return reg.pushManager.subscribe({
                        userVisibleOnly: true,
                        applicationServerKey: convertedVapidKey
                    });

                } else {
                    // We have a subscription, update the database

                    const result = await fetch('/api/push/register', {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify({
                            subscription: sub
                        })
                    });

                    console.log('Subscription object: ', sub);
                }
            });
        })
            .catch(function (err) {
                console.log('Service Worker registration failed: ', err);
            });
    }
}
main();

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
        .replace(/\-/g, '+')
        .replace(/_/g, '/');

    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);

    for (var i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
}