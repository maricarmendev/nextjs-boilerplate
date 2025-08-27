// Service Worker v1.0.0
const SW_VERSION = '1.0.0';
const CACHE_NAME = `notification-cache-v${SW_VERSION}`;

self.addEventListener('install', (event) => {
  console.log(`Service Worker v${SW_VERSION} instalado`);
  // Forzar activación inmediata
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log(`Service Worker v${SW_VERSION} activado`);
  // Tomar control de todas las páginas inmediatamente
  event.waitUntil(clients.claim());
});

// Manejo de notificaciones push
self.addEventListener('push', (event) => {
  console.log('Notificación push recibida:', event);
  
  if (!event.data) {
    console.warn('Notificación push sin datos');
    return;
  }

  let data;
  try {
    data = event.data.json();
  } catch (e) {
    console.error('Error parseando datos de push:', e);
    data = { title: 'Nueva notificación', body: event.data.text() };
  }
  
  const title = data.title || 'Nueva notificación';
  const options = {
    body: data.body || '',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    image: data.image,
    data: { url: data.url || '/', ...data },
    timestamp: Date.now(),
    requireInteraction: false,
    silent: false,
    actions: data.actions || [],
  };

  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Manejo de clicks en notificaciones
self.addEventListener('notificationclick', (event) => {
  console.log('Click en notificación:', event);
  
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then((clientList) => {
      // Buscar ventana existente
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Abrir nueva ventana si no hay ninguna
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});

// Manejo de errores de push subscription
self.addEventListener('pushsubscriptionchange', (event) => {
  console.log('Suscripción push cambió, re-suscribiendo...');
  event.waitUntil(
    self.registration.pushManager.subscribe(event.oldSubscription.options)
      .then((subscription) => {
        console.log('Re-suscripción exitosa');
        // Aquí podrías enviar la nueva suscripción al servidor
      })
      .catch((err) => {
        console.error('Error re-suscribiendo:', err);
      })
  );
});