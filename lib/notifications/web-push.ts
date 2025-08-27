// lib/web-push.ts
import webpush from 'web-push';

webpush.setVapidDetails(
  'mailto:tu-email@ejemplo.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
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
  try {
    const pushSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: subscription.p256dh,
        auth: subscription.auth,
      },
    };

    const result = await webpush.sendNotification(
      pushSubscription,
      JSON.stringify(payload)
    );

    return result;
  } catch (error) {
    console.error('Error enviando notificación:', error);
    throw error;
  }
}
