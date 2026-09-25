import { useState, useEffect } from 'react';
import { X, Sparkles, Plus, Loader2, Utensils, Check } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeFoodWithAI } from '../utils/gemini';

const QUICK_FOODS = [
  { label: "+২টি কলা", text: "২টি সাগর কলা" },
  { label: "+১ বাটি চিড়া", text: "১ বাটি চিড়া ও গুড়" },
  { label: "+ছোলা ও চীনাবাদাম", text: "৫০ গ্রাম ভেজানো ছোলা ও চীনাবাদাম" },
  { label: "+২টি সিদ্ধ ডিম", text: "২টি সিদ্ধ ডিম" },
  { label: "+ভাত ও ঘন ডাল", text: "১ প্লেট ভাত সাথে ১ বাটি ঘন ডাল" },
];

export default function AddFoodModal({ isOpen, onClose, onAddFood, lang = 'bn' }) {
  const [foodQuery, setFoodQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [loading, setLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);

  // Time-based auto-detection of meal
  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 11) setSelectedMeal('breakfast');
    else if (currentHour >= 11 && currentHour < 16) setSelectedMeal('lunch');
    else if (currentHour >= 16 && currentHour < 19) setSelectedMeal('snacks');
    else setSelectedMeal('dinner');
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAIAnalyze = async (queryText) => {
    const query = queryText || foodQuery;
    if (!query.trim()) {
      toast.warning(lang === 'bn' ? 'খাবারের নাম বা বিবরণ লিখুন' : 'Please enter food details');
      return;
    }
    setLoading(true);
    setAiPreview(null);
    try {
      const data = await analyzeFoodWithAI(query);
      setAiPreview(data);
    } catch {
      toast.error('AI বিশ্লেষণ করতে ব্যর্থ হয়েছে, আবার চেষ্টা করুন');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickAdd = (text) => {
    setFoodQuery(text);
    handleAIAnalyze(text);
  };

  const handleConfirmAdd = () => {
    if (!aiPreview) return;
    onAddFood({
      ...aiPreview,
      mealType: selectedMeal,
      timestamp: new Date().toISOString()
    });
    toast.success(`${aiPreview.name} যোগ করা হয়েছে!`);
    onClose();
    setFoodQuery('');
    setAiPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#161F33] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-brandOrange">
              <Utensils className="w-4 h-4" />
            </div>
            <h3 className="text-base font-semibold">
              {lang === 'bn' ? 'খাবার যোগ করুন (Smart AI)' : 'Add Food (Smart AI)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meal Category Time-Window Selector */}
        <div className="my-4">
          <label className="text-[11px] font-medium text-slate-400 block mb-2">
            {lang === 'bn' ? 'মিলের সময় নির্বাচন করুন:' : 'Select Meal Time:'}
          </label>
          <div className="grid grid-cols-4 gap-1.5 text-xs font-medium">
            {[
              { id: 'breakfast', bn: 'ব্রেকফাস্ট', en: 'Breakfast' },
              { id: 'lunch', bn: 'লাঞ্চ', en: 'Lunch' },
              { id: 'snacks', bn: 'স্ন্যাকস', en: 'Snacks' },
              { id: 'dinner', bn: 'ডিনার', en: 'Dinner' }
            ].map(m => (
              <button
                key={m.id}
                type="button"
                onClick={() => setSelectedMeal(m.id)}
                className={`py-2 px-1 rounded-xl text-center transition ${
                  selectedMeal === m.id
                    ? 'bg-brandOrange text-white shadow-md shadow-orange-500/20 font-semibold'
                    : 'bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300'
                }`}
              >
                {lang === 'bn' ? m.bn : m.en}
              </button>
            ))}
          </div>
        </div>

        {/* AI Food Input Search Bar */}
        <div className="relative mb-3">
          <input
            type="text"
            value={foodQuery}
            onChange={(e) => setFoodQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAIAnalyze()}
            placeholder={lang === 'bn' ? "যেমন: ২টা কলা ও ১ বাটি চিড়া..." : "e.g. 2 eggs and 1 bowl rice..."}
            className="w-full px-4 py-3.5 pr-24 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-sm focus:border-brandOrange focus:outline-none"
          />
          <button
            type="button"
            onClick={() => handleAIAnalyze()}
            disabled={loading}
            className="absolute right-2 top-2 bottom-2 px-3 rounded-xl bg-brandOrange text-white text-xs font-medium flex items-center gap-1 active:scale-95 transition disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            <span>{lang === 'bn' ? 'হিসাব' : 'Analyze'}</span>
          </button>
        </div>

        {/* Quick Shortcut Badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {QUICK_FOODS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleQuickAdd(q.text)}
              className="text-[11px] px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 hover:bg-orange-500/10 hover:text-brandOrange text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* AI Nutrition Result Card */}
        {aiPreview && (
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25 mb-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{aiPreview.name}</h4>
                <p className="text-[11px] text-slate-400">{aiPreview.portion}</p>
              </div>
              <span className="text-base font-extrabold text-brandOrange">
                +{aiPreview.calories} <span className="text-xs font-normal">kcal</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-orange-500/20 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase">প্রোটিন</span>
                <p className="text-xs font-bold text-teal-500">{aiPreview.protein}g</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">কার্বস</span>
                <p className="text-xs font-bold text-sky-400">{aiPreview.carbs}g</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase">ফ্যাট</span>
                <p className="text-xs font-bold text-amber-400">{aiPreview.fat}g</p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleConfirmAdd}
              className="w-full mt-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'bn' ? 'তালিকায় যোগ করুন' : 'Confirm & Log Food'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}