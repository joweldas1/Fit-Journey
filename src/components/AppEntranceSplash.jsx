import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * AppEntranceSplash — Smooth Mobile & Desktop Entrance Animation
 * Eliminates blank screens on launch, displays glowing Leo mascot and Fit Journey brand.
 */
export default function AppEntranceSplash({ onComplete, lang = 'bn' }) {
  const [stage, setStage] = useState('entering'); // 'entering' -> 'active' -> 'exiting' -> 'done'

  useEffect(() => {
    // Stage 1: Fast reveal
    const t1 = setTimeout(() => {
      setStage('active');
    }, 50);

    // Stage 2: Start smooth fade out after 1.4s
    const t2 = setTimeout(() => {
      setStage('exiting');
    }, 1400);

    // Stage 3: Complete and unmount after 1.8s
    const t3 = setTimeout(() => {
      setStage('done');
      if (onComplete) onComplete();
    }, 1800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
    };
  }, [onComplete]);

  if (stage === 'done') return null;

  const isBn = lang === 'bn';

  return (
    <div
      onClick={() => {
        setStage('done');
        if (onComplete) onComplete();
      }}
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#09090B] transition-opacity duration-500 cursor-pointer select-none ${
        stage === 'exiting' ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
    >
      {/* Ambient Radial Neon Background */}
      <div className="absolute w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-orange-500/15 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-60 h-60 rounded-full bg-amber-500/10 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6">
        {/* Leo Animated Mascot Container */}
        <div className="relative mb-5">
          <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl p-1 bg-gradient-to-b from-[#1F1F2E] to-[#09090B] border border-orange-500/50 shadow-[0_0_35px_rgba(249,115,22,0.45)] flex items-center justify-center animate-bounce duration-1000">
            <img
              src="/leo.svg"
              alt="Leo Mascot"
              className="w-full h-full object-cover object-top scale-110"
            />
          </div>
          
          {/* Glowing Ping Radar */}
          <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500 border-2 border-[#09090B]" />
          </span>
        </div>

        {/* Brand Name Typography with Glow */}
        <div className="flex items-center gap-1.5 justify-center mb-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-tight leading-none">
            <span className="text-white">Fit</span>
            <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(249,115,22,0.6)] ml-1">
              Journey
            </span>
          </h1>
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin" style={{ animationDuration: '4s' }} />
        </div>

        {/* Subtitle */}
        <p className="text-xs sm:text-sm font-semibold text-slate-400 tracking-wide">
          {isBn ? 'স্মার্ট ক্যালোরি ও ফিটনেস ব্লুপ্রিন্ট' : 'Smart Calorie & Fitness Blueprint'}
        </p>

        {/* Mini Pulsing Loading Pill */}
        <div className="mt-8 flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-[11px] font-bold text-orange-400">
          <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-ping" />
          <span>{isBn ? 'শুরু হচ্ছে...' : 'Ready...'}</span>
        </div>
      </div>
    </div>
  );
}
