import { useState } from 'react';
import confetti from 'canvas-confetti';
import { toast } from 'sonner';
import { 
  ArrowRight, 
  CheckCircle2, 
  Flame, 
  Sparkles, 
  User, 
  Globe, 
  Moon, 
  Sun,
  ChevronDown,
  Briefcase,
  Clock,
  Loader2,
  X,
  Target
} from 'lucide-react';
import { calculateUserCaloriePlanWithAI } from '../utils/gemini';

export default function OnboardingModal({ 
  onComplete, 
  onClose,
  darkMode, 
  setDarkMode, 
  initialLang = 'bn',
  initialData = null 
}) {
  const isEditing = Boolean(initialData);
  const [step, setStep] = useState(isEditing ? 1 : 0);
  const [lang, setLang] = useState(initialData?.lang || initialLang);
  const [loadingAI, setLoadingAI] = useState(false);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    gender: initialData?.gender || 'male',
    age: initialData?.age ? String(initialData.age) : '25',
    heightFeet: initialData?.heightFeet ? String(initialData.heightFeet) : '5',
    heightInches: initialData?.heightInches ? String(initialData.heightInches) : '7',
    currentWeight: initialData?.currentWeight ? String(initialData.currentWeight) : '',
    targetWeight: initialData?.targetWeight ? String(initialData.targetWeight) : '',
    durationMonths: initialData?.durationMonths ? String(initialData.durationMonths) : '3',
    profession: initialData?.profession || 'desk_job',
    workHours: initialData?.workHours ? String(initialData.workHours) : '8'
  });

  const [calculatedPlan, setCalculatedPlan] = useState(null);

  // Real Human Realistic Input Lock & Guard
  const handleChange = (e) => {
    const { name, value } = e.target;

    // Strict numerical input sanitation
    if (name === 'age') {
      if (value === '') { setFormData(prev => ({ ...prev, age: '' })); return; }
      const num = parseInt(value, 10);
      if (isNaN(num)) return;
      if (num > 100) {
        toast.warning(lang === 'bn' ? 'বয়স সর্বোচ্চ ১০০ পর্যন্ত হতে পারে' : 'Age maximum limit is 100');
        setFormData(prev => ({ ...prev, age: '100' }));
        return;
      }
      setFormData(prev => ({ ...prev, age: String(num) }));
      return;
    }

    if (name === 'heightFeet') {
      if (value === '') { setFormData(prev => ({ ...prev, heightFeet: '' })); return; }
      const num = parseInt(value, 10);
      if (isNaN(num)) return;
      if (num > 8) {
        toast.warning(lang === 'bn' ? 'উচ্চতা সর্বোচ্চ ৮ ফুট হতে পারে' : 'Height maximum is 8 ft');
        setFormData(prev => ({ ...prev, heightFeet: '8' }));
        return;
      }
      setFormData(prev => ({ ...prev, heightFeet: String(num) }));
      return;
    }

    if (name === 'heightInches') {
      if (value === '') { setFormData(prev => ({ ...prev, heightInches: '' })); return; }
      const num = parseInt(value, 10);
      if (isNaN(num)) return;
      if (num > 11) {
        toast.warning(lang === 'bn' ? 'ইঞ্চি ০ থেকে ১১ এর মধ্যে হতে হবে' : 'Inches must be between 0 and 11');
        setFormData(prev => ({ ...prev, heightInches: '11' }));
        return;
      }
      setFormData(prev => ({ ...prev, heightInches: String(num) }));
      return;
    }

    if (name === 'currentWeight' || name === 'targetWeight') {
      if (value === '') { setFormData(prev => ({ ...prev, [name]: '' })); return; }
      const num = parseFloat(value);
      if (isNaN(num)) return;
      if (num > 250) {
        toast.warning(lang === 'bn' ? 'ওজন সর্বোচ্চ ২৫০ কেজি হতে পারে' : 'Weight maximum limit is 250 kg');
        setFormData(prev => ({ ...prev, [name]: '250' }));
        return;
      }
      setFormData(prev => ({ ...prev, [name]: value }));
      return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleStep1Submit = () => {
    // Name validation
    if (!formData.name.trim()) {
      toast.error(lang === 'bn' ? 'অনুগ্রহ করে আপনার নাম লিখুন' : 'Please enter your name');
      return;
    }

    const age = Number(formData.age);
    const feet = Number(formData.heightFeet);
    const inches = Number(formData.heightInches);
    const weight = Number(formData.currentWeight);
    const target = Number(formData.targetWeight);

    if (!age || age < 1 || age > 100) {
      toast.error(lang === 'bn' ? 'সঠিক বয়স লিখুন (১ - ১০০ বছর)' : 'Please enter a valid age (1 - 100 yrs)');
      return;
    }
    if (!feet || feet < 3 || feet > 8) {
      toast.error(lang === 'bn' ? 'উচ্চতা ৩ থেকে ৮ ফুটের মধ্যে দিন' : 'Height must be between 3 and 8 ft');
      return;
    }
    if (inches < 0 || inches > 11) {
      toast.error(lang === 'bn' ? 'ইঞ্চি ০ থেকে ১১ এর মধ্যে দিন' : 'Inches must be between 0 and 11');
      return;
    }
    if (!weight || weight < 20 || weight > 250) {
      toast.error(lang === 'bn' ? 'সঠিক বর্তমান ওজন লিখুন (২০ - ২৫০ কেজি)' : 'Please enter valid current weight (20 - 250 kg)');
      return;
    }
    if (!target || target < 20 || target > 250) {
      toast.error(lang === 'bn' ? 'সঠিক টার্গেট ওজন লিখুন (২০ - ২৫০ কেজি)' : 'Please enter valid target weight (20 - 250 kg)');
      return;
    }

    setStep(2);
  };

  const handleCalculateWithAI = async (e) => {
    e.preventDefault();
    const target = Number(formData.targetWeight);
    if (!target || target < 20 || target > 250) {
      toast.warning(lang === 'bn' ? 'টার্গেট ওজন ২০ থেকে ২৫০ কেজির মধ্যে রাখুন' : 'Target weight must be 20 - 250 kg');
      return;
    }

    setLoadingAI(true);
    const totalInches = (Number(formData.heightFeet) * 12) + Number(formData.heightInches);
    const heightCm = Math.round(totalInches * 2.54);

    try {
      const plan = await calculateUserCaloriePlanWithAI({
        ...formData,
        heightCm
      }, lang);

      setCalculatedPlan({ ...plan, heightCm });
      setStep(3);

      toast.success(lang === 'bn' ? 'আপনার পারসোনালাইজড ডায়েট প্ল্যান প্রস্তুত!' : 'Your personalized plan is ready!');
      try {
        confetti({ 
          particleCount: 65, 
          spread: 70, 
          origin: { y: 0.65 },
          colors: ['#FF6B4A', '#0D7C66', '#38BDF8', '#FBBF24']
        });
      } catch {}
    } catch (err) {
      console.warn("AI calculation warning:", err);
      toast.error(lang === 'bn' ? 'এআই সার্ভারে সমস্যা, বৈজ্ঞানিক ফর্মুলায় প্ল্যান তৈরি করা হচ্ছে' : 'AI error, generated via scientific formula');
    } finally {
      setLoadingAI(false);
    }
  };

  const handleFinish = () => {
    const profile = {
      ...formData,
      ...calculatedPlan,
      lang,
      isOnboarded: true,
      createdAt: initialData?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    localStorage.setItem('fit_profile', JSON.stringify(profile));
    onComplete(profile);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md transition-all duration-300">
      
      <div className="w-full max-w-md bg-white dark:bg-[#151D2E] rounded-[28px] p-6 sm:p-7 shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 relative overflow-hidden transition-all duration-300 ease-out max-h-[95vh] overflow-y-auto">
        
        {/* Top Control Bar */}
        <div className="flex justify-between items-center mb-5 pb-3 border-b border-slate-100 dark:border-slate-800/80 relative z-10">
          <button 
            type="button"
            onClick={() => setLang(prev => prev === 'bn' ? 'en' : 'bn')}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-xs font-medium transition active:scale-95 text-slate-700 dark:text-slate-200 border border-slate-200/60 dark:border-slate-700"
          >
            <Globe className="w-3.5 h-3.5 text-brandOrange" />
            <span>{lang === 'bn' ? 'English' : 'বাংলা'}</span>
          </button>

          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              title={darkMode ? (lang === 'bn' ? 'লাইট মোড' : 'Light Mode') : (lang === 'bn' ? 'ডার্ক মোড' : 'Dark Mode')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/90 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 transition active:scale-95 border border-slate-200/80 dark:border-slate-700/80 shadow-xs"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
              <span>{darkMode ? (lang === 'bn' ? 'লাইট' : 'Light') : (lang === 'bn' ? 'নাইট' : 'Dark')}</span>
            </button>

            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-1.5 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white transition active:scale-95 border border-slate-200/60 dark:border-slate-700"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Progress Step Indicator */}
        {step > 0 && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              {[1, 2, 3].map((i) => (
                <div 
                  key={i} 
                  className={`h-1.5 flex-1 rounded-full mx-0.5 transition-all duration-300 ${
                    step === i 
                      ? 'bg-brandOrange shadow-sm shadow-orange-500/50' 
                      : step > i 
                        ? 'bg-teal-500' 
                        : 'bg-slate-200 dark:bg-slate-800'
                  }`}
                />
              ))}
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-400 font-medium">
              <span>{lang === 'bn' ? `ধাপ ${step} / ৩` : `Step ${step} of 3`}</span>
              <span className="font-semibold text-brandOrange">
                {step === 1 && (lang === 'bn' ? 'শারীরিক তথ্য ও টার্গেট ওজন' : 'Body Metrics & Target Weight')}
                {step === 2 && (lang === 'bn' ? 'পেশা ও কাজের রুটিন' : 'Profession & Work Routine')}
                {step === 3 && (lang === 'bn' ? 'কাস্টম প্ল্যান ও সারসংক্ষেপ' : 'Custom Plan Summary')}
              </span>
            </div>
          </div>
        )}

        {/* STEP 0: Welcome Screen */}
        {step === 0 && (
          <div className="text-center py-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 ease-out">
            <div className="mb-4 inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-brandOrange text-[11px] font-semibold tracking-wide">
              <Sparkles className="w-3.5 h-3.5 text-brandOrange" />
              <span>{lang === 'bn' ? 'AI স্মার্ট ফিটনেস' : 'AI Smart Fitness'}</span>
            </div>

            {/* Leo Mascot Floating Image (Transparent & Glowing) */}
            <div className="relative mb-5 flex items-center justify-center">
              <div className="w-24 h-24 sm:w-28 sm:h-28 flex items-center justify-center animate-float-gentle filter drop-shadow-[0_12px_28px_rgba(249,115,22,0.55)]">
                <img 
                  src="/leo.svg" 
                  alt="Leo Mascot" 
                  className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]" 
                />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900 dark:text-white mb-2 leading-snug">
              {lang === 'bn' ? 'আপনার ফিটনেস যাত্রা শুরু হোক' : 'Begin Your Fitness Journey'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
              {lang === 'bn' 
                ? 'আপনার বর্তমান ওজন, টার্গেট ওজন ও কাজের পরিশ্রম বিশ্লেষণ করে এআই তৈরি করবে নিখুঁত দৈনিক ক্যালোরি টার্গেট।' 
                : 'AI will analyze your current weight, target weight, and work intensity to build an exact calorie plan.'}
            </p>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-brandOrange via-orange-500 to-amber-500 hover:opacity-95 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition-all duration-200"
            >
              <span>{lang === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        )}

        {/* STEP 1: Body Metrics with Explicit Target Weight */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300 ease-out">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-orange-500/10 text-brandOrange border border-orange-500/20">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold">
                {lang === 'bn' ? 'শারীরিক তথ্য ও টার্গেট ওজন' : 'Body Metrics & Target Weight'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4 pl-9">
              {lang === 'bn' ? 'সঠিক ক্যালোরির জন্য আপনার বর্তমান ও কাঙ্ক্ষিত টার্গেট ওজন দিন' : 'Enter your metrics and desired target weight'}
            </p>

            <div className="space-y-3.5">
              {/* Name Field */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  {lang === 'bn' ? 'আপনার নাম' : 'Your Name'}
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder={lang === 'bn' ? 'আপনার নাম লিখুন' : 'Enter your name'}
                  maxLength={30}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:border-brandOrange text-sm font-medium focus:outline-none"
                />
              </div>

              {/* Gender Toggle */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  {lang === 'bn' ? 'লিঙ্গ নির্বাচন করুন' : 'Select Gender'}
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'male' })}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                      formData.gender === 'male'
                        ? 'bg-brandOrange text-white border-brandOrange shadow-md shadow-orange-500/20'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span>👨 {lang === 'bn' ? 'পুরুষ (Male)' : 'Male'}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, gender: 'female' })}
                    className={`py-2.5 px-4 rounded-xl text-xs font-bold border transition flex items-center justify-center gap-2 ${
                      formData.gender === 'female'
                        ? 'bg-brandOrange text-white border-brandOrange shadow-md shadow-orange-500/20'
                        : 'bg-slate-50 dark:bg-slate-900/60 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span>👩 {lang === 'bn' ? 'মহিলা (Female)' : 'Female'}</span>
                  </button>
                </div>
              </div>

              {/* Age & Height Grid */}
              <div className="grid grid-cols-2 gap-3">
                {/* Age */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5 flex justify-between">
                    <span>{lang === 'bn' ? 'বয়স (বছর)' : 'Age (yrs)'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">১-১০০</span>
                  </label>
                  <input
                    type="number"
                    name="age"
                    min="1"
                    max="100"
                    value={formData.age}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:border-brandOrange text-sm font-medium focus:outline-none"
                    placeholder="25"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5 flex justify-between">
                    <span>{lang === 'bn' ? 'উচ্চতা' : 'Height'}</span>
                    <span className="text-[10px] text-slate-400 font-normal">৩-৮ ফুট</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <div className="flex items-center bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-300 dark:border-slate-700 px-2 focus-within:border-brandOrange">
                      <input 
                        type="number" 
                        name="heightFeet" 
                        min="3"
                        max="8"
                        value={formData.heightFeet} 
                        onChange={handleChange} 
                        className="w-full py-2.5 bg-transparent text-sm font-medium focus:outline-none" 
                      />
                      <span className="text-[10px] text-slate-400">{lang === 'bn' ? 'ফুট' : 'ft'}</span>
                    </div>
                    <div className="flex items-center bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-300 dark:border-slate-700 px-2 focus-within:border-brandOrange">
                      <input 
                        type="number" 
                        name="heightInches" 
                        min="0"
                        max="11"
                        value={formData.heightInches} 
                        onChange={handleChange} 
                        className="w-full py-2.5 bg-transparent text-sm font-medium focus:outline-none" 
                      />
                      <span className="text-[10px] text-slate-400">{lang === 'bn' ? 'ইঞ্চি' : 'in'}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* DEDICATED WEIGHT SECTION: CURRENT WEIGHT & TARGET WEIGHT SIDE-BY-SIDE */}
              <div className="p-3.5 rounded-2xl bg-slate-50/90 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 space-y-2.5">
                <div className="flex items-center justify-between text-xs font-bold text-slate-700 dark:text-slate-200">
                  <span className="flex items-center gap-1.5">
                    <Target className="w-4 h-4 text-brandOrange" />
                    <span>{lang === 'bn' ? 'ওজন ও কাঙ্ক্ষিত লক্ষ্য' : 'Weight & Target Benchmark'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">{lang === 'bn' ? '২০-২৫০ কেজি' : '20-250 kg'}</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {/* Current Weight */}
                  <div>
                    <label className="text-[11px] font-semibold text-slate-600 dark:text-slate-400 block mb-1">
                      {lang === 'bn' ? 'বর্তমান ওজন (কেজি)' : 'Current Weight (kg)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="currentWeight"
                      min="20"
                      max="250"
                      value={formData.currentWeight}
                      onChange={handleChange}
                      placeholder={lang === 'bn' ? 'যেমন: ৬০' : 'e.g. 60'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 focus:border-brandOrange text-sm font-bold text-slate-900 dark:text-white focus:outline-none"
                    />
                  </div>

                  {/* Target Weight */}
                  <div>
                    <label className="text-[11px] font-bold text-brandOrange block mb-1">
                      {lang === 'bn' ? '🎯 টার্গেট ওজন (কেজি)' : '🎯 Target Weight (kg)'}
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      name="targetWeight"
                      min="20"
                      max="250"
                      value={formData.targetWeight}
                      onChange={handleChange}
                      placeholder={lang === 'bn' ? 'যেমন: ৬৮' : 'e.g. 68'}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white dark:bg-slate-800 border-2 border-brandOrange/50 focus:border-brandOrange text-sm font-bold text-brandOrange focus:outline-none shadow-xs"
                    />
                  </div>
                </div>

                {/* Real-time Goal Calculation Feedback */}
                {formData.currentWeight && formData.targetWeight && (
                  <div className="pt-2 border-t border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs font-bold">
                    <span className="text-[11px] text-slate-400">
                      {lang === 'bn' ? 'নির্ধারিত লক্ষ্য:' : 'Calculated Goal:'}
                    </span>
                    {(() => {
                      const cw = parseFloat(formData.currentWeight);
                      const tw = parseFloat(formData.targetWeight);
                      if (isNaN(cw) || isNaN(tw)) return null;
                      const diff = tw - cw;
                      if (diff > 0) {
                        return (
                          <span className="text-emerald-500 font-bold flex items-center gap-1">
                            <span>🚀</span>
                            <span>{lang === 'bn' ? `+${diff.toFixed(1)} কেজি বৃদ্ধি (Weight Gain)` : `+${diff.toFixed(1)} kg Gain`}</span>
                          </span>
                        );
                      } else if (diff < 0) {
                        return (
                          <span className="text-sky-400 font-bold flex items-center gap-1">
                            <span>🔥</span>
                            <span>{lang === 'bn' ? `${Math.abs(diff).toFixed(1)} কেজি হ্রাস (Weight Loss)` : `${Math.abs(diff).toFixed(1)} kg Loss`}</span>
                          </span>
                        );
                      } else {
                        return (
                          <span className="text-amber-400 font-bold flex items-center gap-1">
                            <span>⚖️</span>
                            <span>{lang === 'bn' ? 'বর্তমান ওজন বজায় রাখা (Maintain)' : 'Maintain Weight'}</span>
                          </span>
                        );
                      }
                    })()}
                  </div>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={handleStep1Submit}
              className="w-full mt-6 py-3 px-6 rounded-2xl bg-gradient-to-r from-brandOrange via-orange-500 to-amber-500 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 active:scale-[0.98] transition"
            >
              <span>{lang === 'bn' ? 'পরবর্তী ধাপ' : 'Next Step'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 2: Lifestyle, Profession, Work Hours & Target Timeline */}
        {step === 2 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300 ease-out">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20">
                <Briefcase className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold">
                {lang === 'bn' ? 'পেশা ও কাজের বিবরণ' : 'Work & Lifestyle Routine'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4 pl-9">
              {lang === 'bn' ? 'কাজের পরিশ্রম অনুযায়ী সঠিক ক্যালোরি নির্ধারণ হবে' : 'Calorie target will adjust according to daily physical stress'}
            </p>

            <div className="space-y-3.5">
              {/* Target Goal Summary & Timeline Card */}
              <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base">🎯</span>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">
                        {lang === 'bn' ? 'নির্ধারিত লক্ষ্য' : 'Selected Goal'}
                      </span>
                      <p className="text-xs font-black text-slate-800 dark:text-slate-100">
                        {formData.currentWeight} kg ➔ <span className="text-brandOrange font-extrabold">{formData.targetWeight} kg</span>
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="text-[11px] font-bold text-brandOrange hover:underline px-2 py-1 rounded-lg bg-orange-500/10 border border-orange-500/20"
                  >
                    {lang === 'bn' ? 'ওজন বদলান ✏️' : 'Edit ✏️'}
                  </button>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                    {lang === 'bn' ? 'টার্গেট অর্জনের সময়কাল' : 'Target Timeline'}
                  </label>
                  <select
                    name="durationMonths"
                    value={formData.durationMonths}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-xs font-bold focus:border-brandOrange"
                  >
                    <option value="2">{lang === 'bn' ? '২ মাস (দ্রুত গতি)' : '2 Months (Fast)'}</option>
                    <option value="3">{lang === 'bn' ? '৩ মাস (প্রস্তাবিত স্বাভাবিক গতি)' : '3 Months (Recommended)'}</option>
                    <option value="4">{lang === 'bn' ? '৪ মাস (স্থির ও স্বাস্থ্যকর)' : '4 Months (Steady)'}</option>
                    <option value="6">{lang === 'bn' ? '৬ মাস (দীর্ঘমেয়াদী রূপান্তর)' : '6 Months (Long-term)'}</option>
                  </select>
                </div>
              </div>

              {/* Profession */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                  {lang === 'bn' ? 'আপনার কাজের ধরন / পেশা' : 'Job Type & Daily Activity'}
                </label>
                <div className="relative">
                  <select
                    name="profession"
                    value={formData.profession}
                    onChange={handleChange}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium focus:border-brandOrange appearance-none pr-10 cursor-pointer"
                  >
                    <option value="desk_job">
                      {lang === 'bn' ? '💻 ডেস্ক জব / স্টুডেন্ট (সারাদিন বসে কাজ)' : '💻 Desk Job / Student (Sedentary)'}
                    </option>
                    <option value="light_active">
                      {lang === 'bn' ? '🚶 হালকা মুভমেন্ট / শিক্ষক / দোকানদার' : '🚶 Light Active / Teacher / Retail'}
                    </option>
                    <option value="moderate_field">
                      {lang === 'bn' ? '🏃 ফিল্ড জব / সেলস / সারাদিন হাঁটাচলা' : '🏃 Field Work / Sales / On-feet all day'}
                    </option>
                    <option value="heavy_labor">
                      {lang === 'bn' ? '🏗️ ভারী শারীরিক পরিশ্রম / ডেলিভারি / নির্মাণ কাজ' : '🏗️ Heavy Physical Labor / Delivery / Site work'}
                    </option>
                  </select>
                  <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              {/* Work Hours Range */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5 flex items-center justify-between">
                  <span>{lang === 'bn' ? 'দৈনিক কাজের সময় (ঘণ্টা)' : 'Daily Work Hours'}</span>
                  <span className="text-brandOrange font-bold">{formData.workHours} {lang === 'bn' ? 'ঘণ্টা' : 'hrs'}</span>
                </label>
                <div className="flex items-center gap-3">
                  <Clock className="w-4 h-4 text-slate-400" />
                  <input
                    type="range"
                    name="workHours"
                    min="4"
                    max="14"
                    step="1"
                    value={formData.workHours}
                    onChange={handleChange}
                    className="w-full accent-brandOrange cursor-pointer"
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-400 leading-relaxed">
                💡 <span className="text-slate-300 font-medium">{lang === 'bn' ? 'এআই সুবিধা:' : 'AI Benefit:'}</span> {lang === 'bn' ? 'আপনার কাজের পরিশ্রমে দিনে কত ক্যালোরি বার্ন হয় তা হিসাব করে সঠিক টার্গেট দেওয়া হবে।' : 'Calculates extra calories burned during work hours to ensure guaranteed target reaching.'}
              </div>
            </div>

            <div className="flex gap-2.5 mt-6">
              <button 
                type="button"
                onClick={() => setStep(1)} 
                disabled={loadingAI}
                className="w-1/3 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 font-medium text-xs transition"
              >
                {lang === 'bn' ? 'পেছনে' : 'Back'}
              </button>
              <button 
                type="button"
                onClick={handleCalculateWithAI} 
                disabled={loadingAI}
                className="w-2/3 py-2.5 rounded-xl bg-gradient-to-r from-brandOrange to-orange-500 hover:from-orange-500 hover:to-brandOrange text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-orange-500/25 active:scale-[0.98] transition disabled:opacity-50"
              >
                {loadingAI ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>{lang === 'bn' ? 'এআই হিসাব করছে...' : 'AI Calculating...'}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === 'bn' ? 'এআই দিয়ে হিসাব করুন' : 'Calculate with AI'}</span>
                    <Sparkles className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: Summary Plan with Dynamic Name Greeting */}
        {step === 3 && calculatedPlan && (
          <div className="text-center animate-in fade-in zoom-in-95 duration-300 ease-out">
            <div className="inline-flex p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 mb-2">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-0.5">
              {lang === 'bn' 
                ? `${formData.name ? formData.name + ', ' : ''}আপনার কাস্টম ডায়েট প্ল্যান প্রস্তুত!` 
                : `${formData.name ? formData.name + ', ' : ''}Your Personalized Plan is Ready!`}
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              {lang === 'bn' 
                ? `টার্গেট: ${formData.currentWeight} ➔ ${formData.targetWeight} কেজি • ${formData.workHours} ঘণ্টা কাজের রুটিন`
                : `Target: ${formData.currentWeight} ➔ ${formData.targetWeight} kg • ${formData.workHours}h work routine`}
            </p>

            <div className="p-4 rounded-2xl bg-gradient-to-b from-orange-500/10 to-transparent border border-orange-500/20 mb-3.5">
              <span className="text-[11px] font-bold text-brandOrange uppercase tracking-wider block mb-1">
                {lang === 'bn' ? 'দৈনিক ক্যালোরি লক্ষ্য (Daily Calorie Target)' : 'Daily Calorie Target'}
              </span>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center justify-center gap-1.5">
                <span>{calculatedPlan.dailyCalorieTarget}</span>
                <span className="text-xs text-slate-400 font-normal">kcal/day</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-2 flex items-center justify-center gap-2">
                <span>{lang === 'bn' ? 'রক্ষণাবেক্ষণ' : 'Maintenance'}: {calculatedPlan.tdee}</span>
                <span>•</span>
                <span className="text-emerald-500 font-semibold">
                  {calculatedPlan.dailySurplus >= 0 ? `+${calculatedPlan.dailySurplus}` : calculatedPlan.dailySurplus} kcal
                </span>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 mb-3.5">
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">{lang === 'bn' ? 'প্রোটিন' : 'Protein'}</span>
                <p className="text-sm font-bold text-teal-400 mt-0.5">{calculatedPlan.macros?.protein}g</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">{lang === 'bn' ? 'কার্বস' : 'Carbs'}</span>
                <p className="text-sm font-bold text-sky-400 mt-0.5">{calculatedPlan.macros?.carbs}g</p>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-800">
                <span className="text-[10px] text-slate-400 uppercase font-medium">{lang === 'bn' ? 'ফ্যাট' : 'Fat'}</span>
                <p className="text-sm font-bold text-amber-400 mt-0.5">{calculatedPlan.macros?.fat}g</p>
              </div>
            </div>

            {calculatedPlan.advice && (
              <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-brandOrange font-medium mb-4 leading-relaxed text-left flex items-start gap-2">
                <Sparkles className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{calculatedPlan.advice}</span>
              </div>
            )}

            <button
              type="button"
              onClick={handleFinish}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-brandOrange to-orange-500 hover:from-orange-500 hover:to-brandOrange text-white font-bold text-sm shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <span>{lang === 'bn' ? (isEditing ? 'টার্গেট আপডেট করুন' : 'অ্যাপে প্রবেশ করুন') : (isEditing ? 'Update Target' : 'Start Journey')}</span>
              <Flame className="w-4 h-4 fill-white" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
