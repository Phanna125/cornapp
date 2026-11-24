import { CORN_DISEASES } from '../data/diseases';
import type { DiagnosisResult } from '../types';

const STORAGE_KEY = 'corn_leaf_scan_history_v1';
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
  try {
    const existing = getScanHistory();
    // Prepend new scan to start of list
    const filtered = existing.filter((item) => item.id !== scan.id);
    const updated = [scan, ...filtered].slice(0, MAX_HISTORY_ITEMS);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch (e) {
    console.warn('Failed to save scan to localStorage (quota exceeded?):', e);
    // If quota exceeded, trim half the history and retry
    try {
      const existing = getScanHistory().slice(0, 5);
      const updated = [scan, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    } catch {
      return [];
    }
  }
};

export const deleteScanFromHistory = (id: string): DiagnosisResult[] => {
  try {
    const existing = getScanHistory();
    const updated = existing.filter((item) => item.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    return updated;
  } catch {
    return [];
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
 * Creates SVG data URL placeholders for demo samples
 */
export const createSampleLeafSvg = (color: string, label: string): string => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
    <rect width="300" height="300" fill="#0d1b1e"/>
    <defs>
      <linearGradient id="leafGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stop-color="${color}" stop-opacity="0.9"/>
        <stop offset="100%" stop-color="#14532d" stop-opacity="0.95"/>
      </linearGradient>
    </defs>
    <!-- Corn leaf curve -->
    <path d="M 150 25 C 240 70 260 210 150 275 C 40 210 60 70 150 25 Z" fill="url(#leafGrad)" stroke="#22c55e" stroke-width="3"/>
    <!-- Leaf midrib vein -->
    <path d="M 150 25 Q 155 150 150 275" stroke="#86efac" stroke-width="4" stroke-linecap="round"/>
    <!-- Vein branches -->
    <path d="M 150 90 Q 185 110 210 120 M 150 130 Q 195 155 220 170 M 150 170 Q 190 195 210 215" stroke="#86efac" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    <path d="M 150 90 Q 115 110 90 120 M 150 130 Q 105 155 80 170 M 150 170 Q 110 195 90 215" stroke="#86efac" stroke-width="2" stroke-linecap="round" opacity="0.6"/>
    <text x="150" y="285" fill="#f8fafc" font-family="sans-serif" font-size="14" font-weight="bold" text-anchor="middle">${label}</text>
  </svg>`;

  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
};

/**
 * Initializes mock seed scans if user history is brand new,
 * showcasing recent scans on first launch to judges.
 */
export const initializeDemoHistoryIfEmpty = (): DiagnosisResult[] => {
  const current = getScanHistory();
  if (current.length > 0) return current;

  const demoScans: DiagnosisResult[] = [
    {
      id: 'demo_rust_01',
      timestamp: Date.now() - 1000 * 60 * 45, // 45 mins ago
      imageUrl: createSampleLeafSvg('#f59e0b', 'Common Rust (Sample)'),
      topDisease: CORN_DISEASES.common_rust,
      confidence: 0.988,
      confidencePercentage: '98.8%',
      inferenceDurationMs: 194,
      allScores: [
        { id: 'common_rust', nameEn: 'Common Rust', nameKh: 'ជំងឺច្រែះស្លឹក (Common Rust)', probability: 0.988, percentage: '98.8%', color: 'bg-amber-500' },
        { id: 'corn_leaf_blight', nameEn: 'Corn Leaf Blight', nameKh: 'ជំងឺរលាកស្លឹកពោត (Leaf Blight)', probability: 0.008, percentage: '0.8%', color: 'bg-rose-500' },
        { id: 'gray_leaf_spot', nameEn: 'Gray Leaf Spot', nameKh: 'ជំងឺអុជប្រផេះ (Gray Leaf Spot)', probability: 0.002, percentage: '0.2%', color: 'bg-purple-500' },
        { id: 'insects_damage', nameEn: 'Insects Damage', nameKh: 'សត្វល្អិតបំផ្លាញ', probability: 0.001, percentage: '0.1%', color: 'bg-orange-500' },
        { id: 'healthy', nameEn: 'Healthy', nameKh: 'សុខភាពល្អ', probability: 0.001, percentage: '0.1%', color: 'bg-emerald-500' },
      ],
    },
    {
      id: 'demo_healthy_02',
      timestamp: Date.now() - 1000 * 60 * 180, // 3 hours ago
      imageUrl: createSampleLeafSvg('#22c55e', 'Healthy Leaf (Sample)'),
      topDisease: CORN_DISEASES.healthy,
      confidence: 0.995,
      confidencePercentage: '99.5%',
      inferenceDurationMs: 167,
      allScores: [
        { id: 'healthy', nameEn: 'Healthy', nameKh: 'សុខភាពល្អ', probability: 0.995, percentage: '99.5%', color: 'bg-emerald-500' },
        { id: 'common_rust', nameEn: 'Common Rust', nameKh: 'ជំងឺច្រែះស្លឹក', probability: 0.002, percentage: '0.2%', color: 'bg-amber-500' },
        { id: 'insects_damage', nameEn: 'Insects Damage', nameKh: 'សត្វល្អិតបំផ្លាញ', probability: 0.001, percentage: '0.1%', color: 'bg-orange-500' },
        { id: 'corn_leaf_blight', nameEn: 'Corn Leaf Blight', nameKh: 'ជំងឺរលាកស្លឹកពោត', probability: 0.001, percentage: '0.1%', color: 'bg-rose-500' },
        { id: 'gray_leaf_spot', nameEn: 'Gray Leaf Spot', nameKh: 'ជំងឺអុជប្រផេះ', probability: 0.001, percentage: '0.1%', color: 'bg-purple-500' },
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
