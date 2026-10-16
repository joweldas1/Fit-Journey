import React, { useEffect, useState } from 'react';
import { Sparkles } from 'lucide-react';

/**
 * AppEntranceSplash — Polished, High-Impact Mobile Entrance Experience
 * - Prominent Leo mascot (tightly cropped, no empty gap, proper scale)
 * - Harmonious proximity between Leo and "Fit Journey" brand
 * - Refined, elegant subtitle with warm amber glow
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
      {/* Ambient Radial Neon Aura */}
      <div className="absolute w-80 h-80 sm:w-[420px] sm:h-[420px] rounded-full bg-orange-500/25 blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute w-64 h-64 rounded-full bg-amber-500/20 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center text-center px-6 max-w-sm mx-auto">
        
        {/* Prominent Transparent Floating Leo Mascot (Tightly framed, zero awkward gap) */}
        <div className="relative mb-3 sm:mb-4 flex items-center justify-center">
          <div className="w-36 h-36 sm:w-44 sm:h-44 flex items-center justify-center animate-float-gentle filter drop-shadow-[0_15px_35px_rgba(249,115,22,0.55)]">
            <img
              src="/leo.svg"
              alt="Leo Mascot"
              className="w-full h-full object-contain filter drop-shadow-[0_6px_18px_rgba(0,0,0,0.7)]"
            />
          </div>
        </div>

        {/* Brand Name Typography with Generous Spacing */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <h1 className="text-3xl sm:text-4xl font-black tracking-wider leading-none flex items-center">
            <span className="text-white">Fit</span>
            <span className="bg-gradient-to-r from-orange-500 via-amber-400 to-orange-400 bg-clip-text text-transparent drop-shadow-[0_0_20px_rgba(249,115,22,0.7)] ml-2.5">
              Journey
            </span>
          </h1>
          <Sparkles className="w-5 h-5 text-amber-400 animate-spin ml-1" style={{ animationDuration: '4s' }} />
        </div>

        {/* Refined, Elegant Tagline with Warm Amber Glow */}
        <p className="text-xs sm:text-sm font-semibold tracking-wider mt-1.5 leading-relaxed bg-gradient-to-r from-orange-200 via-amber-100 to-orange-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(249,115,22,0.3)]">
          {isBn ? 'আপনার দৈনন্দিন পুষ্টি ও ফিটনেস গাইড' : 'Your Daily Nutrition & Fitness Guide'}
        </p>

        {/* Sleek Loading Bar & Small Subdued Text */}
        <div className="mt-8 sm:mt-9 flex flex-col items-center gap-2">
          {/* Glowing Animated Loading Track above text */}
          <div className="w-28 sm:w-32 h-[2.5px] rounded-full bg-white/10 overflow-hidden relative shadow-[0_0_12px_rgba(249,115,22,0.35)]">
            <div
              className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-orange-500 rounded-full transition-all duration-[1300ms] ease-out"
              style={{ width: stage === 'entering' ? '15%' : '100%' }}
            />
          </div>

          {/* Clean Small Text (Dot removed, small & elegant) */}
          <span className="text-[10px] sm:text-[10.5px] font-medium tracking-[0.22em] uppercase text-slate-400/90">
            {isBn ? 'শুরু হচ্ছে...' : 'Getting Ready...'}
          </span>
        </div>

      </div>
    </div>
  );
}
