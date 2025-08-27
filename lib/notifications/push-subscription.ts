import { NOTIFICATION_CONFIG } from "@/lib/config/notifications";

export async function registerServiceWorker() {
  if (!('serviceWorker' in navigator)) {
    throw new Error(NOTIFICATION_CONFIG.messages.notSupported);
  }

  try {
    const registration = await navigator.serviceWorker.register(
      NOTIFICATION_CONFIG.sw.path,
      { scope: NOTIFICATION_CONFIG.sw.scope }
    );
    
    await navigator.serviceWorker.ready;
    
    registration.addEventListener('updatefound', () => {
      console.log(`Service Worker actualizado a v${NOTIFICATION_CONFIG.sw.version}`);
    });
    
    return registration;
  } catch (error) {
    console.error('Error registrando Service Worker:', error);
    throw error;
  }
}

export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!("Notification" in window)) {
    throw new Error(NOTIFICATION_CONFIG.messages.notSupported);
  }

  return await Notification.requestPermission();
}

export async function subscribeToPushNotifications(registration: ServiceWorkerRegistration) {
  try {
    if (!registration.active) {
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

    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      return existingSubscription;
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(
        NOTIFICATION_CONFIG.vapid.publicKey
      ).buffer as ArrayBuffer
    });

    return subscription;
  } catch (error) {
    console.error('Error creando suscripción:', error);
    throw error;
  }
}

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