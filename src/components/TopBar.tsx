import React from 'react';
import { Sun, Moon, ShieldCheck } from 'lucide-react';
import type { Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import type { ModelStatus } from '../utils/inference';
import { triggerHaptic } from '../utils/telegram';

interface TopBarProps {
  language: Language;
  onToggleLanguage: () => void;
  outdoorMode: boolean;
  onToggleOutdoorMode: () => void;
  modelStatus: ModelStatus;
}

export const TopBar: React.FC<TopBarProps> = ({
  language,
  onToggleLanguage,
  outdoorMode,
  onToggleOutdoorMode,
  modelStatus,
}) => {
  const t = TRANSLATIONS[language];

  return (
    <header className="sticky top-0 z-30 w-full px-4 pt-3.5 pb-3 backdrop-blur-xl bg-slate-950/80 border-b border-emerald-900/30 transition-colors shadow-sm">
      <div className="flex items-center justify-between">
        {/* Brand Logo & Title */}
        <div className="flex items-center space-x-3">
          <div className="relative group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 via-green-500 to-lime-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 border border-emerald-300/40 transform transition-transform group-hover:scale-105">
              <span className="text-2xl leading-none select-none filter drop-shadow">🌽</span>
            </div>
            <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-slate-950 flex items-center justify-center">
              <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base sm:text-lg font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans',var(--font-khmer)]">
                {t.appTitle}
              </h1>
              <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                IWBW 2026
              </span>
            </div>
            <p className="text-[11px] font-semibold text-emerald-400/90 tracking-tight">
              {t.appSubtitle}
            </p>
          </div>
        </div>

        {/* Right Action Controls: Outdoor Sunlight & Language */}
        <div className="flex items-center space-x-2">
          {/* Outdoor Sunlight Mode Button */}
          <button
            onClick={() => {
              triggerHaptic('impact', 'light');
              onToggleOutdoorMode();
            }}
            title={t.fieldMode}
            className={`p-2.5 rounded-2xl border transition-all flex items-center justify-center active:scale-90 ${
              outdoorMode
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-extrabold shadow-lg shadow-amber-400/30 ring-2 ring-amber-400/50'
                : 'bg-slate-900/90 text-slate-300 border-slate-800 hover:border-slate-700 hover:bg-slate-800 shadow-sm'
            }`}
          >
            {outdoorMode ? <Sun className="w-4 h-4 fill-current" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Bilingual Switcher: Khmer / English */}
          <button
            onClick={() => {
              triggerHaptic('selection');
              onToggleLanguage();
            }}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-gradient-to-r from-emerald-950/80 to-slate-900/80 hover:from-emerald-900/80 hover:to-slate-800/80 text-emerald-300 border border-emerald-700/50 text-xs font-bold tracking-wide transition-all active:scale-95 shadow-sm"
          >
            <span className="text-sm">{language === 'en' ? '🇰🇭' : '🇬🇧'}</span>
            <span className="font-['Plus_Jakarta_Sans',var(--font-khmer)]">
              {language === 'en' ? 'ភាសាខ្មែរ' : 'English'}
            </span>
          </button>
        </div>
      </div>

      {/* Sub-bar: On-Device WASM Engine Status & Privacy Guarantee */}
      <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[11px]">
        <div className="flex items-center space-x-2">
          {modelStatus === 'loading' ? (
            <div className="flex items-center space-x-1.5 text-amber-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <span className="font-semibold">{t.statusLoading}</span>
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 text-emerald-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span className="font-bold tracking-wide">
                {modelStatus === 'ready' ? t.statusReady : t.statusFallback}
              </span>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 font-medium">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>100% On-Device</span>
        </div>
      </div>
    </header>
  );
};
