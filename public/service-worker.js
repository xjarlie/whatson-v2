self.addEventListener('install', function (event) {
    console.log('used to register the service worker')
})

self.addEventListener('fetch', function (event) {
    console.log('used to intercept requests so we can check for the file or data in the cache');

    caches.keys().then(function(names) {
        for (let name of names)
            caches.delete(name);
    });
});

self.addEventListener('activate', function (event) {
    console.log('this event triggers when the service worker activates');
    event.waitUntil(
        caches.keys().then(function (cacheNames) {
            return Promise.all(
                cacheNames.filter(function (cacheName) {
                    // Return true if you want to remove this cache,
                    // but remember that caches are shared across
                    // the whole origin
                }).map(function (cacheName) {
                    return caches.delete(cacheName);
                })
            );
        })
    );
});

self.addEventListener('push', function (e) {
    const { title, message, icon, url, tag } = e.data.json();

    var options = {
        body: message,
        icon: icon,
        badge: '/public/img/notif-icon.png',
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2',
            url
        },
        tag
    };
    e.waitUntil(
        self.registration.showNotification(title, options)
    );
});

self.addEventListener('notificationclick', e => {
    // Get all the Window clients
    e.waitUntil(clients.matchAll({ type: 'window' }).then(clientList => {
        let client = null;

        for (let i = 0; i < clientList.length; i++) {
            let item = clientList[i];

            if (item.url) {
                client = item;
                break;
            }
        }


        if (client && 'navigate' in client) {
            e.notification.close();
            client.focus();
            return client.navigate(e.notification.data.url);
        }
        else {
            e.notification.close();
            // if client doesn't have navigate function, try to open a new browser window
            return clients.openWindow(e.notification.data.url);
        }
    }));
});