import { useState } from 'react';
import { 
  Flame, 
  Globe, 
  Moon, 
  Sun, 
  Menu, 
  X, 
  Compass, 
  Target, 
  CalendarDays, 
  RotateCcw,
  Bell,
  BellRing,
  Sparkles,
  CalendarCheck
} from 'lucide-react';

export default function Header({
  profile,
  darkMode,
  setDarkMode,
  lang,
  setLang,
  onTriggerReset,
  activeTab,
  setActiveTab,
  isNotifActive,
  onToggleNotification,
  onOpenDailyPlan,
  onToggleLeo,
  onEditProfile
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const targetCal = profile?.dailyCalorieTarget || 2897;
  const isBn = lang === 'bn';

  const navItems = [
    { 
      id: 'journey', 
      label: 'Fit Journey', 
      icon: Compass 
    },
    { 
      id: 'target', 
      label: isBn ? 'ডেইলি ক্যালোরি টার্গেট' : 'Daily Calorie Target', 
      icon: Target 
    },
    { 
      id: 'analytics', 
      label: isBn ? 'ওজন ট্র্যাকিং ক্যালেন্ডার' : 'Weight & Progress Log', 
      icon: CalendarDays 
    },
  ];

  const handleNavClick = (tabId) => {
    setActiveTab(tabId);
    setIsDrawerOpen(false);
  };

  return (
    <>
      {/* 1. Clean Sticky Header (No Unnecessary Bell on Top) */}
      <header className="sticky top-0 z-40 w-full h-[66px] shrink-0 bg-white/95 dark:bg-[#09090B]/95 backdrop-blur-xl border-b border-slate-200/80 dark:border-[#27272A] px-4 sm:px-6 transition-colors duration-300">
        <div className="max-w-md mx-auto h-full flex items-center justify-between gap-2">
          
          {/* Brand Logo with Glowing Leo & Fit Journey Typography */}
          <div className="flex-1 min-w-0 flex items-center gap-2">
            {/* Leo Mascot Icon with Neon Glow (Prominent Size & Transparent) */}
            <button
              type="button"
              onClick={onToggleLeo}
              title="Leo Assistant"
              className="relative group shrink-0 focus:outline-none"
            >
              <div className="w-12 h-12 sm:w-14 sm:h-14 flex items-center justify-center transition-all duration-200 group-hover:scale-105 active:scale-95 filter drop-shadow-[0_0_14px_rgba(249,115,22,0.5)]">
                <img 
                  src="/leo.svg" 
                  alt="Leo Mascot" 
                  className="w-full h-full object-contain" 
                />
              </div>
            </button>

            {/* Glowing Brand Typography & Target */}
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-base sm:text-lg font-black tracking-wider leading-none flex items-center">
                  <span className="text-slate-900 dark:text-white">Fit</span>
                  <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(249,115,22,0.45)] ml-2.5">
                    Journey
                  </span>
                </h1>
                
                <div className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-orange-500/10 border border-orange-500/25 text-brandOrange shrink-0 ml-1">
                  <Flame className="w-2.5 h-2.5 fill-brandOrange text-brandOrange animate-pulse" />
                  <span className="text-[10px] font-black leading-none">1</span>
                </div>
              </div>

              <p className="text-[10.5px] font-semibold text-slate-500 dark:text-slate-400 mt-1.5 truncate flex items-center gap-1.5 leading-none">
                <span>{isBn ? 'ডেইলি টার্গেট:' : 'Daily Target:'}</span>
                <span className="font-black text-brandOrange text-[11px] tracking-tight">
                  {targetCal}
                </span>
                <span>{isBn ? 'ক্যালোরি' : 'kcal'}</span>
              </p>
            </div>
          </div>

          {/* Right Action Controls: শুধু দরকারি ৩টি বাটন */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Leo Interactive Assistant Button */}
            <button
              type="button"
              onClick={onToggleLeo}
              className="relative p-1.5 rounded-xl bg-orange-500/10 dark:bg-orange-500/15 border border-orange-500/30 hover:border-brandOrange text-brandOrange active:scale-95 transition flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Leo"
            >
              <div className="w-6 h-6 sm:w-7 sm:h-7 shrink-0 flex items-center justify-center">
                <img src="/leo.svg" alt="Leo" className="w-full h-full object-contain" />
              </div>
              <span className="text-[11px] font-extrabold pr-0.5 hidden xs:inline">Leo</span>
            </button>

            {/* Language Switcher */}
            <button
              type="button"
              onClick={() => setLang(lang === 'bn' ? 'en' : 'bn')}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition"
              title="Change Language"
            >
              <Globe className="w-3.5 h-3.5 text-brandOrange" />
              <span>{isBn ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* Dark / Light Mode */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-600 dark:text-amber-400 border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition"
              title="Toggle Theme"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Menu Drawer Hamburger */}
            <button
              type="button"
              onClick={() => setIsDrawerOpen(true)}
              className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 active:scale-95 transition"
              title="Open Menu"
            >
              <Menu className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>

        </div>
      </header>

      {/* 2. Backdrop */}
      <div 
        onClick={() => setIsDrawerOpen(false)}
        className={`fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ease-in-out ${
          isDrawerOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* 3. Smooth Slide Drawer */}
      <aside 
        className={`fixed top-0 right-0 z-50 w-72 sm:w-80 h-full bg-white dark:bg-[#161F33] p-5 shadow-2xl flex flex-col justify-between border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-out will-change-transform ${
          isDrawerOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div>
          {/* Drawer Top Header */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-brandOrange/15 flex items-center justify-center text-brandOrange">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-sm font-black text-slate-900 dark:text-white">
                  {isBn ? 'ফিটনেস কন্ট্রোল' : 'Fitness Control'}
                </h3>
                <p className="text-[10px] text-slate-400 font-medium">
                  {profile?.name ? `${profile.name}` : (isBn ? 'ইউজার প্যানেল' : 'User Panel')}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 active:scale-95 transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Navigation Links */}
          <div className="mt-4 space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleNavClick(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-left ${
                    isActive
                      ? 'bg-orange-500/10 text-brandOrange border border-orange-500/25 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? 'text-brandOrange' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </button>
              );
            })}

            {/* Daily Plan Trigger */}
            {onOpenDailyPlan && (
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  onOpenDailyPlan();
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <CalendarCheck className="w-4 h-4 text-brandOrange" />
                  <span>{isBn ? 'দৈনিক ক্যালোরি পরিকল্পনা (AI)' : "Daily Meal Plan (AI)"}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-brandOrange border border-orange-500/20">
                  New
                </span>
              </button>
            )}

            {/* Edit Target Weight & Profile Trigger */}
            {onEditProfile && (
              <button
                type="button"
                onClick={() => {
                  setIsDrawerOpen(false);
                  onEditProfile();
                }}
                className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-[0.98]"
              >
                <div className="flex items-center gap-3">
                  <Target className="w-4 h-4 text-brandOrange" />
                  <span>{isBn ? 'টার্গেট ওজন ও প্রোফাইল পরিবর্তন' : 'Edit Target Weight & Profile'}</span>
                </div>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-orange-500/10 text-brandOrange border border-orange-500/20">
                  {profile?.targetWeight ? `${profile.targetWeight} kg` : 'Set'}
                </span>
              </button>
            )}

            {/* Notification Setting Row (সহজ, সুন্দর ১ লাইনের নরমাল মেনু আইটেম) */}
            <button
              type="button"
              onClick={onToggleNotification}
              className="w-full flex items-center justify-between px-3.5 py-3 rounded-2xl text-xs font-bold transition-all text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60 active:scale-[0.98]"
            >
              <div className="flex items-center gap-3">
                {isNotifActive ? (
                  <BellRing className="w-4 h-4 text-emerald-500 animate-pulse" />
                ) : (
                  <Bell className="w-4 h-4 text-slate-400" />
                )}
                <span>{isBn ? 'স্মার্ট নোটিফিকেশন' : 'Notifications'}</span>
              </div>

              {/* Minimal Clean Status Pill */}
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                isNotifActive
                  ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
              }`}>
                {isNotifActive ? (isBn ? 'চালু' : 'ON') : (isBn ? 'বন্ধ' : 'OFF')}
              </span>
            </button>
          </div>
        </div>

        {/* Reset Section */}
        <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
          <button
            type="button"
            onClick={() => {
              setIsDrawerOpen(false);
              onTriggerReset();
            }}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl border border-rose-500/20 bg-rose-500/10 hover:bg-rose-500/15 text-rose-500 text-xs font-bold active:scale-95 transition"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>{isBn ? 'রিসেট / রি-ক্যালকুলেট করুন' : 'Reset / Recalculate'}</span>
          </button>
        </div>
      </aside>
    </>
  );
}