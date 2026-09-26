/**
 * Browser Web Notification Manager with Strict Language Sync
 */

// 1. Check & Request Notification Permission
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("Browser does not support notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
}

// 2. Check if notification is already enabled
export function checkNotificationPermission() {
  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
}

// 3. Send Push Notification strictly respecting Client's chosen language ('bn' | 'en')
export function sendCalorieNotification({ consumed, target, lang = 'bn' }) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const remaining = Math.max(target - consumed, 0);

  // Client Language Binding
  const isBangla = lang === 'bn';

  const title = isBangla
    ? "🔔 ফিটনেস ক্যালোরি আপডেট"
    : "🔔 Calorie Journey Alert";

  const body = isBangla
    ? `খাওয়া হয়েছে: ${consumed} kcal | টার্গেট বাকি: ${remaining} kcal`
    : `Consumed: ${consumed} kcal | Remaining: ${remaining} kcal`;

  try {
    new Notification(title, {
      body,
      icon: "/favicon.ico",
      badge: "/favicon.ico",
      tag: "fit-hourly-update",
      renotify: true,
      silent: false
    });
  } catch (err) {
    console.warn("Notification trigger error:", err);
  }
}