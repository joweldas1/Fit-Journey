import { useState, useEffect } from 'react';
import { Quote, Sparkles } from 'lucide-react';

// ২ থেকে ৪ লাইনের গভীর ও বাস্তবিক মোটিভেশনাল কোট
const MOTIVATIONAL_QUOTES = [
  {
    id: 1,
    bn: "শারীরিক রূপান্তর শুধু জিম বা ডায়েটের বিষয় নয়, এটি প্রতিদিনের আত্মশুদ্ধি। প্রতিটি সুষম খাবার এবং নিয়মমাফিক ঘুম আপনার দীর্ঘমেয়াদি স্বাস্থ্যের সবচেয়ে বড় বিনিয়োগ।",
    en: "Transformation is not merely physical; it is a daily test of self-discipline. Every balanced meal and structured rest is a lifetime investment in your vitality."
  },
  {
    id: 2,
    bn: "ক্ষুধার্ত থাকা নয়, শরীরকে সঠিক পুষ্টি দিয়ে শক্তিশালী করাই আসল উদ্দেশ্য। আপনার দৈনন্দিন ক্যালোরি পর্যবেক্ষণ আপনাকে নিজের লক্ষ্যের সাথে সবসময় অবিচল রাখবে।",
    en: "Fitness is never about deprivation; it is about fueling your body with clean precision. Tracking your intake daily keeps your goals realistic and reachable."
  },
  {
    id: 3,
    bn: "হাল ছেড়ে দেওয়ার ইচ্ছা সবারই হয়, কিন্তু যারা ক্লান্ত অবস্থাতেও নিয়ম মেনে চলে তারাই সফল হয়। প্রেরণা হারিয়ে গেলেও আপনার দৈনিক রুটিন আপনাকে এগিয়ে নিয়ে যাবে।",
    en: "Everyone feels like quitting at times, but true progress belongs to those who stay disciplined. When motivation fades, your structured routine will carry you forward."
  },
  {
    id: 4,
    bn: "দ্রুত কোনো শর্টকাট খুঁজতে যাবেন না, যা তাড়াহুড়ো করে আসে তা স্থায়ী হয় না। ধীরে ধীরে সঠিক খাদ্যাভ্যাস গড়ে তুলুন, শরীর নিজে থেকেই আপনার কাঙ্ক্ষিত আকারে পৌঁছাবে।",
    en: "Avoid looking for shortcuts; rapid changes rarely endure. Cultivate sustainable nutrition habits patiently, and your ideal physique will follow naturally."
  },
  {
    id: 5,
    bn: "আজকের অলসতা আগামীকালের আফসোসের জন্ম দেয়। দিনের শুরুতে গৃহীত প্রতিটি সচেতন সিদ্ধান্তই দিনশেষে আপনাকে আত্মবিশ্বাসী ও উদ্যমী করে তুলবে।",
    en: "Today's hesitation becomes tomorrow's regret. Every mindful nutrition decision made early in the day compounds into unshakeable confidence by night."
  },
  {
    id: 6,
    bn: "অন্য কারো অগ্রগতির সাথে নিজের তুলনা করবেন না; লড়াইটা শুধুই গতকালের নিজের সাথে। নিজের মেটাবলিজম ও রুটিনকে বুঝুন, সাফল্য আসবেই।",
    en: "Never measure your progress against someone else's timeline. Your only competition is who you were yesterday; trust your body and honor the process."
  },
  {
    id: 7,
    bn: "এক বেলা অতিরিক্ত খেয়ে ফেললে পুরো দিন নষ্ট হয়ে যায় না। হতাশ না হয়ে ঠিক পরের খাবার থেকেই পুনরায় আপনার পরিকল্পিত ডায়েটে ফিরে আসুন।",
    en: "One off-target meal never derails your hard work. Do not let guilt take over; simply recalibrate and return to your routine in the very next meal."
  },
  {
    id: 8,
    bn: "কঠিন সময়ে শরীরকে গড়ে তোলার সাহসই আসল বিজয়ের প্রতীক। পরিমিত খাবার ও নিয়মিত সক্রিয় জীবনযাপন আপনাকে মানসিকভাবেও অদম্য করে তোলে।",
    en: "Persisting through difficult days builds mental fortitude alongside muscle. Mindful eating and steady physical activity forge an unbreakable mindset."
  }
];

export default function MotivationalQuote({ lang = 'bn' }) {
  const [currentIndex, setCurrentIndex] = useState(() => {
    const saved = localStorage.getItem('fit_last_quote_index');
    if (saved !== null) {
      const nextIdx = (parseInt(saved, 10) + 1) % MOTIVATIONAL_QUOTES.length;
      localStorage.setItem('fit_last_quote_index', String(nextIdx));
      return nextIdx;
    }
    localStorage.setItem('fit_last_quote_index', '0');
    return 0;
  });

  const [fade, setFade] = useState(true);

  useEffect(() => {
    // Proti 2 minute (120000ms) por por quote change hobe
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setCurrentIndex((prev) => {
          const next = (prev + 1) % MOTIVATIONAL_QUOTES.length;
          localStorage.setItem('fit_last_quote_index', String(next));
          return next;
        });
        setFade(true);
      }, 250);
    }, 120000);

    return () => clearInterval(interval);
  }, []);

  const activeQuote = MOTIVATIONAL_QUOTES[currentIndex] || MOTIVATIONAL_QUOTES[0];
  const quoteText = lang === 'bn' ? activeQuote.bn : activeQuote.en;

  return (
    // mb-3.5 ebong mt-1 diye button theke shundor space toiri kora holo
    <div className="w-full px-1 mt-1 mb-3.5 shrink-0">
      <div className="rounded-2xl bg-white/40 dark:bg-[#151D2E]/80 border border-slate-200/80 dark:border-slate-800/80 p-3 sm:p-3.5 backdrop-blur-md shadow-sm">
        <div className="flex items-start gap-2.5">
          {/* Quote Icon */}
          <div className="p-1.5 rounded-xl bg-orange-500/10 text-brandOrange border border-orange-500/20 shrink-0 mt-0.5">
            <Quote className="w-3.5 h-3.5" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Header Badge */}
            <div className="flex items-center gap-1.5 mb-1">
              <Sparkles className="w-2.5 h-2.5 text-amber-400" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                {lang === 'bn' ? 'দৈনিক জীবনদর্শন ও অনুপ্রেরণা' : 'Daily Insight & Discipline'}
              </span>
            </div>

            {/* 2-4 Liner Readable Quote Body */}
            <p 
              className={`text-xs leading-relaxed text-slate-700 dark:text-slate-200 font-medium transition-opacity duration-250 ${
                fade ? 'opacity-100' : 'opacity-0'
              }`}
            >
              "{quoteText}"
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}