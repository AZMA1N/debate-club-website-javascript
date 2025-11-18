// Service Worker for NSUDC Website PWA
const CACHE_NAME = 'nsudc-v1.0.0';
const STATIC_CACHE = 'nsudc-static-v1';
const DYNAMIC_CACHE = 'nsudc-dynamic-v1';

// Files to cache
const STATIC_FILES = [
  '/',
  '/index.html',
  '/about.html',
  '/achievements.html',
  '/events.html',
  '/register.html',
  '/styles.css',
  '/js/app.js',
  '/js/animations.js',
  '/js/interactive.js',
  '/include.js',
  '/components/header.html',
  '/components/footer.html',
  '/nsudc-logo.png',
  '/nsu-logo-small.png',
  '/data/social.json',
  '/data/announcements.json',
  '/offline.html',
  'https://cdn.tailwindcss.com/3.3.0',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap'
];

// Install event - cache static files
self.addEventListener('install', event => {
  console.log('Service Worker: Installing...');
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then(cache => {
        console.log('Service Worker: Caching static files');
        return cache.addAll(STATIC_FILES);
      })
      .catch(err => console.log('Service Worker: Cache failed', err))
  );
  self.skipWaiting();
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('Service Worker: Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== STATIC_CACHE && cache !== DYNAMIC_CACHE) {
            console.log('Service Worker: Clearing old cache', cache);
            return caches.delete(cache);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch event - serve cached files or fetch from network
self.addEventListener('fetch', event => {
  // Skip non-GET requests
  if (event.request.method !== 'GET') return;

  // Skip external requests (except fonts and CDN)
  const url = new URL(event.request.url);
  if (url.origin !== location.origin && 
      !url.hostname.includes('fonts.googleapis.com') &&
      !url.hostname.includes('cdn.tailwindcss.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Return cached version if available
        if (response) {
          console.log('Service Worker: Serving from cache', event.request.url);
          return response;
        }

        // Otherwise fetch from network
        return fetch(event.request)
          .then(fetchResponse => {
            // Check if valid response
            if (!fetchResponse || fetchResponse.status !== 200 || fetchResponse.type !== 'basic') {
              return fetchResponse;
            }

            // Clone response for caching
            const responseClone = fetchResponse.clone();

            // Cache dynamic content
            caches.open(DYNAMIC_CACHE)
              .then(cache => {
                cache.put(event.request, responseClone);
              });

            return fetchResponse;
          })
          .catch(err => {
            console.log('Service Worker: Fetch failed', err);
            
            // Return offline page for navigation requests
              if (event.request.destination === 'document') {
                return caches.match('/offline.html');
              }
          });
      })
  );
});

// Background sync for form submissions
self.addEventListener('sync', event => {
  if (event.tag === 'background-sync') {
    console.log('Service Worker: Background sync triggered');
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  // Handle any pending form submissions
  const pendingForms = await getStoredForms();
  
  for (const form of pendingForms) {
    try {
      await fetch(form.url, {
        method: 'POST',
        body: form.data
      });
      
      // Remove from storage on success
      await removeStoredForm(form.id);
      
      // Notify user of successful submission
      self.registration.showNotification('Form submitted successfully!', {
        body: 'Your registration has been processed.',
        icon: '/nsudc-logo.png',
        badge: '/nsudc-logo.png'
      });
    } catch (error) {
      console.log('Background sync failed for form:', form.id);
    }
  }
}

async function getStoredForms() {
  // This would integrate with IndexedDB in a real implementation
  return [];
}

async function removeStoredForm(id) {
  // This would remove from IndexedDB in a real implementation
  return true;
}

// Push notifications
self.addEventListener('push', event => {
  const options = {
    body: event.data ? event.data.text() : 'New update from NSUDC',
    icon: '/nsudc-logo.png',
    badge: '/nsudc-logo.png',
    vibrate: [200, 100, 200],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification('NSUDC Update', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', event => {
  event.notification.close();

  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});