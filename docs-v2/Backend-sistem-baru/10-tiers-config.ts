/**
 * lib/config/tiers.ts
 * 
 * ⚠️ SINGLE SOURCE OF TRUTH untuk semua tier, harga, kredit, dan konfigurasi bisnis
 * 
 * ATURAN TEGAS:
 * - Tidak boleh ada nilai tier/harga hardcode di file lain
 * - Semua file (pricing.ts, tier-enforcer.ts, prompt builder, dll) HARUS import dari sini
 * - Kalau mau ubah harga/kuota, cukup edit 1 file ini
 * 
 * TODO: Disimpan juga ke tabel system_config di database (optional, untuk konfigurasi runtime)
 */

// ============================================================================
// TIER IDs - Gunakan sebagai type safety key di seluruh codebase
// ============================================================================

export const TIER = {
  STARTER: 'STARTER',
  PRO: 'PRO',
  PRO_MAX: 'PRO_MAX',
} as const;

export type TierId = typeof TIER[keyof typeof TIER];

// Untuk Prisma schema enum
export const TIER_VALUES = Object.values(TIER) as const;

// ============================================================================
// MODEL CLASSES - Basis untuk multiplier kredit
// ============================================================================

export const MODEL_CLASS = {
  HEMAT: 'HEMAT',           // 1x baseline, ~Rp5,58/kredit biaya riil
  MENENGAH: 'MENENGAH',     // 24x baseline, ~Rp134/kredit biaya riil
  FLAGSHIP: 'FLAGSHIP',     // 35x baseline, ~Rp196/kredit biaya riil
  ULTRA: 'ULTRA',           // 65x baseline, ~Rp364/kredit biaya riil
} as const;

export type ModelClassId = typeof MODEL_CLASS[keyof typeof MODEL_CLASS];

// Multiplier untuk setiap kelas model
// Formula: output_tokens × multiplier = kredit_dihabiskan
export const CREDIT_MULTIPLIER: Record<ModelClassId, number> = {
  HEMAT: 1,
  MENENGAH: 24,
  FLAGSHIP: 35,
  ULTRA: 65,
};

/**
 * Biaya riil per kredit (IDR) - hanya untuk referensi internal
 * Digunakan untuk margin calculation & validation, bukan untuk charge ke user
 * 1 kredit = 1.000 token model Hemat
 */
export const CREDIT_COST_IDR: Record<ModelClassId, number> = {
  HEMAT: 5.58,       // ~Rp5,58 per kredit
  MENENGAH: 134,     // ~Rp134 per kredit (24x baseline)
  FLAGSHIP: 196,     // ~Rp196 per kredit (35x baseline)
  ULTRA: 364,        // ~Rp364 per kredit (65x baseline)
};

/**
 * Nilai internal 1 kredit untuk user display
 * 1 kredit = Rp20 (user-facing), untuk memudahkan mental math
 */
export const CREDIT_VALUE_IDR = 20;

// ============================================================================
// TIER CONFIGURATION - Keseluruhan spesifikasi per tier
// ============================================================================

export interface TierConfig {
  // Pricing
  priceIdr: number;
  
  // Kredit bulanan
  creditsPerMonth: number;
  rolloverMax: number;  // Kredit yang bisa di-rollover ke bulan berikutnya
  
  // Dokumen inti yang boleh di-generate
  coreDocuments: readonly string[];
  
  // Model classes yang bisa dipilih user
  allowedModelClasses: readonly ModelClassId[];
  
  // Token limits (hard caps teknis)
  maxOutputTokensPerDoc: number;      // Hard cap di parameter max_tokens API provider
  maxContextInjectionTokens: number;  // Lapisan pengaman akumulasi context
  maxFormInputTokens: number;         // Maks token dari form user input
  
  // Operasional limits
  maxProjectsPerMonth: number;
  maxProjectsPerDay: number;
  
  // Feature flags
  canForkProject: boolean;
  canCustomizePreset: boolean;
  canRegenPerFile: boolean;            // Regenerate per dokumen, bukan 1 kali semua
  canReviseUnlimited: boolean;          // Unlimited revisi di panel IDE
  canAccessOptionalModules: boolean;    // 8 modul opsional (Security, Testing, Database Deep-Dive, dst)
  
  // Mini tools
  miniToolsIncluded: number | 'all';   // Berapa tools, atau 'all'
  miniToolTrialLimit?: number;          // Untuk Starter: 3x/bulan
  
  // Support
  whatsappChatPerMonth: number;        // Chat gratis with founder
  whatsappChatPriority: 'normal' | 'priority';
}

export const TIER_CONFIG: Record<TierId, TierConfig> = {
  [TIER.STARTER]: {
    priceIdr: 65_000,
    creditsPerMonth: 3_000,
    rolloverMax: 0,
    
    coreDocuments: ['prd', 'architecture', 'plan-task'],
    allowedModelClasses: ['HEMAT'],
    
    maxOutputTokensPerDoc: 2_500,
    maxContextInjectionTokens: 3_000,
    maxFormInputTokens: 1_500,
    
    maxProjectsPerMonth: 10,
    maxProjectsPerDay: 3,
    
    canForkProject: false,
    canCustomizePreset: false,
    canRegenPerFile: false,
    canReviseUnlimited: false,
    canAccessOptionalModules: false,
    
    miniToolsIncluded: 1,
    miniToolTrialLimit: 3,
    
    whatsappChatPerMonth: 0,
    whatsappChatPriority: 'normal',
  },

  [TIER.PRO]: {
    priceIdr: 145_000,
    creditsPerMonth: 7_000,
    rolloverMax: 2_000,
    
    coreDocuments: ['prd', 'architecture', 'plan-task', 'design-system', 'agent-rules'],
    allowedModelClasses: ['HEMAT', 'MENENGAH', 'FLAGSHIP'],
    
    maxOutputTokensPerDoc: 5_000,
    maxContextInjectionTokens: 5_000,
    maxFormInputTokens: 2_500,
    
    maxProjectsPerMonth: 30,
    maxProjectsPerDay: 8,
    
    canForkProject: true,
    canCustomizePreset: true,
    canRegenPerFile: false,
    canReviseUnlimited: false,
    canAccessOptionalModules: false,
    
    miniToolsIncluded: 3,
    
    whatsappChatPerMonth: 2,
    whatsappChatPriority: 'normal',
  },

  [TIER.PRO_MAX]: {
    priceIdr: 199_000,
    creditsPerMonth: 14_000,
    rolloverMax: 4_000,
    
    coreDocuments: ['prd', 'architecture', 'plan-task', 'design-system', 'agent-rules', 'adaptive-document'],
    allowedModelClasses: ['HEMAT', 'MENENGAH', 'FLAGSHIP', 'ULTRA'],
    
    maxOutputTokensPerDoc: 10_000,
    maxContextInjectionTokens: 8_000,
    maxFormInputTokens: 3_500,
    
    maxProjectsPerMonth: 60,
    maxProjectsPerDay: 15,
    
    canForkProject: true,
    canCustomizePreset: true,
    canRegenPerFile: true,
    canReviseUnlimited: true,
    canAccessOptionalModules: true,
    
    miniToolsIncluded: 'all',
    
    whatsappChatPerMonth: 5,
    whatsappChatPriority: 'priority',
  },
};

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get tier config with fallback
 * SAFE: tidak bisa return undefined, selalu ada default atau error clear
 */
export function getTierConfig(tierId: TierId | string): TierConfig {
  if (tierId in TIER_CONFIG) {
    return TIER_CONFIG[tierId as TierId];
  }
  throw new Error(`Invalid tier ID: ${tierId}. Must be one of ${Object.values(TIER).join(', ')}`);
}

/**
 * Estimate kredit yang dibutuhkan untuk 1 generate request
 * Formula: (output_tokens × multiplier_model) / 1000
 * 
 * Contoh:
 * - 4000 output token, model Menengah (24x): (4000 × 24) / 1000 = 96 kredit
 */
export function estimateCreditsPerDocument(
  outputTokens: number,
  modelClass: ModelClassId
): number {
  const multiplier = CREDIT_MULTIPLIER[modelClass];
  return Math.ceil((outputTokens * multiplier) / 1000);
}

/**
 * Hitung total kredit untuk 1 proyek (multiple dokumen)
 */
export function estimateTotalCredits(
  documentConfigs: Array<{ outputTokens: number; modelClass: ModelClassId }>
): number {
  return documentConfigs.reduce((total, doc) => {
    return total + estimateCreditsPerDocument(doc.outputTokens, doc.modelClass);
  }, 0);
}

/**
 * Validate user's model class selection terhadap tier mereka
 * Throw error kalau user coba akses model di luar tier
 */
export function validateModelClassForTier(tierId: TierId, modelClass: string): boolean {
  const config = getTierConfig(tierId);
  return (config.allowedModelClasses as string[]).includes(modelClass);
}

/**
 * Hitung harga efektif per kredit (untuk margin calculation)
 * Misal di Pro tier, worst case semua dokumen pakai kelas Flagship (35x)
 * Maka biaya riil = 7000 kredit × (rata2 biaya per kredit) = ?
 */
export function calculateWorstCaseCostForTier(tierId: TierId): number {
  const config = getTierConfig(tierId);
  const maxModelClass = config.allowedModelClasses[config.allowedModelClasses.length - 1];
  const worstCaseCostPerKredit = CREDIT_COST_IDR[maxModelClass];
  return config.creditsPerMonth * worstCaseCostPerKredit;
}

/**
 * Hitung margin kotor untuk tier (untuk pricing validation)
 * Margin = (revenue - worst_case_cost) / revenue
 */
export function calculateGrossMarginForTier(tierId: TierId): number {
  const config = getTierConfig(tierId);
  const worstCaseCost = calculateWorstCaseCostForTier(tierId);
  const margin = (config.priceIdr - worstCaseCost) / config.priceIdr;
  return Math.round(margin * 10000) / 100; // Persentase, 2 decimal places
}

// ============================================================================
// TYPE EXPORTS untuk TypeScript Safety
// ============================================================================

export type { TierConfig };

/**
 * Untuk Prisma schema:
 * enum Tier {
 *   STARTER
 *   PRO
 *   PRO_MAX
 * }
 */
