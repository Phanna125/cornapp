import React, { useState } from 'react';
import {
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  CheckCircle2,
  Bug,
  Flame,
  RefreshCw,
  Sparkles,
  Info,
  Clock,
  Layers,
  Volume2,
  VolumeX,
  Share2,
  Maximize2,
  X,
} from 'lucide-react';
import type { DiagnosisResult, DiseaseId, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { triggerHaptic, getTelegramWebApp } from '../utils/telegram';

interface DiagnosisScreenProps {
  language: Language;
  diagnosis: DiagnosisResult;
  onScanAnother: () => void;
  outdoorMode: boolean;
}

export const DiagnosisScreen: React.FC<DiagnosisScreenProps> = ({
  language,
  diagnosis,
  onScanAnother,
  outdoorMode,
}) => {
  const t = TRANSLATIONS[language];
  const [showAllScores, setShowAllScores] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  const { topDisease, confidencePercentage, allScores, imageUrl, inferenceDurationMs } = diagnosis;

  const toggleAllScores = () => {
    triggerHaptic('selection');
    setShowAllScores((prev) => !prev);
  };

  const getDiseaseIcon = (id: DiseaseId) => {
    switch (id) {
      case 'healthy':
        return <CheckCircle2 className="w-6 h-6 text-emerald-400" />;
      case 'common_rust':
        return <AlertTriangle className="w-6 h-6 text-amber-400" />;
      case 'corn_leaf_blight':
        return <Flame className="w-6 h-6 text-rose-400" />;
      case 'gray_leaf_spot':
        return <Layers className="w-6 h-6 text-purple-400" />;
      case 'insects_damage':
        return <Bug className="w-6 h-6 text-orange-400" />;
    }
  };

  const getSeverityBadge = () => {
    switch (topDisease.severity) {
      case 'healthy':
        return {
          label: t.severityHealthy,
          color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40',
        };
      case 'moderate':
        return {
          label: t.severityModerate,
          color: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
        };
      case 'high':
        return {
          label: t.severityHigh,
          color: 'bg-purple-500/20 text-purple-300 border-purple-500/40',
        };
      case 'severe':
        return {
          label: t.severitySevere,
          color: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
        };
      case 'action_needed':
        return {
          label: t.severityAction,
          color: 'bg-orange-500/20 text-orange-300 border-orange-500/40',
        };
    }
  };

  const adviceList =
    language === 'kh' ? topDisease.treatmentAdvice.kh : topDisease.treatmentAdvice.en;

  const causeText = language === 'kh' ? topDisease.causes.kh : topDisease.causes.en;

  // Text-to-Speech audio guide
  const handleToggleVoice = () => {
    triggerHaptic('impact', 'medium');
    if (!('speechSynthesis' in window)) {
      alert('Speech synthesis not supported in this browser.');
      return;
    }

    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }

    const diseaseTitle = language === 'kh' ? topDisease.name.kh : topDisease.name.en;
    const spokenText = `${diseaseTitle}. ${adviceList.join('. ')}`;

    const utterance = new SpeechSynthesisUtterance(spokenText);
    utterance.rate = 0.95;
    utterance.lang = language === 'kh' ? 'km-KH' : 'en-US';

    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);

    setIsSpeaking(true);
    window.speechSynthesis.speak(utterance);
  };

  // Share diagnosis via Telegram
  const handleShareTelegram = () => {
    triggerHaptic('impact', 'medium');
    const diseaseName = language === 'kh' ? topDisease.name.kh : topDisease.name.en;
    const formattedText = t.shareTextPrompt
      .replace('{disease}', diseaseName)
      .replace('{confidence}', confidencePercentage)
      .replace('{advice}', adviceList[0] || '');

    const tg = getTelegramWebApp();
    const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(formattedText)}`;

    if (tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  const severityBadge = getSeverityBadge();

  return (
    <div className="flex flex-col flex-1 px-4 py-3 space-y-4 max-w-lg mx-auto w-full pb-24 relative">
      {/* 1. Photo Specimen Thumbnail with Metadata */}
      <div className="relative w-full h-48 sm:h-52 rounded-3xl overflow-hidden border-2 border-slate-700/80 shadow-2xl bg-slate-950 group">
        <img
          src={imageUrl}
          alt="Diagnosed corn leaf"
          className="w-full h-full object-cover cursor-pointer transition-transform duration-300 group-hover:scale-105"
          onClick={() => setIsFullscreenModalOpen(true)}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-transparent pointer-events-none"></div>

        {/* Top-Right Latency Badge */}
        <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-slate-900/90 backdrop-blur-md border border-slate-700 text-[11px] font-mono text-emerald-400 flex items-center gap-1.5 shadow-md">
          <Clock className="w-3 h-3" />
          <span>{inferenceDurationMs} ms on-device</span>
        </div>

        {/* Top-Left Inspect Zoom Button */}
        <button
          onClick={() => setIsFullscreenModalOpen(true)}
          className="absolute top-3 left-3 p-2 rounded-full bg-slate-900/80 backdrop-blur-md border border-slate-700 text-slate-300 hover:text-white shadow-md active:scale-95"
        >
          <Maximize2 className="w-3.5 h-3.5" />
        </button>

        {/* Bottom Thumbnail Info */}
        <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center justify-between text-xs text-slate-300">
          <span className="font-semibold text-slate-200">
            {language === 'kh' ? 'គំរូស្លឹកដែលបានពិនិត្យ' : 'Scanned Specimen'}
          </span>
          <span className="text-[11px] text-emerald-400 font-mono font-bold">MobileNetV3</span>
        </div>
      </div>

      {/* 2. Color-Coded Result Banner */}
      <div
        className={`p-4 sm:p-5 rounded-3xl border-2 transition-all shadow-xl relative overflow-hidden ${
          topDisease.badgeColor.border
        } ${topDisease.badgeColor.bg} ${
          outdoorMode ? 'border-4 font-black shadow-2xl' : ''
        }`}
      >
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-3 rounded-2xl bg-slate-950/80 border border-white/10 shadow-lg">
              {getDiseaseIcon(topDisease.id)}
            </div>
            <div>
              {/* Severity Pill */}
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider border ${severityBadge.color}`}
                >
                  {severityBadge.label}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans',var(--font-khmer)]">
                {language === 'kh' ? topDisease.name.kh : topDisease.name.en}
              </h2>
              <p className="text-xs italic text-slate-300 font-mono">
                {topDisease.scientificName}
              </p>
            </div>
          </div>
        </div>

        {/* 3. Big Clear Confidence Score & Scores Toggle */}
        <div className="mt-4 pt-3.5 border-t border-white/10 flex items-center justify-between">
          <div>
            <p className="text-xs font-bold text-slate-300">{t.confidenceLabel}</p>
            <p className="text-3xl sm:text-4xl font-black tracking-tight text-white flex items-baseline gap-1">
              <span>{confidencePercentage}</span>
              <span className="text-xs font-semibold text-emerald-400">match</span>
            </p>
          </div>

          <button
            onClick={toggleAllScores}
            className="flex items-center space-x-1.5 px-3 py-2 rounded-2xl bg-slate-900/90 hover:bg-slate-900 text-xs font-bold text-slate-200 border border-white/10 transition-all shadow-sm active:scale-95"
          >
            <span>{showAllScores ? t.hideAllScores : t.viewAllScores}</span>
            {showAllScores ? (
              <ChevronUp className="w-3.5 h-3.5" />
            ) : (
              <ChevronDown className="w-3.5 h-3.5" />
            )}
          </button>
        </div>

        {/* Collapsible All 5 Class Scores Breakdown */}
        {showAllScores && (
          <div className="mt-4 pt-3 border-t border-white/10 space-y-2.5 animate-in fade-in duration-200">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-300 mb-1 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" />
              <span>Full Class Probability Breakdown (IWBW Judges)</span>
            </p>
            {allScores.map((item) => {
              const pctValue = Math.round(item.probability * 100);
              const isTop = item.id === topDisease.id;
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between text-xs font-medium">
                    <span
                      className={`font-['Plus_Jakarta_Sans',var(--font-khmer)] ${
                        isTop ? 'font-bold text-white' : 'text-slate-300'
                      }`}
                    >
                      {language === 'kh' ? item.nameKh : item.nameEn}
                    </span>
                    <span className={isTop ? 'font-bold text-emerald-400' : 'text-slate-400'}>
                      {item.percentage}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-950/80 overflow-hidden border border-slate-700/50">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTop ? 'bg-gradient-to-r from-emerald-400 to-green-500' : 'bg-slate-500'
                      }`}
                      style={{ width: `${Math.max(pctValue, 2)}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Voice Readout & Telegram Share Bar */}
      <div className="grid grid-cols-2 gap-2.5">
        {/* Audio Guide Button */}
        <button
          onClick={handleToggleVoice}
          className={`flex items-center justify-center space-x-2 py-3 px-3 rounded-2xl border text-xs font-bold transition-all active:scale-95 shadow-sm ${
            isSpeaking
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-slate-700/80'
          }`}
        >
          {isSpeaking ? (
            <>
              <VolumeX className="w-4 h-4 text-amber-400" />
              <span>Stop Voice</span>
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span>{t.readAloudBtn}</span>
            </>
          )}
        </button>

        {/* Telegram Share Button */}
        <button
          onClick={handleShareTelegram}
          className="flex items-center justify-center space-x-2 py-3 px-3 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 text-xs font-bold transition-all active:scale-95 shadow-sm"
        >
          <Share2 className="w-4 h-4 text-blue-400" />
          <span>{t.shareBtn}</span>
        </button>
      </div>

      {/* 4. Actionable Advice Card */}
      <div className="p-4 sm:p-5 rounded-3xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex items-center space-x-2 text-emerald-400">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          <h3 className="text-sm font-extrabold tracking-tight text-white uppercase font-['Plus_Jakarta_Sans',var(--font-khmer)]">
            {t.actionableAdviceTitle}
          </h3>
        </div>

        <ul className="space-y-2.5">
          {adviceList.map((advice, idx) => (
            <li
              key={idx}
              className="flex items-start space-x-3 p-3 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs sm:text-sm font-medium text-slate-100 leading-relaxed font-['Plus_Jakarta_Sans',var(--font-khmer)]"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold flex items-center justify-center text-xs mt-0.5 border border-emerald-500/30">
                {idx + 1}
              </span>
              <span>{advice}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* 5. Primary Causes & Biology Card */}
      <div className="p-4 rounded-3xl bg-slate-900/70 border border-slate-800/80 text-xs space-y-1.5 shadow-sm">
        <div className="flex items-center space-x-1.5 text-slate-300 font-bold">
          <Info className="w-4 h-4 text-blue-400" />
          <span>{t.primaryCausesTitle}</span>
        </div>
        <p className="text-slate-300 leading-relaxed font-['Plus_Jakarta_Sans',var(--font-khmer)]">
          {causeText}
        </p>
      </div>

      {/* Fallback In-App Scan Another Button (if outside Telegram client) */}
      <div className="pt-2">
        <button
          onClick={() => {
            triggerHaptic('impact', 'medium');
            onScanAnother();
          }}
          className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-base tracking-wide shadow-xl shadow-emerald-900/40 border border-emerald-400/40 flex items-center justify-center space-x-2 active:scale-[0.98] transition-all font-['Plus_Jakarta_Sans',var(--font-khmer)]"
        >
          <RefreshCw className="w-5 h-5" />
          <span>
            {language === 'kh'
              ? 'ស្កេនស្លឹកថ្មី / Scan Another Leaf'
              : 'Scan Another Leaf / ស្កេនស្លឹកថ្មី'}
          </span>
        </button>
      </div>

      {/* Fullscreen Specimen Zoom Modal */}
      {isFullscreenModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 flex flex-col items-center justify-center p-4 animate-in fade-in duration-200">
          <button
            onClick={() => setIsFullscreenModalOpen(false)}
            className="absolute top-6 right-6 p-3 rounded-full bg-slate-800 text-white hover:bg-slate-700"
          >
            <X className="w-6 h-6" />
          </button>
          <div className="max-w-md w-full rounded-3xl overflow-hidden border-2 border-emerald-500 shadow-2xl">
            <img src={imageUrl} alt="Enlarged leaf" className="w-full h-auto object-contain" />
          </div>
          <p className="text-xs text-slate-400 mt-4 font-medium">
            {language === 'kh' ? 'រូបភាពស្លឹកពង្រីកសម្រាប់ពិនិត្យ' : 'High-Resolution Leaf Specimen View'}
          </p>
        </div>
      )}
    </div>
  );
};
