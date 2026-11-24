import React, { useEffect, useState } from 'react';
import { ShieldCheck, Zap, Cpu, CheckCircle } from 'lucide-react';
import type { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';

interface AnalyzingScreenProps {
  language: Language;
  imagePreviewUrl: string;
}

export const AnalyzingScreen: React.FC<AnalyzingScreenProps> = ({
  language,
  imagePreviewUrl,
}) => {
  const t = TRANSLATIONS[language];
  const [elapsedMs, setElapsedMs] = useState(0);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedMs((prev) => prev + 25);
    }, 25);

    const stepTimer1 = setTimeout(() => setCurrentStepIndex(1), 75);
    const stepTimer2 = setTimeout(() => setCurrentStepIndex(2), 150);

    return () => {
      clearInterval(timer);
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
    };
  }, []);

  const steps = [
    t.stepPreprocessing,
    t.stepInference,
    t.stepSoftmax,
  ];

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-4 py-6 max-w-md mx-auto w-full text-center">
      {/* Captured Photo Container with Laser Scanner Sweep */}
      <div className="relative w-64 h-64 sm:w-72 sm:h-72 rounded-3xl overflow-hidden border-2 border-emerald-400 shadow-2xl shadow-emerald-950/80 bg-slate-950">
        <img
          src={imagePreviewUrl}
          alt="Scanning leaf"
          className="w-full h-full object-cover filter brightness-95"
        />

        {/* Dark Vignette Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/50 pointer-events-none"></div>

        {/* High-Tech Animated Laser Line with Double Glow */}
        <div className="absolute left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-lime-200 to-emerald-500 shadow-[0_0_20px_#22c55e,0_0_40px_#4ade80] animate-laser pointer-events-none z-10"></div>

        {/* Viewfinder Target Reticle HUD */}
        <div className="absolute inset-4 border border-emerald-500/40 rounded-2xl pointer-events-none flex flex-col justify-between p-2.5">
          <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400">
            <span className="flex items-center gap-1">
              <Cpu className="w-3 h-3 text-emerald-400" />
              <span>MOBILENET_V3</span>
            </span>
            <span>224×224 PLANAR</span>
          </div>
          <div className="flex justify-between items-center text-[10px] font-mono text-emerald-400">
            <span>WASM MULTI-SIMD</span>
            <span className="font-bold text-white">{elapsedMs} ms</span>
          </div>
        </div>

        {/* Circular Radar Scan Effect */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="w-20 h-20 rounded-full border-2 border-emerald-400/30 border-t-emerald-300 animate-spin"></div>
        </div>
      </div>

      {/* Progress & Step Indicators */}
      <div className="mt-6 space-y-2 w-full max-w-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/90 border border-emerald-500/40 text-emerald-300 text-xs font-bold shadow-md">
          <Zap className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
          <span>MobileNetV3-Large (WASM)</span>
        </div>

        <h2 className="text-xl font-extrabold text-white tracking-tight font-['Plus_Jakarta_Sans',var(--font-khmer)]">
          {t.analyzingTitle}
        </h2>
        <p className="text-xs font-semibold text-slate-300">
          {t.analyzingSubtitle}
        </p>

        {/* Dynamic Pipeline Steps */}
        <div className="mt-4 p-3 rounded-2xl bg-slate-900/90 border border-slate-800 text-left space-y-1.5 shadow-inner">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className={`flex items-center space-x-2 text-[11px] transition-colors ${
                idx <= currentStepIndex ? 'text-emerald-300 font-bold' : 'text-slate-500'
              }`}
            >
              {idx < currentStepIndex ? (
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
              ) : idx === currentStepIndex ? (
                <span className="w-3.5 h-3.5 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin flex-shrink-0" />
              ) : (
                <span className="w-3.5 h-3.5 rounded-full border border-slate-700 flex-shrink-0" />
              )}
              <span className="truncate">{step}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Privacy Guarantee Badge */}
      <div className="mt-6 flex items-center justify-center space-x-2 text-xs font-medium text-emerald-400/90 bg-emerald-950/40 px-3.5 py-1.5 rounded-2xl border border-emerald-800/40">
        <ShieldCheck className="w-4 h-4 text-emerald-400" />
        <span>{t.analyzingPrivacy}</span>
      </div>
    </div>
  );
};
