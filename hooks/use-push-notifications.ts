"use client";

import { useState, useEffect, useCallback } from "react";

type NotificationState = {
  permission: NotificationPermission;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
};

export function usePushNotifications() {
  const [state, setState] = useState<NotificationState>({
    permission: "default",
    isSubscribed: false,
    isLoading: false,
    error: null,
  });

  const checkStatus = useCallback(async () => {
    if (!("Notification" in window)) {
      setState((prev) => ({
        ...prev,
        error: "Tu navegador no soporta notificaciones",
      }));
      return;
    }

    const permission = Notification.permission;
    
    try {
      const registration = await navigator?.serviceWorker?.getRegistration();
      const subscription = registration
        ? await registration.pushManager.getSubscription()
        : null;

      setState((prev) => ({
        ...prev,
        permission,
        isSubscribed: !!subscription,
        error: null,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        permission,
        error: "Error verificando estado de notificaciones",
      }));
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  const setLoading = (isLoading: boolean) => {
    setState((prev) => ({ ...prev, isLoading }));
  };

  const setSubscribed = (isSubscribed: boolean) => {
    setState((prev) => ({ ...prev, isSubscribed }));
  };

  const setError = (error: string | null) => {
    setState((prev) => ({ ...prev, error }));
  };

  return {
    ...state,
    setLoading,
    setSubscribed,
    setError,
    checkStatus,
  };
}