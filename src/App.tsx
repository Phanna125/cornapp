import React, { useState, useEffect, useCallback } from 'react';
import type { AppScreen, DiagnosisResult, Language } from './types';
import { TopBar } from './components/TopBar';
import { HomeScreen } from './components/HomeScreen';
import { AnalyzingScreen } from './components/AnalyzingScreen';
import { DiagnosisScreen } from './components/DiagnosisScreen';
import {
  initTelegramApp,
  getTelegramWebApp,
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
  saveScanToHistory,
  initializeDemoHistoryIfEmpty,
} from './utils/history';

export const App: React.FC = () => {
  const [screen, setScreen] = useState<AppScreen>('home');
  const [language, setLanguage] = useState<Language>('kh'); // Default to Khmer for Cambodian farmers
  const [outdoorMode, setOutdoorMode] = useState<boolean>(false);
  const [modelStatus, setModelStatus] = useState<ModelStatus>('loading');
  const [analyzingImage, setAnalyzingImage] = useState<string | null>(null);
  const [currentDiagnosis, setCurrentDiagnosis] = useState<DiagnosisResult | null>(null);
  const [recentScans, setRecentScans] = useState<DiagnosisResult[]>([]);

  // 1. Initial Launch: Telegram setup, Model loading, and History check
  useEffect(() => {
    initTelegramApp();

    const tg = getTelegramWebApp();
    if (tg?.initDataUnsafe?.user?.language_code) {
      const code = tg.initDataUnsafe.user.language_code.toLowerCase();
      if (code.startsWith('km') || code.startsWith('kh')) {
        setLanguage('kh');
      }
    }

    // Subscribe to model loading status
    const unsubscribe = onModelStatusChange((status) => {
      setModelStatus(status);
    });

    // Load or initialize offline model
    initializeModel();

    // Populate recent scans
    const initialHistory = initializeDemoHistoryIfEmpty();
    setRecentScans(initialHistory);

    return () => {
      unsubscribe();
    };
  }, []);

  // 2. Telegram Native MainButton & BackButton lifecycle bindings
  useEffect(() => {
    let cleanupMain: (() => void) | undefined;
    let cleanupBack: (() => void) | undefined;

    if (screen === 'diagnosis') {
      const buttonText =
        language === 'kh'
          ? 'ស្កេនស្លឹកថ្មី / Scan Another Leaf'
          : 'Scan Another Leaf / ស្កេនស្លឹកថ្មី';

      cleanupMain = setupMainButton(
        buttonText,
        () => {
          setScreen('home');
          setCurrentDiagnosis(null);
        },
        { color: '#16a34a', textColor: '#ffffff' }
      );

      cleanupBack = setupBackButton(() => {
        setScreen('home');
        setCurrentDiagnosis(null);
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
  }, [screen, language]);

  // 3. Process Captured or Uploaded Leaf Image
  const handleSelectImage = useCallback(
    async (fileOrUrl: File | string) => {
      let previewUrl = '';
      if (typeof fileOrUrl === 'string') {
        previewUrl = fileOrUrl;
      } else {
        previewUrl = URL.createObjectURL(fileOrUrl);
      }

      setAnalyzingImage(previewUrl);
      setScreen('analyzing');

      try {
        // Run MobileNetV3-Large on-device inference pipeline
        const result = await diagnoseCornLeaf(fileOrUrl);

        // Tactile Feedback (tg.HapticFeedback): notificationOccurred('success')
        triggerHaptic('notification', 'success');

        // Persist to offline history
        const updatedHistory = saveScanToHistory(result);
        setRecentScans(updatedHistory);

        setCurrentDiagnosis(result);
        setScreen('diagnosis');
      } catch (err) {
        console.error('Diagnosis processing failed:', err);
        triggerHaptic('notification', 'error');
        alert('Could not process leaf image. Please try again with clear lighting.');
        setScreen('home');
      }
    },
    []
  );

  const handleSelectRecentScan = useCallback((scan: DiagnosisResult) => {
    setCurrentDiagnosis(scan);
    setScreen('diagnosis');
  }, []);

  const handleScanAnother = useCallback(() => {
    triggerHaptic('impact', 'medium');
    setCurrentDiagnosis(null);
    setScreen('home');
  }, []);

  const handleToggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'kh' ? 'en' : 'kh'));
  }, []);

  const handleToggleOutdoorMode = useCallback(() => {
    setOutdoorMode((prev) => !prev);
  }, []);

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        outdoorMode
          ? 'bg-black text-white font-semibold'
          : 'bg-[var(--tg-theme-bg-color,#0b1320)] text-[var(--tg-theme-text-color,#f8fafc)]'
      }`}
    >
      {/* Sticky App Header */}
      <TopBar
        language={language}
        onToggleLanguage={handleToggleLanguage}
        outdoorMode={outdoorMode}
        onToggleOutdoorMode={handleToggleOutdoorMode}
        modelStatus={modelStatus}
      />

      {/* Main 3-Screen Body */}
      <main className="flex-1 flex flex-col justify-between">
        {screen === 'home' && (
          <HomeScreen
            language={language}
            onSelectImage={handleSelectImage}
            recentScans={recentScans}
            onSelectRecentScan={handleSelectRecentScan}
            onClearHistory={() => setRecentScans([])}
            outdoorMode={outdoorMode}
          />
        )}

        {screen === 'analyzing' && analyzingImage && (
          <AnalyzingScreen language={language} imagePreviewUrl={analyzingImage} />
        )}

        {screen === 'diagnosis' && currentDiagnosis && (
          <DiagnosisScreen
            language={language}
            diagnosis={currentDiagnosis}
            onScanAnother={handleScanAnother}
            outdoorMode={outdoorMode}
          />
        )}
      </main>
    </div>
  );
};

export default App;
