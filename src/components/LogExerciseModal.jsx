import { useState } from 'react';
import { X, Dumbbell, Sparkles, Loader2, Check, Mic, MicOff } from 'lucide-react';
import { useVoiceInput } from '../hooks/useVoiceInput';
import { toast } from 'sonner';
import { analyzeExerciseWithAI } from '../utils/gemini';

const QUICK_WORKOUTS = [
  { label: "পুশ-আপ (৩ সেট)", text: "৩ সেট ১২ বার করে মোট ৩৬টি পুশ-আপ" },
  { label: "চেয়ার ডিপস (৩ সেট)", text: "৩ সেট ট্রাইসেপ চেয়ার ডিপস" },
  { label: "বডিওয়েট স্কোয়াট", text: "৩ সেট ১৫ বার করে বডিওয়েট স্কোয়াট" },
  { label: "বাইসেপ কার্ল", text: "পানির বোতল দিয়ে ৩ সেট বাইসেপ কার্ল" },
];

export default function LogExerciseModal({ isOpen, onClose, onLogExercise, lang = 'bn' }) {
  const [exerciseQuery, setExerciseQuery] = useState('');
  const { isListening, isSupported, startListening, stopListening } = useVoiceInput({
    lang,
    onTranscript: (spokenText) => {
      setExerciseQuery(spokenText);
      handleAIAnalyze(spokenText);
    }
  });
  const [loading, setLoading] = useState(false);
  const [aiPreview, setAiPreview] = useState(null);

  if (!isOpen) return null;

  const handleAIAnalyze = async (queryText) => {
    const query = queryText || exerciseQuery;
    if (!query.trim()) {
      toast.warning(lang === 'bn' ? 'ব্যায়ামের বিবরণ লিখুন' : 'Please enter workout details');
      return;
    }
    setLoading(true);
    setAiPreview(null);
    try {
      const data = await analyzeExerciseWithAI(query, lang);
      setAiPreview(data);
    } catch {
      toast.error('AI বিশ্লেষণ করতে পারেনি, আবার চেষ্টা করুন');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    if (!aiPreview) return;
    onLogExercise({
      ...aiPreview,
      timestamp: new Date().toISOString()
    });
    toast.success(`${aiPreview.name} সফলভাবে যুক্ত হয়েছে!`);
    onClose();
    setExerciseQuery('');
    setAiPreview(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white dark:bg-[#161F33] rounded-t-[32px] sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-slate-100 max-h-[90vh] overflow-y-auto">
        
        <div className="flex items-center justify-between pb-4 border-b border-slate-200 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-teal-500/10 text-teal-600 dark:text-teal-400">
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            </div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              {lang === 'bn' ? 'ব্যায়াম লগ করুন (Smart AI)' : 'Log Workout (Smart AI)'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 my-3 font-semibold">
          {lang === 'bn' ? 'কী ব্যায়াম করলেন ও কয়টি সেট দিলেন লিখুন:' : 'Enter what exercise and sets you performed:'}
        </p>

        {/* Leo Listening Speech Bubble */}
        {isListening && (
          <div className="flex items-center gap-2 mb-2 px-3 py-2 rounded-2xl bg-teal-500/10 border border-teal-500/30 text-xs font-bold text-teal-600 dark:text-teal-400 animate-pulse">
            <div className="w-6 h-6 rounded-lg overflow-hidden shrink-0 border border-teal-500/40">
              <img src="/leo.svg" alt="Leo" className="w-full h-full object-cover object-top" />
            </div>
            <span>{lang === 'bn' ? 'লিও শুনছে... আপনার ব্যায়ামের নাম বা সেট বলুন...' : 'Leo is listening... say your exercise or sets...'}</span>
          </div>
        )}

        <div className="relative mb-3">
          <input
            type="text"
            value={exerciseQuery}
            onChange={(e) => setExerciseQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAIAnalyze()}
            placeholder={lang === 'bn' ? "ব্যায়ামের নাম লিখুন বা মুখে বলুন..." : "e.g. 3 sets of 12 pushups..."}
            className="w-full px-4 py-3.5 pr-32 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-300 dark:border-slate-700 text-sm focus:border-teal-500 focus:outline-none"
          />

          <div className="absolute right-2 top-2 bottom-2 flex items-center gap-1">
            {isSupported && (
              <button
                type="button"
                onClick={() => (isListening ? stopListening() : startListening())}
                title={isListening ? 'Stop listening' : 'Voice Input (Leo)'}
                className={`p-2 rounded-xl border flex items-center justify-center transition active:scale-95 ${
                  isListening
                    ? 'bg-rose-500 text-white border-rose-400 animate-pulse shadow-md shadow-rose-500/30'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:text-teal-500 hover:border-teal-500'
                }`}
              >
                {isListening ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
              </button>
            )}

            <button
              type="button"
              onClick={() => handleAIAnalyze()}
              disabled={loading}
              className="px-3 py-1.5 h-full rounded-xl bg-teal-600 hover:bg-teal-500 text-white text-xs font-bold flex items-center gap-1 active:scale-95 transition disabled:opacity-50 shadow-sm"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>{lang === 'bn' ? 'যাচাই' : 'Analyze'}</span>
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-5">
          {QUICK_WORKOUTS.map((q, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => {
                setExerciseQuery(q.text);
                handleAIAnalyze(q.text);
              }}
              className="text-[11px] px-2.5 py-1.5 rounded-full bg-slate-100 dark:bg-slate-800/60 hover:text-teal-500 text-slate-600 dark:text-slate-300 border border-slate-200/60 dark:border-slate-700/60 transition"
            >
              {q.label}
            </button>
          ))}
        </div>

        {aiPreview && (
          <div className="p-4 rounded-2xl bg-teal-500/10 border border-teal-500/25 mb-4 animate-in fade-in zoom-in-95">
            <div className="flex justify-between items-start mb-2">
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">{aiPreview.name}</h4>
                <p className="text-[11px] text-teal-600 dark:text-teal-400 font-medium">🎯 {aiPreview.targetedMuscle}</p>
              </div>
              <span className="text-base font-extrabold text-teal-600 dark:text-teal-400">
                -{aiPreview.caloriesBurned} <span className="text-xs font-normal">kcal</span>
              </span>
            </div>

            <p className="text-xs text-slate-500 dark:text-slate-400 mt-2 pt-2 border-t border-teal-500/20 leading-relaxed">
              💡 {aiPreview.aiFeedback}
            </p>

            <button
              type="button"
              onClick={handleConfirm}
              className="w-full mt-4 py-3 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition"
            >
              <Check className="w-4 h-4" />
              <span>{lang === 'bn' ? 'ওয়ার্কআউট সেভ করুন' : 'Confirm Workout'}</span>
            </button>
          </div>
        )}

      </div>
    </div>
  );
}