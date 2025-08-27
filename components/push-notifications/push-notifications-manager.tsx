"use client";

import { useTransition } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import {
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/actions/push-subscription";
import {
  registerServiceWorker,
  requestNotificationPermission,
  suscribeToPushNotifications,
} from "@/lib/notifications/push-suscription";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";

interface Props {
  userId?: string;
}

export function PushNotificationManager({ userId }: Props) {
  const { permission, isSubscribed, setIsSubscribed } = usePushNotifications();
  const [isPending, startTransition] = useTransition();

  const handleSubscribe = async () => {
    startTransition(async () => {
      try {
        // 1. Registrar Service Worker
        const registration = await registerServiceWorker();

        // 2. Solicitar permisos
        const permission = await requestNotificationPermission();

        if (permission === "granted") {
          // 3. Crear suscripción
          const subscription = await suscribeToPushNotifications(registration);

          // 4. Guardar en base de datos usando Server Action
          const formData = new FormData();
          formData.append("subscription", JSON.stringify(subscription));
          if (userId) formData.append("userId", userId);

          const result = await subscribeToPush(formData);

          if (result.success) {
            setIsSubscribed(true);
            // Mostrar notificación de confirmación
            new Notification("Notificaciones Activadas", {
              body: "Ahora recibirás notificaciones push de esta aplicación",
              icon: "/icon.png",
            });
          } else {
            const errorMessage =
              result.error?.message ||
              "Error desconocido al activar notificaciones";
            console.error("Error al guardar suscripción:", result.error);
            alert("Error al activar notificaciones: " + errorMessage);
          }
        } else {
          console.log("Permisos de notificación denegados");
        }
      } catch (error) {
        console.error("Error:", error);
        alert("Error al habilitar notificaciones");
      }
    });
  };

  const handleUnsubscribe = async () => {
    startTransition(async () => {
      try {
        const registration = await navigator.serviceWorker.getRegistration();
        if (registration) {
          const subscription = await registration.pushManager.getSubscription();
          if (subscription) {
            await subscription.unsubscribe();
            await unsubscribeFromPush(subscription.endpoint);
            setIsSubscribed(false);
          }
        }
      } catch (error) {
        console.error("Error al deshabilitar notificaciones:", error);
        alert("Error al deshabilitar notificaciones");
      }
    });
  };

  if (permission === "denied") {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            Notificaciones Bloqueadas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Las notificaciones están bloqueadas en tu navegador. Para
              activarlas:
              <ol className="mt-2 ml-4 list-decimal">
                <li>
                  Haz clic en el icono del candado en la barra de direcciones
                </li>
                <li>Busca la opción de Notificaciones</li>
                <li>Cambia de &quot;Bloquear&quot; a &quot;Permitir&quot;</li>
                <li>Recarga la página</li>
              </ol>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
      <div className="space-y-0.5">
        <Label>Notifications</Label>
        <span className="text-sm text-muted-foreground">
          Mantente al día con las últimas actualizaciones y contenido relevante
        </span>
      </div>
      <div>
        <Switch
          checked={isSubscribed}
          onCheckedChange={(checked) => {
            if (checked) handleSubscribe();
            else handleUnsubscribe();
          }}
        />
      </div>
    </div>
  );
}
