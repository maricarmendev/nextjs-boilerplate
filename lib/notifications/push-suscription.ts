// ¿Qué son las VAPID Keys?
// Son calves criptográficas que identifican a tu servidor ante los Push Services
// Debes generar estas claves una sola vez
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY ?? "";

export async function registerServiceWorker() {
  // ¿Por qué verificamos 'serviceWorker' in navigator?
  // No todos los navegadores soportan Service Workers
  if ('serviceWorker' in navigator) {
    try {
      // Registramos el Service Worker
      const registration = await navigator.serviceWorker.register('/sw.js');
      console.log('Service Worker registrado:', registration);
      
      // Esperar a que el Service Worker esté activo
      await navigator.serviceWorker.ready;
      console.log('Service Worker activo y listo');
      
      // ¿Para qué este evento?
      // Se dispara cuando hay una nueva versión del SW disponible
      registration.addEventListener('updatefound', () => {
        console.log('Nueva versión del Service Worker encontrada');
      });
      
      return registration;
    } catch (error) {
      console.error('Error registrando Service Worker:', error);
      throw error;
    }
  } else {
    throw new Error('Service Workers no soportados');
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  // ¿Por qué verificamos si Notification existe?
  // Por que hay navegadores muy antiguos que no lo soportan
  if (!("Notification" in window)) {
    throw new Error("Este navegador no soporta notificaciones");
  }

  // Solicitar permisos al usuario
  const permission = await Notification.requestPermission();
  return permission;
}

export async function suscribeToPushNotifications(registration: ServiceWorkerRegistration){
  try {
    // Verificar que el Service Worker esté activo
    if (!registration.active) {
      console.log('Esperando a que el Service Worker se active...');
      await new Promise<void>((resolve) => {
        const checkState = () => {
          if (registration.active) {
            resolve();
          } else if (registration.installing || registration.waiting) {
            setTimeout(checkState, 100);
          }
        };
        checkState();
      });
    }

    // Verificar si ya existe una suscripción
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      console.log('Ya existe una suscripción, usando la existente');
      return existingSubscription;
    }

    // ¿Qué hace pushManager.subscribe()?
    // Crea una suscripción única para este usuario/navegador
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true, // Las notificaciones siempre deben de ser visibles al usuario
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY)
    })

    console.log('Suscripción creada:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error creando suscripción:', error);
    throw error;
  }
}

// ¿Para qué esta función?
// Las VAPID keys vienen en formato base64, pero el navegador necesita Uint8Array
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}