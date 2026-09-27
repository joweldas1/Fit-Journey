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
  Briefcase,
  Clock,
  Loader2
} from 'lucide-react';
import { calculateUserCaloriePlanWithAI } from '../utils/gemini';
import { t } from '../utils/translations';

export default function OnboardingModal({ onComplete, darkMode, setDarkMode, initialLang = 'bn' }) {
  const [step, setStep] = useState(0);
  const [lang, setLang] = useState(initialLang);
  const [loadingAI, setLoadingAI] = useState(false);
  const txt = t[lang] || t.bn;

  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    age: '25',
    heightFeet: '5',
    heightInches: '7',
    currentWeight: '55',
    targetWeight: '62',
    durationMonths: '3',
    profession: 'desk_job',
    workHours: '8'
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
      toast.error(lang === 'bn' ? 'সঠিক ওজন লিখুন (২০ - ২৫০ কেজি)' : 'Please enter valid weight (20 - 250 kg)');
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
      toast.error(lang === 'bn' ? 'হিসাব সম্পন্ন করা যায়নি, আবার চেষ্টা করুন' : 'Calculation failed, please try again');
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
      createdAt: new Date().toISOString()
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

          <button 
            type="button"
            onClick={() => setDarkMode(!darkMode)}
            className="p-2 rounded-full bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700/80 text-slate-600 dark:text-amber-400 transition active:scale-95 border border-slate-200/60 dark:border-slate-700"
          >
            {darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </div>

        {/* Progress Step Indicator */}
        {step > 0 && (
          <div className="flex items-center justify-between mb-5 px-1 relative z-10">
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
              {lang === 'bn' ? `ধাপ ${step} / ৩` : `Step ${step} of 3`}
            </span>
          </div>
        )}

        {/* STEP 0: Welcome Screen */}
        {step === 0 && (
          <div className="text-center py-4 flex flex-col items-center animate-in fade-in zoom-in-95 duration-500 ease-out">
            <div className="mb-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-500/10 border border-orange-500/20 text-brandOrange text-[11px] font-medium tracking-wide">
              <Sparkles className="w-3 h-3" />
              <span>{lang === 'bn' ? 'AI স্মার্ট ফিটনেস' : 'AI Smart Fitness'}</span>
            </div>

            <div className="relative mb-5">
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-brandOrange to-amber-500 flex items-center justify-center text-white shadow-xl shadow-orange-500/30">
                <Flame className="w-10 h-10 fill-white/90" />
              </div>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white mb-2 leading-snug">
              {lang === 'bn' ? 'আপনার ফিটনেস যাত্রা শুরু হোক' : 'Begin Your Fitness Journey'}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mb-8 max-w-xs leading-relaxed">
              {lang === 'bn' 
                ? 'আপনার বয়স, কাজের ধরন ও পেশা অনুযায়ী এআই তৈরি করবে শতভাগ নিখুঁত দৈনিক ক্যালোরি টার্গেট।' 
                : 'AI will analyze your physical metrics, job routine, and work intensity to build an exact calorie target.'}
            </p>

            <button
              type="button"
              onClick={() => setStep(1)}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-teal-600 to-teal-500 hover:from-teal-500 hover:to-teal-600 text-white font-medium text-sm flex items-center justify-center gap-2 shadow-lg shadow-teal-600/30 active:scale-[0.98] transition-all duration-200"
            >
              <span>{lang === 'bn' ? 'শুরু করুন' : 'Get Started'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* STEP 1: Body Metrics with Strict Human Limits & Name Input */}
        {step === 1 && (
          <div className="animate-in fade-in slide-in-from-right-3 duration-300 ease-out">
            <div className="flex items-center gap-3 mb-1">
              <div className="p-2 rounded-xl bg-orange-500/10 text-brandOrange border border-orange-500/20">
                <User className="w-4 h-4" />
              </div>
              <h2 className="text-base sm:text-lg font-bold">
                {lang === 'bn' ? 'শারীরিক তথ্য ও পরিমাপ' : 'Body Metrics & Gender'}
              </h2>
            </div>
            <p className="text-xs text-slate-400 mb-4 pl-9">
              {lang === 'bn' ? 'ক্যালোরি হিসাবের জন্য আপনার মৌলিক তথ্য দিন' : 'Enter your basic metrics for accurate BMR calculation'}
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

              {/* Age (Restricted to 1 - 100) */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5 flex justify-between">
                  <span>{lang === 'bn' ? 'বয়স (বছর)' : 'Age (years)'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {lang === 'bn' ? '১ - ১০০ বছর' : '1 - 100 yrs'}
                  </span>
                </label>
                <input
                  type="number"
                  name="age"
                  min="1"
                  max="100"
                  value={formData.age}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:border-brandOrange text-sm font-medium focus:outline-none"
                  placeholder="25"
                />
              </div>

              {/* Height (Restricted 3-8 ft & 0-11 in) */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5 flex justify-between">
                  <span>{lang === 'bn' ? 'উচ্চতা' : 'Height'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {lang === 'bn' ? '৩-৮ ফুট, ০-১১ ইঞ্চি' : '3-8 ft, 0-11 in'}
                  </span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex items-center bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 focus-within:border-brandOrange">
                    <input 
                      type="number" 
                      name="heightFeet" 
                      min="3"
                      max="8"
                      value={formData.heightFeet} 
                      onChange={handleChange} 
                      className="w-full py-2.5 bg-transparent text-sm font-medium focus:outline-none" 
                    />
                    <span className="text-xs text-slate-400 ml-1">{lang === 'bn' ? 'ফুট' : 'ft'}</span>
                  </div>
                  <div className="flex items-center bg-slate-50/70 dark:bg-slate-900/60 rounded-xl border border-slate-300 dark:border-slate-700 px-3.5 focus-within:border-brandOrange">
                    <input 
                      type="number" 
                      name="heightInches" 
                      min="0"
                      max="11"
                      value={formData.heightInches} 
                      onChange={handleChange} 
                      className="w-full py-2.5 bg-transparent text-sm font-medium focus:outline-none" 
                    />
                    <span className="text-xs text-slate-400 ml-1">{lang === 'bn' ? 'ইঞ্চি' : 'in'}</span>
                  </div>
                </div>
              </div>

              {/* Current Weight (Restricted 20-250 kg) */}
              <div>
                <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5 flex justify-between">
                  <span>{lang === 'bn' ? 'বর্তমান ওজন (কেজি)' : 'Current Weight (kg)'}</span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {lang === 'bn' ? '২০ - ২৫০ কেজি' : '20 - 250 kg'}
                  </span>
                </label>
                <input
                  type="number"
                  step="0.1"
                  name="currentWeight"
                  min="20"
                  max="250"
                  value={formData.currentWeight}
                  onChange={handleChange}
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 focus:border-brandOrange text-sm font-medium focus:outline-none"
                  placeholder="55"
                />
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

        {/* STEP 2: Lifestyle, Profession, Work Hours & Target */}
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

              {/* Target Weight & Duration */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5 flex justify-between">
                    <span>{lang === 'bn' ? 'টার্গেট ওজন' : 'Target Wt.'}</span>
                    <span className="text-[10px] text-slate-400">
                      {lang === 'bn' ? '২০-২৫০ কেজি' : '20-250 kg'}
                    </span>
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    name="targetWeight"
                    min="20"
                    max="250"
                    value={formData.targetWeight}
                    onChange={handleChange}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 focus:border-brandOrange text-xs font-medium focus:outline-none"
                    placeholder="62"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-300 block mb-1.5">
                    {lang === 'bn' ? 'সময়কাল' : 'Timeline'}
                  </label>
                  <select
                    name="durationMonths"
                    value={formData.durationMonths}
                    onChange={handleChange}
                    className="w-full px-3 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-700 text-xs font-medium focus:border-brandOrange"
                  >
                    <option value="2">{lang === 'bn' ? '২ মাস' : '2 Months'}</option>
                    <option value="3">{lang === 'bn' ? '৩ মাস' : '3 Months'}</option>
                    <option value="4">{lang === 'bn' ? '৪ মাস' : '4 Months'}</option>
                    <option value="6">{lang === 'bn' ? '৬ মাস' : '6 Months'}</option>
                  </select>
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
                    <span>{lang === 'bn' ? 'AI বিশ্লেষণ করছে...' : 'AI Analyzing...'}</span>
                  </>
                ) : (
                  <>
                    <span>{lang === 'bn' ? 'AI ক্যালোরি গণনা করুন' : 'Calculate with AI'}</span>
                    <Sparkles className="w-3.5 h-3.5" />
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
                ? `${formData.gender === 'male' ? 'পুরুষ' : 'মহিলা'} • ${formData.workHours} ঘণ্টা কাজের রুটিন অনুযায়ী ক্যালকুলেটেড`
                : `${formData.gender === 'male' ? 'Male' : 'Female'} • Custom calibrated for ${formData.workHours}h work routine`}
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
              <span>{lang === 'bn' ? 'অ্যাপে প্রবেশ করুন' : 'Start Journey'}</span>
              <Flame className="w-4 h-4 fill-white" />
            </button>
          </div>
        )}

      </div>
    </div>
  );
}