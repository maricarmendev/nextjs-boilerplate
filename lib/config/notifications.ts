export const NOTIFICATION_CONFIG = {
  vapid: {
    publicKey: process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    privateKey: process.env.VAPID_PRIVATE_KEY!,
    email: process.env.VAPID_EMAIL || "admin@example.com",
  },
  icons: {
    default: "/icon-192x192.png",
    badge: "/icon-72x72.png",
  },
  sw: {
    path: "/sw.js",
    scope: "/",
    version: "1.0.0",
  },
  messages: {
    permissionDenied: "Las notificaciones están bloqueadas en tu navegador",
    subscribeSuccess: "Notificaciones activadas correctamente",
    subscribeError: "Error al activar notificaciones",
    unsubscribeSuccess: "Notificaciones desactivadas",
    unsubscribeError: "Error al desactivar notificaciones",
    notSupported: "Tu navegador no soporta notificaciones push",
  },
} as const;

export function validateNotificationConfig() {
  const errors: string[] = [];

  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY) {
    errors.push("NEXT_PUBLIC_VAPID_PUBLIC_KEY no está configurada");
  }

  if (!process.env.VAPID_PRIVATE_KEY) {
    errors.push("VAPID_PRIVATE_KEY no está configurada");
  }

  if (errors.length > 0) {
    console.error("❌ Errores de configuración de notificaciones:");
    errors.forEach((error) => console.error(`  - ${error}`));
    return false;
  }

  return true;
}