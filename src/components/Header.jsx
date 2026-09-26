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
  TrendingUp
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
      {/* Sticky Header with Backdrop Blur */}
      <header className="sticky top-0 z-40 w-full bg-white/85 dark:bg-[#0B1120]/85 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 py-3 transition-colors">
        <div className="max-w-md mx-auto flex items-center justify-between">
          
          {/* Left: Hamburger & App Title */}
          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-darkCard border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-sm active:scale-95 transition"
              aria-label="Open Menu"
            >
              <Menu className="w-4 h-4" />
            </button>

            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                  {txt.appTitle}
                </h1>
                <span className="inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-orange-500/10 text-brandOrange border border-orange-500/20 text-[10px] font-semibold">
                  <Flame className="w-3 h-3 fill-brandOrange" />
                  <span>1</span>
                </span>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400">
                {profile ? `${txt.dailyTarget}: ${profile.dailyCalorieTarget} ${txt.kcalPerDay}` : 'Loading...'}
              </p>
            </div>
          </div>

          {/* Right: Language & Theme Toggles */}
          <div className="flex items-center gap-1.5">
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
              className="flex items-center gap-1 px-3 py-2 rounded-2xl bg-slate-100 dark:bg-darkCard border border-slate-200/80 dark:border-slate-800 text-slate-700 dark:text-slate-200 text-xs font-semibold active:scale-95 transition shadow-sm"
            >
              <Globe className="w-3.5 h-3.5 text-brandOrange" />
              <span>{lang === 'bn' ? 'বাংলা' : 'EN'}</span>
            </button>

            <button 
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              title="Switch Mode"
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-darkCard border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-amber-400 active:scale-95 transition shadow-sm"
            >
              {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </header>

      {/* Slide-over Side Drawer Menu */}
      {menuOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div 
            onClick={() => setMenuOpen(false)}
            className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm transition-opacity"
          />

          <div className="relative w-72 max-w-[80%] bg-white dark:bg-[#131B2E] h-full shadow-2xl p-5 flex flex-col justify-between border-r border-slate-200/70 dark:border-slate-800 animate-in slide-in-from-left duration-300 z-10">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800 mb-4">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-xl bg-gradient-to-tr from-brandOrange to-amber-500 text-white">
                    <Flame className="w-5 h-5 fill-white" />
                  </div>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">Fitness Navigation</span>
                </div>
                <button 
                  onClick={() => setMenuOpen(false)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Navigation Items with Language Sync */}
              <div className="space-y-1.5">
                <button
                  type="button"
                  onClick={() => handleNavClick('journey')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-medium transition ${
                    activeTab === 'journey'
                      ? 'bg-orange-500/10 text-brandOrange border border-orange-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Compass className="w-4 h-4" />
                    <span>{txt.journeyTab}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('target')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-medium transition ${
                    activeTab === 'target'
                      ? 'bg-orange-500/10 text-brandOrange border border-orange-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Target className="w-4 h-4" />
                    <span>{txt.targetTab}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>

                <button
                  type="button"
                  onClick={() => handleNavClick('analytics')}
                  className={`w-full flex items-center justify-between p-3 rounded-2xl text-xs font-medium transition ${
                    activeTab === 'analytics'
                      ? 'bg-orange-500/10 text-brandOrange border border-orange-500/20'
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <TrendingUp className="w-4 h-4" />
                    <span>{txt.analyticsTab}</span>
                  </div>
                  <ChevronRight className="w-3.5 h-3.5 opacity-60" />
                </button>
              </div>

              {/* Recalculate / Reset Action */}
              <div className="mt-8 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false);
                    onTriggerReset();
                  }}
                  className="w-full flex items-center gap-2.5 p-3 rounded-2xl text-xs font-medium text-rose-500 bg-rose-500/10 border border-rose-500/20 active:scale-95 transition hover:bg-rose-500/15"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>{txt.resetBtn}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400">
              <p>{profile ? `${profile.currentWeight} kg ➔ ${profile.targetWeight} kg` : 'Fit Journey'}</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}