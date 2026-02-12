const CACHE_NAME = 'sach-wave-v1'
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/logo.png'
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    })
  )
  self.skipWaiting()
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    })
  )
  self.clients.claim()
})

// Fetch event - serve from cache or network
self.addEventListener('fetch', (event) => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return
  
  // Skip API requests
  if (event.request.url.includes('/api/')) return
  
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Return cached version or fetch from network
      return response || fetch(event.request).then((fetchResponse) => {
        // Cache new static assets
        if (fetchResponse.ok && 
            (fetchResponse.headers.get('content-type')?.includes('image') ||
             fetchResponse.headers.get('content-type')?.includes('javascript') ||
             fetchResponse.headers.get('content-type')?.includes('css'))) {
          const responseClone = fetchResponse.clone()
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone)
          })
        }
        return fetchResponse
      })
    }).catch(() => {
      // Return offline fallback for navigation requests
      if (event.request.mode === 'navigate') {
        return caches.match('/index.html')
      }
    })
  )
})

// Push notification support
self.addEventListener('push', (event) => {
  const options = {
    body: event.data?.text() || 'New notification from Sach Wave',
    icon: '/icon-192x192.png',
    badge: '/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      url: self.location.origin
    }
  }
  
  event.waitUntil(
    self.registration.showNotification('Sach Wave', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow(event.notification.data?.url || '/')
  )
})
