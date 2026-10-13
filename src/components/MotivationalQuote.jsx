import { useState, useEffect, useMemo } from 'react';
import { Sparkles, Utensils, RefreshCw, CalendarCheck, Lightbulb } from 'lucide-react';

const CURATED_QUOTES = [
  {
    id: 1,
    bn: "শারীরিক রূপান্তর শুধু জিম বা ডায়েটের বিষয় নয়, এটি প্রতিদিনের আত্মশুদ্ধি। প্রতিটি সুষম খাবার এবং নিয়মমাফিক ঘুম আপনার দীর্ঘমেয়াদি স্বাস্থ্যের বড় বিনিয়োগ।",
    en: "Transformation is not merely physical; it is daily discipline. Every balanced meal and structured sleep is a lifetime investment in vitality."
  },
  {
    id: 2,
    bn: "ক্ষুধার্ত থাকা নয়, শরীরকে সঠিক পুষ্টি দিয়ে শক্তিশালী করাই আসল উদ্দেশ্য। আপনার দৈনন্দিন ক্যালোরি পর্যবেক্ষণ আপনাকে নিজের লক্ষ্যের সাথে অবিচল রাখবে।",
    en: "Fitness is never about deprivation; it is fueling your body with clean precision. Daily intake tracking keeps your goals attainable."
  },
  {
    id: 3,
    bn: "হাল ছেড়ে দেওয়ার ইচ্ছা সবারই হয়, কিন্তু যারা ক্লান্ত অবস্থাতেও নিয়ম মেনে চলে তারাই সফল হয়। প্রেরণা হারিয়ে গেলেও আপনার দৈনিক রুটিন এগিয়ে নেবে।",
    en: "Everyone feels like quitting at times, but progress belongs to the consistent. When motivation wanes, let discipline carry you."
  },
  {
    id: 4,
    bn: "ধীরে ধীরে সঠিক খাদ্যাভ্যাস গড়ে তুলুন, শরীর নিজে থেকেই আপনার কাঙ্ক্ষিত আকারে পৌঁছাবে। তাড়াহুড়োর কোনো শর্টকাট দীর্ঘস্থায়ী হয় না।",
    en: "Build sustainable habits with patience. Shortcuts rarely last; honor your body's journey to healthy transformation."
  },
  {
    id: 5,
    bn: "এক বেলা অতিরিক্ত খেয়ে ফেললে পুরো দিন নষ্ট হয়ে যায় না। হতাশ না হয়ে ঠিক পরের খাবার থেকেই পুনরায় আপনার পরিকল্পিত ডায়েটে ফিরে আসুন।",
    en: "One off-target meal never ruins your progress. Recalibrate without guilt and return to your routine in the very next meal."
  },
  {
    id: 6,
    bn: "আজকের সচেতন প্রতিটি খাদ্যাভ্যাস আগামীকালের আত্মবিশ্বাসী ও উদ্যমী আপনাকে গড়ে তোলে। প্রতিটি ক্যালোরি আপনার লক্ষ্য অর্জনের জ্বালানি।",
    en: "Every mindful nutritional choice you make today compounds into unshakeable confidence and strength tomorrow."
  }
];

export default function MotivationalQuote({ 
  lang = 'bn', 
  consumed = 0, 
  target = 2400, 
  foods = [], 
  dailyPlan = null,
  onOpenDailyPlan
}) {
  const isBn = lang === 'bn';
  const remaining = Math.max(target - consumed, 0);
  const extra = Math.max(consumed - target, 0);
  const percentage = target > 0 ? Math.round((consumed / target) * 100) : 0;

  const [quoteIndex, setQuoteIndex] = useState(() => {
    const saved = localStorage.getItem('fit_quote_idx');
    return saved !== null ? parseInt(saved, 10) % CURATED_QUOTES.length : 0;
  });

  const [fade, setFade] = useState(true);

  // Auto-rotate quote every 90 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setQuoteIndex(prev => {
          const next = (prev + 1) % CURATED_QUOTES.length;
          localStorage.setItem('fit_quote_idx', String(next));
          return next;
        });
        setFade(true);
      }, 200);
    }, 90000);

    return () => clearInterval(timer);
  }, []);

  const handleNextQuote = () => {
    setFade(false);
    setTimeout(() => {
      setQuoteIndex(prev => {
        const next = (prev + 1) % CURATED_QUOTES.length;
        localStorage.setItem('fit_quote_idx', String(next));
        return next;
      });
      setFade(true);
    }, 150);
  };

  // Smart Contextual Suggestion (Requirement E)
  const smartAnalysis = useMemo(() => {
    const hour = new Date().getHours();

    // 1. Time-aware meal segment suggestion
    let mealTimeSuggestion = '';
    if (hour >= 5 && hour < 11) {
      mealTimeSuggestion = isBn 
        ? "সকাল: ডিম, ওটস বা রুটি-কলা দিয়ে দিন শুরু করতে পারেন।" 
        : "Morning: Eggs, oats, or whole grain toast with fruit.";
    } else if (hour >= 11 && hour < 16) {
      mealTimeSuggestion = isBn 
        ? "দুপুর: ভাত/রুটি, প্রচুর ডাল, সালাদ ও প্রোটিন (মাছ/মুরগি) গ্রহণ করুন।" 
        : "Noon: Balanced lunch with lean protein, grains, and greens.";
    } else if (hour >= 16 && hour < 19) {
      mealTimeSuggestion = isBn 
        ? "বিকাল: একমুঠো বাদাম, ফল বা দুধ-চা দিয়ে হালকা পুষ্টি নিশ্চিত করুন।" 
        : "Evening: A handful of nuts, Greek yogurt, or fruit.";
    } else {
      mealTimeSuggestion = isBn 
        ? "রাত: পরিমিত হালকা ডিনার ও ঘুমানোর ২ ঘণ্টা পূর্বে খাবার সম্পন্ন করুন।" 
        : "Night: Light protein dinner at least 2 hours before rest.";
    }

    // 2. Calorie status insight
    let statusText = '';
    let badgeColor = 'text-brandOrange';

    if (consumed === 0) {
      statusText = isBn 
        ? "আজ এখনো কোনো খাবার রেকর্ড করা হয়নি। সুস্থ রুটিন বজায় রাখতে প্রতিটি মিল লগ করুন।" 
        : "No meals logged yet today. Track consistently to stay on course!";
      badgeColor = 'text-amber-500';
    } else if (percentage < 45) {
      statusText = isBn 
        ? `লক্ষ্যে পৌঁছাতে এখনো ${remaining} kcal প্রয়োজন। পুষ্টিকর ভারী আহারের পরিকল্পনা নিন।` 
        : `You still need ${remaining} kcal to reach your goal. Prioritize nutrient-dense fuel.`;
      badgeColor = 'text-sky-400';
    } else if (percentage >= 45 && percentage < 85) {
      statusText = isBn 
        ? `চমৎকার ধারাবাহিকতা! আর মাত্র ${remaining} kcal বাকি রয়েছে। আপনার ডায়েট পারফেক্ট চলছে।` 
        : `Strong momentum! ${remaining} kcal left to hit target. Your intake is right on track.`;
      badgeColor = 'text-teal-400';
    } else if (percentage >= 85 && percentage <= 110) {
      statusText = isBn 
        ? `অভিনন্দন! আজকের লক্ষ্যমাত্রা (${target} kcal) সফলভাবে অর্জিত হয়েছে। পর্যাপ্ত পানি ও বিশ্রাম নিন।` 
        : `Target reached! Daily calorie benchmark met with discipline. Rest and hydrate.`;
      badgeColor = 'text-emerald-400';
    } else {
      statusText = isBn 
        ? `নির্ধারিত লক্ষ্যের চেয়ে ${extra} kcal বেশি গ্রহণ করা হয়েছে। হালকা হাঁটাচলা হজমে সাহায্য করবে।` 
        : `Calorie target exceeded by ${extra} kcal. A light recovery walk is recommended.`;
      badgeColor = 'text-rose-400';
    }

    const mealsCount = foods?.length || 0;
    const mealCountSuffix = mealsCount > 0 
      ? (isBn ? ` (${mealsCount}টি খাবার লগ করা হয়েছে)` : ` (${mealsCount} meals logged)`) 
      : '';

    return { mealTimeSuggestion, statusText: `${statusText}${mealCountSuffix}`, badgeColor };
  }, [consumed, target, percentage, remaining, extra, isBn, foods]);

  const activeQuote = CURATED_QUOTES[quoteIndex] || CURATED_QUOTES[0];
  const quoteText = isBn ? activeQuote.bn : activeQuote.en;

  return (
    <div className="w-full my-2.5 shrink-0 animate-in fade-in duration-300">
      <div className="rounded-2xl bg-white/70 dark:bg-[#161F33]/85 backdrop-blur-xl border border-slate-200/90 dark:border-slate-800/90 p-3.5 sm:p-4 shadow-sm hover:shadow-md transition-all">
        
        {/* Top Header: Smart Insights & Refresh */}
        <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800/80">
          <div className="flex items-center gap-1.5">
            <div className="p-1 rounded-lg bg-orange-500/10 text-brandOrange">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
              {isBn ? 'স্মার্ট গাইডেন্স ও পরামর্শ' : 'Smart Guidance & Insight'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Plan Button */}
            {onOpenDailyPlan && (
              <button
                type="button"
                onClick={onOpenDailyPlan}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400 border border-teal-500/20 transition active:scale-95"
                title={isBn ? "আজকের মিল প্ল্যান" : "Today's Plan"}
              >
                <CalendarCheck className="w-3 h-3" />
                <span>{dailyPlan ? (isBn ? 'প্ল্যান রেডি' : 'Planned') : (isBn ? 'প্ল্যান করুন' : 'Plan')}</span>
              </button>
            )}

            {/* Quote Refresh Button */}
            <button
              type="button"
              onClick={handleNextQuote}
              className="p-1 rounded-lg text-slate-400 hover:text-brandOrange hover:bg-slate-100 dark:hover:bg-slate-800 transition active:scale-90"
              title={isBn ? "নতুন উক্তি দেখুন" : "Next quote"}
            >
              <RefreshCw className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Dynamic Status Guidance (Requirement E) */}
        <div className="space-y-2">
          {/* Real-time Status Insight */}
          <div className="flex items-start gap-2">
            <Lightbulb className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${smartAnalysis.badgeColor}`} />
            <p className="text-xs font-medium text-slate-700 dark:text-slate-200 leading-relaxed">
              {smartAnalysis.statusText}
            </p>
          </div>

          {/* Next Meal Suggestion */}
          <div className="flex items-start gap-2 pt-1.5 border-t border-slate-100/80 dark:border-slate-800/60">
            <Utensils className="w-3.5 h-3.5 shrink-0 mt-0.5 text-teal-500" />
            <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">
              <span className="font-bold text-slate-700 dark:text-slate-300">
                {isBn ? 'পরবর্তী আহার পরামর্শ:' : 'Next Meal Suggestion:'}
              </span>{' '}
              {smartAnalysis.mealTimeSuggestion}
            </p>
          </div>

          {/* Daily Plan summary if active */}
          {dailyPlan && dailyPlan.advice && (
            <div className="px-2.5 py-1.5 rounded-xl bg-orange-500/10 border border-orange-500/20 text-[11px] text-brandOrange font-medium">
              💡 {dailyPlan.advice}
            </div>
          )}

          {/* Curated Motivational Philosophy Quote */}
          <div 
            className={`pt-2 border-t border-dashed border-slate-200/80 dark:border-slate-800/80 text-[11px] italic text-slate-500 dark:text-slate-400 transition-opacity duration-200 ${
              fade ? 'opacity-100' : 'opacity-0'
            }`}
          >
            "{quoteText}"
          </div>
        </div>

      </div>
    </div>
  );
}