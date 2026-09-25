import { useState } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  Target, 
  User, 
  Globe, 
  Moon, 
  Sun,
  ChevronDown,
  Activity
} from 'lucide-react';
import { calculateFitnessTarget } from '../utils/calculator';
import { validateStep1, validateStep2 } from '../utils/validation';
import { t } from '../utils/translations';

export default function OnboardingModal({ onComplete, darkMode, setDarkMode, initialLang = 'bn' }) {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState(initialLang);
  const txt = t[lang];

  const [formData, setFormData] = useState({
    age: '27',
    gender: 'male',
    heightFeet: '5',
    heightInches: '7',
    currentWeight: '49',
    targetWeight: '60',
    durationMonths: '3',
  });

  const [calculatedPlan, setCalculatedPlan] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleStep1Submit = () => {
    const check = validateStep1(formData, lang);
    if (!check.valid) {
      toast.error(txt[check.msgKey]);
      return;
    }
    setStep(2);
  };

  const handleCalculate = (e) => {
    e.preventDefault();
    const check = validateStep2(formData, lang);
    if (!check.valid) {
      toast.warning(txt[check.msgKey]);
      return;
    }

    const totalInches = (Number(formData.heightFeet) * 12) + Number(formData.heightInches);
    const heightCm = Math.round(totalInches * 2.54);
    const plan = calculateFitnessTarget({ ...formData, heightCm });

    setCalculatedPlan({ ...plan, heightCm });
    setStep(3);

    toast.success(txt.successMsg);
    try {
      confetti({ 
        particleCount: 65, 
        spread: 70, 
        origin: { y: 0.65 },
        colors: ['#FF6B4A', '#0D7C66', '#38BDF8', '#FBBF24']
      });
    } catch {}
  };

  const handleFinish = () => {
    const profile = {
      ...formData,
      ...calculatedPlan,
      lang,
      isOnboarded: true,
      createdAt: new Date().toISOString()
    };
    localStorage.setItem('fit_profile', JSON.stringify(profile));
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md transition-all duration-300">
      
      {/* Container Card */}
      <div className="w-full max-w-md bg-white dark:bg-[#151D2E] rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 relative overflow-hidden transition-all duration-300 ease-out">
        
        {/* Subtle Ambient Glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-brandOrange/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Top Control Bar */}
        <div className="flex justify-between items-center mb-6 pb-3 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
          <button 
            type="button"
            onClick={() => setLang(prev => prev === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-medium transition active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700"
          >
            <Globe className="w-3.5 h-3.5 text-brandOrange" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <button 
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-amber-400 transition active:scale-95 border border-slate-200/60 dark:border-slate-700"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Top Progress Steps (Steps 1, 2, 3) */}
        {step > 0 && (
          <div className="flex items-center justify-between mb-6 px-1 relative z-10">
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-1.5 rounded-full transition-all duration-500 ease-out ${
                    step === i 
                      ? 'w-7 bg-brandOrange' 
                      : step > i 
                        ? 'w-3 bg-teal-500' 
                        : 'w-3 bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <span className="text-[11px] font-medium text-slate-400 tracking-wide">
              {txt.step} {step} {txt.of} 3
            </span>
          </div>
        )}

        {/* STEP 0: Entrance Screen */}
        {step === 0 && (
          <div className="text-center py-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 ease-out">
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-brandOrange text-[11px] font-medium tracking-wide">
              <Sparkles className="w-3 h-3" />
              <span>{txt.welcomeBadge}</span>
            </div>

            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brandOrange to-amber-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
                <Flame className="w-10 h-10 fill-white/90" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-semibold tracking-tight text-slate-900 dark:text-white mb-2 leading-snug">
              {txt.welcomeTitle}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
              {txt.welcomeSub}
            </p>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 active:scale-[0.98] transition-all duration-200"
            >
              <span>{txt.getStarted}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1: Body Metrics */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300 ease-out">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-orange-500/10 text-brandOrange border border-orange-500/20">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold">{txt.step1Title}</h2>
            </div>
            <p className="text-xs text-slate-400 mb-5 pl-9">{txt.step1Sub}</p>

            <div className="space-y-4">
              {/* Age */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1.5">{txt.age}</label>
                <input
                  type="number"
                  name="age"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:border-brandOrange dark:focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/20 text-sm font-medium focus:outline-none transition"
                  placeholder="27"
                />
              </div>

              {/* Height */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1.5">{txt.height}</label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-slate-700 px-3.5 focus-within:border-brandOrange focus-within:ring-2 focus-within:ring-brandOrange/20 transition">
                    <input 
                      type="number" 
                      name="heightFeet" 
                      value={formData.heightFeet} 
                      onChange={handleChange} 
                      className="w-full py-3 bg-transparent text-sm font-medium focus:outline-none" 
                    />
                    <span className="text-xs text-slate-400 font-normal ml-1">{txt.feet}</span>
                  </div>
                  <div className="flex items-center bg-slate-50/70 dark:bg-slate-900/60 rounded-2xl border border-slate-300 dark:border-slate-700 px-3.5 focus-within:border-brandOrange focus-within:ring-2 focus-within:ring-brandOrange/20 transition">
                    <input 
                      type="number" 
                      name="heightInches" 
                      value={formData.heightInches} 
                      onChange={handleChange} 
                      className="w-full py-3 bg-transparent text-sm font-medium focus:outline-none" 
                    />
                    <span className="text-xs text-slate-400 font-normal ml-1">{txt.inch}</span>
                  </div>
                </div>
              </div>

              {/* Weight */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1.5">{txt.currentWeight}</label>
                <input
                  type="number"
                  step="0.1"
                  name="currentWeight"
                  value={formData.currentWeight}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:border-brandOrange dark:focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/20 text-sm font-medium focus:outline-none transition"
                  placeholder="49"
                />
              </div>
            </div>

          <button
  type="button"
  onClick={handleStep1Submit}
  className="w-full mt-7 py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brandOrange via-orange-500 to-amber-500 hover:opacity-95 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all duration-200"
>
  <span>{txt.next}</span>
  <ArrowRight className="w-4 h-4" />
</button>
          </div>
        )}

        {/* STEP 2: Goal Target */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300 ease-out">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                <Target className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-semibold">{txt.step2Title}</h2>
            </div>
            <p className="text-xs text-slate-400 mb-5 pl-9">{txt.step2Sub}</p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1.5">{txt.targetWeight}</label>
                <input
                  type="number"
                  step="0.5"
                  name="targetWeight"
                  value={formData.targetWeight}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/20 text-sm font-medium focus:outline-none transition"
                  placeholder="60"
                />
              </div>

              {/* Styled Dropdown Selector */}
              <div>
                <label className="text-xs font-medium text-slate-600 dark:text-slate-300 block mb-1.5">{txt.duration}</label>
                <div className="relative">
                  <select
                    name="durationMonths"
                    value={formData.durationMonths}
                    onChange={handleChange}
                    className="w-full px-4 py-3 rounded-2xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:border-brandOrange focus:ring-2 focus:ring-brandOrange/20 text-sm font-medium text-slate-800 dark:text-slate-200 focus:outline-none appearance-none transition pr-10 cursor-pointer"
                  >
                    <option value="2">{txt.months2}</option>
                    <option value="3">{txt.months3}</option>
                    <option value="4">{txt.months4}</option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Tip Box */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800/80 text-xs text-slate-500 dark:text-slate-400 leading-relaxed flex items-start gap-2">
                <span className="text-brandOrange mt-0.5">💡</span>
                <span>
                  <strong className="text-slate-700 dark:text-slate-300 font-medium">{txt.tipTitle}</strong> {txt.tipDesc}
                </span>
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button 
                type="button"
                onClick={() => setStep(1)} 
                className="w-1/3 py-3 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/70 text-slate-600 dark:text-slate-300 font-medium text-sm transition"
              >
                {txt.back}
              </button>
              <button 
                type="button"
                onClick={handleCalculate} 
                className="w-2/3 py-3 rounded-2xl bg-gradient-to-r from-brandOrange to-orange-500 hover:from-orange-500 hover:to-brandOrange text-white font-medium text-sm flex items-center justify-center gap-1.5 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition"
              >
                <span>{txt.calculate}</span>
                <Sparkles className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Summary Plan */}
        {step === 3 && calculatedPlan && (
          <div className="text-center animate-in fade-in zoom-in-95 duration-300 ease-out">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-2">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-1">{txt.planReady}</h2>
            <p className="text-xs text-slate-400 mb-5">
              {formData.durationMonths} {txt.planReadySub}
            </p>

            {/* Target Box */}
            <div className="p-4 rounded-3xl bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/20 mb-4">
              <span className="text-[11px] font-medium text-brandOrange uppercase tracking-wider block mb-1">
                {txt.dailyTarget}
              </span>
              <div className="text-3xl font-bold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                <span>{calculatedPlan.dailyCalorieTarget}</span>
                <span className="text-xs text-slate-400 font-normal">kcal/day</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-2">
                <span>{txt.maintenance}: {calculatedPlan.tdee}</span>
                <span>•</span>
                <span className="text-emerald-500 font-medium">{txt.surplus}: +{calculatedPlan.dailySurplus} kcal</span>
              </div>
            </div>

            {/* Macro Breakdown */}
            <div className="grid grid-cols-3 gap-2.5 mb-6">
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">{txt.protein}</span>
                <p className="text-sm font-semibold text-macroProtein mt-0.5">{calculatedPlan.macros.protein}g</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">{txt.carbs}</span>
                <p className="text-sm font-semibold text-macroCarb mt-0.5">{calculatedPlan.macros.carbs}g</p>
              </div>
              <div className="p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">{txt.fat}</span>
                <p className="text-sm font-semibold text-macroFat mt-0.5">{calculatedPlan.macros.fat}g</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brandOrange to-orange-500 hover:from-orange-500 hover:to-brandOrange text-white font-medium text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <span>{txt.enterApp}</span>
              <Flame className="w-4 h-4 fill-white" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}