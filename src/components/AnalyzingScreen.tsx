import React, { useEffect, useState } from 'react';
import { Check, Lock } from 'lucide-react';
import { UI_COPY } from '../data/translations';

interface AnalyzingScreenProps {
  imagePreviewUrl: string;
  batchProgress?: { current: number; total: number } | null;
}

export const AnalyzingScreen: React.FC<AnalyzingScreenProps> = ({
  imagePreviewUrl,
  batchProgress,
}) => {
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
  }, [imagePreviewUrl]);

  const steps = [
    UI_COPY.stepPreprocessing,
    UI_COPY.stepInference,
    UI_COPY.stepSoftmax,
  ];

  const isBatch = Boolean(batchProgress && batchProgress.total > 1);
  const batchPercent = isBatch && batchProgress
    ? Math.round((batchProgress.current / batchProgress.total) * 100)
    : 0;

  return (
    <div className="flex flex-col flex-1 items-center justify-center px-5 py-6 max-w-md mx-auto w-full">
      <div className="glass-card rounded-[32px] p-5 w-full space-y-5">
        {/* Top Row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="px-3.5 py-1 rounded-full bg-white/12 border border-white/20 text-xs font-medium text-white/90">
              {UI_COPY.analyzingBadge}
            </span>
            {isBatch && batchProgress && (
              <span className="px-3 py-1 rounded-full bg-[#f7f0c6]/20 border border-[#f7f0c6]/40 text-xs font-semibold text-[#f7f0c6]">
                Leaf {batchProgress.current} of {batchProgress.total}
              </span>
            )}
          </div>
          <span className="text-xs font-medium text-white/65 tabular-nums">
            {elapsedMs} ms
          </span>
        </div>

        {isBatch && (
          <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
            <div
              className="h-full rounded-full bg-[#f7f0c6] transition-all duration-300"
              style={{ width: `${batchPercent}%` }}
            />
          </div>
        )}

        {/* Clean Leaf Preview with Subtle Scan Sweep */}
        <div className="relative w-full h-56 rounded-2xl overflow-hidden border border-white/20 bg-black/40">
          <img
            src={imagePreviewUrl}
            alt="Leaf being analyzed"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/20 pointer-events-none" />
          <div className="absolute left-0 right-0 h-0.5 bg-[#f7f0c6] shadow-[0_0_16px_rgba(247,240,198,0.85)] animate-scan-line pointer-events-none" />
        </div>

        {/* Title */}
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {isBatch ? 'Scanning leaf batch' : UI_COPY.analyzingTitle}
          </h2>
          <p className="text-xs text-white/65 mt-1">
            {UI_COPY.analyzingSubtitle}
          </p>
        </div>

        {/* Calm Step Checklist */}
        <div className="border-t border-white/15 pt-4 space-y-2.5">
          {steps.map((step, idx) => {
            const done = idx < currentStepIndex;
            const active = idx === currentStepIndex;
            return (
              <div
                key={idx}
                className={`flex items-center gap-2.5 text-xs transition-colors ${
                  done || active ? 'text-white font-medium' : 'text-white/40'
                }`}
              >
                {done ? (
                  <span className="w-4 h-4 rounded-full bg-[#f7f0c6] text-[#1a1612] flex items-center justify-center flex-shrink-0">
                    <Check className="w-2.5 h-2.5 stroke-[3]" />
                  </span>
                ) : active ? (
                  <span className="w-4 h-4 rounded-full border-2 border-[#f7f0c6] border-t-transparent animate-spin flex-shrink-0" />
                ) : (
                  <span className="w-4 h-4 rounded-full border border-white/25 flex-shrink-0" />
                )}
                <span>{step}</span>
              </div>
            );
          })}
        </div>

        {/* Subtle Privacy Note */}
        <div className="flex items-center gap-2 text-[11px] text-white/55 pt-1">
          <Lock className="w-3.5 h-3.5 flex-shrink-0" />
          <span>{UI_COPY.analyzingPrivacy}</span>
        </div>
      </div>
    </div>
  );
};
