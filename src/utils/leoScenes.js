/**
 * Leo Situational Intelligence Engine (Clean UTF-8)
 * Time-based greetings and questions for Leo
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
        ? "You've successfully hit 100% of your daily calorie target! Are you satisfied with today's meals?"
        : "আজকের দৈনিক ক্যালোরি টার্গেট ১০০% অর্জিত হয়েছে! আজকের খাবার ও নিয়মানুবর্তিতা নিয়ে তুমি কি সন্তুষ্ট?",
      actionType: 'celebrate',
      actionLabel: isEn ? 'Yes, Celebrated! 🎉' : 'হ্যাঁ, দারুণ হয়েছে! 🎉',
      secondaryActionLabel: isEn ? 'Close' : 'ঠিক আছে',
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
          ? "Heavy burn recorded! Have you refueled with protein and water yet?"
          : "চমৎকার ঘাম ঝরিয়েছো! পেশী রিকভারির জন্য পর্যাপ্ত পানি ও প্রোটিন খেয়েছো কি?",
        actionType: 'add_food',
        actionLabel: isEn ? 'Log Recovery Food (+)' : 'হ্যাঁ, খাবার লগ করুন (+)',
        secondaryActionLabel: isEn ? 'Not Yet' : 'এখনও খাইনি',
        mood: 'energetic',
        accentColor: '#0D9488'
      };
    }
  }

  // 3. Time of Day Matrix (10 Situational Slots with Direct Questions)

  // 12:00 AM - 4:59 AM: Midnight Craving Guard
  if (timeVal >= 0 && timeVal < 5) {
    return {
      id: 'midnight',
      badge: isEn ? '🌙 LATE NIGHT GUARD' : '🌙 লেট-নাইট গার্ড',
      title: isEn ? 'Still Awake So Late?' : 'এত রাতে জেগে আছো?',
      message: isEn
        ? "What are you doing up so late? Looking for midnight snacks in the fridge?"
        : "এত রাতে কী করছো? ফ্রিজের দিকে লেট-নাইট স্ন্যাক্স খুঁজতে যাচ্ছ নাকি?",
      actionType: 'dismiss',
      actionLabel: isEn ? 'Just Drinking Water' : 'শুধু পানি খাচ্ছি 💧',
      secondaryActionLabel: isEn ? 'Going to Sleep' : 'ঘুমাতে যাচ্ছি 😴',
      mood: 'calm',
      accentColor: '#6366F1'
    };
  }

  // 5:00 AM - 8:59 AM: Morning Kickoff & Hydration
  if (timeVal >= 5 && timeVal < 9) {
    return {
      id: 'morning',
      badge: isEn ? '☀️ MORNING KICKOFF' : '☀️ শুভ সকাল',
      title: isEn ? 'Good Morning!' : 'শুভ সকাল!',
      message: isEn
        ? "Good morning! Did you drink a fresh glass of water? What are we having for breakfast today?"
        : "শুভ সকাল! এক গ্লাস বিশুদ্ধ পানি খেয়েছো তো? আজকের স্বাস্থ্যকর ব্রেকফাস্টে কী খাচ্ছ?",
      actionType: 'add_food',
      actionLabel: isEn ? 'Log Breakfast (+)' : 'ব্রেকফাস্ট লগ করুন (+)',
      secondaryActionLabel: isEn ? 'Eating Later' : 'পরে খাবো',
      mood: 'energetic',
      accentColor: '#F97316'
    };
  }

  // 9:00 AM - 11:59 AM: Late Morning / Brunch Check
  if (timeVal >= 9 && timeVal < 12) {
    const hasBreakfast = foodsCount > 0;
    return {
      id: 'late_morning',
      badge: isEn ? '🍳 BREAKFAST CHECK' : '🍳 ব্রেকফাস্ট চেক',
      title: isEn ? 'Morning Almost Over!' : 'সকাল প্রায় শেষ!',
      message: hasBreakfast
        ? (isEn ? "Great job starting your day! Staying energized for the upcoming lunch?" : "সকালের খাবার চমৎকার শুরু হয়েছে! দুপুরের আগের সময়টায় এনার্জি কেমন লাগছে?")
        : (isEn ? "Morning is passing fast! Have you taken your breakfast yet, or skipping it?" : "সকাল প্রায় শেষ! ব্রেকফাস্ট খেয়েছো তো, নাকি না খেয়েই দিন শুরু করেছো?"),
      actionType: 'add_food',
      actionLabel: isEn ? 'Log Food (+)' : 'খাবার লগ করুন (+)',
      secondaryActionLabel: isEn ? 'All Good' : 'সব ঠিক আছে',
      mood: 'energetic',
      accentColor: '#F97316'
    };
  }

  // 12:00 PM - 2:59 PM: Midday Lunch Prime
  if (timeVal >= 12 && timeVal < 15) {
    return {
      id: 'lunch',
      badge: isEn ? '🍛 LUNCH PROTOCOL' : '🍛 লাঞ্চ টাইম',
      title: isEn ? 'Good Noon!' : 'গুড নুন!',
      message: foodsCount === 0
        ? (isEn ? "No food logged yet today! Have you had lunch or breakfast?" : "আজকে এখনো কোনো খাবার লগ করোনি! দুপুরের লাঞ্চ কিছু খেয়েছো?")
        : (isEn ? "Good noon! Have you taken your lunch yet? What did you eat for lunch today?" : "গুড নুন! দুপুরের খাবার খেয়েছো তো? আজকের লাঞ্চে কী কী খেলে?"),
      actionType: 'add_food',
      actionLabel: isEn ? 'Log Lunch Now (+)' : 'হ্যাঁ, লাঞ্চ লগ করুন (+)',
      secondaryActionLabel: isEn ? 'Eating Soon' : 'এখনও খাইনি',
      mood: 'energetic',
      accentColor: '#0D9488'
    };
  }

  // 3:00 PM - 4:59 PM: Afternoon Slump & Hydration
  if (timeVal >= 15 && timeVal < 17) {
    return {
      id: 'afternoon',
      badge: isEn ? '💧 AFTERNOON RECHARGE' : '💧 রিফ্রেশমেন্ট চেক',
      title: isEn ? 'Afternoon Slump?' : 'বিকেলের ক্লান্তি?',
      message: isEn
        ? "Feeling an energy dip? Did you drink enough water this afternoon, or need a healthy snack?"
        : "বিকেলে এনার্জি কমে যাচ্ছে? পর্যাপ্ত পানি খেয়েছো তো, নাকি হালকা কোনো পুষ্টিকর স্ন্যাক্স লাগবে?",
      actionType: 'add_food',
      actionLabel: isEn ? 'Log Snack / Water (+)' : 'স্ন্যাক্স/পানি লগ করুন (+)',
      secondaryActionLabel: isEn ? 'I am Good' : 'সব ঠিক আছে',
      mood: 'calm',
      accentColor: '#0EA5E9'
    };
  }

  // 5:00 PM - 7:59 PM: Evening Movement & Workout
  if (timeVal >= 17 && timeVal < 20) {
    const hasWorkedOut = exercisesCount > 0;
    return {
      id: 'evening_workout',
      badge: isEn ? '🏃 FITNESS WINDOW' : '🏃 ফিটনেস উইন্ডো',
      title: isEn ? 'Good Evening!' : 'গুড ইভিনিং!',
      message: hasWorkedOut
        ? (isEn ? "Great work exercising today! Drinking enough water to hydrate?" : "আজকে ইতোমধ্যে দারুণ এক্সারসাইজ করেছো! পর্যাপ্ত পানি ও ইলেকট্রোলাইট নিয়েছো কি?")
        : (isEn ? "Good evening! Did you do any workout, walk, or physical exercise today?" : "গুড ইভিনিং! আজকের কোনো ব্যায়াম, হাঁটা বা ওয়ার্কআউট কি করেছো?"),
      actionType: 'exercise',
      actionLabel: hasWorkedOut 
        ? (isEn ? 'Add More Workout (+)' : 'আরও ব্যায়াম লগ (+)') 
        : (isEn ? 'Yes, Log Workout (+)' : 'হ্যাঁ, ব্যায়াম করেছি (+)'),
      secondaryActionLabel: isEn ? 'Rest Day Today' : 'আজ রেস্ট ডে',
      mood: 'energetic',
      accentColor: '#F97316'
    };
  }

  // 8:00 PM - 9:59 PM: Dinner Check-in
  if (timeVal >= 20 && timeVal < 22) {
    return {
      id: 'dinner',
      badge: isEn ? '🥗 DINNER CHECK' : '🥗 ডিনার চেক',
      title: isEn ? 'Dinner Time!' : 'ডিনারের সময়!',
      message: isEn
        ? "Have you finished your dinner yet? Let's check and balance your remaining calories!"
        : "রাতের ডিনার শেষ করেছো তো? চলো আজকের বাকি ক্যালোরির সাথে মিলিয়ে নিই!",
      actionType: 'add_food',
      actionLabel: isEn ? 'Log Dinner (+)' : 'ডিনার লগ করুন (+)',
      secondaryActionLabel: isEn ? 'Not Yet' : 'এখনও খাইনি',
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
      ? "The day is wrapping up! How did your fitness and calories go today? Ready for good sleep?"
      : "দিন প্রায় শেষ! আজকের পুরো ক্যালোরির হিসাব কি মিলিয়েছো? কালকের জন্য ভালো ঘুমের প্রস্তুতি নাও!",
    actionType: 'dismiss',
    actionLabel: isEn ? 'View Final Score' : 'ক্যালোরি হিসাব দেখি',
    secondaryActionLabel: isEn ? 'Good Night Leo' : 'শুভরাত্রি লিও 🌙',
    mood: 'calm',
    accentColor: '#8B5CF6'
  };
}
