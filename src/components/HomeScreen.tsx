import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Sparkles,
  Clock,
  ChevronRight,
  AlertCircle,
  Video,
  VideoOff,
  Trash2,
} from 'lucide-react';
import type { DiagnosisResult, DiseaseId, Language } from '../types';
import { TRANSLATIONS } from '../data/translations';
import { CORN_DISEASES } from '../data/diseases';
import { triggerHaptic } from '../utils/telegram';
import { createSampleLeafSvg, clearScanHistory } from '../utils/history';

interface HomeScreenProps {
  language: Language;
  onSelectImage: (fileOrUrl: File | string) => void;
  recentScans: DiagnosisResult[];
  onSelectRecentScan: (scan: DiagnosisResult) => void;
  onClearHistory?: () => void;
  outdoorMode: boolean;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  language,
  onSelectImage,
  recentScans,
  onSelectRecentScan,
  onClearHistory,
  outdoorMode,
}) => {
  const t = TRANSLATIONS[language];
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'diseases'>('all');

  // Stop video stream when unmounting
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [cameraStream]);

  const handleCameraClick = () => {
    triggerHaptic('impact', 'medium');
    cameraInputRef.current?.click();
  };

  const handleGalleryClick = () => {
    triggerHaptic('impact', 'light');
    galleryInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      triggerHaptic('impact', 'heavy');
      onSelectImage(file);
      e.target.value = '';
    }
  };

  // Toggle Live Camera Viewfinder
  const toggleLiveCamera = async () => {
    triggerHaptic('selection');
    if (isLiveCameraActive) {
      if (cameraStream) {
        cameraStream.getTracks().forEach((track) => track.stop());
        setCameraStream(null);
      }
      setIsLiveCameraActive(false);
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' }, width: { ideal: 720 }, height: { ideal: 720 } },
          audio: false,
        });
        setCameraStream(stream);
        setIsLiveCameraActive(true);
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (err) {
        console.warn('Live camera access not granted or unavailable:', err);
        // Fallback to standard camera capture input
        cameraInputRef.current?.click();
      }
    }
  };

  // Capture frame directly from live camera stream
  const handleSnapLiveCamera = () => {
    if (!videoRef.current) return;
    triggerHaptic('impact', 'heavy');

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 640;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          // Stop live stream
          if (cameraStream) {
            cameraStream.getTracks().forEach((track) => track.stop());
            setCameraStream(null);
          }
          setIsLiveCameraActive(false);
          const file = new File([blob], `leaf_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onSelectImage(file);
        }
      },
      'image/jpeg',
      0.9
    );
  };

  const handleDemoSelect = (diseaseId: DiseaseId) => {
    triggerHaptic('impact', 'medium');
    const colorMap: Record<DiseaseId, string> = {
      healthy: '#22c55e',
      common_rust: '#f59e0b',
      corn_leaf_blight: '#f43f5e',
      gray_leaf_spot: '#a855f7',
      insects_damage: '#ea580c',
    };
    const disease = CORN_DISEASES[diseaseId];
    const demoUrl = createSampleLeafSvg(colorMap[diseaseId], disease.name.en);
    onSelectImage(demoUrl);
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000);
    if (seconds < 60) return language === 'kh' ? 'អម្បាញ់មិញ' : 'Just now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return language === 'kh' ? `${minutes} នាទីមុន` : `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return language === 'kh' ? `${hours} ម៉ោងមុន` : `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return language === 'kh' ? `${days} ថ្ងៃមុន` : `${days}d ago`;
  };

  const filteredScans = recentScans.filter((scan) => {
    if (selectedFilter === 'diseases') {
      return scan.topDisease.id !== 'healthy';
    }
    return true;
  });

  return (
    <div className="flex flex-col flex-1 px-4 py-3 space-y-4 max-w-lg mx-auto w-full">
      {/* Hidden file inputs: one for rear camera, one for gallery */}
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileChange}
        className="hidden"
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Center Hero Viewfinder Card with HUD Reticle */}
      <div
        className={`relative overflow-hidden rounded-3xl border-2 transition-all shadow-xl ${
          outdoorMode
            ? 'bg-black border-emerald-400 shadow-emerald-500/30'
            : 'bg-gradient-to-b from-slate-900/90 via-slate-950/95 to-slate-900/90 border-emerald-500/40 hover:border-emerald-400'
        }`}
      >
        {/* Top Viewfinder Controls */}
        <div className="absolute top-3 left-4 right-4 z-20 flex items-center justify-between pointer-events-auto">
          <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-slate-950/80 backdrop-blur-md border border-slate-700/60 text-[10px] font-mono text-emerald-400">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AI SCAN HUD</span>
          </div>

          <button
            onClick={toggleLiveCamera}
            className={`flex items-center space-x-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold transition-all border shadow-sm ${
              isLiveCameraActive
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                : 'bg-slate-900/80 text-slate-300 border-slate-700 hover:text-emerald-300'
            }`}
          >
            {isLiveCameraActive ? (
              <>
                <VideoOff className="w-3.5 h-3.5" />
                <span>Exit Live</span>
              </>
            ) : (
              <>
                <Video className="w-3.5 h-3.5 text-emerald-400" />
                <span>Live View</span>
              </>
            )}
          </button>
        </div>

        {/* Viewfinder Content: Live Camera or Graphic Dropzone */}
        {isLiveCameraActive ? (
          <div className="relative w-full h-72 sm:h-80 bg-black flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
            />
            {/* Viewfinder Reticle Corners */}
            <div className="absolute inset-8 border border-emerald-500/30 rounded-2xl pointer-events-none">
              <div className="absolute top-0 left-0 w-5 h-5 border-t-2 border-l-2 border-emerald-400 -mt-0.5 -ml-0.5"></div>
              <div className="absolute top-0 right-0 w-5 h-5 border-t-2 border-r-2 border-emerald-400 -mt-0.5 -mr-0.5"></div>
              <div className="absolute bottom-0 left-0 w-5 h-5 border-b-2 border-l-2 border-emerald-400 -mb-0.5 -ml-0.5"></div>
              <div className="absolute bottom-0 right-0 w-5 h-5 border-b-2 border-r-2 border-emerald-400 -mb-0.5 -mr-0.5"></div>
            </div>

            {/* Shutter Capture Button */}
            <div className="absolute bottom-4 inset-x-0 flex justify-center z-20">
              <button
                onClick={handleSnapLiveCamera}
                className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 border-4 border-white shadow-2xl flex items-center justify-center text-slate-950 active:scale-90 transition-transform"
              >
                <Camera className="w-7 h-7" />
              </button>
            </div>
          </div>
        ) : (
          <div
            onClick={handleCameraClick}
            className="group relative flex flex-col items-center justify-center p-7 sm:p-8 cursor-pointer select-none"
          >
            {/* Viewfinder HUD Framing Brackets */}
            <div className="absolute inset-4 pointer-events-none">
              <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400/80"></div>
              <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400/80"></div>
              <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400/80"></div>
              <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400/80"></div>
            </div>

            {/* Pulsing Corn Leaf Target */}
            <div className="relative my-3">
              <div className="absolute inset-0 rounded-full animate-radar bg-emerald-500/25 blur-sm pointer-events-none"></div>
              <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-emerald-950 via-emerald-900 to-green-900 border-2 border-emerald-400 flex items-center justify-center shadow-2xl relative z-10 transition-transform group-hover:scale-105">
                <svg
                  className="w-14 h-14 sm:w-16 sm:h-16 text-emerald-300 transform -rotate-12 drop-shadow-md"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.8"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M12 2C6.5 2 2 6.5 2 12c0 3.5 1.8 6.6 4.6 8.4L12 22l5.4-1.6C20.2 18.6 22 15.5 22 12c0-5.5-4.5-10-10-10z" />
                  <path d="M12 2v20" />
                  <path d="M12 7l4 2" />
                  <path d="M12 12l-4 2" />
                  <path d="M12 17l4 2" />
                </svg>
                <div className="absolute bottom-0 right-0 bg-emerald-500 text-slate-950 p-2 rounded-full shadow-lg border-2 border-slate-950">
                  <Camera className="w-4 h-4" />
                </div>
              </div>
            </div>

            {/* Bilingual Tips */}
            <div className="text-center mt-2 space-y-1 z-10">
              <h2 className="text-base sm:text-lg font-extrabold tracking-tight text-white font-['Plus_Jakarta_Sans',var(--font-khmer)]">
                {t.heroTip}
              </h2>
              <p className="text-sm font-semibold text-emerald-300 font-['Kantumruy_Pro',sans-serif]">
                {t.heroSubtip}
              </p>
              <p className="text-xs text-slate-400 pt-1 font-medium">
                {t.heroCardInstruction}
              </p>
            </div>

            {/* Action pill */}
            <div className="mt-4 px-4 py-1.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5 group-hover:bg-emerald-500/30 transition-colors">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Tap to Snap Leaf Photo</span>
            </div>
          </div>
        )}
      </div>

      {/* Primary Action Buttons: Take Photo & Choose Gallery */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={handleCameraClick}
          className="flex items-center justify-center space-x-2 py-4 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-green-600 to-emerald-600 hover:from-emerald-500 hover:to-green-500 text-white font-extrabold text-sm tracking-wide shadow-lg shadow-emerald-900/40 active:scale-[0.97] transition-all border border-emerald-400/40"
        >
          <Camera className="w-5 h-5 text-emerald-100" />
          <span className="font-['Plus_Jakarta_Sans',var(--font-khmer)]">{t.btnTakePhoto}</span>
        </button>

        <button
          onClick={handleGalleryClick}
          className="flex items-center justify-center space-x-2 py-4 px-4 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-100 font-extrabold text-sm tracking-wide shadow-md active:scale-[0.97] transition-all border border-slate-700/80"
        >
          <ImageIcon className="w-5 h-5 text-emerald-400" />
          <span className="font-['Plus_Jakarta_Sans',var(--font-khmer)]">{t.btnGallery}</span>
        </button>
      </div>

      {/* Judge & Presentation 1-Tap Demo Selector Bar */}
      <div className="pt-1.5">
        <div className="flex items-center justify-between mb-2 px-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            {t.btnTryDemo}
          </span>
          <span className="text-[10px] text-slate-400">1-click AI evaluation</span>
        </div>
        <div className="grid grid-cols-5 gap-1.5">
          <button
            onClick={() => handleDemoSelect('healthy')}
            className="flex flex-col items-center p-2 rounded-2xl bg-emerald-950/60 hover:bg-emerald-900/70 border border-emerald-600/50 text-[10px] text-emerald-300 font-bold transition-all active:scale-95 text-center shadow-sm"
          >
            <span className="text-lg">🟢</span>
            <span className="mt-1 leading-tight line-clamp-1">{language === 'kh' ? 'សុខភាពល្អ' : 'Healthy'}</span>
          </button>
          <button
            onClick={() => handleDemoSelect('common_rust')}
            className="flex flex-col items-center p-2 rounded-2xl bg-amber-950/60 hover:bg-amber-900/70 border border-amber-600/50 text-[10px] text-amber-300 font-bold transition-all active:scale-95 text-center shadow-sm"
          >
            <span className="text-lg">🟡</span>
            <span className="mt-1 leading-tight line-clamp-1">{language === 'kh' ? 'ច្រែះស្លឹក' : 'Rust'}</span>
          </button>
          <button
            onClick={() => handleDemoSelect('corn_leaf_blight')}
            className="flex flex-col items-center p-2 rounded-2xl bg-rose-950/60 hover:bg-rose-900/70 border border-rose-600/50 text-[10px] text-rose-300 font-bold transition-all active:scale-95 text-center shadow-sm"
          >
            <span className="text-lg">🔴</span>
            <span className="mt-1 leading-tight line-clamp-1">{language === 'kh' ? 'រលាកស្លឹក' : 'Blight'}</span>
          </button>
          <button
            onClick={() => handleDemoSelect('gray_leaf_spot')}
            className="flex flex-col items-center p-2 rounded-2xl bg-purple-950/60 hover:bg-purple-900/70 border border-purple-600/50 text-[10px] text-purple-300 font-bold transition-all active:scale-95 text-center shadow-sm"
          >
            <span className="text-lg">🟣</span>
            <span className="mt-1 leading-tight line-clamp-1">{language === 'kh' ? 'អុជប្រផេះ' : 'Gray Spot'}</span>
          </button>
          <button
            onClick={() => handleDemoSelect('insects_damage')}
            className="flex flex-col items-center p-2 rounded-2xl bg-orange-950/60 hover:bg-orange-900/70 border border-orange-600/50 text-[10px] text-orange-300 font-bold transition-all active:scale-95 text-center shadow-sm"
          >
            <span className="text-lg">🟠</span>
            <span className="mt-1 leading-tight line-clamp-1">{language === 'kh' ? 'សត្វល្អិត' : 'Insects'}</span>
          </button>
        </div>
      </div>

      {/* Bottom Strip: Recent Field Scans with Filter Chips */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-200">
            <Clock className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t.recentScansTitle}</span>
          </div>

          {/* Filter Pills & Clear */}
          <div className="flex items-center space-x-1.5 text-[10px]">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2 py-0.5 rounded-full font-bold transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {t.filterAll}
            </button>
            <button
              onClick={() => setSelectedFilter('diseases')}
              className={`px-2 py-0.5 rounded-full font-bold transition-colors ${
                selectedFilter === 'diseases'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-400 hover:text-slate-300'
              }`}
            >
              {t.filterDiseases}
            </button>
            {recentScans.length > 0 && onClearHistory && (
              <button
                onClick={() => {
                  triggerHaptic('impact', 'medium');
                  if (window.confirm(t.clearHistoryConfirm)) {
                    clearScanHistory();
                    onClearHistory();
                  }
                }}
                title={t.clearHistoryBtn}
                className="p-1 rounded-md text-slate-500 hover:text-rose-400 transition-colors ml-1"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {filteredScans.length === 0 ? (
          <div className="flex items-center justify-center p-6 rounded-3xl bg-slate-900/60 border border-slate-800 text-center">
            <div className="text-slate-400 text-xs">
              <AlertCircle className="w-5 h-5 mx-auto mb-1 text-slate-500" />
              <p className="font-semibold text-slate-300">{t.noScansTitle}</p>
              <p className="text-[11px] mt-0.5">{t.noScansDesc}</p>
            </div>
          </div>
        ) : (
          <div className="flex space-x-3 overflow-x-auto no-scrollbar pb-2 pt-0.5">
            {filteredScans.map((scan) => {
              const disease = scan.topDisease;
              return (
                <div
                  key={scan.id}
                  onClick={() => {
                    triggerHaptic('selection');
                    onSelectRecentScan(scan);
                  }}
                  className="flex-shrink-0 w-36 sm:w-40 p-2.5 rounded-3xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/70 hover:border-emerald-500/50 transition-all cursor-pointer active:scale-95 shadow-lg flex flex-col justify-between"
                >
                  <div className="relative w-full h-24 rounded-2xl overflow-hidden bg-slate-950 mb-2 border border-slate-800">
                    <img
                      src={scan.imageUrl}
                      alt={disease.name.en}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute top-1.5 right-1.5 px-2 py-0.5 rounded-lg bg-slate-950/80 backdrop-blur-sm text-[10px] font-bold text-emerald-400 border border-emerald-500/20">
                      {scan.confidencePercentage}
                    </div>
                  </div>
                  <div>
                    <p className="text-xs font-bold text-slate-100 line-clamp-1 font-['Plus_Jakarta_Sans',var(--font-khmer)]">
                      {language === 'kh' ? disease.name.kh : disease.name.en}
                    </p>
                    <div className="flex items-center justify-between mt-1.5 text-[10px] text-slate-400">
                      <span>{formatTimeAgo(scan.timestamp)}</span>
                      <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
