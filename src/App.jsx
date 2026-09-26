import { useState, useEffect } from 'react';
import { Toaster, toast } from 'sonner';
import { Dumbbell, AlertTriangle, Timer, Plus } from 'lucide-react';
import Header from './components/Header';
import OnboardingModal from './components/OnboardingModal';
import CalorieGauge from './components/CalorieGauge';
import AddFoodModal from './components/AddFoodModal';
import LogExerciseModal from './components/LogExerciseModal';
import DailyCalorieView from './components/DailyCalorieView';
import GlobalCalendarView from './components/GlobalCalendarView';
import { t } from './utils/translations';

export default function App() {
  const [darkMode, setDarkMode] = useState(true);
  const [profile, setProfile] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [lang, setLang] = useState('bn');
  const [activeTab, setActiveTab] = useState('journey');

  const [isAddFoodOpen, setIsAddFoodOpen] = useState(false);
  const [isExerciseOpen, setIsExerciseOpen] = useState(false);

  const todayKey = new Date().toISOString().split('T')[0];
  const [foods, setFoods] = useState(() => {
    const saved = localStorage.getItem(`fit_foods_${todayKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [exercises, setExercises] = useState(() => {
    const saved = localStorage.getItem(`fit_exercises_${todayKey}`);
    return saved ? JSON.parse(saved) : [];
  });

  const [showResetCountdown, setShowResetCountdown] = useState(false);
  const [timeLeft, setTimeLeft] = useState(120);

  useEffect(() => {
    const saved = localStorage.getItem('fit_profile');
    if (saved) {
      const data = JSON.parse(saved);
      setProfile(data);
      if (data.lang) setLang(data.lang);
    } else {
      setShowOnboarding(true);
    }
  }, []);

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
    setFoods((prev) => [{ ...foodItem, id: Date.now() }, ...prev]);
  };

  const handleDeleteFood = (id) => {
    setFoods((prev) => prev.filter(f => f.id !== id));
    toast.info(lang === 'bn' ? 'খাবারটি মুছে ফেলা হয়েছে' : 'Food item removed');
  };

  const handleLogExercise = (workoutItem) => {
    setExercises((prev) => [{ ...workoutItem, id: Date.now() }, ...prev]);
  };

  const executeReset = () => {
    setShowResetCountdown(false);
    localStorage.clear();
    setProfile(null);
    setFoods([]);
    setExercises([]);
    setShowOnboarding(true);
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const txt = t[lang] || t.bn;

  const targetCalories = profile?.dailyCalorieTarget || 2400;
  const consumedCalories = foods.reduce((acc, f) => acc + (f.calories || 0), 0);
  const burnedCalories = exercises.reduce((acc, e) => acc + (e.caloriesBurned || 0), 0);

  return (
    <div className={`min-h-screen w-full transition-colors duration-300 ${darkMode ? 'bg-darkBg text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
      
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

      {/* Onboarding Modal */}
      {showOnboarding && (
        <OnboardingModal 
          darkMode={darkMode}
          setDarkMode={setDarkMode}
          initialLang={lang}
          onComplete={(newProfile) => {
            setProfile(newProfile);
            setLang(newProfile.lang || 'bn');
            setShowOnboarding(false);
          }} 
        />
      )}

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

      {/* 1. STICKY HEADER (Full width at top) */}
      <Header 
        profile={profile}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        lang={lang}
        setLang={setLang}
        onTriggerReset={() => { setTimeLeft(120); setShowResetCountdown(true); }}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* 2. FULL SCREEN EDGE-TO-EDGE MOBILE VIEW CONTAINER */}
      <main className="w-full max-w-md mx-auto min-h-[calc(100vh-65px)] flex flex-col justify-between px-4 sm:px-5 pb-6 pt-3">
        
        {/* Tab 1: Journey Dashboard */}
        {activeTab === 'journey' && (
          <div className="space-y-4 my-auto animate-in fade-in duration-300">
            
            {/* Calorie Gauge Card */}
            <div className="bg-white dark:bg-darkCard p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm">
              <CalorieGauge consumed={consumedCalories} target={targetCalories} lang={lang} />

              {/* Action Buttons: Fixed + + Double Plus & Added Orange-Amber Gradient */}
              <div className="grid grid-cols-2 gap-3 mt-6">
                <button 
                  type="button"
                  onClick={() => setIsAddFoodOpen(true)}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-brandOrange via-orange-500 to-amber-500 hover:opacity-95 text-white font-semibold text-xs shadow-lg shadow-orange-500/25 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  <span>{txt.addFood}</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setIsExerciseOpen(true)}
                  className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl bg-slate-100 dark:bg-darkSurface hover:bg-slate-200 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 font-semibold text-xs active:scale-95 transition-all"
                >
                  <Dumbbell className="w-4 h-4 text-teal-500" />
                  <span>{txt.logExercise}</span>
                </button>
              </div>
            </div>

            {/* Quick Summary Dock Bar with 100% Language Sync */}
            <div className="bg-white dark:bg-darkCard p-4 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex justify-around text-center text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">{txt.goal}</span>
                <p className="font-bold text-slate-900 dark:text-white mt-0.5">{profile ? `${profile.currentWeight} ➔ ${profile.targetWeight} kg` : '--'}</p>
              </div>
              <div className="border-l border-slate-100 dark:border-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">{txt.burned}</span>
                <p className="font-bold text-teal-500 mt-0.5">-{burnedCalories} kcal</p>
              </div>
              <div className="border-l border-slate-100 dark:border-slate-800" />
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold">{txt.mealsLogged}</span>
                <p className="font-bold text-brandOrange mt-0.5">{foods.length} {txt.items}</p>
              </div>
            </div>

          </div>
        )}

        {/* Tab 2: Daily Calorie Target Tab */}
        {activeTab === 'target' && profile && (
          <DailyCalorieView 
            profile={profile}
            foods={foods}
            onDeleteFood={handleDeleteFood}
            onOpenAddFood={() => setIsAddFoodOpen(true)}
            lang={lang}
          />
        )}

        {/* Tab 3: Global Calendar & Weight Analytics Tab */}
        {activeTab === 'analytics' && (
          <GlobalCalendarView 
            profile={profile}
            lang={lang}
          />
        )}

        <div className="h-2" />
      </main>
    </div>
  );
}