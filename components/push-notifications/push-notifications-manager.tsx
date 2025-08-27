"use client";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { usePushNotifications } from "@/hooks/use-push-notifications";
import {
  subscribeToPush,
  unsubscribeFromPush,
} from "@/lib/actions/push-subscription";
import {
  registerServiceWorker,
  requestNotificationPermission,
  subscribeToPushNotifications,
} from "@/lib/notifications/push-subscription";
import { NOTIFICATION_CONFIG } from "@/lib/config/notifications";
import { Switch } from "../ui/switch";
import { Label } from "../ui/label";
import { toast } from "sonner";

interface Props {
  userId?: string;
}

export function PushNotificationManager({ userId }: Props) {
  const {
    permission,
    isSubscribed,
    isLoading,
    setLoading,
    setSubscribed,
    setError,
  } = usePushNotifications();

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const registration = await registerServiceWorker();
      const permission = await requestNotificationPermission();

      if (permission !== "granted") {
        toast.error("Permisos de notificación denegados");
        setLoading(false);
        return;
      }

      const subscription = await subscribeToPushNotifications(registration);

      const formData = new FormData();
      formData.append("subscription", JSON.stringify(subscription));
      if (userId) formData.append("userId", userId);

      const result = await subscribeToPush(formData);

      if (result.success) {
        setSubscribed(true);
        toast.success(NOTIFICATION_CONFIG.messages.subscribeSuccess);
        
        if ("Notification" in window && Notification.permission === "granted") {
          new Notification("Notificaciones Activadas", {
            body: "Ahora recibirás notificaciones push",
            icon: NOTIFICATION_CONFIG.icons.default,
          });
        }
      } else {
        throw new Error(result.error?.message || NOTIFICATION_CONFIG.messages.subscribeError);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : NOTIFICATION_CONFIG.messages.subscribeError;
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      if (!registration) {
        throw new Error("No se encontró el Service Worker");
      }

      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        throw new Error("No hay suscripción activa");
      }

      await subscription.unsubscribe();
      await unsubscribeFromPush(subscription.endpoint);
      
      setSubscribed(false);
      toast.success(NOTIFICATION_CONFIG.messages.unsubscribeSuccess);
    } catch (error) {
      const message = error instanceof Error ? error.message : NOTIFICATION_CONFIG.messages.unsubscribeError;
      toast.error(message);
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (permission === "denied") {
    return (
      <Card className="border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive">
            {NOTIFICATION_CONFIG.messages.permissionDenied}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertDescription>
              Para activar las notificaciones:
              <ol className="mt-2 ml-4 list-decimal space-y-1">
                <li>Haz clic en el icono del candado en la barra de direcciones</li>
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
          disabled={isLoading}
          onCheckedChange={(checked) => {
            if (checked) handleSubscribe();
            else handleUnsubscribe();
          }}
        />
      </div>
    </div>
  );
}