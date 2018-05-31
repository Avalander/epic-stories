const static_cache = {
	name: `epic-stories-static-v${VERSION}`,
	assets: [
		'https://fonts.googleapis.com/css?family=Montserrat:400,700|Raleway:400,700|Caveat:400,700',
		'/674f50d287a8c48dc19ba404d20fe713.eot',
		'/912ec66d7572ff821749319396470bde.svg',
		'/af7ae505a9eed503f8b8e6982036873e.woff2',
		'/b06871f281fee6b241d60582ae9369b9.ttf',
		'/fee66e712a8a08eef5805a46892932ad.woff',
		'/index.html',
		'/main.bundle.js',
		'/main.css',
	]
}

self.addEventListener('install', event =>
	event.waitUntil(
		caches.open(static_cache.name)
			.then(cache => cache.addAll(static_cache.assets))
	)
)

self.addEventListener('activate', event =>
	event.waitUntil(
		caches.keys()
			.then(cache_names =>
				cache_names
					.filter(x => x.startsWith('epic-stories-static-'))
					.filter(x => x !== static_cache.name)
					.map(x => caches.delete(x))
			)
	)
)

self.addEventListener('fetch', event => {
	const request_url = new URL(event.request.url)
	if (request_url.origin === location.origin && request_url.pathname === '/') {
		event.respondWith(caches.match('/index.html'))
		return
	}
	event.respondWith(
		caches.match(event.request)
			.then(response => response || fetch(event.request))
	)
})

self.addEventListener('message', event => {
	if (event.data.action === 'skip-waiting') self.skipWaiting()
})
