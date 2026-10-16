import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * AppEntranceSplash — Ultra-Clean Transparent Entrance Experience
 * - Transparent floating Leo mascot (no box, no black background)
 * - Removed green dot radar
 * - Spacious, elegant typography for "Fit Journey" & subtitle
 */
export default function AppEntranceSplash({ onComplete, lang = 'bn' }) {
  const [stage, setStage] = useState('entering'); // 'entering' -> 'active' -> 'exiting' -> 'done'

  useEffect(() => {
    // Stage 1: Fast reveal
    const t1 = setTimeout(() => {
      setStage('active');
    }, 50);

    // Stage 2: Start smooth fade out after 1.5s
    const t2 = setTimeout(() => {
      setStage('exiting');
    }, 1500);

    // Stage 3: Complete and unmount after 1.9s
    const t3 = setTimeout(() => {
      setStage('done');
      if (onComplete) onComplete();
    }, 1900);

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
      {/* Ambient Radial Neon Atmosphere */}
      <div className="absolute w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-full bg-orange-500/20 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-64 h-64 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm mx-auto">
        
        {/* Transparent Floating Leo Mascot (No Box Background, No Green Dot) */}
        <div className="relative mb-7 sm:mb-8 flex items-center justify-center">
          <div className="w-28 h-28 sm:w-36 sm:h-36 flex items-center justify-center animate-float-gentle drop-shadow-[0_12px_30px_rgba(249,115,22,0.5)]">
            <img
              src="/leo.svg"
              alt="Leo Mascot"
              className="w-full h-full object-contain filter drop-shadow-[0_4px_16px_rgba(0,0,0,0.6)]"
            />
          </div>
        </div>

        {/* Brand Name Typography with Generous Spacing */}
        <div className="flex items-center justify-center gap-2 mb-3">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider leading-none flex items-center">
            <span className="text-white">Fit</span>
            <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(249,115,22,0.65)] ml-2.5">
              Journey
            </span>
          </h1>
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin ml-1" style={{ animationDuration: '4s' }} />
        </div>

        {/* Subtitle with Breathing Room */}
        <p className="text-xs sm:text-sm font-medium text-slate-400/90 tracking-widest mt-1.5 sm:mt-2 leading-relaxed">
          {isBn ? 'স্মার্ট ক্যালোরি ও ফিটনেস ব্লুপ্রিন্ট' : 'Smart Calorie & Fitness Blueprint'}
        </p>

        {/* Status Pill with Clean Spacing */}
        <div className="mt-9 sm:mt-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs font-semibold text-orange-400/90 shadow-sm">
          <span className="w-2 h-2 rounded-full bg-orange-500 animate-ping" />
          <span className="tracking-wide">{isBn ? 'শুরু হচ্ছে...' : 'Ready...'}</span>
        </div>

      </div>
    </div>
  );
}
