import LeoEntranceBanner from './components/LeoEntranceBanner';
import { getLeoCurrentScene } from './utils/leoScenes';
import { useState, useEffect, useRef } from 'react';
import { Toaster, toast } from 'sonner';
import { Dumbbell, AlertTriangle, Timer, Plus } from 'lucide-react';
import Header from './components/Header';
import OnboardingModal from './components/OnboardingModal';
import CalorieGauge from './components/CalorieGauge';
import AddFoodModal from './components/AddFoodModal';
import LogExerciseModal from './components/LogExerciseModal';
import DailyCalorieView from './components/DailyCalorieView';
import GlobalCalendarView from './components/GlobalCalendarView';
import DailyPlanModal from './components/DailyPlanModal';
import { t } from './utils/translations';
import MotivationalQuote from './components/MotivationalQuote';
import { 
  requestNotificationPermission, 
  checkNotificationPermission, 
  sendSmartNotification 
} from './utils/notifier';

// টাইমজোন-সঠিক লোকাল ডেট কি (UTC অফসেট বাগ মুক্ত)
const getLocalDateKey = (d = new Date()) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lang, setLang] = useState('bn');
  const [activeTab, setActiveTab] = useState('journey');
  // Leo 3-5s smart entrance scene banner — ALWAYS triggers on entry/refresh
  const [showLeoBanner, setShowLeoBanner] = useState(true);

  // Trigger Leo whenever user switches back to the tab
  useEffect(() => {
    const handleTabReentry = () => {
      if (document.visibilityState === 'visible') {
        setShowLeoBanner(true);
      }
    };
    document.addEventListener('visibilitychange', handleTabReentry);
    return () => document.removeEventListener('visibilitychange', handleTabReentry);
  }, []);

  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [isExerciseOpen, setIsExerciseOpen] = useState(false);
  const [isDailyPlanOpen, setIsDailyPlanOpen] = useState(false);
  const [isNotifActive, setIsNotifActive] = useState(false);

  const todayKey = getLocalDateKey();
  
  const [foods, setFoods] = useState(() => {
    const saved = localStorage.getItem(`fit_foods_${todayKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem(`fit_exercises_${todayKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [dailyPlan, setDailyPlan] = useState(() => {
    const saved = localStorage.getItem(`fit_daily_plan_${todayKey}`);
    return saved ? JSON.parse(saved) : null;
  });

  const [showResetCountdown, setShowResetCountdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  // Initialize Profile, Notifications & Daily Plan Popup (Requirement D)
  useEffect(() => {
    const saved = localStorage.getItem('fit_profile');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        setProfile(data);
        if (data.lang) setLang(data.lang);

        // Requirement D: Check if daily plan exists for today
        const existingPlan = localStorage.getItem(`fit_daily_plan_${todayKey}`);
        const dismissed = sessionStorage.getItem(`fit_daily_plan_dismissed_${todayKey}`);
        if (!existingPlan && !dismissed) {
          // Open morning/midnight daily plan popup
          const timer = setTimeout(() => setIsDailyPlanOpen(true), 500);
          return () => clearTimeout(timer);
        }
      } catch (e) {
        console.warn("Failed to parse saved profile", e);
      }
    } else {
      setShowOnboarding(true);
    }
    setIsNotifActive(checkNotificationPermission());
  }, [todayKey]);

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  useEffect(() => {
    localStorage.setItem(`fit_foods_${todayKey}`, JSON.stringify(foods));
  }, [foods, todayKey]);

  useEffect(() => {
    localStorage.setItem(`fit_exercises_${todayKey}`, JSON.stringify(exercises));
  }, [exercises, todayKey]);

  // Notification Engine
  const foodsRef = useRef(foods);
  const profileRef = useRef(profile);
  const langRef = useRef(lang);

  useEffect(() => {
    foodsRef.current = foods;
    profileRef.current = profile;
    langRef.current = lang;
  }, [foods, profile, lang]);

  const triggerEvaluatedNotification = () => {
    const curTarget = profileRef.current?.dailyCalorieTarget || 2897;
    const curConsumed = foodsRef.current.reduce((acc, f) => acc + (f.calories || 0), 0);
    const curLang = langRef.current;
    const userName = profileRef.current?.name || '';

    let notifType = 'HOURLY_UPDATE';

    if (curConsumed === 0) {
      notifType = 'NO_FOOD_LOGGED';
    } else if (curConsumed >= curTarget && curConsumed <= curTarget + 300) {
      notifType = 'TARGET_REACHED';
    } else if (curConsumed > curTarget + 300) {
      notifType = 'EXCEEDED_GOAL';
    } else if (curConsumed < curTarget * 0.5) {
      notifType = 'BEHIND_SCHEDULE';
    } else {
      notifType = 'ON_TRACK';
    }

    sendSmartNotification({
      type: notifType,
      consumed: curConsumed,
      target: curTarget,
      lang: curLang,
      userName
    });
  };

  useEffect(() => {
    const ONE_HOUR_MS = 60 * 60 * 1000;

    const checkAndNotify = () => {
      const lastSentTime = parseInt(localStorage.getItem('fit_last_notified_timestamp') || '0', 10);
      const now = Date.now();

      if (now - lastSentTime >= ONE_HOUR_MS) {
        triggerEvaluatedNotification();
        localStorage.setItem('fit_last_notified_timestamp', String(now));
      }
    };

    const interval = setInterval(checkAndNotify, 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleNotification = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      setIsNotifActive(true);
      toast.success(lang === 'bn' ? 'স্মার্ট নোটিফিকেশন চালু হয়েছে! (১ ঘণ্টা পর পর আপডেট পাবেন)' : 'Smart notifications active! (Hourly updates)');
      triggerEvaluatedNotification();
      localStorage.setItem('fit_last_notified_timestamp', String(Date.now()));
    } else {
      setIsNotifActive(false);
      toast.error(lang === 'bn' ? 'ব্রাউজার সেটিংস থেকে নোটিফিকেশন Allow করুন' : 'Please allow notification from browser settings');
    }
  };

  // Safe Hoisted executeReset function (fixes linter initialization warning)
  const executeReset = () => {
    setShowResetCountdown(false);
    localStorage.clear();
    sessionStorage.clear();
    setProfile(null);
    setFoods([]);
    setExercises([]);
    setDailyPlan(null);
    setShowOnboarding(true);
  };

  // Reset Countdown Effect
  useEffect(() => {
    let timerId;
    if (showResetCountdown && timeLeft > 0) {
      timerId = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (showResetCountdown && timeLeft === 0) {
      executeReset();
      toast.info(lang === 'bn' ? 'সময় শেষ! ডেটা রিসেট হয়েছে।' : 'Time up! Data reset.');
    }
    return () => clearInterval(timerId);
  }, [showResetCountdown, timeLeft, lang]);

  const handleAddFood = (foodItem) => {
    setFoods((prev) => {
      const updated = [{ ...foodItem, id: Date.now() }, ...prev];
      const curTarget = profile?.dailyCalorieTarget || 2897;
      const prevTotal = prev.reduce((acc, f) => acc + (f.calories || 0), 0);
      const totalCal = updated.reduce((acc, f) => acc + (f.calories || 0), 0);

      if (totalCal >= curTarget && prevTotal < curTarget) {
        sendSmartNotification({
          type: 'TARGET_REACHED',
          consumed: totalCal,
          target: curTarget,
          lang,
          userName: profile?.name || ''
        });
      }
      return updated;
    });
  };

  const handleDeleteFood = (id) => {
    setFoods((prev) => prev.filter(f => f.id !== id));
    toast.info(lang === 'bn' ? 'খাবারটি মুছে ফেলা হয়েছে' : 'Food item removed');
  };

  const handleLogExercise = (workoutItem) => {
    setExercises((prev) => [{ ...workoutItem, id: Date.now() }, ...prev]);
  };

  // Handle Daily Plan Apply (Requirement D)
  const handleApplyDailyPlan = (newPlan) => {
    setDailyPlan(newPlan);
    localStorage.setItem(`fit_daily_plan_${todayKey}`, JSON.stringify(newPlan));

    if (newPlan.dailyCalorieTarget) {
      setProfile(prev => {
        const updated = {
          ...(prev || {}),
          dailyCalorieTarget: newPlan.dailyCalorieTarget,
          macros: newPlan.macros || prev?.macros
        };
        localStorage.setItem('fit_profile', JSON.stringify(updated));
        return updated;
      });
    }
  };

  const handleCloseDailyPlan = () => {
    setIsDailyPlanOpen(false);
    sessionStorage.setItem(`fit_daily_plan_dismissed_${todayKey}`, 'true');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const txt = t[lang] || t.bn;

  const targetCalories = profile?.dailyCalorieTarget || 2897;
  const consumedCalories = foods.reduce((acc, f) => acc + (f.calories || 0), 0);
  const burnedCalories = exercises.reduce((acc, e) => acc + (e.caloriesBurned || 0), 0);

  return (
    <div className={`h-[100dvh] max-h-[100dvh] w-full overflow-hidden flex flex-col transition-colors duration-300 ${darkMode ? 'bg-[#09090B] text-slate-100 selection:bg-orange-500 selection:text-white' : 'bg-[#FFFFFF] text-slate-800 selection:bg-teal-500 selection:text-white'}`}>
      
      <Toaster position="top-center" richColors theme={darkMode ? 'dark' : 'light'} />

      {/* 2-Minute Reset Modal */}
      {showResetCountdown && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="w-full max-w-sm bg-white dark:bg-[#161F33] rounded-3xl p-6 shadow-2xl border border-rose-500/30 text-center relative overflow-hidden">
            <div className="inline-flex p-3.5 rounded-2xl bg-rose-500/10 text-rose-500 mb-3 border border-rose-500/20">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-1.5">
              {lang === 'bn' ? 'সতর্কতা: ডেটা রিসেট' : 'Warning: Reset Data'}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-5 leading-relaxed">
              {lang === 'bn' 
                ? '২ মিনিটের মধ্যে বাতিল না করলে আপনার বর্তমান ওজন, বয়স ও পূর্বের সব রেকর্ড স্বয়ংক্রিয়ভাবে মুছে যাবে।' 
                : 'If not cancelled within 2 minutes, all records will be deleted automatically.'}
            </p>
            <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/25 mb-6 text-rose-500 font-mono text-xl font-bold">
              <Timer className="w-5 h-5 animate-spin" style={{ animationDuration: '3s' }} />
              <span>{formatTime(timeLeft)}</span>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => { setShowResetCountdown(false); setTimeLeft(120); }}
                className="py-3 px-4 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold active:scale-95 transition"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>
              <button
                type="button"
                onClick={executeReset}
                className="py-3 px-4 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold active:scale-95 transition shadow-lg shadow-rose-600/25"
              >
                {lang === 'bn' ? 'এখনই রিসেট' : 'Reset Now'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Onboarding Wizard & Edit Profile */}
      {showOnboarding && (
        <OnboardingModal 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          initialLang={lang}
          initialData={profile}
          onClose={profile ? () => setShowOnboarding(false) : null}
          onComplete={(newProfile) => {
            const isInitial = !profile;
            setProfile(newProfile);
            setLang(newProfile.lang || 'bn');
            setShowOnboarding(false);
            // After first onboarding, prompt for today's plan
            if (isInitial) {
              setTimeout(() => setIsDailyPlanOpen(true), 500);
            }
          }} 
        />
      )}

      {/* Daily Plan Popup (Requirement D) */}
      <DailyPlanModal
        isOpen={isDailyPlanOpen}
        onClose={handleCloseDailyPlan}
        onApplyPlan={handleApplyDailyPlan}
        lang={lang}
        initialPlan={dailyPlan}
      />

      {/* Add Food Modal */}
      <AddFoodModal 
        isOpen={isAddFoodOpen}
        onClose={() => setIsAddFoodOpen(false)}
        onAddFood={handleAddFood}
        lang={lang}
      />

      {/* Log Exercise Modal */}
      <LogExerciseModal 
        isOpen={isExerciseOpen}
        onClose={() => setIsExerciseOpen(false)}
        onLogExercise={handleLogExercise}
        lang={lang}
      />

      {/* Sticky Header */}
      <Header 
        profile={profile}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lang={lang}
        setLang={setLang}
        onTriggerReset={() => { setTimeLeft(120); setShowResetCountdown(true); }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isNotifActive={isNotifActive}
        onToggleNotification={handleToggleNotification}
        onOpenDailyPlan={() => setIsDailyPlanOpen(true)}
        onToggleLeo={() => setShowLeoBanner(prev => !prev)}
        onEditProfile={() => setShowOnboarding(true)}
      />

      {/* Main Container - Smooth Mobile Responsive Layout (Fixes Quote Section Visibility) */}
      <main className="flex-1 w-full max-w-md mx-auto flex flex-col min-h-0 overflow-y-auto px-4 sm:px-6 pt-2 pb-6">
        {/* Leo 3-5 Second Smart Situational Entrance Scene */}
        {showLeoBanner && (
          <div className="mb-3 shrink-0">
            <LeoEntranceBanner
              isOpen={showLeoBanner}
              darkMode={darkMode}
              lang={lang}
              scene={getLeoCurrentScene({
                consumedCalories,
                targetCalories,
                foodsCount: foods.length,
                exercisesCount: exercises.length,
                lang,
                lastWorkoutTimestamp: exercises[0]?.timestamp || null
              })}
              onDismiss={() => {
                setShowLeoBanner(false);
              }}
              onAction={(actionType) => {
                if (actionType === 'add_food') setIsAddFoodOpen(true);
                else if (actionType === 'exercise') setIsExerciseOpen(true);
                else if (actionType === 'plan') setIsDailyPlanOpen(true);
              }}
            />
          </div>
        )}
        
        {/* Tab 1: Dashboard */}
        {activeTab === 'journey' && (
          <div className="flex-1 flex flex-col justify-between gap-1 animate-in fade-in duration-200">
            
            {/* Top: Calorie Gauge */}
            <div className="flex flex-col items-center justify-center py-1 shrink-0">
              <CalorieGauge consumed={consumedCalories} target={targetCalories} lang={lang} />
            </div>

            {/* Middle: Guaranteed Visible Smart Suggestions & Motivational Card (Requirement C & E) */}
            <MotivationalQuote 
              lang={lang} 
              consumed={consumedCalories}
              target={targetCalories}
              foods={foods}
              dailyPlan={dailyPlan}
              onOpenDailyPlan={() => setIsDailyPlanOpen(true)}
            />

            {/* Bottom: Action Buttons & Status Dock */}
            <div className="space-y-3 w-full shrink-0 pb-1">
              <div className="grid grid-cols-2 gap-3 w-full">
                <button 
                  type="button"
                  onClick={() => setIsAddFoodOpen(true)}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brandOrange via-orange-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{txt.addFood}</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setIsExerciseOpen(true)}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-white/5 dark:bg-darkCard/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 font-semibold text-sm shadow-sm active:scale-95 transition-all"
                >
                  <Dumbbell className="w-4 h-4 text-teal-400" />
                  <span>{txt.logExercise}</span>
                </button>
              </div>

              {/* Status Dock */}
              <div className="w-full grid grid-cols-3 divide-x divide-slate-200/70 dark:divide-slate-800/80 bg-white/60 dark:bg-darkCard/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl py-3 px-2 shadow-sm backdrop-blur-md text-center text-xs">
                <button
                  type="button"
                  onClick={() => setShowOnboarding(true)}
                  className="hover:bg-orange-500/10 rounded-xl transition text-center px-1 group cursor-pointer"
                  title={lang === 'bn' ? 'টার্গেট ওজন ও প্রোফাইল পরিবর্তন করুন' : 'Click to edit target weight'}
                >
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider flex items-center justify-center gap-1">
                    <span>{txt.goal}</span>
                    <span className="text-[9px] text-brandOrange opacity-75 group-hover:opacity-100 transition">✏️</span>
                  </span>
                  <p className="font-extrabold text-slate-900 dark:text-white mt-0.5 group-hover:text-brandOrange transition">
                    {profile ? `${profile.currentWeight} ➔ ${profile.targetWeight} kg` : '--'}
                  </p>
                </button>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{txt.burned}</span>
                  <p className="font-extrabold text-teal-500 dark:text-teal-400 mt-0.5">-{burnedCalories} kcal</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{txt.mealsLogged}</span>
                  <p className="font-extrabold text-brandOrange mt-0.5">{foods.length} {txt.items}</p>
                </div>
              </div>

            </div>

          </div>
        )}

        {/* Tab 2: Calorie Target */}
        {activeTab === 'target' && profile && (
          <div className="flex-1 overflow-y-auto pr-1">
            <DailyCalorieView 
              profile={profile}
              foods={foods}
              onDeleteFood={handleDeleteFood}
              onOpenAddFood={() => setIsAddFoodOpen(true)}
              lang={lang}
            />
          </div>
        )}

        {/* Tab 3: Calendar */}
        {activeTab === 'analytics' && (
          <div className="flex-1 overflow-y-auto pr-1">
            <GlobalCalendarView 
              profile={profile}
              lang={lang}
            />
          </div>
        )}

      </main>
    </div>
  );
}