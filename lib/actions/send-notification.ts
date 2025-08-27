"use server";

import { z } from "zod";
import { eq, and } from "drizzle-orm";
import { db } from "@/lib/db";
import { sendPushNotification } from "@/lib/notifications/web-push";
import { pushSubscriptions } from "@/lib/db/schema";
import { NOTIFICATION_CONFIG } from "@/lib/config/notifications";
import { ActionResponse } from "@/types";

const notificationSchema = z.object({
  title: z.string().min(1).max(100),
  message: z.string().min(1).max(300),
  url: z.string().url().optional(),
  userId: z.string().optional(),
});

export type SendNotificationData = {
  sent: number;
  total: number;
}

export async function sendNotification(formData: FormData):Promise<ActionResponse<SendNotificationData>> {
  try {
    const data = notificationSchema.parse({
      title: formData.get("title"),
      message: formData.get("message"),
      url: formData.get("url") || undefined,
      userId: formData.get("userId") || undefined,
    });

    // Obtener suscripciones activas
    const subscriptions = data.userId
      ? await db
          .select()
          .from(pushSubscriptions)
          .where(
            and(
              eq(pushSubscriptions.userId, data.userId),
              eq(pushSubscriptions.isActive, true)
            )
          )
      : await db
          .select()
          .from(pushSubscriptions)
          .where(eq(pushSubscriptions.isActive, true));

    if (subscriptions.length === 0) {
      return { success: false, error: { message: "No hay suscripciones activas" } };
    }

    // Enviar notificaciones
    const results = await Promise.allSettled(
      subscriptions.map((sub) =>
        sendPushNotification(
          {
            endpoint: sub.endpoint,
            p256dh: sub.p256dh,
            auth: sub.auth,
          },
          {
            title: data.title,
            body: data.message,
            url: data.url,
            icon: NOTIFICATION_CONFIG.icons.default,
            badge: NOTIFICATION_CONFIG.icons.badge,
          }
        )
      )
    );

    const successful = results.filter((r) => r.status === "fulfilled").length;

    return {
      success: true,
      data: {
        sent: successful,
        total: subscriptions.length,
      },
    };
  } catch (error) {
    console.error("Error enviando notificaciones:", error);
    return { success: false, error: { message: "Error al enviar notificaciones" } };
  }
}
