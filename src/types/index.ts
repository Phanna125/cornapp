export type DiseaseId =
  | 'healthy'
  | 'common_rust'
  | 'corn_leaf_blight'
  | 'gray_leaf_spot'
  | 'insects_damage';

export interface DiseaseInfo {
  id: DiseaseId;
  index: number;
  name: string;
  shortName: string;
  scientificName: string;
  badgeColor: {
    bg: string;
    text: string;
    border: string;
    dot: string;
  };
  severity: 'healthy' | 'moderate' | 'high' | 'severe' | 'action_needed';
  treatmentAdvice: string[];
  causes: string;
}

export interface ClassProbability {
  id: DiseaseId;
  name: string;
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
  engine?: 'onnx' | 'heuristic';
}

export type AppScreen = 'home' | 'analyzing' | 'diagnosis';
