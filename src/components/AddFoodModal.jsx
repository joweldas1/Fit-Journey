import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Loader2, Utensils, Check, ArrowRight, ListPlus, Bot, Database } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeFoodWithAI } from '../utils/gemini';
import FOOD_MASTER_DB from '../utils/food';

const QUICK_FOODS = [
  { label: "+২টি কলা", text: "পাকা কলা" },
  { label: "+১ বাটি চিড়া", text: "চিড়া" },
  { label: "+ছোলা ও চীনাবাদাম", text: "চিনাবাদাম" },
  { label: "+সিদ্ধ ডিম", text: "ডিম কারি" },
  { label: "+ভাত ও ডাল", text: "ডাল ভাত" },
];

export default function AddFoodModal({ isOpen, onClose, onAddFood, lang = 'bn' }) {
  const [foodQuery, setFoodQuery] = useState('');
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [loading, setLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [relevantItems, setRelevantItems] = useState([]);
  
  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const currentHour = new Date().getHours();
    if (currentHour >= 5 && currentHour < 11) setSelectedMeal('breakfast');
    else if (currentHour >= 11 && currentHour < 16) setSelectedMeal('lunch');
    else if (currentHour >= 16 && currentHour < 19) setSelectedMeal('snacks');
    else setSelectedMeal('dinner');
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  if (!isOpen) return null;

  const handleInputChange = (e) => {
    const val = e.target.value;
    setFoodQuery(val);
    setRelevantItems([]);

    if (val.trim().length >= 1) {
      const keyword = val.toLowerCase().trim();
      const filtered = FOOD_MASTER_DB.filter(item => 
        item.bn.toLowerCase().includes(keyword) || 
        item.en.toLowerCase().includes(keyword)
      ).slice(0, 8);

      setSuggestions(filtered);
      setShowDropdown(true);
    } else {
      setSuggestions([]);
      setShowDropdown(false);
    }
  };

  const handleSelectSuggestion = (item) => {
    const queryText = lang === 'bn' ? item.bn : item.en;
    setFoodQuery(queryText);
    setShowDropdown(false);
    handleAIAnalyze(queryText);
  };

  const handleAIAnalyze = async (queryText) => {
    const query = queryText || foodQuery;
    if (!query.trim()) {
      toast.warning(lang === 'bn' ? 'খাবারের নাম লিখুন' : 'Please enter food name');
      return;
    }
    setLoading(true);
    setAiPreview(null);
    setRelevantItems([]);
    setShowDropdown(false);

    try {
      const res = await analyzeFoodWithAI(query, lang);
      if (res.type === 'SINGLE_MATCH') {
        setAiPreview(res.data);
      } else if (res.type === 'MULTIPLE_SUGGESTIONS') {
        setRelevantItems(res.items);
      }
    } catch {
      toast.error('হিসাব করতে সমস্যা হয়েছে, অনুগ্রহ করে ড্রপডাউন থেকে সিলেক্ট করুন');
    } finally {
      setLoading(false);
    }
  };

  const handlePickRelevantFood = (item) => {
    setAiPreview({
      name: item.displayName || item.bn,
      calories: item.calories || item.cal,
      protein: item.protein || item.p,
      carbs: item.carbs || item.c,
      fat: item.fat || item.f,
      portion: item.portion || item.unit,
      aiTip: lang === 'bn' 
        ? "আমাদের ৭০০+ ফুড ডাটাবেস থেকে ভেরিফায়েড পুষ্টিমান লোড হয়েছে।" 
        : "Verified nutrition loaded from 700+ database.",
      source: 'local_database'
    });
    setRelevantItems([]);
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
    setRelevantItems([]);
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
              {lang === 'bn' ? 'খাবার যোগ করুন (Smart Search)' : 'Add Food (Smart Search)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meal Category */}
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

        {/* Input Bar */}
        <div className="relative mb-3" ref={dropdownRef}>
          <input
            type="text"
            value={foodQuery}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleAIAnalyze()}
            placeholder={lang === 'bn' ? "যেমন: ডাল ভাত, ১টি কলা, ২টি সিদ্ধ ডিম..." : "e.g. rice, banana, egg..."}
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

          {/* Suggestions Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <ul className="absolute left-0 right-0 mt-1 max-h-56 overflow-y-auto bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 divide-y divide-slate-100 dark:divide-slate-800">
              {suggestions.map((item) => (
                <li
                  key={item.id}
                  onClick={() => handleSelectSuggestion(item)}
                  className="px-4 py-2.5 text-xs flex items-center justify-between hover:bg-orange-500/10 dark:hover:bg-slate-800 cursor-pointer transition"
                >
                  <span className="font-medium text-slate-800 dark:text-slate-200">
                    {lang === 'en' ? item.en : item.bn}
                  </span>
                  <span className="text-brandOrange font-bold">
                    {item.cal} kcal <span className="text-[10px] text-slate-400 font-normal">/ {item.unit}</span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Quick Badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {QUICK_FOODS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setFoodQuery(q.text);
                handleAIAnalyze(q.text);
              }}
              className="text-[11px] px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 hover:text-brandOrange text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition"
            >
              {q.label}
            </button>
          ))}
        </div>

        {/* Relevant Food Matches */}
        {relevantItems.length > 0 && (
          <div className="mb-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 animate-in fade-in duration-200">
            <div className="flex items-center gap-1.5 text-xs font-bold text-brandOrange mb-2.5">
              <ListPlus className="w-4 h-4" />
              <span>{lang === 'bn' ? 'প্রাসঙ্গিক খাবারগুলো থেকে বেছে নিন:' : 'Choose from relevant matches:'}</span>
            </div>
            <div className="space-y-2">
              {relevantItems.map((rel, idx) => (
                <div
                  key={idx}
                  onClick={() => handlePickRelevantFood(rel)}
                  className="p-2.5 rounded-xl bg-white dark:bg-slate-800/90 border border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between hover:border-brandOrange cursor-pointer active:scale-98 transition shadow-sm"
                >
                  <div>
                    <h5 className="text-xs font-bold text-slate-800 dark:text-slate-200">{rel.displayName}</h5>
                    <p className="text-[10px] text-slate-400">{rel.portion} • P: {rel.protein}g | C: {rel.carbs}g</p>
                  </div>
                  <div className="flex items-center gap-1.5 text-brandOrange text-xs font-bold">
                    <span>+{rel.calories} kcal</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Nutrition Preview Card */}
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
{/* Clean Single Line Source Badge */}
<div className="mt-3.5 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] font-medium text-brandOrange flex items-center gap-2">
  {aiPreview.source === 'live_analyzed' ? (
    <>
      <Activity className="w-3.5 h-3.5 flex-shrink-0 text-brandOrange" />
      <span>{lang === 'bn' ? 'লাইভ পুষ্টি বিশ্লেষণ (Live Analyzed Nutrition Value)' : 'Live Analyzed Nutrition Value'}</span>
    </>
  ) : (
    <>
      <Database className="w-3.5 h-3.5 flex-shrink-0 text-brandOrange" />
      <span>{lang === 'bn' ? 'ভেরিফায়েড পুষ্টি ডাটাবেস থেকে প্রাপ্ত' : 'Verified Food Database Record'}</span>
    </>
  )}
</div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirmAdd}
              className="w-full mt-3.5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
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