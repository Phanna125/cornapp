import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { UI_COPY } from '../data/translations';
import type { ModelStatus } from '../utils/inference';
import { triggerHaptic } from '../utils/telegram';

interface TopBarProps {
  outdoorMode: boolean;
  onToggleOutdoorMode: () => void;
  modelStatus: ModelStatus;
}

export const TopBar: React.FC<TopBarProps> = ({
  outdoorMode,
  onToggleOutdoorMode,
  modelStatus,
}) => {
  const statusText =
    modelStatus === 'loading'
      ? UI_COPY.statusLoading
      : modelStatus === 'ready'
      ? UI_COPY.statusReady
      : UI_COPY.statusFallback;

  return (
    <header className="w-full max-w-md mx-auto px-5 pt-6 pb-3 flex items-start justify-between">
      {/* Editorial 2-line stacked title matching reference */}
      <div>
        <h1 className="text-[28px] leading-[1.08] font-bold tracking-tight text-white">
          {UI_COPY.appTitleTop}
          <br />
          {UI_COPY.appTitleBottom}
        </h1>
        <div className="flex items-center gap-2 mt-2">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              modelStatus === 'loading' ? 'bg-amber-300 animate-pulse' : 'bg-[#f7f0c6]'
            }`}
          />
          <span className="text-xs font-medium text-white/65 tracking-wide">
            {statusText}
          </span>
        </div>
      </div>

      {/* Minimal circular frosted button matching reference */}
      <button
        onClick={() => {
          triggerHaptic('impact', 'light');
          onToggleOutdoorMode();
        }}
        title={UI_COPY.fieldMode}
        aria-label={UI_COPY.fieldMode}
        className={`w-10 h-10 rounded-full flex items-center justify-center transition-all active:scale-90 border ${
          outdoorMode
            ? 'bg-[#f7f0c6] text-[#1a1612] border-[#f7f0c6] shadow-lg'
            : 'bg-white/10 hover:bg-white/18 text-white/90 border-white/20 backdrop-blur-md'
        }`}
      >
        {outdoorMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
      </button>
    </header>
  );
};
