/**
 * Browser & Mobile Web Notification Manager
 * Features: First-Name Personalization, Strong Mobile Vibration & Professional Tone
 */

// ১. ব্যবহারকারীর ফার্স্ট নেম বের করার হেল্পার
function getFirstName(fullName) {
  if (!fullName || typeof fullName !== 'string') return '';
  return fullName.trim().split(/\s+/)[0];
}

// ২. পারমিশন রিকোয়েস্ট
export async function requestNotificationPermission() {
  if (!("Notification" in window)) {
    console.warn("ব্রাউজারে নোটিফিকেশন সাপোর্ট করে না।");
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

// ৩. পারমিশন স্টেটাস চেক
export function checkNotificationPermission() {
  if (!("Notification" in window)) return false;
  return Notification.permission === "granted";
}

// ৪. প্রফেশনাল ও পারসোনালাইজড মেসেজ ডিকশনারি
const NOTIFICATION_TEMPLATES = {
  // লক্ষ্য পূরণ (Success)
  TARGET_REACHED: {
    bn: {
      title: (name) => name ? `🎯 দৈনিক লক্ষ্য সম্পন্ন | অভিনন্দন ${name}!` : "🎯 দৈনিক পুষ্টি লক্ষ্য সম্পন্ন!",
      body: () => "আজকের ক্যালোরি লক্ষ্য সফলভাবে সম্পন্ন হয়েছে। আপনার ধারাবাহিকতা প্রশংসনীয়।"
    },
    en: {
      title: (name) => name ? `🎯 Goal Achieved | Well Done, ${name}!` : "🎯 Daily Caloric Goal Met!",
      body: () => "You have successfully completed your calorie benchmark for today. Excellent discipline."
    }
  },

  // পিছিয়ে থাকা সতর্কতা (Behind Progress)
  BEHIND_SCHEDULE: {
    bn: {
      title: (name) => name ? `📊 পুষ্টি ঘাটতি সতর্কতা | ${name}` : "📊 পুষ্টি ঘাটতি সতর্কতা",
      body: (_, rem) => `দৈনিক লক্ষ্যমাত্রায় পৌঁছাতে এখনো ${rem} kcal প্রয়োজন। সময়মতো পুষ্টিকর খাবার গ্রহণ করুন।`
    },
    en: {
      title: (name) => name ? `📊 Caloric Intake Alert | ${name}` : "📊 Caloric Intake Alert",
      body: (_, rem) => `You are currently ${rem} kcal behind your daily target. Fuel up to maintain steady progress.`
    }
  },

  // লক্ষ্যের কাছাকাছি (On Track Momentum)
  ON_TRACK: {
    bn: {
      title: (name) => name ? `⚡ চমৎকার অগ্রগতি | ${name}` : "⚡ চমৎকার অগ্রগতি",
      body: (_, rem) => `লক্ষ্য অর্জনে আর মাত্র ${rem} kcal বাকি রয়েছে। আপনার রুটিন নিখুঁতভাবে এগোচ্ছে।`
    },
    en: {
      title: (name) => name ? `⚡ Strong Momentum | ${name}` : "⚡ Strong Momentum",
      body: (_, rem) => `Just ${rem} kcal remaining to hit your target. Keep up the structured intake.`
    }
  },

  // খাবার লগ না করার রিমাইন্ডার (Empty Log)
  NO_FOOD_LOGGED: {
    bn: {
      title: (name) => name ? `🕒 ট্র্যাকিং রিমাইন্ডার | ${name}` : "🕒 দৈনিক ট্র্যাকিং রিমাইন্ডার",
      body: () => "আজকের কোনো আহার এখনো লগ করা হয়নি। সঠিক পর্যবেক্ষণ বজায় রাখতে মিল রেকর্ড করুন।"
    },
    en: {
      title: (name) => name ? `🕒 Activity Reminder | ${name}` : "🕒 Daily Activity Reminder",
      body: () => "No meals logged yet today. Consistent tracking is vital for accurate physiological feedback."
    }
  },

  // অতিরিক্ত ক্যালোরি গ্রহণ (Threshold Exceeded)
  EXCEEDED_GOAL: {
    bn: {
      title: (name) => name ? `⚠️ ক্যালোরি সীমা অতিক্রান্ত | ${name}` : "⚠️ ক্যালোরি সীমা অতিক্রান্ত",
      body: (_, __, extra) => `নির্ধারিত লক্ষ্যের চেয়ে ${extra} kcal বেশি গ্রহণ করা হয়েছে। ভারসাম্য বজায় রাখতে কিছুটা শারীরিক কসরত করতে পারেন।`
    },
    en: {
      title: (name) => name ? `⚠️ Calorie Limit Exceeded | ${name}` : "⚠️ Calorie Limit Exceeded",
      body: (_, __, extra) => `You have exceeded your daily quota by ${extra} kcal. A light walk or recovery activity is recommended.`
    }
  },

  // নিয়মিত প্রতি ঘণ্টার আপডেট (Standard Hourly Snapshot)
  HOURLY_UPDATE: {
    bn: {
      title: (name) => name ? `📌 পুষ্টি স্ট্যাটাস | ${name}` : "📌 বর্তমান পুষ্টি স্ট্যাটাস",
      body: (name, rem, extra, consumed) => `গৃহীত: ${consumed} kcal | অবশিষ্ট: ${rem} kcal। পরিমিত আহার গ্রহণ করুন।`
    },
    en: {
      title: (name) => name ? `📌 Calorie Snapshot | ${name}` : "📌 Daily Nutrition Snapshot",
      body: (name, rem, extra, consumed) => `Consumed: ${consumed} kcal | Remaining: ${rem} kcal. Maintain your rhythm.`
    }
  }
};

// ৫. মোবাইল-ফোর্সড পুশ নোটিফিকেশন ডিসপ্যাচার
export async function sendSmartNotification({ 
  type = 'HOURLY_UPDATE', 
  consumed = 0, 
  target = 2897, 
  lang = 'bn',
  userName = '' 
}) {
  if (!("Notification" in window) || Notification.permission !== "granted") {
    return;
  }

  const firstName = getFirstName(userName);
  const remaining = Math.max(target - consumed, 0);
  const extra = Math.max(consumed - target, 0);

  const template = NOTIFICATION_TEMPLATES[type] || NOTIFICATION_TEMPLATES.HOURLY_UPDATE;
  const content = template[lang] || template.bn;

  const title = typeof content.title === 'function' ? content.title(firstName) : content.title;
  const body = typeof content.body === 'function' ? content.body(firstName, remaining, extra, consumed) : content.body;

  // মোবাইলের জন্য অপ্টিমাইজড কনফিগারেশন (উচ্চ প্রায়োরিটি ও ডিস্টিংক্ট ভাইব্রেশন)
  const options = {
    body,
    icon: "/favicon.ico",
    badge: "/favicon.ico",
    tag: "fit-hourly-status", // একই ট্যাগ থাকলে নোটিফিকেশন বার ক্লিন থাকবে
    renotify: true, // প্রতি ঘণ্টায় রিনোটিফাই হয়ে সাউন্ড/ভাইব্রেট করবে
    silent: false,
    requireInteraction: false,
    vibrate: [300, 100, 300, 100, 300], // মোবাইলে শক্ত ভাইব্রেশন যা মিস হবে না
    data: { url: "/" }
  };

  try {
    // মোবাইল ডিভাইসের ক্ষেত্রে Service Worker দিয়ে ফোর্স নোটিফিকেশন
    if ('serviceWorker' in navigator) {
      const reg = await navigator.serviceWorker.ready;
      if (reg && reg.showNotification) {
        await reg.showNotification(title, options);
        return;
      }
    }

    // ডেস্কটপ ব্রাউজার ফলব্যাক
    new Notification(title, options);
  } catch (err) {
    console.warn("Notification dispatch failed:", err);
  }
}