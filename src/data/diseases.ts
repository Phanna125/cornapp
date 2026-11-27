import type { DiseaseId, DiseaseInfo } from '../types';

export const CORN_DISEASES: Record<DiseaseId, DiseaseInfo> = {
  healthy: {
    id: 'healthy',
    index: 3,
    name: 'Healthy Corn Leaf',
    shortName: 'Healthy',
    scientificName: 'Zea mays • Normal',
    badgeColor: {
      bg: 'bg-emerald-400/15',
      text: 'text-emerald-200',
      border: 'border-emerald-300/35',
      dot: 'bg-emerald-400',
    },
    severity: 'healthy',
    causes: 'Optimal field nutrition, clean soil, and balanced moisture.',
    treatmentAdvice: [
      'No chemical treatment needed — maintain your current irrigation schedule.',
      'Apply balanced nitrogen-potassium fertilizer to support active ear formation.',
      'Keep scouting lower leaves once every 5–7 days during rainy spells.',
    ],
  },

  common_rust: {
    id: 'common_rust',
    index: 0,
    name: 'Common Rust',
    shortName: 'Rust',
    scientificName: 'Puccinia sorghi',
    badgeColor: {
      bg: 'bg-amber-300/15',
      text: 'text-amber-100',
      border: 'border-amber-200/35',
      dot: 'bg-amber-400',
    },
    severity: 'moderate',
    causes: 'Airborne fungal spores favored by high humidity (80%+) and moderate temperatures (16–25°C).',
    treatmentAdvice: [
      'Apply a triazole or strobilurin fungicide (e.g., Azoxystrobin + Difenoconazole) if pustules spread to upper ear leaves.',
      'Avoid excessive late-season nitrogen fertilizer, which increases rust vulnerability.',
      'Maintain proper plant spacing (20–25 cm) to improve airflow between rows.',
    ],
  },

  corn_leaf_blight: {
    id: 'corn_leaf_blight',
    index: 1,
    name: 'Corn Leaf Blight',
    shortName: 'Blight',
    scientificName: 'Exserohilum turcicum',
    badgeColor: {
      bg: 'bg-rose-400/18',
      text: 'text-rose-100',
      border: 'border-rose-300/35',
      dot: 'bg-rose-400',
    },
    severity: 'severe',
    causes: 'Fungal infection causing elongated cigar-shaped grayish-tan lesions; spreads rapidly in warm, wet weather.',
    treatmentAdvice: [
      'Spray a systemic fungicide (Mancozeb, Propiconazole, or Pyraclostrobin) promptly to protect ear yield.',
      'Avoid overhead irrigation in the late afternoon so leaves do not stay wet overnight.',
      'Plow under or remove crop residues after harvest to break the fungal lifecycle.',
    ],
  },

  gray_leaf_spot: {
    id: 'gray_leaf_spot',
    index: 2,
    name: 'Gray Leaf Spot',
    shortName: 'Gray Spot',
    scientificName: 'Cercospora zeae-maydis',
    badgeColor: {
      bg: 'bg-slate-200/15',
      text: 'text-slate-100',
      border: 'border-slate-200/35',
      dot: 'bg-slate-300',
    },
    severity: 'high',
    causes: 'Rectangular lesions bounded by leaf veins; thrives under heavy morning dew, fog, and high humidity.',
    treatmentAdvice: [
      'Apply a foliar fungicide with dual modes of action (Strobilurin + Triazole) before tassel emergence.',
      'Rotate with non-host crops (soybean, mung bean, or cassava) for at least one full season.',
      'Choose hybrid seed varieties rated for Gray Leaf Spot tolerance next planting.',
    ],
  },

  insects_damage: {
    id: 'insects_damage',
    index: 4,
    name: 'Insect Damage',
    shortName: 'Insects',
    scientificName: 'Spodoptera frugiperda',
    badgeColor: {
      bg: 'bg-orange-400/18',
      text: 'text-orange-100',
      border: 'border-orange-300/35',
      dot: 'bg-orange-400',
    },
    severity: 'action_needed',
    causes: 'Fall armyworm caterpillars or stalk borers chewing irregular holes and leaving sawdust-like frass.',
    treatmentAdvice: [
      'Use a targeted insecticide (Chlorantraniliprole, Emamectin benzoate, or Bt spray) — do not use fungicide.',
      'Direct spray down into the plant whorl (funnel top) where young larvae feed.',
      'Consider neem oil extracts or Trichogramma egg parasitoids for integrated pest management.',
    ],
  },
};

// Exact ImageFolder alphabetical class order from training notebook:
// 0: Common Rust, 1: Corn Leaf Blight, 2: Gray Leaf Spot, 3: Healthy, 4: Insects damage
export const ORDERED_DISEASE_KEYS: DiseaseId[] = [
  'common_rust',
  'corn_leaf_blight',
  'gray_leaf_spot',
  'healthy',
  'insects_damage',
];
