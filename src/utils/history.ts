import { CORN_DISEASES } from '../data/diseases';
import type { DiagnosisResult } from '../types';

const STORAGE_KEY = 'corn_leaf_scan_history_v2';
const MAX_HISTORY_ITEMS = 20;

export const getScanHistory = (): DiagnosisResult[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
    return [];
  } catch (e) {
    console.warn('Failed to parse scan history from localStorage:', e);
    return [];
  }
};

export const saveScanToHistory = (scan: DiagnosisResult): DiagnosisResult[] => {
  return saveScansToHistory([scan]);
};

export const saveScansToHistory = (scans: DiagnosisResult[]): DiagnosisResult[] => {
  if (scans.length === 0) return getScanHistory();
  try {
    const existing = getScanHistory();
    const newIds = new Set(scans.map((s) => s.id));
    const filtered = existing.filter((item) => !newIds.has(item.id));
    const updated = [...scans, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save scans to localStorage (quota exceeded?):', e);
    try {
      const existing = getScanHistory().slice(0, 4);
      const updated = [...scans.slice(0, 6), ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }
};

export const clearScanHistory = (): void => {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('Failed to clear scan history:', e);
  }
};

/**
 * Creates clean SVG sample leaf placeholders for quick evaluation
 */
export const createSampleLeafSvg = (color: string, label: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="#231915"/>
    <defs>
      <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.92"/>
        <stop offset="100%" stop-color="#2e4028" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <path d="M 150 28 C 232 76 250 206 150 268 C 50 206 68 76 150 28 Z" fill="url(#leafGrad)" stroke="#d9e2c8" stroke-opacity="0.5" stroke-width="2.5"/>
    <path d="M 150 28 Q 154 148 150 268" stroke="#f7f0c6" stroke-opacity="0.65" stroke-width="3" stroke-linecap="round"/>
    <path d="M 150 90 Q 182 110 206 120 M 150 130 Q 190 152 214 166 M 150 170 Q 186 192 204 210" stroke="#f7f0c6" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>
    <path d="M 150 90 Q 118 110 94 120 M 150 130 Q 110 152 86 166 M 150 170 Q 114 192 96 210" stroke="#f7f0c6" stroke-opacity="0.35" stroke-width="2" stroke-linecap="round"/>
    <text x="150" y="286" fill="#f7f4ef" font-family="sans-serif" font-size="13" font-weight="600" text-anchor="middle">${label}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Initializes sample scans on first launch
 */
export const initializeDemoHistoryIfEmpty = (): DiagnosisResult[] => {
  const current = getScanHistory();
  if (current.length > 0) return current;

  const demoScans: DiagnosisResult[] = [
    {
      id: 'demo_rust_01',
      timestamp: Date.now() - 1000 * 60 * 45,
      imageUrl: createSampleLeafSvg('#d99b43', 'Common Rust'),
      topDisease: CORN_DISEASES.common_rust,
      confidence: 0.988,
      confidencePercentage: '98.8%',
      inferenceDurationMs: 184,
      allScores: [
        { id: 'common_rust', name: 'Common Rust', probability: 0.988, percentage: '98.8%', color: 'bg-amber-400' },
        { id: 'corn_leaf_blight', name: 'Corn Leaf Blight', probability: 0.008, percentage: '0.8%', color: 'bg-rose-400' },
        { id: 'gray_leaf_spot', name: 'Gray Leaf Spot', probability: 0.002, percentage: '0.2%', color: 'bg-slate-300' },
        { id: 'insects_damage', name: 'Insect Damage', probability: 0.001, percentage: '0.1%', color: 'bg-orange-400' },
        { id: 'healthy', name: 'Healthy Corn Leaf', probability: 0.001, percentage: '0.1%', color: 'bg-emerald-400' },
      ],
    },
    {
      id: 'demo_healthy_02',
      timestamp: Date.now() - 1000 * 60 * 180,
      imageUrl: createSampleLeafSvg('#4d8b55', 'Healthy Leaf'),
      topDisease: CORN_DISEASES.healthy,
      confidence: 0.995,
      confidencePercentage: '99.5%',
      inferenceDurationMs: 162,
      allScores: [
        { id: 'healthy', name: 'Healthy Corn Leaf', probability: 0.995, percentage: '99.5%', color: 'bg-emerald-400' },
        { id: 'common_rust', name: 'Common Rust', probability: 0.002, percentage: '0.2%', color: 'bg-amber-400' },
        { id: 'insects_damage', name: 'Insect Damage', probability: 0.001, percentage: '0.1%', color: 'bg-orange-400' },
        { id: 'corn_leaf_blight', name: 'Corn Leaf Blight', probability: 0.001, percentage: '0.1%', color: 'bg-rose-400' },
        { id: 'gray_leaf_spot', name: 'Gray Leaf Spot', probability: 0.001, percentage: '0.1%', color: 'bg-slate-300' },
      ],
    },
  ];

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(demoScans));
    return demoScans;
  } catch {
    return [];
  }
};
