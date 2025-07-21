// PWA utility functions

export interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

let deferredPrompt: BeforeInstallPromptEvent | null = null;

// Handle PWA install prompt
export const handleInstallPrompt = () => {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    deferredPrompt = e as BeforeInstallPromptEvent;
  });
};

// Show install prompt
export const showInstallPrompt = async (): Promise<boolean> => {
  if (!deferredPrompt) {
    return false;
  }

  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  deferredPrompt = null;
  
  return outcome === 'accepted';
};

// Check if app is installed
export const isInstalled = (): boolean => {
  return window.matchMedia('(display-mode: standalone)').matches ||
         (window.navigator as any).standalone ||
         document.referrer.includes('android-app://');
};

// Register for push notifications
export const registerForNotifications = async (): Promise<boolean> => {
  if (!('serviceWorker' in navigator) || !('PushManager' in window)) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(
          'your-vapid-public-key-here' // Replace with actual VAPID key
        )
      });
      
      // Send subscription to server
      console.log('Push notification subscription:', subscription);
      return true;
    }
  } catch (error) {
    console.error('Failed to register for notifications:', error);
  }
  
  return false;
};

// Schedule prayer time notifications
export const schedulePrayerNotifications = async (prayerTimes: any[]) => {
  if (!('serviceWorker' in navigator)) return;

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Clear existing notifications
    const notifications = await registration.getNotifications();
    notifications.forEach(notification => notification.close());
    
    // Schedule new notifications for each prayer time
    prayerTimes.forEach((prayer, index) => {
      const [hours, minutes] = prayer.time.split(':').map(Number);
      const notificationTime = new Date();
      notificationTime.setHours(hours, minutes, 0, 0);
      
      if (notificationTime > new Date()) {
        setTimeout(() => {
          registration.showNotification(`${prayer.name} Prayer Time`, {
            body: `It's time for ${prayer.name} prayer`,
            icon: '/icon-192x192.png',
            badge: '/icon-72x72.png',
            requireInteraction: true
          });
        }, notificationTime.getTime() - Date.now());
      }
    });
  } catch (error) {
    console.error('Failed to schedule notifications:', error);
  }
};

// Store data for offline use
export const storeOfflineData = async (key: string, data: any) => {
  try {
    const cache = await caches.open('adhan-data');
    const response = new Response(JSON.stringify(data));
    await cache.put(`/api/${key}`, response);
  } catch (error) {
    console.error('Failed to store offline data:', error);
  }
};

// Retrieve offline data
export const getOfflineData = async (key: string): Promise<any> => {
  try {
    const cache = await caches.open('adhan-data');
    const response = await cache.match(`/api/${key}`);
    if (response) {
      return await response.json();
    }
  } catch (error) {
    console.error('Failed to retrieve offline data:', error);
  }
  return null;
};

// Check online status
export const isOnline = (): boolean => {
  return navigator.onLine;
};

// Listen for online/offline events
export const setupConnectivityListener = (
  onOnline: () => void,
  onOffline: () => void
) => {
  window.addEventListener('online', onOnline);
  window.addEventListener('offline', onOffline);
  
  return () => {
    window.removeEventListener('online', onOnline);
    window.removeEventListener('offline', onOffline);
  };
};

// Helper function to convert VAPID key
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

// Background sync for prayer times
export const syncPrayerTimes = async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.ready;
      // Note: Background sync requires HTTPS and is experimental
      console.log('Prayer times sync requested');
    } catch (error) {
      console.error('Background sync failed:', error);
    }
  }
};