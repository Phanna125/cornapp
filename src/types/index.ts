export type Language = 'en' | 'kh';

export type DiseaseId =
  | 'healthy'
  | 'common_rust'
  | 'corn_leaf_blight'
  | 'gray_leaf_spot'
  | 'insects_damage';

export interface TreatmentAdvice {
  en: string[];
  kh: string[];
}

export interface DiseaseInfo {
  id: DiseaseId;
  index: number;
  name: {
    en: string;
    kh: string;
  };
  scientificName: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    glow: string;
    dot: string;
  };
  severity: 'healthy' | 'moderate' | 'high' | 'severe' | 'action_needed';
  treatmentAdvice: TreatmentAdvice;
  causes: {
    en: string;
    kh: string;
  };
}

export interface ClassProbability {
  id: DiseaseId;
  nameEn: string;
  nameKh: string;
  probability: number; // 0 to 1
  percentage: string;  // e.g. "99.4%"
  color: string;
}

export interface DiagnosisResult {
  id: string;
  timestamp: number;
  imageUrl: string;
  topDisease: DiseaseInfo;
  confidence: number; // 0 to 1
  confidencePercentage: string; // e.g. "99.4%"
  allScores: ClassProbability[];
  inferenceDurationMs: number;
}

export type AppScreen = 'home' | 'analyzing' | 'diagnosis';
