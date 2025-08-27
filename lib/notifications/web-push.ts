import webpush from 'web-push';
import { NOTIFICATION_CONFIG, validateNotificationConfig } from '@/lib/config/notifications';

// Validar configuración al inicializar
if (!validateNotificationConfig()) {
  throw new Error('Configuración de notificaciones inválida');
}

webpush.setVapidDetails(
  `mailto:${NOTIFICATION_CONFIG.vapid.email}`,
  NOTIFICATION_CONFIG.vapid.publicKey,
  NOTIFICATION_CONFIG.vapid.privateKey
);

export interface PushPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  image?: string;
  url?: string;
}

export async function sendPushNotification(
  subscription: {
    endpoint: string;
    p256dh: string;
    auth: string;
  },
  payload: PushPayload
) {
  const pushSubscription = {
    endpoint: subscription.endpoint,
    keys: {
      p256dh: subscription.p256dh,
      auth: subscription.auth,
    },
  };

  try {
    const result = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify({
        ...payload,
        icon: payload.icon || NOTIFICATION_CONFIG.icons.default,
        badge: payload.badge || NOTIFICATION_CONFIG.icons.badge,
      })
    );

    return result;
  } catch (error) {
    console.error('Error enviando notificación push:', error);
    throw error;
  }
}
