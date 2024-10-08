self.addEventListener('install', (event) => {
    console.log('Service Worker installing.');
    event.waitUntil(
        caches.open('todo-cache').then((cache) => {
            return cache.addAll([
                './index.html',
                './styles.css',
                './app.js',
                './manifest.json'
            ]);
        })
    );
});

self.addEventListener('fetch', (event) => {
    event.respondWith(
        caches.match(event.request).then((response) => {
            return response || fetch(event.request);
        })
    );
});



self.addEventListener('push', function(event) {
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: './icons/icon.png'
    };
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});
