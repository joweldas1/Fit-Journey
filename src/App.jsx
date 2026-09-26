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

      {/* STICKY TOP HEADER */}
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

      {/* FULL SCREEN EDGE-TO-EDGE VIEW CONTAINER */}
      <main className="w-full max-w-md mx-auto min-h-[calc(100vh-65px)] flex flex-col justify-between px-4 sm:px-6 pt-4 pb-6">
        
        {/* Tab 1: Journey Dashboard (No Enclosing Box / Pure Edge-to-Edge) */}
        {activeTab === 'journey' && (
          <div className="flex-1 flex flex-col justify-between py-2 animate-in fade-in duration-300">
            
            {/* 1. SEAMLESS AMBIENT GAUGE (সরাসরি ব্যাকগ্রাউন্ডের ওপর ওপেন ভিউ) */}
            <div className="flex-1 flex flex-col items-center justify-center py-6">
              <CalorieGauge consumed={consumedCalories} target={targetCalories} lang={lang} />
            </div>

            {/* 2. BOTTOM CONTROLS: ACTION BUTTONS + STATUS DOCK */}
            <div className="space-y-4 w-full">
              
              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3.5 w-full">
                <button 
                  type="button"
                  onClick={() => setIsAddFoodOpen(true)}
                  className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-gradient-to-r from-brandOrange via-orange-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-orange-500/25 active:scale-95 transition-all"
                >
                  <Plus className="w-4 h-4 stroke-[3]" />
                  <span>{txt.addFood}</span>
                </button>
                
                <button 
                  type="button"
                  onClick={() => setIsExerciseOpen(true)}
                  className="flex items-center justify-center gap-2 py-4 px-4 rounded-2xl bg-white/5 dark:bg-darkCard/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200/80 dark:border-slate-800 font-semibold text-sm shadow-sm active:scale-95 transition-all"
                >
                  <Dumbbell className="w-4 h-4 text-teal-400" />
                  <span>{txt.logExercise}</span>
                </button>
              </div>

              {/* Bottom Native Status Dock */}
              <div className="w-full grid grid-cols-3 divide-x divide-slate-200/70 dark:divide-slate-800/80 bg-white/60 dark:bg-darkCard/80 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl py-3.5 px-2 shadow-sm backdrop-blur-md text-center text-xs">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{txt.goal}</span>
                  <p className="font-extrabold text-slate-900 dark:text-white mt-1">{profile ? `${profile.currentWeight} ➔ ${profile.targetWeight} kg` : '--'}</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{txt.burned}</span>
                  <p className="font-extrabold text-teal-500 dark:text-teal-400 mt-1">-{burnedCalories} kcal</p>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">{txt.mealsLogged}</span>
                  <p className="font-extrabold text-brandOrange mt-1">{foods.length} {txt.items}</p>
                </div>
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

      </main>
    </div>
  );
}