import type { DiseaseId, DiseaseInfo } from '../types';

export const CORN_DISEASES: Record<DiseaseId, DiseaseInfo> = {
  healthy: {
    id: 'healthy',
    index: 0,
    name: {
      en: 'Healthy Corn Leaf',
      kh: 'ស្លឹកពោតមានសុខភាពល្អ',
    },
    scientificName: 'Zea mays (Normal)',
    badgeColor: {
      bg: 'bg-emerald-500/15 dark:bg-emerald-500/25',
      text: 'text-emerald-700 dark:text-emerald-300',
      border: 'border-emerald-500',
      glow: 'shadow-emerald-500/30',
      dot: 'bg-emerald-500',
    },
    severity: 'healthy',
    causes: {
      en: 'Optimal field nutrition, clean soil, and balanced moisture.',
      kh: 'ដីមានជីវជាតិល្អ គ្មានមេរោគ និងការស្រោចស្រពត្រឹមត្រូវ។',
    },
    treatmentAdvice: {
      en: [
        'No chemical treatment needed — maintain current irrigation schedule.',
        'Apply balanced nitrogen-potassium fertilizer to support active ear formation.',
        'Keep scouting lower leaves once every 5-7 days during rainy spells.',
      ],
      kh: [
        'មិនបាច់ប្រើថ្នាំគីមីទេ — បន្តស្រោចទឹកតាមកាលវិភាគធម្មតា។',
        'ដាក់ជីអ៊ុយរ៉េ ឬជីប៉ូតាស្យូមសមស្រប ដើម្បីជួយឱ្យផ្លែពោតធំធាត់ល្អ។',
        'បន្តចុះពិនិត្យមើលស្លឹកខាងក្រោម ៥ ទៅ ៧ ថ្ងៃម្តង ជាពិសេសពេលមានភ្លៀងធ្លាក់។',
      ],
    },
  },

  common_rust: {
    id: 'common_rust',
    index: 1,
    name: {
      en: 'Common Rust',
      kh: 'ជំងឺច្រែះស្លឹក (Common Rust)',
    },
    scientificName: 'Puccinia sorghi',
    badgeColor: {
      bg: 'bg-amber-500/15 dark:bg-amber-500/25',
      text: 'text-amber-800 dark:text-amber-300',
      border: 'border-amber-500',
      glow: 'shadow-amber-500/30',
      dot: 'bg-amber-500',
    },
    severity: 'moderate',
    causes: {
      en: 'Fungal airborne spores favored by high humidity (80%+) and moderate temperatures (16–25°C).',
      kh: 'ផ្សិតបង្កជំងឺដែលរសាត់តាមខ្យល់ កើតឡើងខ្លាំងនៅពេលសំណើមខ្ពស់ និងអាកាសធាតុត្រជាក់ល្មម។',
    },
    treatmentAdvice: {
      en: [
        'Apply a triazole or strobilurin-based fungicide (e.g., Azoxystrobin + Difenoconazole) if pustules spread to upper ear leaves.',
        'Avoid excessive late-season nitrogen fertilizer which worsens rust vulnerability.',
        'Ensure proper plant spacing (20–25 cm) to encourage airflow between rows.',
      ],
      kh: [
        'បាញ់ថ្នាំសម្លាប់ផ្សិត (ដូចជា Azoxystrobin ឬ Difenoconazole) ប្រសិនបើស្នាមច្រែះរាលដាលដល់ស្លឹកក្បែរផ្លែ។',
        'កាត់បន្ថយការដាក់ជីអ៊ុយរ៉េជ្រុលហួសហេតុ ដែលអាចធ្វើឱ្យស្លឹកទន់ងាយឆ្លងជំងឺ។',
        'ទុកគម្លាតដាំដុះឱ្យសមល្មម (២០–២៥ ស.ម) ដើម្បីឱ្យខ្យល់ចេញចូលបានល្អ និងកាត់បន្ថយសំណើម។',
      ],
    },
  },

  corn_leaf_blight: {
    id: 'corn_leaf_blight',
    index: 2,
    name: {
      en: 'Corn Leaf Blight',
      kh: 'ជំងឺរលាកស្លឹកពោត (Leaf Blight)',
    },
    scientificName: 'Exserohilum turcicum / Bipolaris maydis',
    badgeColor: {
      bg: 'bg-rose-500/15 dark:bg-rose-500/25',
      text: 'text-rose-700 dark:text-rose-300',
      border: 'border-rose-500',
      glow: 'shadow-rose-500/30',
      dot: 'bg-rose-500',
    },
    severity: 'severe',
    causes: {
      en: 'Fungus causing long cigar-shaped grayish-tan lesions; spreads rapidly during warm rain cycles.',
      kh: 'ផ្សិតបង្កជំងឺដែលបង្កើតស្នាមឆ្នូតប្រផេះវែងដូចបារី រាលដាលលឿនពេលមានភ្លៀងធ្លាក់ក្តៅស្អុះ។',
    },
    treatmentAdvice: {
      en: [
        'URGENT: Spray systemic fungicide (Mancozeb, Propiconazole, or Pyraclostrobin) immediately to protect ear yield.',
        'Do NOT spray overhead irrigation during late afternoon to prevent leaf wetness overnight.',
        'Plow under or destroy crop residues after harvest to break the fungal wintering cycle.',
      ],
      kh: [
        'បន្ទាន់៖ បាញ់ថ្នាំសម្លាប់ផ្សិត (ដូចជា Mancozeb ឬ Propiconazole) ជាបន្ទាន់ដើម្បីការពារទិន្នផលគ្រាប់។',
        'កុំស្រោចទឹកពីលើស្លឹកនៅពេលល្ងាច ព្រោះទឹកដក់លើស្លឹកពេញមួយយប់ធ្វើឱ្យមេរោគដុះលឿន។',
        'ភ្ជួរលប់ ឬប្រមូលកាកសំណល់ដើមពោតដុតបំផ្លាញចោលក្រោយប្រមូលផលរួច ដើម្បីកាត់ផ្តាច់ពូជផ្សិត។',
      ],
    },
  },

  gray_leaf_spot: {
    id: 'gray_leaf_spot',
    index: 3,
    name: {
      en: 'Gray Leaf Spot',
      kh: 'ជំងឺអុជប្រផេះ (Gray Leaf Spot)',
    },
    scientificName: 'Cercospora zeae-maydis',
    badgeColor: {
      bg: 'bg-purple-500/15 dark:bg-purple-500/25',
      text: 'text-purple-700 dark:text-purple-300',
      border: 'border-purple-500',
      glow: 'shadow-purple-500/30',
      dot: 'bg-purple-500',
    },
    severity: 'high',
    causes: {
      en: 'Rectangular blocky lesions delimited by leaf veins; thrives under heavy dew and fog.',
      kh: 'ស្នាមអុជរាងបួនជ្រុងទ្រវែងតាមបណ្តោយទ្រនុងស្លឹក កើតច្រើននៅតំបន់មានទឹកសន្សើមខ្លាំង។',
    },
    treatmentAdvice: {
      en: [
        'Apply foliar fungicide with dual modes of action (Strobilurin + Triazole) before tassel emergence.',
        'Rotate with non-host crops (cassava, soybean, or mung bean) for at least one full planting cycle.',
        'Select hybrid seed varieties certified for Gray Leaf Spot tolerance for the next season.',
      ],
      kh: [
        'បាញ់ថ្នាំផ្សិតផ្សំពីរមុខ (Strobilurin + Triazole) មុនពេលពោតចេញផ្កាឈ្មោល។',
        'ផ្លាស់ប្តូរមុខដំណាំ (ដាំសណ្តែកបាយ សណ្តែកសៀង ឬដំឡូងមី) យ៉ាងហោចមួយរដូវកាលដើម្បីផ្តាច់មេរោគ។',
        'ជ្រើសរើសពូជពោតកូនកាត់ដែលធន់នឹងជំងឺអុជប្រផេះសម្រាប់រដូវកាលបន្ទាប់។',
      ],
    },
  },

  insects_damage: {
    id: 'insects_damage',
    index: 4,
    name: {
      en: 'Insects Damage (Armyworm / Borer)',
      kh: 'សត្វល្អិតបំផ្លាញ (ដង្កូវហ្វូង / ទម្លុះដើម)',
    },
    scientificName: 'Spodoptera frugiperda / Ostrinia furnacalis',
    badgeColor: {
      bg: 'bg-orange-500/15 dark:bg-orange-500/25',
      text: 'text-orange-800 dark:text-orange-300',
      border: 'border-orange-500',
      glow: 'shadow-orange-500/30',
      dot: 'bg-orange-500',
    },
    severity: 'action_needed',
    causes: {
      en: 'Fall armyworm caterpillars or corn stalk borers chewing irregular holes and leaving sawdust-like frass.',
      kh: 'ដង្កូវហ្វូងរដូវស្លឹកឈើជ្រុះ ឬដង្កូវស៊ីទម្លុះដើម កាត់ស៊ីស្លឹកធ្លុះធ្លាយ និងបន្សល់អាចម៍ដូចកញ្ជើកន្ទក់។',
    },
    treatmentAdvice: {
      en: [
        'CRITICAL: Use biological or targeted INSECTICIDE (e.g. Chlorantraniliprole, Emamectin benzoate, or Bt spray) — do NOT use fungicide!',
        'Spray directly down into the whorl (funnel top) of young plants where larvae hide.',
        'Apply neem oil extracts or release Trichogramma egg parasites as organic IPM control.',
      ],
      kh: [
        'សំខាន់បំផុត៖ ត្រូវប្រើ ថ្នាំសម្លាប់សត្វល្អិត (ដូចជា Emamectin benzoate, Chlorantraniliprole ឬមេរោគ Bt) — ដាច់ខាត កុំប្រើថ្នាំផ្សិត!',
        'បាញ់បញ្ចូលចំកណ្តាលបំពង់ត្រួយខ្ចីរបស់ដើមពោត ដែលជាកន្លែងដង្កូវលាក់ខ្លួនពួនស៊ី។',
        'អាចប្រើប្រេងស្តៅធម្មជាតិ ឬស្លឹកថ្នាំជក់ត្រាំទឹកបាញ់ ជាវិធីកសិកម្មសរីរាង្គជំនួយ។',
      ],
    },
  },
};

export const ORDERED_DISEASE_KEYS: DiseaseId[] = [
  'healthy',
  'common_rust',
  'corn_leaf_blight',
  'gray_leaf_spot',
  'insects_damage',
];
