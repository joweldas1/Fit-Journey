import { useState } from 'react';
import { 
  Menu, 
  X, 
  RotateCcw, 
  Sun, 
  Moon, 
  Globe, 
  Flame, 
  Compass, 
  Target, 
  ChevronRight,
  TrendingUp,
  Sparkles
} from 'lucide-react';
import { t } from '../utils/translations';

export default function Header({ 
  profile, 
  darkMode, 
  setDarkMode, 
  lang, 
  setLang, 
  onTriggerReset,
  activeTab,
  setActiveTab
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const txt = t[lang] || t.bn;

  const handleNavClick = (tab) => {
    setActiveTab(tab);
    setMenuOpen(false);
  };

  return (
    <>
      {/* Sleek Compact Sticky Navbar */}
      <header className="sticky top-0 z-40 w-full bg-slate-900/60 dark:bg-[#0B1120]/75 backdrop-blur-md border-b border-slate-200/20 dark:border-slate-800/60 transition-colors">
        <div className="max-w-md mx-auto px-4 py-2.5 flex items-center justify-between">
          
          {/* Left: Clean Brand Title & Daily Target */}
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-[15px] font-bold tracking-tight text-slate-900 dark:text-white leading-tight">
                {txt.appTitle}
              </h1>
              
              {/* Streak Badge */}
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-orange-500/10 border border-orange-500/20 text-brandOrange text-[10px] font-semibold">
                <Flame className="w-2.5 h-2.5 fill-brandOrange text-brandOrange" />
                <span>1</span>
              </span>
            </div>

            <p className="text-[10px] sm:text-[11px] font-medium text-slate-400 mt-0.5 flex items-center gap-1">
              <span>{txt.dailyTarget}:</span>
              <span className="font-bold text-brandOrange">
                {profile?.dailyCalorieTarget || 2897}
              </span>
              <span>{txt.kcalPerDay}</span>
            </p>
          </div>

          {/* Right: Controls (Language -> Color/Theme -> Hamburger Menu) */}
          <div className="flex items-center gap-1.5">
            {/* 1. Language Switcher */}
            <button 
              type="button"
              onClick={() => {
                const next = lang === 'bn' ? 'en' : 'bn';
                setLang(next);
                if (profile) {
                  localStorage.setItem('fit_profile', JSON.stringify({ ...profile, lang: next }));
                }
              }}
              title="Switch Language"
              className="h-8 px-2.5 flex items-center gap-1 rounded-lg bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/40 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 text-[11px] font-semibold hover:border-brandOrange/40 active:scale-95 transition"
            >
              <Globe className="w-3 h-3 text-brandOrange" />
              <span>{lang === 'bn' ? 'বাংলা' : 'EN'}</span>
            </button>

            {/* 2. Theme / Color Change Toggle */}
            <button 
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              title="Switch Theme"
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/40 dark:border-slate-700/50 text-amber-500 dark:text-amber-400 hover:border-amber-400/40 active:scale-95 transition"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
            </button>

            {/* 3. Hamburger Menu Button (Positioned after Color Change) */}
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="w-8 h-8 flex items-center justify-center rounded-lg bg-slate-200/50 dark:bg-slate-800/50 border border-slate-300/40 dark:border-slate-700/50 text-slate-700 dark:text-slate-300 hover:border-brandOrange/40 active:scale-95 transition"
              aria-label="Open Menu"
            >
              <Menu className="w-4 h-4" />
            </button>
          </div>

        </div>
      </header>

      {/* Slide-over Side Drawer Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex animate-in fade-in duration-200">
          <div 
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-72 max-w-[82%] bg-white dark:bg-[#111827] h-full shadow-2xl p-5 flex flex-col justify-between border-r border-slate-200 dark:border-slate-800 animate-in slide-in-from-left duration-300 z-10">
            <div>
              {/* Drawer Top Header */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800/80 mb-5">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-gradient-to-tr from-brandOrange to-amber-500 text-white shadow-md shadow-orange-500/20">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="text-sm font-bold text-slate-900 dark:text-white block">
                      {txt.appTitle}
                    </span>
                    <span className="text-[10px] text-slate-400 font-medium">Navigation Menu</span>
                  </div>
                </div>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Tabs */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleNavClick('journey')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'journey'
                      ? 'bg-orange-500/10 text-brandOrange border border-orange-500/25 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Compass className="w-4 h-4" />
                    <span>{txt.journeyTab}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('target')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'target'
                      ? 'bg-orange-500/10 text-brandOrange border border-orange-500/25 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Target className="w-4 h-4" />
                    <span>{txt.targetTab}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('analytics')}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-xs font-semibold transition-all ${
                    activeTab === 'analytics'
                      ? 'bg-orange-500/10 text-brandOrange border border-orange-500/25 shadow-sm'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <TrendingUp className="w-4 h-4" />
                    <span>{txt.analyticsTab}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>

              {/* Reset Action */}
              <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/80">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onTriggerReset();
                  }}
                  className="w-full flex items-center gap-2.5 p-3 rounded-xl text-xs font-semibold text-rose-500 bg-rose-500/10 border border-rose-500/20 active:scale-95 transition hover:bg-rose-500/15"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{txt.resetBtn}</span>
                </button>
              </div>
            </div>

            {/* Drawer Bottom Weight Tag */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800/80 text-[11px] font-medium text-slate-400 flex items-center justify-between">
              <span>Goal Journey</span>
              <span className="text-slate-600 dark:text-slate-300 font-bold">
                {profile ? `${profile.currentWeight} ➔ ${profile.targetWeight} kg` : 'Active'}
              </span>
            </div>
          </div>
        </div>
      )}
    </>
  );
}