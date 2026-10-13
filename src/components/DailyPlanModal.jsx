import { useState } from 'react';
import { X, Sparkles, Loader2, Check, Calendar, Flame, Lightbulb } from 'lucide-react';
import { toast } from 'sonner';
import { analyzeDailyCaloriePlanWithAI } from '../utils/gemini';

const EXAMPLE_PLANS = {
  bn: [
    { label: "সুষম দেশীয় মিল", text: "সকালে ২টি সেদ্ধ ডিম ও ১টি কলা, দুপুরে ১ প্লেট ভাত, ডাল ও রুই মাছ, বিকেলে একমুঠো বাদাম, রাতে ওটস বা রুটি-সবজি।" },
    { label: "হাই-প্রোটিন ডায়েট", text: "সকালে ওটস ও ৩টি ডিমের অমলেট, দুপুরে ভাত ও ১৫০ গ্রাম চিকেন ব্রেস্ট ও সালাদ, বিকেলে ছোলা-বাদাম, রাতে মাছ ও সবজি।" },
    { label: "হালকা ওজন নিয়ন্ত্রণ", text: "সকালে ১টি আপেল ও গ্রিন টি, দুপুরে ২টি রুটি ও সবজি-ডাল, বিকেলে শসা ও পেয়ারা, রাতে হালকা স্যুপ ও ১টি ডিম।" }
  ],
  en: [
    { label: "Balanced Daily", text: "Morning: 2 boiled eggs and 1 banana. Noon: 1 plate rice with lentils and fish. Evening: handful of almonds. Night: oats or vegetable roti." },
    { label: "High Protein", text: "Breakfast: oatmeal with 3 eggs. Lunch: rice with 150g grilled chicken and salad. Snacks: chickpeas and nuts. Dinner: fish and broccoli." },
    { label: "Light Healthy", text: "Breakfast: fruit salad and green tea. Lunch: 2 whole wheat rotis with mixed veg curry. Evening: cucumber. Dinner: clear chicken soup." }
  ]
};

export default function DailyPlanModal({
  isOpen,
  onClose,
  onApplyPlan,
  lang = 'bn',
  initialPlan = null
}) {
  const isBn = lang === 'bn';
  const [planText, setPlanText] = useState(initialPlan?.rawPlanText || '');
  const [loading, setLoading] = useState(false);
  const [analyzedPlan, setAnalyzedPlan] = useState(initialPlan || null);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    if (!planText.trim()) {
      toast.warning(isBn ? 'আপনার সারাদিনের খাবারের পরিকল্পনাটি লিখুন' : 'Please describe your meals for today');
      return;
    }

    setLoading(true);
    setAnalyzedPlan(null);

    try {
      const result = await analyzeDailyCaloriePlanWithAI(planText, lang);
      setAnalyzedPlan(result);
      toast.success(isBn ? 'এআই আপনার দৈনিক পরিকল্পনা সফলভাবে তৈরি করেছে!' : 'AI has analyzed your meal plan!');
    } catch (err) {
      toast.error(err.message || (isBn ? 'পরিকল্পনা হিসাব করতে ব্যর্থ হয়েছে' : 'Failed to analyze meal plan'));
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!analyzedPlan) return;
    onApplyPlan(analyzedPlan);
    toast.success(isBn ? 'আজকের ক্যালোরি লক্ষ্যমাত্রা সফলভাবে সেট হয়েছে!' : "Today's calorie target successfully updated!");
    onClose();
  };

  const examples = EXAMPLE_PLANS[lang] || EXAMPLE_PLANS.bn;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white dark:bg-[#151D2E] rounded-t-[32px] sm:rounded-3xl p-5 sm:p-6 shadow-2xl border border-slate-200/80 dark:border-slate-800 text-slate-800 dark:text-slate-100 max-h-[92vh] overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-orange-500/10 text-brandOrange border border-orange-500/20">
              <Calendar className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                <span>{isBn ? 'আজকের ডায়েট ও ক্যালোরি পরিকল্পনা' : "Today's Calorie & Meal Plan"}</span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-500/15 text-brandOrange font-bold">
                  AI Smart
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                {isBn ? 'সারাদিন কী কী খাওয়ার ইচ্ছা আছে ফ্রিমুক্তভাবে লিখুন' : 'Describe your planned meals in your own words'}
              </p>
            </div>
          </div>
          <button 
            onClick={onClose} 
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Example Presets */}
        <div className="my-3">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">
            {isBn ? 'উদাহরণ ট্যাপ করে শুরু করুন:' : 'Tap an example to begin:'}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {examples.map((ex, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setPlanText(ex.text)}
                className="text-[11px] px-2.5 py-1 rounded-full bg-slate-100 hover:bg-orange-500/10 hover:text-brandOrange dark:bg-slate-800/70 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition"
              >
                + {ex.label}
              </button>
            ))}
          </div>
        </div>

        {/* Text Input Area */}
        <div className="mb-4">
          <textarea
            value={planText}
            onChange={(e) => setPlanText(e.target.value)}
            rows={3}
            placeholder={isBn 
              ? "যেমন: সকালে ২টি ডিম ও কলা, দুপুরে ১ প্লেট ভাত ও ডাল-মুরগি, বিকেলে বাদাম, রাতে ওটস..." 
              : "e.g. morning 2 eggs & toast, noon rice & chicken breast, evening green tea & almonds, night oats..."}
            className="w-full p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/70 border border-slate-300 dark:border-slate-700 text-xs sm:text-sm font-medium focus:border-brandOrange focus:outline-none transition resize-none leading-relaxed"
          />

          <button
            type="button"
            onClick={handleAnalyze}
            disabled={loading}
            className="w-full mt-2 py-3 rounded-xl bg-gradient-to-r from-brandOrange to-orange-500 hover:from-orange-500 hover:to-brandOrange text-white text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-orange-500/25 active:scale-[0.98] transition disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isBn ? 'AI ক্যালোরি হিসাব করছে...' : 'AI Analyzing Daily Target...'}</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>{isBn ? 'AI দিয়ে টার্গেট ও মিল হিসাব করুন' : 'Extract Target with AI'}</span>
              </>
            )}
          </button>
        </div>

        {/* AI Analyzed Results Card */}
        {analyzedPlan && (
          <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/25 mb-4 animate-in fade-in zoom-in-95">
            {/* Target Display */}
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-orange-500/20">
              <div>
                <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                  {isBn ? 'আজকের প্রস্তাবিত ক্যালোরি লক্ষ্য' : 'Extracted Daily Calorie Target'}
                </span>
                <h4 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-1.5 mt-0.5">
                  <Flame className="w-5 h-5 text-brandOrange fill-brandOrange" />
                  <span>{analyzedPlan.dailyCalorieTarget}</span>
                  <span className="text-xs font-normal text-slate-400">kcal</span>
                </h4>
              </div>

              <div className="text-right text-[11px] text-slate-500 dark:text-slate-400">
                <span>P: {analyzedPlan.macros?.protein}g</span> • 
                <span> C: {analyzedPlan.macros?.carbs}g</span> • 
                <span> F: {analyzedPlan.macros?.fat}g</span>
              </div>
            </div>

            {/* Meal Breakdown Pills if available */}
            {analyzedPlan.meals && analyzedPlan.meals.length > 0 && (
              <div className="space-y-1.5 mb-3">
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {isBn ? 'মিল অনুযায়ী ক্যালোরি বণ্টন:' : 'Meal Schedule Breakdown:'}
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {analyzedPlan.meals.map((m, idx) => (
                    <div key={idx} className="p-2 rounded-xl bg-white/60 dark:bg-slate-900/60 border border-orange-500/15">
                      <div className="flex justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span className="truncate">{m.title || m.mealType}</span>
                        <span className="text-brandOrange shrink-0">~{m.calories} cal</span>
                      </div>
                      <p className="text-[10px] text-slate-400 truncate mt-0.5">{m.items}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Dietitian Tip */}
            {analyzedPlan.advice && (
              <div className="flex items-start gap-1.5 text-xs text-brandOrange font-medium mb-3 bg-orange-500/10 p-2.5 rounded-xl border border-orange-500/20">
                <Lightbulb className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{analyzedPlan.advice}</span>
              </div>
            )}

            {/* Confirm & Set Plan Button */}
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-teal-600/20 active:scale-95 transition"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{isBn ? 'এই লক্ষ্যমাত্রা আজকের জন্য সেট করুন' : "Apply as Today's Target"}</span>
            </button>
          </div>
        )}

        {/* Footer skip */}
        <div className="flex justify-between items-center pt-2 text-xs text-slate-400">
          <button
            type="button"
            onClick={onClose}
            className="hover:underline text-slate-500 dark:text-slate-400"
          >
            {isBn ? 'পরে করব / এড়িয়ে যান' : 'Skip for now'}
          </button>
          <span className="text-[10px]">{isBn ? 'প্রতিদিন সকালে বা রাতে নতুন প্ল্যান করতে পারবেন' : 'You can update anytime'}</span>
        </div>

      </div>
    </div>
  );
}
