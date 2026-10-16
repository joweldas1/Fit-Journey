import { Trash2, Plus } from 'lucide-react';
import FOOD_MASTER_DB from '../utils/food';

export default function DailyCalorieView({ 
  profile, 
  foods = [], 
  onDeleteFood, 
  onOpenAddFood,
  lang = 'bn' 
}) {
  const targetCalories = profile?.dailyCalorieTarget || 2400;
  const consumedCalories = foods.reduce((acc, f) => acc + (f.calories || 0), 0);
  const remaining = Math.max(targetCalories - consumedCalories, 0);

  // Consumed macros
  const consumedProtein = foods.reduce((acc, f) => acc + (f.protein || 0), 0);
  const consumedCarbs = foods.reduce((acc, f) => acc + (f.carbs || 0), 0);
  const consumedFat = foods.reduce((acc, f) => acc + (f.fat || 0), 0);

  const targetProtein = profile?.macros?.protein || 88;
  const targetCarbs = profile?.macros?.carbs || 350;
  const targetFat = profile?.macros?.fat || 70;

  const mealSections = [
    { id: 'breakfast', title: lang === 'bn' ? '🌅 ব্রেকফাস্ট' : '🌅 Breakfast' },
    { id: 'lunch', title: lang === 'bn' ? '☀️ লাঞ্চ' : '☀️ Lunch' },
    { id: 'snacks', title: lang === 'bn' ? '☕ ইভনিং স্ন্যাকস' : '☕ Evening Snacks' },
    { id: 'dinner', title: lang === 'bn' ? '🌙 ডিনার' : '🌙 Dinner' },
  ];

  // Dynamic Language Name Resolver
  const getFoodDisplayName = (item) => {
    if (lang === 'bn' && item.nameBn) return item.nameBn;
    if (lang === 'en' && item.nameEn) return item.nameEn;

    // Ager save kora static item gulo 700 DB theke khuje bilingual kora
    const matched = FOOD_MASTER_DB.find(db => 
      (item.foodId && db.id === item.foodId) ||
      (db.en && db.en.toLowerCase() === (item.name || '').toLowerCase()) ||
      (db.bn && db.bn.toLowerCase() === (item.name || '').toLowerCase())
    );

    if (matched) {
      return lang === 'bn' ? matched.bn : matched.en;
    }

    return item.name;
  };

  // Dynamic Portion Translation
  const getPortionDisplayName = (portionStr) => {
    if (!portionStr) return '';
    if (lang === 'en') return portionStr;
    return portionStr
      .replace(/plate/gi, 'প্লেট')
      .replace(/pcs|pc/gi, 'টি')
      .replace(/cup|bowl/gi, 'বাটি')
      .replace(/glass/gi, 'গ্লাস')
      .replace(/slice/gi, 'টুকরা');
  };

  return (
    <div className="space-y-4 animate-in fade-in duration-300">
      
      {/* Top Target Overview Card */}
      <div className="bg-white dark:bg-darkCard p-5 rounded-[28px] border border-slate-200 dark:border-slate-800 shadow-[0_2px_12px_rgba(0,0,0,0.04)]">
        <div className="flex justify-between items-center mb-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'আজকের ক্যালোরি সারসংক্ষেপ' : 'Today’s Calorie Summary'}
            </h2>
            <p className="text-xs font-semibold text-slate-600 dark:text-slate-400">
              {lang === 'bn' ? `টার্গেট: ${targetCalories} kcal` : `Target: ${targetCalories} kcal`}
            </p>
          </div>
          <button
            onClick={onOpenAddFood}
            className="p-2.5 rounded-2xl bg-gradient-to-r from-brandOrange to-orange-500 text-white text-xs font-bold flex items-center gap-1 shadow-md shadow-orange-500/25 active:scale-95 transition"
          >
            <Plus className="w-4 h-4 stroke-[3]" />
            <span>{lang === 'bn' ? 'খাবার যোগ' : 'Add Food'}</span>
          </button>
        </div>

        {/* Live Calorie Split */}
        <div className="grid grid-cols-2 gap-3 p-4 rounded-2xl bg-slate-100/70 dark:bg-darkSurface border border-slate-200 dark:border-slate-800/80 mb-4 text-center">
          <div>
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-black tracking-wider">
              {lang === 'bn' ? 'খাওয়া হয়েছে' : 'Consumed'}
            </span>
            <p className="text-2xl font-black text-orange-600 dark:text-brandOrange">{consumedCalories} <span className="text-xs font-semibold">kcal</span></p>
          </div>
          <div className="border-l border-slate-200 dark:border-slate-800">
            <span className="text-[10px] text-slate-600 dark:text-slate-400 uppercase font-black tracking-wider">
              {lang === 'bn' ? 'টার্গেট বাকি' : 'Remaining'}
            </span>
            <p className="text-2xl font-black text-slate-900 dark:text-slate-200">{remaining} <span className="text-xs font-semibold">kcal</span></p>
          </div>
        </div>

        {/* Macro Progress Bars */}
        <div className="space-y-2.5">
          {/* Protein */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-teal-600 dark:text-macroProtein font-extrabold">{lang === 'bn' ? 'প্রোটিন' : 'Protein'}</span>
              <span className="text-slate-600 dark:text-slate-400">{consumedProtein}g / {targetProtein}g</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-teal-500 dark:bg-macroProtein transition-all duration-500" 
                style={{ width: `${Math.min((consumedProtein / targetProtein) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Carbs */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-sky-600 dark:text-macroCarb font-extrabold">{lang === 'bn' ? 'কার্বস' : 'Carbs'}</span>
              <span className="text-slate-600 dark:text-slate-400">{consumedCarbs}g / {targetCarbs}g</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-sky-500 dark:bg-macroCarb transition-all duration-500" 
                style={{ width: `${Math.min((consumedCarbs / targetCarbs) * 100, 100)}%` }}
              />
            </div>
          </div>

          {/* Fat */}
          <div>
            <div className="flex justify-between text-xs font-bold mb-1">
              <span className="text-amber-600 dark:text-macroFat font-extrabold">{lang === 'bn' ? 'ফ্যাট' : 'Fat'}</span>
              <span className="text-slate-600 dark:text-slate-400">{consumedFat}g / {targetFat}g</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden">
              <div 
                className="h-full rounded-full bg-amber-500 dark:bg-macroFat transition-all duration-500" 
                style={{ width: `${Math.min((consumedFat / targetFat) * 100, 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Food List */}
      <div className="space-y-3">
        {mealSections.map((sec) => {
          const items = foods.filter(f => f.mealType === sec.id);
          const mealTotal = items.reduce((acc, i) => acc + (i.calories || 0), 0);

          return (
            <div key={sec.id} className="bg-white dark:bg-darkCard p-4 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-[0_2px_8px_rgba(0,0,0,0.03)]">
              <div className="flex justify-between items-center mb-2 pb-1.5 border-b border-slate-200 dark:border-slate-800/80">
                <span className="text-xs font-extrabold text-slate-900 dark:text-slate-200">{sec.title}</span>
                <span className="text-xs font-black text-orange-600 dark:text-brandOrange">{mealTotal} kcal</span>
              </div>

              {items.length === 0 ? (
                <p className="text-[11px] text-slate-500 dark:text-slate-400 py-1.5 font-medium">
                  {lang === 'bn' ? 'এই সময়ে এখনো কোনো খাবার যোগ করা হয়নি' : 'No food logged for this meal'}
                </p>
              ) : (
                <div className="space-y-2">
                  {items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center p-2.5 rounded-xl bg-slate-50 dark:bg-darkSurface border border-slate-200/80 dark:border-slate-800">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                          {getFoodDisplayName(item)}
                        </h4>
                        <p className="text-[10.5px] font-medium text-slate-600 dark:text-slate-400">
                          {getPortionDisplayName(item.portion)} • P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900 dark:text-slate-200">+{item.calories}</span>
                        <button
                          onClick={() => onDeleteFood(item.id || idx)}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-500 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

    </div>
  );
}