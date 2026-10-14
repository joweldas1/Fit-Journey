/**
 * Leo Situational Intelligence Engine
 * Dynamically determines Leo's 3-5 second entrance dialogue, mood, and quick action
 * based on the exact time of day, current calorie metrics, and workout state.
 */

export function getLeoCurrentScene({
  consumedCalories = 0,
  targetCalories = 2500,
  foodsCount = 0,
  exercisesCount = 0,
  lang = 'bn',
  lastWorkoutTimestamp = null
}) {
  const isEn = lang === 'en';
  const now = new Date();
  const hour = now.getHours();
  const minutes = now.getMinutes();
  const timeVal = hour + minutes / 60;

  // 1. Special Priority: 100% Calorie Target Met Today
  if (targetCalories > 0 && consumedCalories >= targetCalories) {
    return {
      id: 'target_met',
      badge: isEn ? '🏆 TARGET ACHIEVED' : '🏆 দৈনিক লক্ষ্য অর্জিত',
      title: isEn ? 'Phenomenal Discipline!' : 'অসাধারণ ডিসিপ্লিন!',
      message: isEn 
        ? "You've successfully hit 100% of your daily calorie target. Maintain hydration and rest well!"
        : "আজকের নির্ধারিত দৈনিক ক্যালোরি টার্গেট ১০০% অর্জিত হয়েছে! চমৎকার ধারাবাহিকতা!",
      actionType: 'celebrate',
      actionLabel: isEn ? 'Celebrate 🎉' : 'উদযাপন করি 🎉',
      mood: 'celebrate',
      accentColor: '#F97316'
    };
  }

  // 2. Special Priority: Post-Workout Burn (Within 45 mins of exercise)
  if (lastWorkoutTimestamp) {
    const timeDiffMinutes = (Date.now() - new Date(lastWorkoutTimestamp).getTime()) / (1000 * 60);
    if (timeDiffMinutes >= 0 && timeDiffMinutes <= 45) {
      return {
        id: 'post_workout',
        badge: isEn ? '⚡ RECOVERY PROTOCOL' : '⚡ ওয়ার্কআউট রিকভারি',
        title: isEn ? 'Great Sweat Session!' : 'দুর্দান্ত ওয়ার্কআউট!',
        message: isEn
          ? "Heavy burn recorded! Fuel your muscle fibers with 20-30g protein and replenish electrolytes."
          : "চমৎকার ঘাম ঝরিয়েছো! পেশী রিকভারির জন্য পর্যাপ্ত পানি ও পুষ্টিকর খাবার গ্রহণ করো।",
        actionType: 'add_food',
        actionLabel: isEn ? 'Log Recovery Meal' : 'রিকভারি খাবার লগ করুন',
        mood: 'energetic',
        accentColor: '#0D9488'
      };
    }
  }

  // 3. Time of Day Matrix (10 Situational Slots)

  // 12:00 AM - 4:59 AM: Midnight Craving Guard
  if (timeVal >= 0 && timeVal < 5) {
    return {
      id: 'midnight',
      badge: isEn ? '🌙 LATE NIGHT GUARD' : '🌙 লেট-নাইট গার্ড',
      title: isEn ? 'Still Awake?' : 'এত রাতে জেগে?',
      message: isEn
        ? "Don't fall into the midnight snack trap. Drink a glass of water and get restorative sleep!"
        : "লেট-নাইট ফ্রিজ রেইডের ফাঁদে পা দিও না! এক গ্লাস পানি খেয়ে দ্রুত বিশ্রাম নাও।",
      actionType: 'dismiss',
      actionLabel: isEn ? 'Sleeping Now 😴' : 'ঘুমাতে যাচ্ছি 😴',
      mood: 'calm',
      accentColor: '#6366F1'
    };
  }

  // 5:00 AM - 8:59 AM: Morning Kickoff & Hydration
  if (timeVal >= 5 && timeVal < 9) {
    return {
      id: 'morning',
      badge: isEn ? '☀️ MORNING KICKOFF' : '☀️ শুভ সকাল',
      title: isEn ? 'Rise & Shine!' : 'শুভ সকাল!',
      message: isEn
        ? "Start your morning with a glass of warm water. What nutrient-rich breakfast are we having?"
        : "দিনটি ১ গ্লাস বিশুদ্ধ পানি দিয়ে শুরু হোক। আজকের স্বাস্থ্যকর ব্রেকফাস্ট কী হবে?",
      actionType: 'add_food',
      actionLabel: isEn ? 'Log Breakfast (+)' : 'ব্রেকফাস্ট লগ করুন (+)',
      mood: 'energetic',
      accentColor: '#F97316'
    };
  }

  // 9:00 AM - 11:59 AM: Late Morning / Brunch Check
  if (timeVal >= 9 && timeVal < 12) {
    return {
      id: 'late_morning',
      badge: isEn ? '🍳 BREAKFAST CHECK' : '🍳 ব্রেকফাস্ট চেক',
      title: isEn ? 'Keep Metabolism Active!' : 'মেটাবলিজম সচল রাখো!',
      message: isEn
        ? "Morning is passing by! Did you take breakfast? Fuel up your body for high daily productivity."
        : "সকাল প্রায় শেষ! ব্রেকফাস্ট মিস করোনি তো? সময়মতো খেয়ে মেটাবলিজম সচল রাখো।",
      actionType: 'add_food',
      actionLabel: isEn ? 'Log Meal (+)' : 'খাবার লগ করুন (+)',
      mood: 'energetic',
      accentColor: '#F97316'
    };
  }

  // 12:00 PM - 2:59 PM: Midday Lunch Prime
  if (timeVal >= 12 && timeVal < 15) {
    return {
      id: 'lunch',
      badge: isEn ? '🍛 LUNCH TIME' : '🍛 লাঞ্চ টাইম',
      title: isEn ? 'Good Noon!' : 'গুড নুন!',
      message: isEn
        ? "It's peak lunch time! Balance your plate with healthy protein, fiber, and clean carbs."
        : "দুপুরের খাবার সময় হয়ে গেছে। প্রোটিন ও সবজি সমৃদ্ধ পুষ্টিকর লাঞ্চ সেরে নাও।",
      actionType: 'add_food',
      actionLabel: isEn ? 'Log Lunch (+)' : 'লাঞ্চ লগ করুন (+)',
      mood: 'energetic',
      accentColor: '#0D9488'
    };
  }

  // 3:00 PM - 4:59 PM: Afternoon Slump & Hydration
  if (timeVal >= 15 && timeVal < 17) {
    return {
      id: 'afternoon',
      badge: isEn ? '💧 HYDRATION RECHARGE' : '💧 রিফ্রেশমেন্ট চেক',
      title: isEn ? 'Beat Afternoon Slump!' : 'এনার্জি রিচার্জ করো!',
      message: isEn
        ? "Feeling fatigued? A glass of cold water or green tea will instantly reboot your mental clarity."
        : "বিকেলের ক্লান্তি ভর করছে? এক গ্লাস পানি বা গ্রিন টি পান করে মুহূর্তেই চাঙ্গা হয়ে নাও!",
      actionType: 'add_food',
      actionLabel: isEn ? 'Log Snack / Water' : 'পানি/স্ন্যাক্স লগ করুন',
      mood: 'calm',
      accentColor: '#0EA5E9'
    };
  }

  // 5:00 PM - 7:59 PM: Evening Movement & Workout
  if (timeVal >= 17 && timeVal < 20) {
    return {
      id: 'evening_workout',
      badge: isEn ? '🏃 PRIME MOVEMENT WINDOW' : '🏃 ফিটনেস উইন্ডো',
      title: isEn ? 'Good Evening!' : 'গুড ইভিনিং!',
      message: isEn
        ? "Prime hour to move your body! Ready for a gym session, brisk walk, or home pushups?"
        : "শরীরটা সচল করার সেরা সময় এখন। আজকের কোনো ওয়ার্কআউট, হাঁটা বা ব্যায়ামের প্ল্যান আছে?",
      actionType: 'exercise',
      actionLabel: isEn ? 'Log Workout (+)' : 'ব্যায়াম লগ করুন (+)',
      mood: 'energetic',
      accentColor: '#F97316'
    };
  }

  // 8:00 PM - 9:59 PM: Dinner Check-in
  if (timeVal >= 20 && timeVal < 22) {
    return {
      id: 'dinner',
      badge: isEn ? '🥗 DINNER BALANCE' : '🥗 ডিনার ব্যালেন্স',
      title: isEn ? 'Dinner Time!' : 'ডিনারের সময়!',
      message: isEn
        ? "Keep dinner light and balanced. Avoid heavy carbs close to bedtime for deeper sleep quality."
        : "শুভ সন্ধ্যা! ডিনারটা যেন খুব ভারী না হয়। খাবার শেষ করে আজকের ক্যালোরিটা মিলিয়ে নাও।",
      actionType: 'add_food',
      actionLabel: isEn ? 'Log Dinner (+)' : 'ডিনার লগ করুন (+)',
      mood: 'calm',
      accentColor: '#0D9488'
    };
  }

  // 10:00 PM - 11:59 PM: Night Review & Sleep Prep
  return {
    id: 'night_review',
    badge: isEn ? '✨ DAILY RECAP' : '✨ সারাদিনের হিসাব',
    title: isEn ? 'Wrapping Up Today!' : 'দিন শেষ হতে চলল!',
    message: isEn
      ? "Take a look at your daily calorie balance. Deep rest tonight will power tomorrow's strength."
      : "আজকের পুরো ক্যালোরি হিসাবটা দেখে নাও। ভালো ঘুমই কালকের ফিটনেসের আসল চাবিকাঠি।",
    actionType: 'dismiss',
    actionLabel: isEn ? 'Good Night Leo 🌙' : 'শুভরাত্রি লিও 🌙',
    mood: 'calm',
    accentColor: '#8B5CF6'
  };
}
