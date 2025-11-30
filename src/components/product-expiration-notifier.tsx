
"use client";

import { useEffect } from 'react';
import { useAuth } from '@/context/auth-context';
import { getProducts } from '@/app/inventory/actions';
import { differenceInDays, isAfter } from 'date-fns';
import { ProductWithCategoryAndBarcodes } from '@/types';

const NOTIFICATION_PERMISSION_KEY = 'notification-permission';
const LAST_NOTIFICATION_DATE_KEY = 'last-notification-date';

export function ProductExpirationNotifier() {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const checkPermissionsAndNotify = async () => {
      let permission = Notification.permission;

      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      
      localStorage.setItem(NOTIFICATION_PERMISSION_KEY, permission);

      if (permission === 'granted') {
        const lastNotificationDate = localStorage.getItem(LAST_NOTIFICATION_DATE_KEY);
        const today = new Date().toDateString();

        // Only send notification once per day
        if (lastNotificationDate !== today) {
          const { products, error } = await getProducts(user.id);
          if (error || !products) return;

          const expiringProducts = products.filter(product => {
            if (!product.expiryDate) return false;
            const expiry = new Date(product.expiryDate);
            const daysLeft = differenceInDays(expiry, new Date());
            return daysLeft >= 0 && daysLeft <= 30;
          });

          if (expiringProducts.length > 0) {
            const notificationTitle = `⚠️ ${expiringProducts.length} Product(s) Expiring Soon`;
            const notificationBody = expiringProducts
                .map(p => `${p.name} (expiring in ${differenceInDays(new Date(p.expiryDate!), new Date())} days)`)
                .join('\n');
            
            new Notification(notificationTitle, {
              body: notificationBody,
              icon: '/logo.svg', // Optional: you can add an icon
            });

            localStorage.setItem(LAST_NOTIFICATION_DATE_KEY, today);
          }
        }
      }
    };

    // Check on initial load and then periodically
    checkPermissionsAndNotify();
    const interval = setInterval(checkPermissionsAndNotify, 1000 * 60 * 60 * 4); // Check every 4 hours

    return () => clearInterval(interval);

  }, [user]);

  return null; // This component does not render anything
}
