import React, { useState, useEffect, useCallback } from 'react';
import type { AppScreen, DiagnosisResult } from './types';
import { TopBar } from './components/TopBar';
import { HomeScreen } from './components/HomeScreen';
import { AnalyzingScreen } from './components/AnalyzingScreen';
import { DiagnosisScreen } from './components/DiagnosisScreen';
import {
  initTelegramApp,
  setupMainButton,
  setupBackButton,
  triggerHaptic,
} from './utils/telegram';
import {
  initializeModel,
  onModelStatusChange,
  diagnoseCornLeaf,
  type ModelStatus,
} from './utils/inference';
import {
  saveScansToHistory,
  initializeDemoHistoryIfEmpty,
} from './utils/history';
import { UI_COPY } from './data/translations';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [outdoorMode, setOutdoorMode] = useState<boolean>(false);
  const [modelStatus, setModelStatus] = useState<ModelStatus>('loading');
  const [analyzingImage, setAnalyzingImage] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<{ current: number; total: number } | null>(
    null
  );
  const [diagnosisBatch, setDiagnosisBatch] = useState<DiagnosisResult[]>([]);
  const [recentScans, setRecentScans] = useState<DiagnosisResult[]>(() =>
    initializeDemoHistoryIfEmpty()
  );

  useEffect(() => {
    initTelegramApp();

    const unsubscribe = onModelStatusChange((status) => {
      setModelStatus(status);
    });

    initializeModel();

    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    let cleanupMain: (() => void) | undefined;
    let cleanupBack: (() => void) | undefined;

    if (screen === 'diagnosis') {
      cleanupMain = setupMainButton(
        UI_COPY.scanAnotherLeaf,
        () => {
          setScreen('home');
          setDiagnosisBatch([]);
        },
        { color: '#f7f0c6', textColor: '#1a1612' }
      );

      cleanupBack = setupBackButton(() => {
        setScreen('home');
        setDiagnosisBatch([]);
      });
    } else if (screen === 'analyzing') {
      cleanupBack = setupBackButton(() => {
        setScreen('home');
      });
    }

    return () => {
      if (cleanupMain) cleanupMain();
      if (cleanupBack) cleanupBack();
    };
  }, [screen]);

  const handleSelectImages = useCallback(async (items: Array<File | string>) => {
    if (items.length === 0) return;

    const results: DiagnosisResult[] = [];
    const total = items.length;
    setScreen('analyzing');

    try {
      for (let i = 0; i < total; i++) {
        const item = items[i];
        const previewUrl =
          typeof item === 'string' ? item : URL.createObjectURL(item);

        setAnalyzingImage(previewUrl);
        setBatchProgress(total > 1 ? { current: i + 1, total } : null);

        const result = await diagnoseCornLeaf(item);
        results.push(result);
      }

      triggerHaptic('notification', 'success');

      const updatedHistory = saveScansToHistory(results);
      setRecentScans(updatedHistory);

      setBatchProgress(null);
      setDiagnosisBatch(results);
      setScreen('diagnosis');
    } catch (err) {
      console.error('Diagnosis processing failed:', err);
      triggerHaptic('notification', 'error');
      setBatchProgress(null);
      alert('Could not process one or more leaf images. Please try again with clear lighting.');
      setScreen('home');
    }
  }, []);

  const handleSelectRecentScan = useCallback((scan: DiagnosisResult) => {
    setDiagnosisBatch([scan]);
    setScreen('diagnosis');
  }, []);

  const handleScanAnother = useCallback(() => {
    triggerHaptic('impact', 'medium');
    setDiagnosisBatch([]);
    setScreen('home');
  }, []);

  const handleToggleOutdoorMode = useCallback(() => {
    setOutdoorMode((prev) => !prev);
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-300 text-[#f7f4ef] ${
        outdoorMode ? 'outdoor-solid' : 'ambient-canvas'
      }`}
    >
      <TopBar
        outdoorMode={outdoorMode}
        onToggleOutdoorMode={handleToggleOutdoorMode}
        modelStatus={modelStatus}
      />

      <main className="flex-1 flex flex-col">
        {screen === 'home' && (
          <HomeScreen
            onSelectImages={handleSelectImages}
            recentScans={recentScans}
            onSelectRecentScan={handleSelectRecentScan}
            onClearHistory={() => setRecentScans([])}
          />
        )}

        {screen === 'analyzing' && analyzingImage && (
          <AnalyzingScreen
            imagePreviewUrl={analyzingImage}
            batchProgress={batchProgress}
          />
        )}

        {screen === 'diagnosis' && diagnosisBatch.length > 0 && (
          <DiagnosisScreen
            key={diagnosisBatch.map((d) => d.id).join(',')}
            diagnoses={diagnosisBatch}
            onScanAnother={handleScanAnother}
          />
        )}
      </main>
    </div>
  );
};

export default App;
