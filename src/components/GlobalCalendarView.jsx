import { useState, useMemo } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalIcon, 
  TrendingUp, 
  Utensils, 
  Inbox, 
  Flame, 
  CheckCircle2, 
  XCircle,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';

export default function GlobalCalendarView({ profile, lang = 'bn' }) {
  // রিয়েল-টাইম বর্তমান তারিখ
  const today = useMemo(() => new Date(), []);
  const todayYear = today.getFullYear();
  const todayMonth = today.getMonth();
  const todayDate = today.getDate();

  const [currentDate, setCurrentDate] = useState(new Date(todayYear, todayMonth, 1));
  const [selectedDay, setSelectedDay] = useState(todayDate); // ডিফল্টভাবে আজকের দিন সিলেক্টেড থাকবে

  const [loggedWeight, setLoggedWeight] = useState('');
  const [weightLogs, setWeightLogs] = useState(() => {
    const saved = localStorage.getItem('fit_weights');
    const initialDate = `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`;
    return saved ? JSON.parse(saved) : [{ date: initialDate, weight: profile?.currentWeight || 65 }];
  });

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const firstDayIndex = new Date(year, month, 1).getDay();

  const monthNames = lang === 'bn' 
    ? ["জানুয়ারি", "ফেব্রুয়ারি", "মার্চ", "এপ্রিল", "মে", "জুন", "জুলাই", "আগস্ট", "সেপ্টেম্বর", "অক্টোবর", "নভেম্বর", "ডিসেম্বর"]
    : ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

  const weekDays = lang === 'bn' 
    ? ["রবি", "সোম", "মঙ্গল", "বুধ", "বৃহ", "শুক্র", "শনি"] 
    : ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
    setSelectedDay(1);
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
    setSelectedDay(1);
  };

  const handleAddWeight = (e) => {
    e.preventDefault();
    if (!loggedWeight || isNaN(loggedWeight)) return;
    const newEntry = {
      date: `${todayYear}-${String(todayMonth + 1).padStart(2, '0')}-${String(todayDate).padStart(2, '0')}`,
      weight: parseFloat(loggedWeight)
    };
    const updated = [newEntry, ...weightLogs];
    setWeightLogs(updated);
    localStorage.setItem('fit_weights', JSON.stringify(updated));
    setLoggedWeight('');
    toast.success(lang === 'bn' ? 'ওজন রেকর্ড করা হয়েছে!' : 'Weight logged successfully!');
  };

  // প্রতিটি দিনের স্ট্যাটাস নির্ণয়
  const getDayStatus = (dayNum) => {
    const isCurrentDay = dayNum === todayDate && month === todayMonth && year === todayYear;
    const checkDate = new Date(year, month, dayNum);
    checkDate.setHours(0, 0, 0, 0);
    const compareToday = new Date(todayYear, todayMonth, todayDate);
    compareToday.setHours(0, 0, 0, 0);

    const dateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
    const savedFoods = localStorage.getItem(`fit_foods_${dateKey}`);
    const foods = savedFoods ? JSON.parse(savedFoods) : [];
    const totalCal = foods.reduce((acc, f) => acc + (f.calories || 0), 0);
    const target = profile?.dailyCalorieTarget || 2897;

    if (isCurrentDay) {
      return { type: 'TODAY', totalCal, target, isSuccess: totalCal >= target };
    }

    if (checkDate > compareToday) {
      return { type: 'FUTURE', totalCal: 0, target };
    }

    // অতীত দিনের ক্যালকুলেশন
    if (totalCal >= target && target > 0) {
      return { type: 'SUCCESS', totalCal, target };
    }
    return { type: 'MISSED', totalCal, target };
  };

  // সিলেক্ট করা দিনের ডাটা লোড
  const selectedDateKey = `${year}-${String(month + 1).padStart(2, '0')}-${String(selectedDay).padStart(2, '0')}`;
  const selectedFoods = useMemo(() => {
    const saved = localStorage.getItem(`fit_foods_${selectedDateKey}`);
    return saved ? JSON.parse(saved) : [];
  }, [selectedDateKey]);

  const selectedTotalCal = selectedFoods.reduce((acc, f) => acc + (f.calories || 0), 0);
  const targetCalories = profile?.dailyCalorieTarget || 2897;
  const isSelectedDayToday = selectedDay === todayDate && month === todayMonth && year === todayYear;
  const isSelectedPast = new Date(year, month, selectedDay) < new Date(todayYear, todayMonth, todayDate);

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* 1. Sleek & Compact Monthly Calendar Card */}
      <div className="bg-white dark:bg-darkCard p-4 sm:p-5 rounded-[24px] border border-slate-100 dark:border-slate-800/80 shadow-md">
        
        {/* Calendar Nav */}
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-orange-500/10 text-brandOrange">
              <CalIcon className="w-4 h-4" />
            </div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white tracking-wide">
              {monthNames[month]} {year}
            </h3>
          </div>
          <div className="flex gap-1.5">
            <button 
              type="button"
              onClick={handlePrevMonth} 
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button 
              type="button"
              onClick={handleNextMonth} 
              className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-90 transition"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Days Header */}
        <div className="grid grid-cols-7 gap-1 text-center mb-2">
          {weekDays.map((d, i) => (
            <span key={i} className="text-[11px] font-semibold text-slate-400 py-1">{d}</span>
          ))}
        </div>

        {/* Calendar Days Grid - Controlled Compact Size */}
        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center max-w-[340px] mx-auto">
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="w-8 h-8 sm:w-9 sm:h-9 mx-auto" />
          ))}

      {Array.from({ length: daysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const status = getDayStatus(dayNum);
            const isSelected = selectedDay === dayNum;
            const isToday = status.type === 'TODAY';

            return (
              <button
                key={dayNum}
                type="button"
                onClick={() => setSelectedDay(dayNum)}
                className={`w-8 h-8 sm:w-9 sm:h-9 mx-auto rounded-full flex flex-col items-center justify-center text-xs font-semibold relative transition-all active:scale-90 ${
                  // 1. Selected hole dark solid fill (kono border/ring thakbe na)
                  isSelected && !isToday
                    ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-md z-10 scale-105 border-0'
                    : isToday
                      ? 'bg-gradient-to-tr from-brandOrange to-orange-400 text-white shadow-sm shadow-orange-500/40' 
                      : status.type === 'SUCCESS' 
                        ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' 
                        : status.type === 'MISSED'
                          ? 'bg-rose-500/10 text-rose-500 border border-rose-500/25'
                          : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                }`}
              >
                <span className="leading-none">{dayNum}</span>
                
                {/* Status Indicator Dot (Selected thakle dot shundor bhabe highlight thakbe) */}
                {status.type === 'SUCCESS' && (
                  <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelected ? 'bg-emerald-300' : 'bg-emerald-500'}`} />
                )}
                {status.type === 'MISSED' && (
                  <span className={`w-1 h-1 rounded-full absolute bottom-1 ${isSelected ? 'bg-rose-300' : 'bg-rose-500'}`} />
                )}
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-4 mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> {lang === 'bn' ? 'লক্ষ্য পূরণ' : 'Target Met'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-rose-500" /> {lang === 'bn' ? 'অনিয়ম / ব্যর্থ' : 'Missed'}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-brandOrange" /> {lang === 'bn' ? 'আজকের দিন' : 'Today'}
          </span>
        </div>
      </div>

      {/* 2. Interactive Previous / Selected Day History Inspector */}
      <div className="bg-white dark:bg-darkCard p-4 sm:p-5 rounded-[24px] border border-slate-100 dark:border-slate-800/80 shadow-md">
        
        {/* Selected Date Header */}
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100 dark:border-slate-800/80">
          <div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
              {isSelectedDayToday 
                ? (lang === 'bn' ? 'আজকের লাইভ রেকর্ড' : "Today's Live Record")
                : (lang === 'bn' ? 'পূর্ববর্তী দিনের রেকর্ড' : 'Past Day Record')}
            </span>
            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white mt-0.5">
              {selectedDay} {monthNames[month]} {year}
            </h4>
          </div>

          {/* Calorie Pill for this Day */}
          <div className="text-right">
            <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-xs font-bold">
              <Flame className="w-3.5 h-3.5 text-brandOrange" />
              <span className="text-slate-800 dark:text-slate-100">{selectedTotalCal}</span>
              <span className="text-slate-400 font-normal">/ {targetCalories} kcal</span>
            </div>
          </div>
        </div>

        {/* Food List OR No-Data-Found State */}
        {selectedFoods.length > 0 ? (
          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
            {selectedFoods.map((food, idx) => (
              <div 
                key={food.id || idx}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-darkSurface border border-slate-100 dark:border-slate-800/70 text-xs"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-lg bg-orange-500/10 text-brandOrange">
                    <Utensils className="w-3.5 h-3.5" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 dark:text-slate-200">
                      {lang === 'bn' ? (food.nameBn || food.name) : (food.nameEn || food.name)}
                    </p>
                    <span className="text-[10px] text-slate-400">{food.portion || '১ প্লেট'}</span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-bold text-brandOrange">+{food.calories}</span>
                  <span className="text-[10px] text-slate-400 block">kcal</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Sleek No Data Found State */
          <div className="py-6 px-4 text-center rounded-2xl bg-slate-50/70 dark:bg-darkSurface/50 border border-dashed border-slate-200 dark:border-slate-800">
            <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
              <Inbox className="w-5 h-5 stroke-[1.5]" />
            </div>
            <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
              {lang === 'bn' ? 'কোনো তথ্য পাওয়া যায়নি!' : 'No Data Logged!'}
            </p>
            <p className="text-[11px] text-slate-400 mt-1 max-w-[220px] mx-auto leading-relaxed">
              {isSelectedPast
                ? (lang === 'bn' ? 'এই তারিখে কোনো খাবার রেকর্ড করা হয়নি।' : 'No meals or foods were logged on this date.')
                : (lang === 'bn' ? 'এই দিনের কোনো খাবার এখনো রেকর্ড করা হয়নি।' : 'No meals logged yet this day')}
            </p>
          </div>
        )}
      </div>

      {/* 3. Weekly Weight Logger Card */}
      <div className="bg-white dark:bg-darkCard p-4 sm:p-5 rounded-[24px] border border-slate-100 dark:border-slate-800/80 shadow-md">
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

        <form onSubmit={handleAddWeight} className="flex gap-2 mb-3">
          <input
            type="number"
            step="0.1"
            value={loggedWeight}
            onChange={(e) => setLoggedWeight(e.target.value)}
            placeholder={lang === 'bn' ? "আজকের ওজন (কেজি)..." : "Today's weight (kg)..."}
            className="w-full px-3.5 py-2 rounded-xl bg-slate-50 dark:bg-darkSurface border border-slate-200 dark:border-slate-700 text-xs font-medium focus:outline-none focus:border-brandOrange"
          />
          <button
            type="submit"
            className="px-4 py-2 rounded-xl bg-brandOrange text-white text-xs font-semibold active:scale-95 transition shadow-sm shadow-orange-500/20"
          >
            {lang === 'bn' ? 'যোগ' : 'Save'}
          </button>
        </form>

        <div className="space-y-1.5 max-h-28 overflow-y-auto pr-1">
          {weightLogs.map((log, idx) => (
            <div key={idx} className="flex justify-between items-center py-1.5 px-3 rounded-xl bg-slate-50 dark:bg-darkSurface text-xs">
              <span className="text-slate-400">{log.date}</span>
              <span className="font-bold text-slate-900 dark:text-white">{log.weight} kg</span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
} 