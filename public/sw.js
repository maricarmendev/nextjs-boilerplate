// public/sw.js
console.log('Service Worker cargado');

// Evento que se dispara cuando llega una notificación push
self.addEventListener('push', function(event) {
  console.log('Push recibido:', event);
  
  // ¿Por qué usamos event.data.json()? 
  // El servidor nos envía los datos en formato JSON
  const data = event.data ? event.data.json() : {};
  
  const title = data.title || 'Nueva notificación';
  const options = {
    body: data.body || 'Tienes una nueva notificación',
    icon: data.icon || '/icon-192x192.png',
    badge: data.badge || '/badge-72x72.png',
    image: data.image,
    data: data.url ? { url: data.url } : {},
    actions: data.actions || [],
    requireInteraction: false, // La notificación se oculta automáticamente
    silent: false,
  };

  // ¿Por qué event.waitUntil()? 
  // Mantiene el Service Worker activo hasta que termine de mostrar la notificación
  event.waitUntil(
    self.registration.showNotification(title, options)
  );
});

// Evento cuando el usuario hace clic en la notificación
self.addEventListener('notificationclick', function(event) {
  console.log('Notificación clickeada:', event);
  
  event.notification.close();

  // ¿Para qué este código?
  // Si hay una URL en los datos, abrimos esa página
  const urlToOpen = event.notification.data.url || '/';

  event.waitUntil(
    // Busca si ya hay una ventana abierta con tu dominio
    clients.matchAll({
      type: 'window',
      includeUncontrolled: true
    }).then(function(clientList) {
      // Si encuentra una ventana, la enfoca y navega a la URL
      for (let client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.navigate(urlToOpen);
          return client.focus();
        }
      }
      // Si no hay ventanas abiertas, abre una nueva
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});