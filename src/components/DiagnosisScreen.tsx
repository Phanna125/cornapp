import React, { useState } from 'react';
import {
  BarChart3,
  RefreshCw,
  Share2,
  Maximize2,
  X,
  ChevronRight,
} from 'lucide-react';
import type { DiagnosisResult } from '../types';
import { UI_COPY } from '../data/translations';
import { triggerHaptic, getTelegramWebApp } from '../utils/telegram';

interface DiagnosisScreenProps {
  diagnoses: DiagnosisResult[];
  onScanAnother: () => void;
}

export const DiagnosisScreen: React.FC<DiagnosisScreenProps> = ({
  diagnoses,
  onScanAnother,
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [showAllScores, setShowAllScores] = useState(false);
  const [isFullscreenModalOpen, setIsFullscreenModalOpen] = useState(false);

  const activeDiagnosis = diagnoses[selectedIndex] ?? diagnoses[0];
  const {
    topDisease,
    confidencePercentage,
    allScores,
    imageUrl,
    inferenceDurationMs,
    engine,
  } = activeDiagnosis;

  const isBatch = diagnoses.length > 1;
  const issuesCount = diagnoses.filter((d) => d.topDisease.id !== 'healthy').length;
  const healthyCount = diagnoses.length - issuesCount;

  const toggleAllScores = () => {
    triggerHaptic('selection');
    setShowAllScores((prev) => !prev);
  };

  const getSeverityLabel = (severity = topDisease.severity) => {
    switch (severity) {
      case 'healthy':
        return UI_COPY.severityHealthy;
      case 'moderate':
        return UI_COPY.severityModerate;
      case 'high':
        return UI_COPY.severityHigh;
      case 'severe':
        return UI_COPY.severitySevere;
      case 'action_needed':
        return UI_COPY.severityAction;
    }
  };

  const handleShareTelegram = () => {
    triggerHaptic('impact', 'medium');
    let formattedText = '';
    if (isBatch) {
      const summaryLines = diagnoses.map(
        (d, idx) => `${idx + 1}. ${d.topDisease.name} (${d.confidencePercentage})`
      );
      formattedText = `Corn Leaf Batch Scan (${diagnoses.length} leaves)\n${summaryLines.join('\n')}`;
    } else {
      formattedText = UI_COPY.shareTextPrompt
        .replace('{disease}', topDisease.name)
        .replace('{confidence}', confidencePercentage)
        .replace('{advice}', topDisease.treatmentAdvice[0] || '');
    }

    const tg = getTelegramWebApp();
    const shareUrl = `https://t.me/share/url?text=${encodeURIComponent(formattedText)}`;

    if (tg?.openTelegramLink) {
      tg.openTelegramLink(shareUrl);
    } else {
      window.open(shareUrl, '_blank');
    }
  };

  return (
    <div className="flex flex-col flex-1 px-5 pb-20 pt-2 space-y-4 max-w-md mx-auto w-full relative">
      {/* Multi-Detect Leaf Selector Strip */}
      {isBatch && (
        <div className="space-y-2.5">
          <div className="flex items-center justify-between px-0.5 text-xs">
            <span className="font-semibold text-white/85">
              Batch results ({diagnoses.length} leaves)
            </span>
            <span className="text-white/60">
              {issuesCount > 0 ? `${issuesCount} issue${issuesCount > 1 ? 's' : ''}` : 'All healthy'}
              {healthyCount > 0 && issuesCount > 0 ? ` • ${healthyCount} healthy` : ''}
            </span>
          </div>

          <div className="flex items-center gap-2.5 overflow-x-auto no-scrollbar py-1">
            {diagnoses.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerHaptic('selection');
                    setSelectedIndex(idx);
                  }}
                  className={`flex-shrink-0 flex items-center gap-2.5 pl-1.5 pr-3.5 py-1.5 rounded-full border transition-all active:scale-95 ${
                    isSelected
                      ? 'bg-white/20 border-white/75 text-white shadow-md'
                      : 'bg-white/8 hover:bg-white/14 border-white/15 text-white/75'
                  }`}
                >
                  <img
                    src={item.imageUrl}
                    alt={item.topDisease.name}
                    className="w-8 h-8 rounded-full object-cover border border-white/25"
                  />
                  <div className="text-left">
                    <p className="text-xs font-semibold leading-tight">
                      #{idx + 1} {item.topDisease.shortName}
                    </p>
                    <p className="text-[10px] text-white/60 leading-tight">
                      {item.confidencePercentage}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Reference-Style Hero Diagnosis Card */}
      <section className="glass-card rounded-[32px] p-5 space-y-5">
        {/* Top Row: Severity Pill + Confidence Metadata + Expand Button */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span
              className={`px-3.5 py-1 rounded-full border text-xs font-medium flex items-center gap-1.5 ${topDisease.badgeColor.bg} ${topDisease.badgeColor.text} ${topDisease.badgeColor.border}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${topDisease.badgeColor.dot}`} />
              <span>{getSeverityLabel()}</span>
            </span>
            <span className="text-xs font-medium text-white/65">
              {isBatch ? `Leaf #${selectedIndex + 1} • ` : ''}
              {confidencePercentage} {UI_COPY.confidenceLabel} • {inferenceDurationMs} ms
              {engine === 'onnx' ? ' • MobileNetV3' : engine === 'heuristic' ? ' • Fallback' : ''}
            </span>
          </div>

          <button
            onClick={() => setIsFullscreenModalOpen(true)}
            title="Inspect leaf image"
            aria-label="Inspect leaf image"
            className="w-10 h-10 rounded-full bg-white/10 hover:bg-white/18 border border-white/18 flex items-center justify-center text-white/90 transition-all active:scale-90 flex-shrink-0"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>

        {/* Specimen Preview + Editorial Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={() => setIsFullscreenModalOpen(true)}
            className="w-16 h-16 rounded-2xl overflow-hidden border border-white/25 flex-shrink-0 bg-black/30 active:scale-95 transition-transform"
          >
            <img
              src={imageUrl}
              alt={topDisease.name}
              className="w-full h-full object-cover"
            />
          </button>

          <div className="min-w-0">
            <h2 className="text-[28px] leading-tight font-bold tracking-tight text-white">
              {topDisease.name}
            </h2>
            <p className="text-xs text-white/60 font-medium mt-0.5 italic">
              {topDisease.scientificName}
            </p>
          </div>
        </div>

        {/* Hairline Divider + Primary Cause */}
        <div className="border-t border-white/15 pt-4">
          <p className="text-xs font-medium text-white/55 mb-1.5">
            {UI_COPY.primaryCausesTitle}
          </p>
          <p className="text-sm text-white/90 leading-relaxed">
            {topDisease.causes}
          </p>
        </div>

        {/* Collapsible 5-Class Breakdown */}
        {showAllScores && (
          <div className="border-t border-white/15 pt-4 space-y-2.5">
            <p className="text-xs font-medium text-white/55">
              Class probabilities
            </p>
            {allScores.map((item) => {
              const pctValue = Math.round(item.probability * 100);
              const isTop = item.id === topDisease.id;
              return (
                <div key={item.id} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className={isTop ? 'font-semibold text-white' : 'text-white/65'}>
                      {item.name}
                    </span>
                    <span className={isTop ? 'font-semibold text-[#f7f0c6]' : 'text-white/55'}>
                      {item.percentage}
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        isTop ? 'bg-[#f7f0c6]' : 'bg-white/35'
                      }`}
                      style={{ width: `${Math.max(pctValue, 2)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Bottom Floating Capsule Dock inside Card */}
        <div className="glass-dock rounded-full p-1.5 flex items-center justify-between gap-2">
          <button
            onClick={toggleAllScores}
            title={showAllScores ? UI_COPY.hideAllScores : UI_COPY.viewAllScores}
            aria-label={showAllScores ? UI_COPY.hideAllScores : UI_COPY.viewAllScores}
            className={`w-12 h-12 rounded-full border flex items-center justify-center transition-all active:scale-90 ${
              showAllScores
                ? 'bg-white/22 text-white border-white/40'
                : 'bg-white/8 hover:bg-white/16 text-white/90 border-white/15'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
          </button>

          <button
            onClick={onScanAnother}
            className="flex-1 h-12 rounded-full bg-[#f7f0c6] hover:bg-[#fcf7da] text-[#1a1612] font-semibold text-sm tracking-tight shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>{UI_COPY.scanAnotherLeaf}</span>
          </button>

          <button
            onClick={handleShareTelegram}
            title={UI_COPY.shareBtn}
            aria-label={UI_COPY.shareBtn}
            className="w-12 h-12 rounded-full bg-white/8 hover:bg-white/16 border border-white/15 flex items-center justify-center text-white/90 transition-all active:scale-90"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </section>

      {/* Recommended Treatment Plan Card */}
      <section className="glass-card rounded-[28px] p-5 space-y-3">
        <h3 className="text-xs font-medium uppercase tracking-wider text-white/55">
          {UI_COPY.actionableAdviceTitle}
        </h3>
        <ul className="space-y-2.5">
          {topDisease.treatmentAdvice.map((advice, idx) => (
            <li
              key={idx}
              className="flex items-start gap-3 text-sm text-white/90 leading-relaxed"
            >
              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-white/12 border border-white/20 text-[#f7f0c6] font-semibold flex items-center justify-center text-[11px] mt-0.5">
                {idx + 1}
              </span>
              <span>{advice}</span>
            </li>
          ))}
        </ul>
      </section>

      {/* All Scanned Leaves Overview Table (Batch Mode) */}
      {isBatch && (
        <section className="glass-card rounded-[28px] p-5 space-y-3">
          <h3 className="text-xs font-medium uppercase tracking-wider text-white/55">
            All scanned leaves
          </h3>
          <div className="space-y-2">
            {diagnoses.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    triggerHaptic('selection');
                    setSelectedIndex(idx);
                  }}
                  className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition-all text-left ${
                    isSelected
                      ? 'bg-white/16 border-white/40'
                      : 'bg-white/5 hover:bg-white/10 border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={item.imageUrl}
                      alt={item.topDisease.name}
                      className="w-10 h-10 rounded-xl object-cover border border-white/20 flex-shrink-0"
                    />
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">
                        Leaf #{idx + 1} • {item.topDisease.name}
                      </p>
                      <p className="text-xs text-white/60">
                        {getSeverityLabel(item.topDisease.severity)} • {item.confidencePercentage}
                      </p>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-white/50 flex-shrink-0" />
                </button>
              );
            })}
          </div>
        </section>
      )}

      {/* Fullscreen Specimen Zoom Modal */}
      {isFullscreenModalOpen && (
        <div
          onClick={() => setIsFullscreenModalOpen(false)}
          className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-5"
        >
          <button
            onClick={() => setIsFullscreenModalOpen(false)}
            aria-label="Close fullscreen view"
            className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/12 border border-white/20 text-white flex items-center justify-center hover:bg-white/20"
          >
            <X className="w-5 h-5" />
          </button>
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-w-md w-full rounded-3xl overflow-hidden border border-white/25 shadow-2xl"
          >
            <img src={imageUrl} alt={topDisease.name} className="w-full h-auto object-contain" />
          </div>
          <p className="text-xs text-white/60 mt-4 font-medium">
            {topDisease.name} • {confidencePercentage}
          </p>
        </div>
      )}
    </div>
  );
};
