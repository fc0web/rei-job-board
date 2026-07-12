/**
 * admin-schema.ts — Admin (site 運営 側) 機能 の TypeScript type 定義
 *
 * v0.4 Layer 2 (2026-07-13, 藤本さん 「B (Layer 1+2)」 選択)
 *
 * Source: yorumachi.jp + kanto.qzin.jp (バニラ) 2026-07-13 factual 実測 + Rei-project fraud-filter v0.3 統合。
 *
 * ★ Honest note:
 *   - 本 file は data structure only、 実装 UI (admin dashboard / review queue / payment records) は
 *     Layer 3 越境 = 弁護士 consultation 経路 待ち、 本 file 範囲外
 *   - Layer 3 実装 = 業務体制 構築 完了 前提 (個人情報 取扱 責任者 + 苦情対応 責任者 選任 済)
 */

import type { ShopListing } from './shop-schema';
import type { JobSeekerProfile, Application, Review, DeletionRequest } from './job-seeker-schema';

// ─────────────────────────────────────────────────────────────
// Section A: 店舗 掲載 review queue (Admin 機能 #1)
// ─────────────────────────────────────────────────────────────

export interface ShopListingReview {
  shopListingId: string;             // ShopListing.id
  reviewerId: string;                // admin user id
  reviewedAt: string;                // ISO 8601
  decision: 'approved' | 'rejected' | 'pending_more_info';
  rejectionReason?: string;
  categoryExclusionCheck: {
    isExcludedCategory: boolean;
    categoryValue: string;           // ShopCategory string
    excludedByPolicy: 'strict_exclude' | 'case_by_case';
  };
  fraudFilterResult?: {
    flagged: boolean;
    riskScore: number;
    matches: string[];
  };
}

// ─────────────────────────────────────────────────────────────
// Section B: 求職者 承認 (Admin 機能 #2、 Layer 3 越境時 のみ)
// ─────────────────────────────────────────────────────────────

/**
 * 求職者 登録 承認 (実装 = Layer 3 越境)
 *
 * ★ 本 type の 実装 = 「求職者情報 非収集 line」 明示 越境、 弁護士 consultation 前提
 */
export interface JobSeekerRegistrationReview {
  jobSeekerId: string;
  reviewerId: string;
  reviewedAt: string;
  decision: 'approved' | 'rejected' | 'pending_more_info';
  rejectionReason?: string;
  ageVerificationConfirmed: boolean; // 18 歳 以上 confirm
  emailVerificationConfirmed: boolean;
  identityVerificationConfirmed?: boolean;  // 本人 確認 process (yorumachi 実測: 「ご本人 を 確認 させて いただいた うえ」)
}

// ─────────────────────────────────────────────────────────────
// Section C: 掲載 期間 management (Admin 機能 #3)
// ─────────────────────────────────────────────────────────────

export interface ListingLifecycleEvent {
  shopListingId: string;
  eventType: 'created' | 'activated' | 'renewed' | 'expiring_soon' | 'expired' | 'suspended';
  eventAt: string;                   // ISO 8601
  triggeredBy: 'admin' | 'scheduler' | 'shop_owner';
  notes?: string;
}

// ─────────────────────────────────────────────────────────────
// Section D: 料金 collection (Admin 機能 #4)
// ─────────────────────────────────────────────────────────────

/**
 * 掲載料 + 契約管理費 の 収納 tracking
 *
 * ★ 料金 collection を 実装 する 場合 は 特定商取引法 表記 独立 page 必須、
 *   決済 代行 会社 と の 契約 + カード 会社 加盟店 契約 が 前提
 */
export interface PaymentRecord {
  id: string;
  shopListingId: string;
  amountYen: number;                 // 掲載料 (税込)
  contractManagementFeeYen: number;  // 契約管理費 (yorumachi 実測: 2,200 円)
  premiumMonthlyPlusYen?: number;    // 上位表示 special plan (税別)
  paymentMethod: 'bank_transfer' | 'credit_card' | 'other';
  paymentStatus: 'pending' | 'paid' | 'refunded' | 'failed';
  paidAt?: string;
  refundedAt?: string;
  refundReason?: string;
  invoiceNumber?: string;            // インボイス制度 対応
}

// ─────────────────────────────────────────────────────────────
// Section E: 契約 約款 versioning (Admin 機能 #5)
// ─────────────────────────────────────────────────────────────

export interface TermsVersion {
  version: string;                   // semver: '1.0.0', '1.1.0', etc
  effectiveFrom: string;             // ISO 8601
  effectiveTo?: string;              // 次 version の effective 開始 で auto set
  documentUrl: string;               // 独立 page URL
  changesFromPreviousVersion?: string;
  lawyerReviewedBy?: string;         // 弁護士 monitor 記録
  lawyerReviewedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Section F: 通報 対応 (Admin 機能 #6)
// ─────────────────────────────────────────────────────────────

/**
 * 通報 (求職者 / お店 / 第三者 いずれ からも 可能)
 *
 * yorumachi 実測: iken form (対応 保証 なし)
 * Rei-side: fraud-filter v0.3 と 統合 + 警察 #9110 + GitHub Issue link (report.astro)
 */
export interface Report {
  id: string;
  reporterType: 'job_seeker' | 'shop_owner' | 'third_party' | 'system_auto';
  reporterUserId?: string;           // reporterType が job_seeker or shop_owner の 場合
  reportedTargetType: 'shop_listing' | 'job_seeker' | 'review' | 'application';
  reportedTargetId: string;
  reportCategory:
    | 'fraud_suspected'                // fraud-filter v0.3 hit
    | 'yamabaito_suspected'             // 闇バイト 疑い
    | 'category_exclusion_violation'    // 業種 除外 line 違反
    | 'privacy_violation'               // 個情法 違反
    | 'defamation'                      // 名誉毀損 (口コミ)
    | 'harassment'                      // ハラスメント
    | 'age_violation'                   // 18 歳 未満 の 応募
    | 'ai_generated_scam'               // v0.3 8 軸 目 (AI 生成 詐欺)
    | 'other';
  description: string;
  submittedAt: string;
  status: 'pending_review' | 'investigating' | 'action_taken' | 'no_action' | 'referred_to_police';
  assignedOfficerName?: string;       // 苦情対応 責任者
  resolvedAt?: string;
  resolutionNotes?: string;
}

// ─────────────────────────────────────────────────────────────
// Section G: 個人情報 削除 対応 (Admin 機能 #7)
// ─────────────────────────────────────────────────────────────

/**
 * 個人情報 削除 request 対応 workflow
 * (job-seeker-schema.ts DeletionRequest と 統合 = admin 側 の 対応 記録)
 */
export interface DeletionResponseRecord {
  deletionRequestId: string;         // DeletionRequest.id
  respondingOfficerName: string;    // 個人情報 取扱 責任者
  respondedAt: string;
  verificationMethod: 'email_confirmation' | 'phone_confirmation' | 'other';
  deletionScope: {
    profileDeleted: boolean;
    applicationsDeleted: boolean;
    searchHistoryDeleted: boolean;
    reviewsDeleted: boolean;
    keepListDeleted: boolean;
  };
  retainedItems?: {                  // 法令 上 保持 義務 の 記録
    item: string;
    retentionReason: string;
    retentionPeriod: string;
  }[];
  completionNoticeSentAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Section H: fraud-filter review (Admin 機能 #8)
// ─────────────────────────────────────────────────────────────

/**
 * fraud-filter v0.3 (8 軸: reward_anomaly / task_vague / underground_slang /
 * sketchy_contact / urgency_pressure / crypto_lure / obfuscation_attempt / ai_generated_scam) の
 * 検出 結果 admin review
 */
export interface FraudFilterReviewLog {
  targetType: 'shop_listing' | 'application' | 'review';
  targetId: string;
  filterVersion: string;             // 'v0.3' etc
  scanned_at: string;
  result: {
    flagged: boolean;
    matches: Array<{
      category: string;              // FlaggedCategory string
      keyword: string;
      field: 'title' | 'description' | 'contact';
    }>;
    riskScore: number;
  };
  adminDecision?: 'confirm_flag' | 'false_positive' | 'pending_more_info';
  adminDecidedAt?: string;
  adminDecidedBy?: string;
}

// ─────────────────────────────────────────────────────────────
// Section I: 統計 dashboard (Admin 機能 #9)
// ─────────────────────────────────────────────────────────────

/**
 * ★ 求職者 情報 集計 は 個情法 「利用目的 の 明示」 対象、
 *   実装時 に 目的 statement + 集計 粒度 の 明示 必須 (個別 特定 でない aggregated 統計 のみ 推奨)
 */
export interface AdminStatistics {
  periodStart: string;
  periodEnd: string;
  activeShopListingCount: number;
  cumulativeShopListingCount: number;
  activeJobSeekerCount?: number;     // Layer 3 越境時 のみ、 集計 粒度 弁護士 review
  applicationCount: number;
  searchCount?: number;              // 個情法 目的 明示 対象
  fraudFilterHitCount: number;
  reportSubmittedCount: number;
  deletionRequestCount: number;
}

// ─────────────────────────────────────────────────────────────
// Section J: 代理店 管理 (Admin 機能 #10、 yorumachi staff.html 参考)
// ─────────────────────────────────────────────────────────────

/**
 * 営業代理店 経由 掲載 追跡 (yorumachi 三面 収益 model 参考)
 *
 * ★ 実装 判断 は 藤本さん judgment + Pattern 5 super-naming 回避 慎重、
 *   「開業資金 一切 不要」 「1 件 で 10,000 円 継続」 系 商業 修辞 は 参考 のみ、 rei-project は 使わない
 */
export interface SalesAgent {
  id: string;
  agentName: string;
  contractedAt: string;
  status: 'active' | 'suspended' | 'terminated';
  contractedShopListings: string[];  // ShopListing.id[]
  commissionRateYenPerContractPerMonth?: number;  // yorumachi 相当: 10,000 円 継続
  totalCommissionEarnedYen: number;
  lastCommissionPaidAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Section K: Admin User 定義
// ─────────────────────────────────────────────────────────────

export type AdminRole =
  | 'super_admin'
  | 'shop_review_officer'
  | 'job_seeker_review_officer'      // Layer 3 越境時 のみ
  | 'personal_info_responsible_officer'
  | 'complaints_responsible_officer'
  | 'payment_officer'
  | 'read_only';

export interface AdminUser {
  id: string;
  username: string;
  role: AdminRole;
  responsibleForCategories?: string[]; // e.g., 'individual_info_handling'
  createdAt: string;
  lastLoginAt?: string;
  active: boolean;
}

// ─────────────────────────────────────────────────────────────
// Section L: 統合 marker (rei-project HONEST_SCOPE 明示)
// ─────────────────────────────────────────────────────────────

export const ADMIN_SCHEMA_IMPLEMENTATION_MARKER = {
  layerScope: 'Layer 2 data-only',
  requiresLegalReview: true,
  requiredOfficerSelection: [
    'personal_info_responsible_officer',    // 個人情報 取扱 責任者
    'complaints_responsible_officer',       // 苦情対応 責任者
  ],
  requiredIndependentPages: [
    'privacy_policy',                        // プライバシー ポリシー 独立 page
    'terms_of_service',                      // 利用規約 独立 page
    'disclaimer',                            // 免責事項 独立 page
    'tokushouhou_kisai',                     // 特定商取引法 表記 (料金 collection 有 なら 必須)
    'personal_info_deletion_request_form',   // 個人情報 削除 請求 form
  ],
  layer3PrerequisitesReference: 'src/data/schemas/shop-schema.ts Layer3ImplementationPrerequisites',
  reiProjectHonestScopeReference: 'project_rei_job_board_scaffold_2026-06-22.md',
} as const;
