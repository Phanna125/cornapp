import React, { useRef, useState, useEffect } from 'react';
import {
  Camera,
  Image as ImageIcon,
  Images,
  Video,
  VideoOff,
  SwitchCamera,
  Trash2,
  Leaf,
} from 'lucide-react';
import type { DiagnosisResult, DiseaseId } from '../types';
import { UI_COPY } from '../data/translations';
import { CORN_DISEASES, ORDERED_DISEASE_KEYS } from '../data/diseases';
import { triggerHaptic } from '../utils/telegram';
import { createSampleLeafSvg, clearScanHistory } from '../utils/history';

interface HomeScreenProps {
  onSelectImages: (filesOrUrls: Array<File | string>) => void;
  recentScans: DiagnosisResult[];
  onSelectRecentScan: (scan: DiagnosisResult) => void;
  onClearHistory?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onSelectImages,
  recentScans,
  onSelectRecentScan,
  onClearHistory,
}) => {
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [isLiveCameraActive, setIsLiveCameraActive] = useState(false);
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'diseases'>('all');
  const [now, setNow] = useState<number>(() => Date.now());

  useEffect(() => {
    const interval = setInterval(() => setNow(Date.now()), 60000);
    return () => clearInterval(interval);
  }, []);

  // Attach MediaStream once <video> is mounted and start playback
  useEffect(() => {
    const videoEl = videoRef.current;
    if (!isLiveCameraActive || !cameraStream || !videoEl) return;

    videoEl.srcObject = cameraStream;
    videoEl.play().catch((err) => {
      console.warn('Video autoplay notice:', err);
    });

    return () => {
      videoEl.srcObject = null;
    };
  }, [isLiveCameraActive, cameraStream]);

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
    const files = Array.from(e.target.files ?? []);
    if (files.length > 0) {
      triggerHaptic('impact', 'heavy');
      onSelectImages(files);
      e.target.value = '';
    }
  };

  const stopLiveCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }
    setIsCameraReady(false);
    setIsLiveCameraActive(false);
  };

  const startLiveCamera = async (mode: 'environment' | 'user' = facingMode) => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError('Live camera is unavailable in this browser. Use Take photo or Gallery.');
      return;
    }

    setCameraError(null);
    setIsCameraReady(false);

    if (cameraStream) {
      cameraStream.getTracks().forEach((track) => track.stop());
      setCameraStream(null);
    }

    try {
      let stream: MediaStream;
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: {
            facingMode: { ideal: mode },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
          audio: false,
        });
      } catch {
        // Fallback if specific constraints are unsupported by desktop/webcam drivers
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false,
        });
      }

      setCameraStream(stream);
      setIsLiveCameraActive(true);
    } catch (err) {
      console.warn('Live camera access not granted or unavailable:', err);
      setIsLiveCameraActive(false);
      setCameraError('Camera access was denied or no camera was found. You can still upload a photo.');
    }
  };

  const toggleLiveCamera = async () => {
    triggerHaptic('selection');
    if (isLiveCameraActive) {
      stopLiveCamera();
    } else {
      await startLiveCamera(facingMode);
    }
  };

  const handleSwitchCamera = async () => {
    triggerHaptic('selection');
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);
    await startLiveCamera(nextMode);
  };

  const handleSnapLiveCamera = () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2 || video.videoWidth === 0 || video.videoHeight === 0) {
      return;
    }
    triggerHaptic('impact', 'heavy');

    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
    canvas.toBlob(
      (blob) => {
        if (blob) {
          stopLiveCamera();
          const file = new File([blob], `leaf_${Date.now()}.jpg`, { type: 'image/jpeg' });
          onSelectImages([file]);
        }
      },
      'image/jpeg',
      0.92
    );
  };

  const sampleColorMap: Record<DiseaseId, string> = {
    healthy: '#4d8b55',
    common_rust: '#d99b43',
    corn_leaf_blight: '#c95e5e',
    gray_leaf_spot: '#8e969c',
    insects_damage: '#d1783c',
  };

  const handleDemoSelect = (diseaseId: DiseaseId) => {
    triggerHaptic('impact', 'medium');
    const disease = CORN_DISEASES[diseaseId];
    const demoUrl = createSampleLeafSvg(sampleColorMap[diseaseId], disease.name);
    onSelectImages([demoUrl]);
  };

  const handleBatchDemoSelect = () => {
    triggerHaptic('impact', 'medium');
    const batchIds: DiseaseId[] = ['common_rust', 'healthy', 'corn_leaf_blight'];
    const urls = batchIds.map((id) =>
      createSampleLeafSvg(sampleColorMap[id], CORN_DISEASES[id].name)
    );
    onSelectImages(urls);
  };

  const formatTimeAgo = (timestamp: number): string => {
    const seconds = Math.max(0, Math.floor((now - timestamp) / 1000));
    if (seconds < 60) return 'Now';
    const minutes = Math.floor(seconds / 60);
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  };

  const filteredScans = recentScans.filter((scan) => {
    if (selectedFilter === 'diseases') {
      return scan.topDisease.id !== 'healthy';
    }
    return true;
  });

  return (
    <div className="flex flex-col flex-1 px-5 pb-6 pt-2 space-y-5 max-w-md mx-auto w-full">
      {/* Hidden file inputs */}
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
        multiple
        onChange={handleFileChange}
        className="hidden"
      />

      {/* Circular Orbs Strip (Recent Scans / Today summary) */}
      <div>
        <div className="flex items-center justify-between mb-3 px-0.5">
          <span className="text-xs font-medium text-white/65 tracking-wide">
            {UI_COPY.recentScansTitle}
          </span>
          <div className="flex items-center gap-1.5 text-[11px]">
            <button
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                selectedFilter === 'all'
                  ? 'bg-white/18 text-white'
                  : 'text-white/55 hover:text-white/85'
              }`}
            >
              {UI_COPY.filterAll}
            </button>
            <button
              onClick={() => setSelectedFilter('diseases')}
              className={`px-2.5 py-0.5 rounded-full font-medium transition-colors ${
                selectedFilter === 'diseases'
                  ? 'bg-white/18 text-white'
                  : 'text-white/55 hover:text-white/85'
              }`}
            >
              {UI_COPY.filterDiseases}
            </button>
            {recentScans.length > 0 && onClearHistory && (
              <button
                onClick={() => {
                  triggerHaptic('impact', 'medium');
                  if (window.confirm(UI_COPY.clearHistoryConfirm)) {
                    clearScanHistory();
                    onClearHistory();
                  }
                }}
                title={UI_COPY.clearHistoryBtn}
                aria-label={UI_COPY.clearHistoryBtn}
                className="p-1 text-white/45 hover:text-white/85 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar py-1">
          {/* Highlighted Today Summary Orb matching reference */}
          <button
            onClick={handleCameraClick}
            className="flex-shrink-0 w-[78px] h-[78px] rounded-full glass-orb-active flex flex-col items-center justify-center text-center transition-transform active:scale-95"
          >
            <span className="text-[10px] font-medium text-white/80">Today</span>
            <span className="text-xl font-bold leading-tight text-white">
              {recentScans.length}
            </span>
            <span className="text-[10px] text-white/75">scans</span>
          </button>

          {filteredScans.length === 0 ? (
            <div className="flex-1 min-w-[180px] h-[78px] rounded-full glass-orb px-5 flex flex-col justify-center">
              <p className="text-xs font-semibold text-white/85">{UI_COPY.noScansTitle}</p>
              <p className="text-[11px] text-white/55 truncate">{UI_COPY.noScansDesc}</p>
            </div>
          ) : (
            filteredScans.map((scan) => (
              <button
                key={scan.id}
                onClick={() => {
                  triggerHaptic('selection');
                  onSelectRecentScan(scan);
                }}
                className="flex-shrink-0 w-[78px] h-[78px] rounded-full glass-orb flex flex-col items-center justify-center text-center px-2 transition-all hover:border-white/40 active:scale-95"
              >
                <span className="text-[10px] font-medium text-white/60">
                  {formatTimeAgo(scan.timestamp)}
                </span>
                <span className="text-sm font-bold text-white leading-tight mt-0.5 truncate max-w-[64px]">
                  {scan.topDisease.shortName}
                </span>
                <span className="text-[10px] font-medium text-white/75 mt-0.5">
                  {scan.confidencePercentage}
                </span>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Main Frosted Glass Card */}
      <section className="glass-card rounded-[32px] p-5 flex-1 flex flex-col justify-between min-h-[400px]">
        {/* Top Card Row: Pill Tag + Live Camera Icon */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1 rounded-full bg-white/12 border border-white/20 text-xs font-medium text-white/90">
              {UI_COPY.heroBadge}
            </span>
            <span className="text-xs font-medium text-white/60">
              {UI_COPY.heroClasses}
            </span>
          </div>

          <button
            onClick={toggleLiveCamera}
            title={isLiveCameraActive ? UI_COPY.btnExitLive : UI_COPY.btnLiveView}
            aria-label={isLiveCameraActive ? UI_COPY.btnExitLive : UI_COPY.btnLiveView}
            className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all active:scale-90 ${
              isLiveCameraActive
                ? 'bg-[#f7f0c6] text-[#1a1612] border-[#f7f0c6]'
                : 'bg-white/10 hover:bg-white/18 text-white/85 border-white/18'
            }`}
          >
            {isLiveCameraActive ? (
              <VideoOff className="w-4 h-4" />
            ) : (
              <Video className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Center Editorial / Camera Content */}
        {isLiveCameraActive ? (
          <div className="my-4 relative w-full flex-1 min-h-[260px] rounded-3xl overflow-hidden bg-black/70 border border-white/20 flex items-center justify-center">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              onLoadedMetadata={() => {
                videoRef.current?.play().catch(() => {});
                setIsCameraReady(true);
              }}
              onPlaying={() => setIsCameraReady(true)}
              className="w-full h-full object-cover"
            />
            {!isCameraReady && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40 text-xs font-medium text-white/75">
                Starting camera...
              </div>
            )}
            <div className="absolute inset-5 rounded-2xl border border-white/35 pointer-events-none" />
          </div>
        ) : (
          <div className="my-5 flex-1 flex flex-col justify-center">
            {cameraError && (
              <div className="mb-4 px-3.5 py-2.5 rounded-2xl bg-rose-400/15 border border-rose-300/30 text-xs text-rose-100">
                {cameraError}
              </div>
            )}
            <div
              onClick={handleCameraClick}
              className="cursor-pointer group space-y-4"
            >
              <div className="w-12 h-12 rounded-2xl bg-white/12 border border-white/20 flex items-center justify-center text-[#f7f0c6] group-hover:scale-105 transition-transform">
                <Leaf className="w-6 h-6" />
              </div>

              <div>
                <h2 className="text-3xl sm:text-[34px] font-bold tracking-tight text-white leading-tight">
                  {UI_COPY.heroHeading}
                </h2>
                <p className="text-sm text-white/65 mt-1 font-medium">
                  MobileNetV3 • On-device
                </p>
              </div>

              <div className="border-t border-white/15 pt-4">
                <p className="text-xs font-medium uppercase tracking-wider text-white/50 mb-1">
                  Scanning guide
                </p>
                <p className="text-sm text-white/85 leading-relaxed">
                  {UI_COPY.heroGuidance}
                </p>
              </div>
            </div>

            {/* Clean Sample Leaf Pills & Multi-Upload Trigger */}
            <div className="mt-5 pt-4 border-t border-white/10 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-[11px] font-medium text-white/50">
                  {UI_COPY.sampleLabel}
                </p>
                <button
                  onClick={handleGalleryClick}
                  className="px-2.5 py-1 rounded-full bg-white/10 hover:bg-white/18 border border-white/20 text-[11px] font-medium text-[#f7f0c6] flex items-center gap-1.5 transition-colors active:scale-95"
                >
                  <Images className="w-3 h-3" />
                  <span>{UI_COPY.btnMultiUpload}</span>
                </button>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {ORDERED_DISEASE_KEYS.map((id) => {
                  const disease = CORN_DISEASES[id];
                  return (
                    <button
                      key={id}
                      onClick={() => handleDemoSelect(id)}
                      className="px-3 py-1.5 rounded-full bg-white/8 hover:bg-white/16 border border-white/15 text-xs font-medium text-white/85 transition-colors active:scale-95 flex items-center gap-1.5"
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${disease.badgeColor.dot}`} />
                      <span>{disease.shortName}</span>
                    </button>
                  );
                })}
                <button
                  onClick={handleBatchDemoSelect}
                  className="px-3 py-1.5 rounded-full bg-[#f7f0c6]/15 hover:bg-[#f7f0c6]/25 border border-[#f7f0c6]/35 text-xs font-medium text-[#f7f0c6] transition-colors active:scale-95"
                >
                  {UI_COPY.sampleBatchBtn}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Floating Capsule Action Dock matching reference bottom bar */}
        <div className="glass-dock rounded-full p-1.5 flex items-center justify-between gap-2">
          <button
            onClick={handleGalleryClick}
            title={UI_COPY.btnGallery}
            aria-label={UI_COPY.btnGallery}
            className="w-12 h-12 rounded-full bg-white/8 hover:bg-white/16 border border-white/15 flex items-center justify-center text-white/90 transition-all active:scale-90"
          >
            <ImageIcon className="w-4 h-4" />
          </button>

          <button
            onClick={isLiveCameraActive ? handleSnapLiveCamera : handleCameraClick}
            disabled={isLiveCameraActive && !isCameraReady}
            className="flex-1 h-12 rounded-full bg-[#f7f0c6] hover:bg-[#fcf7da] disabled:opacity-50 text-[#1a1612] font-semibold text-sm tracking-tight shadow-lg flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <Camera className="w-4 h-4" />
            <span>{isLiveCameraActive ? UI_COPY.btnCapture : UI_COPY.btnTakePhoto}</span>
          </button>

          <button
            onClick={isLiveCameraActive ? handleSwitchCamera : toggleLiveCamera}
            title={isLiveCameraActive ? 'Switch camera' : UI_COPY.btnLiveView}
            aria-label={isLiveCameraActive ? 'Switch camera' : UI_COPY.btnLiveView}
            className="w-12 h-12 rounded-full bg-white/8 hover:bg-white/16 border border-white/15 flex items-center justify-center text-white/90 transition-all active:scale-90"
          >
            {isLiveCameraActive ? (
              <SwitchCamera className="w-4 h-4" />
            ) : (
              <Video className="w-4 h-4" />
            )}
          </button>
        </div>
      </section>
    </div>
  );
};
