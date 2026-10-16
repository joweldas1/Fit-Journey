import { useState, useEffect, useRef } from 'react';
import { X, Sparkles, Loader2, Utensils, Check, ArrowRight, ListPlus, Flame, Mic, MicOff, Camera, Image as ImageIcon, Trash2 } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { toast } from 'sonner';
import { analyzeFoodWithAI, analyzeFoodImageWithAI, compressImage } from '../utils/gemini';
import FOOD_MASTER_DB from '../utils/food';

// Default Fallback jodi user notun hoy ba kono history na thake
const DEFAULT_QUICK_FOODS = [
  { label: "কলা", text: "পাকা কলা" },
  { label: "বাটি চিড়া", text: "চিড়া" },
  { label: "+ছোলা ও চীনাবাদাম", text: "চিনাবাদাম" },
  { label: "+সিদ্ধ ডিম", text: "ডিম কারি" },
  { label: "+ভাত ও ডাল", text: "ডাল ভাত" },
];

export default function AddFoodModal({ isOpen, onClose, onAddFood, lang = 'bn' }) {
  const [foodQuery, setFoodQuery] = useState('');
  const { isListening, isSupported, startListening, stopListening } = useVoiceInput({
    lang,
    onTranscript: (spokenText) => {
      setFoodQuery(spokenText);
      handleAIAnalyze(spokenText);
    }
  });
  const [selectedMeal, setSelectedMeal] = useState('breakfast');
  const [loading, setLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);
  const [relevantItems, setRelevantItems] = useState([]);
  
  const [selectedImage, setSelectedImage] = useState(null);
  const [analyzingImage, setAnalyzingImage] = useState(false);
  const fileInputRef = useRef(null);

  const [suggestions, setSuggestions] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  // Dynamic Frequent Foods State
  const [quickFoods, setQuickFoods] = useState(DEFAULT_QUICK_FOODS);
  const [hasFrequentHistory, setHasFrequentHistory] = useState(false);

  // Load User's Most Logged Foods from localStorage
  useEffect(() => {
    if (isOpen) {
      try {
        const freqMap = JSON.parse(localStorage.getItem('fit_food_frequency') || '{}');
        const sortedFrequent = Object.entries(freqMap)
          .sort((a, b) => b[1] - a[1])
          .slice(0, 5)
          .map(([name]) => ({
            label: `+${name}`,
            text: name,
            isUserFrequent: true
          }));

        if (sortedFrequent.length > 0) {
          setHasFrequentHistory(true);
          const remaining = DEFAULT_QUICK_FOODS.filter(
            def => !sortedFrequent.some(s => s.text === def.text)
          );
          setQuickFoods([...sortedFrequent, ...remaining].slice(0, 5));
        } else {
          setHasFrequentHistory(false);
          setQuickFoods(DEFAULT_QUICK_FOODS);
        }
      } catch {
        setQuickFoods(DEFAULT_QUICK_FOODS);
      }
    }
  }, [isOpen]);

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
    } catch (err) {
      // Direct dynamic error message from gemini.js
      const errorMsg = err.message || (lang === 'bn' ? 'আপনার খাবারটি পাওয়া যায় নি' : 'Your food was not found');
      toast.error(errorMsg);
      setAiPreview(null);
      setRelevantItems([]);
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
      source: 'local_database'
    });
    setRelevantItems([]);
  };

  const handleImageFileSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      setAnalyzingImage(true);
      setAiPreview(null);
      setRelevantItems([]);

      // 1. Instant client-side compression (converts multi-MB phone photo into ~100KB payload)
      const compressed = await compressImage(file, 1024, 0.82);
      setSelectedImage(compressed);

      // 2. Multimodal AI Analysis with Gemini Vision
      const res = await analyzeFoodImageWithAI(compressed, lang);
      if (res?.data) {
        setAiPreview(res.data);
        toast.success(lang === 'bn' ? 'ছবি থেকে খাবার ও ক্যালোরি শনাক্ত হয়েছে!' : 'Meal & calories detected from photo!');
      }
    } catch (err) {
      toast.error(err.message || (lang === 'bn' ? 'ছবি বিশ্লেষণ করা যায়নি' : 'Failed to analyze photo'));
    } finally {
      setLoading(false);
      setAnalyzingImage(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleClearImage = () => {
    setSelectedImage(null);
    setAiPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Khabar add korar shathe shathe tar frequency increment kora
  const handleConfirmAdd = () => {
    if (!aiPreview) return;
    
    try {
      const freqMap = JSON.parse(localStorage.getItem('fit_food_frequency') || '{}');
      const baseFoodName = aiPreview.name.trim();
      freqMap[baseFoodName] = (freqMap[baseFoodName] || 0) + 1;
      localStorage.setItem('fit_food_frequency', JSON.stringify(freqMap));
    } catch (e) {
      console.warn("Could not save frequency", e);
    }

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
    setSelectedImage(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#161F33] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-500/10 text-brandOrange">
              <Utensils className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'খাবার যোগ করুন (Smart Search)' : 'Add Food (Smart Search)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Meal Category */}
        <div className="my-4">
          <label className="text-[11px] font-bold text-slate-600 dark:text-slate-400 block mb-2">
            {lang === 'bn' ? 'মিলের সময় নির্বাচন করুন:' : 'Select Meal Time:'}
          </label>
          <div className="grid grid-cols-4 gap-1.5 text-xs font-semibold">
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
                    ? 'bg-brandOrange text-white shadow-md shadow-orange-500/20 font-bold'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-transparent'
                }`}
              >
                {lang === 'bn' ? m.bn : m.en}
              </button>
            ))}
          </div>
        </div>

        {/* Hidden Camera & Gallery File Input */}
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleImageFileSelect}
          className="hidden"
        />

        {/* Snap Meal Photo Quick Action Banner */}
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={loading}
          className="w-full mb-3.5 flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-orange-500/5 hover:from-orange-500/15 hover:to-amber-500/10 border border-orange-500/30 text-left transition active:scale-[0.98] group cursor-pointer shadow-xs"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-brandOrange/15 border border-orange-500/25 flex items-center justify-center text-brandOrange group-hover:scale-105 transition shrink-0">
              <Camera className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div className="min-w-0">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5 truncate">
                <span>{lang === 'bn' ? 'প্লেটের ছবি তুলে ক্যালোরি মাপুন' : 'Snap Meal Photo & Count Calories'}</span>
                <span className="text-[9px] px-1.5 py-0.2 rounded-full bg-brandOrange text-white font-extrabold uppercase shrink-0">AI Vision</span>
              </h4>
              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 font-medium truncate">
                {lang === 'bn' ? 'ছবি দেখেই এআই প্রতিটি খাবার ও ক্যালোরি বের করবে' : 'Gemini AI detects food items, portions & calories from photo'}
              </p>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-brandOrange group-hover:translate-x-0.5 transition shrink-0 ml-1" />
        </button>

        {/* Selected Image Status & Thumbnail */}
        {selectedImage && (
          <div className="relative mb-3.5 p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 flex items-center gap-3 animate-in fade-in duration-200">
            <div className="w-14 h-14 rounded-xl overflow-hidden bg-slate-200 shrink-0 border border-slate-300 dark:border-slate-700 relative shadow-xs">
              <img src={selectedImage.dataUrl} alt="Meal Preview" className="w-full h-full object-cover" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {analyzingImage 
                  ? (lang === 'bn' ? 'লিও ছবি বিশ্লেষণ করছে...' : 'Leo is analyzing your plate...') 
                  : (aiPreview?.name || (lang === 'bn' ? 'খাবারের ছবি প্রস্তুত' : 'Meal photo ready'))}
              </p>
              <p className="text-[10.5px] text-slate-600 dark:text-slate-400 font-medium truncate">
                {analyzingImage 
                  ? (lang === 'bn' ? 'প্লেটের খাবার ও ক্যালোরি পরিমাপ করা হচ্ছে' : 'Detecting foods & calculating calories')
                  : (lang === 'bn' ? 'সফলভাবে বিশ্লেষণ সম্পন্ন হয়েছে' : 'Analysis complete')}
              </p>
            </div>
            {!loading && (
              <button
                type="button"
                onClick={handleClearImage}
                className="p-1.5 rounded-xl text-slate-400 hover:text-rose-500 hover:bg-rose-500/10 transition shrink-0"
                title="Remove photo"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

        {/* Leo Listening Speech Bubble */}
        {isListening && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-xs font-bold text-brandOrange animate-pulse">
            <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-orange-500/40">
              <img src="/leo.svg" alt="Leo" className="w-full h-full object-cover object-top" />
            </div>
            <span>{lang === 'bn' ? 'লিও শুনছে... আপনার খাবারের নাম বলুন...' : 'Leo is listening... say your food item...'}</span>
          </div>
        )}

        {/* Input Bar */}
        <div className="relative mb-3" ref={dropdownRef}>
          <input
            type="text"
            value={foodQuery}
            onChange={handleInputChange}
            onKeyDown={(e) => e.key === 'Enter' && handleAIAnalyze()}
            placeholder={lang === 'bn' ? "খাবারের নাম লিখুন বা মাইকে বলুন..." : "Type food or tap mic to speak..."}
            className="w-full px-4 py-3.5 pr-40 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-sm focus:border-brandOrange focus:outline-none"
          />

          <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
            {/* Camera / Photo Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={loading}
              title={lang === 'bn' ? 'ক্যামেরা দিয়ে ছবি তুলুন বা গ্যালারি থেকে নিন' : 'Take or upload food photo'}
              className="p-2 rounded-xl bg-slate-100 hover:bg-orange-500/10 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:text-brandOrange border border-slate-200 dark:border-slate-700 hover:border-brandOrange transition active:scale-95 flex items-center justify-center cursor-pointer"
            >
              <Camera className="w-3.5 h-3.5" />
            </button>

            {isSupported && (
              <button
                type="button"
                onClick={() => (isListening ? stopListening() : startListening())}
                title={isListening ? 'Stop listening' : 'Voice Input (Leo)'}
                className={`p-2 rounded-xl border flex items-center justify-center transition active:scale-95 ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-md shadow-rose-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-brandOrange hover:border-brandOrange'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleAIAnalyze()}
              disabled={loading}
              className="px-3 py-1.5 h-full rounded-xl bg-brandOrange text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{lang === 'bn' ? 'যাচাই' : 'Analyze'}</span>
            </button>
          </div>

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

        {/* Dynamic Frequent / Most Used Food Badges */}
        <div className="mb-5">
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-2">
            <Flame className="w-3 h-3 text-brandOrange" />
            <span>
              {hasFrequentHistory 
                ? (lang === 'bn' ? 'আপনার সচরাচর খাওয়া খাবার (Frequent):' : 'Your Frequent Foods:')
                : (lang === 'bn' ? 'দ্রুত নির্বাচনের পরামর্শ:' : 'Quick Suggestions:')}
            </span>
          </div>
          
          <div className="flex flex-wrap gap-1.5">
            {quickFoods.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setFoodQuery(q.text);
                  handleAIAnalyze(q.text);
                }}
                className={`text-[11px] px-2.5 py-1.5 rounded-full border transition flex items-center gap-1 ${
                  q.isUserFrequent 
                    ? 'bg-orange-500/10 text-brandOrange border-orange-500/30 hover:bg-orange-500/20 font-medium'
                    : 'bg-slate-100 dark:bg-slate-800/60 hover:text-brandOrange text-slate-600 dark:text-slate-300 border-slate-200/60 dark:border-slate-700/60'
                }`}
              >
                {q.label}
              </button>
            ))}
          </div>
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
            {/* If analyzed from photo, show preview photo thumbnail */}
            {aiPreview.photoUrl && (
              <div className="mb-3 rounded-xl overflow-hidden max-h-40 w-full border border-orange-500/20 shadow-xs">
                <img src={aiPreview.photoUrl} alt="Analyzed Meal" className="w-full h-full object-cover" />
              </div>
            )}

            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{aiPreview.name}</h4>
                <p className="text-[11px] text-slate-600 dark:text-slate-400 font-medium">{aiPreview.portion}</p>
              </div>
              <span className="text-base font-extrabold text-brandOrange">
                +{aiPreview.calories} <span className="text-xs font-normal">kcal</span>
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 pt-2 border-t border-orange-500/20 text-center">
              <div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase">{lang === 'bn' ? 'প্রোটিন' : 'Protein'}</span>
                <p className="text-xs font-bold text-teal-600 dark:text-teal-400">{aiPreview.protein}g</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase">{lang === 'bn' ? 'কার্বস' : 'Carbs'}</span>
                <p className="text-xs font-bold text-sky-600 dark:text-sky-400">{aiPreview.carbs}g</p>
              </div>
              <div>
                <span className="text-[10px] text-slate-600 dark:text-slate-400 font-bold uppercase">{lang === 'bn' ? 'ফ্যাট' : 'Fat'}</span>
                <p className="text-xs font-bold text-amber-600 dark:text-amber-400">{aiPreview.fat}g</p>
              </div>
            </div>

            {/* Detected sub-items on plate if multiple foods present */}
            {aiPreview.items && aiPreview.items.length > 0 && (
              <div className="mt-3 pt-2.5 border-t border-orange-500/20 space-y-1.5">
                <span className="text-[10px] font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider block">
                  {lang === 'bn' ? 'প্লেটে শনাক্তকৃত খাবারসমূহ:' : 'Detected items on plate:'}
                </span>
                {aiPreview.items.map((it, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs py-0.5">
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {it.name} <span className="text-[10px] text-slate-500 font-normal">({it.portion})</span>
                    </span>
                    <span className="font-bold text-brandOrange">+{it.calories} kcal</span>
                  </div>
                ))}
              </div>
            )}

            {/* AI Advice */}
            {aiPreview.advice && (
              <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-brandOrange font-semibold">
                💡 {aiPreview.advice}
              </div>
            )}

            {/* Clean Single Line Source Badge */}
            <div className="mt-3.5 px-3 py-2 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] font-medium text-brandOrange flex items-center gap-2">
              <Sparkles className="w-3.5 h-3.5 flex-shrink-0 text-brandOrange" />
              <span>
                {aiPreview.source === 'gemini_vision'
                  ? (lang === 'bn' ? 'Leo AI ভিশন দিয়ে ছবি থেকে স্বয়ংক্রিয় পরিমাপকৃত' : 'Measured from photo via Leo AI Vision')
                  : (lang === 'bn' ? 'Leo AI লাইভ পুষ্টি বিশ্লেষণ (AI Analyzed Nutrition)' : 'Leo AI Verified Nutrition')}
              </span>
            </div>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={handleConfirmAdd}
              className="w-full mt-3.5 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition cursor-pointer"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{lang === 'bn' ? 'তালিকায় যোগ করুন' : 'Confirm & Log Food'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}