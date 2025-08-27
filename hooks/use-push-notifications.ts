'use client';

import { useState, useEffect, useCallback } from 'react';

export function usePushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const checkStatus = useCallback(async () => {
    if ('Notification' in window) {
      setPermission(Notification.permission);
    }

    try {
      const registration = await navigator?.serviceWorker?.getRegistration();
      if (registration) {
        const subscription = await registration.pushManager.getSubscription();
        setIsSubscribed(!!subscription);
      }
    } catch (error) {
      console.error('Error verificando estado:', error);
    }
  }, []);

  useEffect(() => {
    checkStatus();
  }, [checkStatus]);

  return {
    permission,
    isSubscribed,
    isLoading,
    setIsLoading,
    setIsSubscribed,
    checkStatus,
  };
}