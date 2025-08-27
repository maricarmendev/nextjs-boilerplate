// app/actions/push-actions.ts
"use server";

import { db } from "@/lib/db";
import { pushSubscriptions } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { revalidatePath } from "next/cache";
import type { ActionResponse } from "@/types";

const subscriptionSchema = z.object({
  endpoint: z.string().url(),
  p256dh: z.string(),
  auth: z.string(),
  userId: z.string().nullable().optional(),
});

export async function subscribeToPush(
  formData: FormData
): Promise<ActionResponse> {
  try {
    const subscriptionData = JSON.parse(formData.get("subscription") as string);
    const userId = formData.get("userId") as string;

    // Extraer las keys correctamente
    const keys = subscriptionData.keys || {};
    
    const validated = subscriptionSchema.parse({
      endpoint: subscriptionData.endpoint,
      p256dh: keys.p256dh,
      auth: keys.auth,
      userId: userId || undefined,
    });

    // Verificar si ya existe
    const existing = await db
      .select()
      .from(pushSubscriptions)
      .where(eq(pushSubscriptions.endpoint, validated.endpoint))
      .limit(1);

    if (existing.length > 0) {
      // Actualizar suscripción existente
      await db
        .update(pushSubscriptions)
        .set({
          p256dh: validated.p256dh,
          auth: validated.auth,
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(pushSubscriptions.endpoint, validated.endpoint));
    } else {
      // Crear nueva suscripción
      await db.insert(pushSubscriptions).values({
        userId: validated.userId,
        endpoint: validated.endpoint,
        p256dh: validated.p256dh,
        auth: validated.auth,
      });
    }

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error suscribiendo:", error);
    return {
      success: false,
      error: {
        message: "Error al suscribir a notificaciones",
      },
    };
  }
}

export async function unsubscribeFromPush(endpoint: string):Promise<ActionResponse> {
  try {
    await db
      .update(pushSubscriptions)
      .set({ isActive: false })
      .where(eq(pushSubscriptions.endpoint, endpoint));

    revalidatePath("/");
    return { success: true };
  } catch (error) {
    console.error("Error suscribiendo:", error);
    return {
      success: false,
      error: {
        message: "Error al suscribir a notificaciones",
      },
    };
  }
}
