import { useState } from 'react';
import { ChevronLeft, ChevronRight, TrendingUp, Calendar as CalIcon, Plus, Check } from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalCalendarView({ profile, lang = 'bn' }) {
  const [currentDate, setCurrentDate] = useState(new Date(2026, 8, 1)); // September 2026
  const [loggedWeight, setLoggedWeight] = useState('');
  const [weightLogs, setWeightLogs] = useState(() => {
    const saved = localStorage.getItem('fit_weights');
    return saved ? JSON.parse(saved) : [{ date: '2026-09-01', weight: profile?.currentWeight || 49 }];
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = lang === 'bn' 
    ? ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const weekDays = lang === 'bn' ? ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"] : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const handleNextMonth = () => setCurrentDate(new Date(year, month + 1, 1));

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!loggedWeight || isNaN(loggedWeight)) return;
    const newEntry = {
      date: new Date().toISOString().split('T')[0],
      weight: parseFloat(loggedWeight)
    };
    const updated = [newEntry, ...weightLogs];
    setWeightLogs(updated);
    localStorage.setItem('fit_weights', JSON.stringify(updated));
    setLoggedWeight('');
    toast.success(lang === 'bn' ? 'ওজন রেকর্ড করা হয়েছে!' : 'Weight logged successfully!');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* 1. Real-Time Monthly Calendar Card */}
      <div className="bg-white dark:bg-darkCard p-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm">
        
        {/* Calendar Nav */}
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <CalIcon className="w-4 h-4 text-brandOrange" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {monthNames[month]} {year}
            </h3>
          </div>
          <div className="flex gap-1">
            <button onClick={handlePrevMonth} className="p-1.5 rounded-xl bg-slate-100 dark:bg-darkSurface text-slate-600 dark:text-slate-300 active:scale-95 transition">
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={handleNextMonth} className="p-1.5 rounded-xl bg-slate-100 dark:bg-darkSurface text-slate-600 dark:text-slate-300 active:scale-95 transition">
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekDays.map((d, i) => (
            <span key={i} className="text-[10px] font-semibold text-slate-400">{d}</span>
          ))}
        </div>

        {/* Calendar Days Grid */}
        <div className="grid grid-cols-7 gap-1 text-center">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="p-2" />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const isToday = dayNum === 25; // Current day mock for 25th September
            const isSuccess = dayNum >= 20 && dayNum < 25; // Consistent streak mock

            return (
              <div 
                key={dayNum}
                className={`py-2 rounded-xl text-xs font-semibold relative transition ${
                  isToday 
                    ? 'bg-brandOrange text-white shadow-md shadow-orange-500/25' 
                    : isSuccess 
                      ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' 
                      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800'
                }`}
              >
                <span>{dayNum}</span>
                {isSuccess && (
                  <span className="w-1 h-1 bg-emerald-500 rounded-full absolute bottom-1 left-1/2 -translate-x-1/2" />
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-[10px] text-slate-400">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {lang === 'bn' ? 'লক্ষ্য পূরণ' : 'Target Met'}
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-brandOrange" /> {lang === 'bn' ? 'আজকের দিন' : 'Today'}
          </span>
        </div>
      </div>

      {/* 2. Weekly & Monthly Calorie Comparison Card */}
      <div className="bg-white dark:bg-darkCard p-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <h3 className="text-xs font-bold text-slate-900 dark:text-white mb-3">
          {lang === 'bn' ? 'সাপ্তাহিক ও মাসিক সারপ্লাস বিশ্লেষণ' : 'Weekly & Monthly Surplus Analytics'}
        </h3>
        
        <div className="grid grid-cols-2 gap-3 text-center">
          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-darkSurface border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {lang === 'bn' ? 'এই সপ্তাহে গৃহিত' : 'This Week Intake'}
            </span>
            <p className="text-lg font-bold text-brandOrange mt-0.5">18,200 <span className="text-[10px] font-normal">kcal</span></p>
            <span className="text-[10px] text-emerald-500 font-medium">92% Consistency</span>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-darkSurface border border-slate-100 dark:border-slate-800">
            <span className="text-[10px] text-slate-400 uppercase font-semibold">
              {lang === 'bn' ? 'প্রত্যাশিত ওজন লাভ' : 'Projected Gain'}
            </span>
            <p className="text-lg font-bold text-teal-500 mt-0.5">+2.1 kg</p>
            <span className="text-[10px] text-slate-400">This Month</span>
          </div>
        </div>
      </div>

      {/* 3. Weight Log History Card */}
      <div className="bg-white dark:bg-darkCard p-5 rounded-[28px] border border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brandOrange" />
            <h3 className="text-xs font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'সাপ্তাহিক ওজন রেকর্ড' : 'Log Weekly Weight'}
            </h3>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {profile?.currentWeight} kg ➔ {profile?.targetWeight} kg
          </span>
        </div>

        <form onSubmit={handleAddWeight} className="flex gap-2 mb-4">
          <input
            type="number"
            step="0.1"
            value={loggedWeight}
            onChange={(e) => setLoggedWeight(e.target.value)}
            placeholder={lang === 'bn' ? "আজকের ওজন (কেজি)..." : "Today's weight (kg)..."}
            className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-darkSurface border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brandOrange"
          />
          <button
            type="submit"
            className="px-4 py-2.5 rounded-xl bg-brandOrange text-white text-xs font-semibold active:scale-95 transition shadow-md shadow-orange-500/20"
          >
            {lang === 'bn' ? 'যোগ' : 'Save'}
          </button>
        </form>

        <div className="space-y-1.5 max-h-32 overflow-y-auto">
          {weightLogs.map((log, idx) => (
            <div key={idx} className="flex justify-between items-center py-2 px-3 rounded-xl bg-slate-50 dark:bg-darkSurface text-xs">
              <span className="text-slate-400">{log.date}</span>
              <span className="font-bold text-slate-900 dark:text-white">{log.weight} kg</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}