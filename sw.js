var cacheName = 'restaurantLanding-v58';
var filesToCache = [
	'/',
	'/index.html', 
	'/restaurant.html',
	'/css/restaurant-media-queries.css',
	'/css/neighborhoods-media-queries.css',
	'/css/styles.css',
	'/data/restaurants.json', 
	'/img/1.jpg',
	'/img/2.jpg',
	'/img/3.jpg',
	'/img/4.jpg',
	'/img/5.jpg', 
	'/img/6.jpg', 
	'/img/7.jpg', 
	'/img/8.jpg', 
	'/img/9.jpg', 
	'/img/10.jpg', 
	'/js/dbhelper.js',
	'/js/main.js',
	'/js/restaurant_info.js',
	'https://unpkg.com/leaflet@1.3.1/dist/leaflet.js',
	'https://unpkg.com/leaflet@1.3.1/dist/leaflet.css'
];

//Listen for install event, set callback;
//Install cache
//Skip waiting
self.addEventListener('install', function(event) {
	console.log('[ServiceWorker] Install');
	event.waitUntil(
		//open cache and give cache name, helps to create versions
		caches.open(cacheName).then(function(cache) {
			console.log('[ServiceWorker] Caching filesToCache');
			//takes list of URLs, fetches them from server, adds response to the cache
			return cache.addAll(filesToCache);
		}).then(function() {
			return self.skipWaiting();
		})
	);
});

//Listen for activate event, delete old cache and install new cache
self.addEventListener('activate', function(event) {
	console.log('[ServiceWorker] Activate');
	event.waitUntil(
		caches.keys().then(function(keyList) {
			return Promise.all(keyList.map(function(key) {
				if (key !== cacheName) {
					console.log('[ServiceWorker] Removing old cache', key);
					return caches.delete(key);
				}
			}))
		})
	);
});

//Fetch the data
self.addEventListener('fetch', function(event) {
	//tells the browser we will handle the response ourselves
	console.log('[ServiceWorker] Fetch', event.request.url);
	event.respondWith(
		caches.match(event.request).then(function(response) {
			if (response) {
				console.log('[ServiceWorker] Found in cache', event.request.url);
				return response;
			} else {
				return fetch(event.request).then(function(response) {
					var responseClone = response.clone();
					caches.open(cacheName).then(function(cache) {
						cache.put(event.request, responseClone);
					})
					return response;
				})
			.catch(function(err) {
				console.log('[ServiceWorker] Error Fetching & Caching.' + err)
			});
		}
	})
	);
});