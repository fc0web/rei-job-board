/**
 * job-seeker-schema.ts — 求職者 側 が 打ち込む 項目 の TypeScript type 定義
 *
 * v0.4 Layer 2 (2026-07-13, 藤本さん 「B (Layer 1+2)」 選択)
 *
 * Source: yorumachi.jp + kanto.qzin.jp (バニラ) 2026-07-13 factual 実測 combined。
 *
 * ★★★ Honest note (最重要):
 *   本 schema の 実装 = **rei-job-board 現状 v0.3 の 「求職者情報 非収集 line」 明示 越境**
 *
 *   越境 前提 (Layer 3 実装 前 に 必須):
 *     - 弁護士 consultation 完了
 *     - 特定募集情報等提供事業者 届出 (厚労省)
 *     - 個情法 対応 業務体制 構築
 *     - プライバシー ポリシー 独立 page 追加
 *     - 苦情対応 責任者 選任
 *     - 個人情報 取扱 責任者 選任
 *
 *   本 file は data structure only、 実装 UI (registration form / login page / user dashboard) は
 *   Layer 3 越境 = 弁護士 consultation 経路 待ち、 本 file 範囲外。
 */

// ─────────────────────────────────────────────────────────────
// Section A: 個人 情報 (yorumachi 実測)
// ─────────────────────────────────────────────────────────────

/**
 * 求職者 登録 情報
 *
 * yorumachi 実測: name (nickname OK) / age (18-50+) / email / password / phone / address / question
 * kanto.qzin: 同 base + SNS 連携 option + 口コミ 投稿
 *
 * ★ 顔写真 / 履歴書 は 両 site で **求めない**、 rei-side 推奨 継続 = 除外 line
 */
export interface JobSeekerProfile {
  // ─ Meta ─
  id: string;                        // uuid
  registeredAt: string;              // ISO 8601
  status: 'pending_verification' | 'active' | 'suspended' | 'deletion_requested';

  // ─ 基本 情報 (Section 2 の #1-6) ─
  nickname: string;                  // 名前 (ニックネーム OK)
  age: number;                       // 18-50+ (★ 18 歳 以上 check、 18 歳未満 rejection)
  email: string;                     // verification 送信 用
  passwordHash: string;              // bcrypt / argon2 hashed (実装時)
  mobileNumber: string;              // 応募先 店舗 に 通知 の 注意 明示 要
  addressPrefecture: string;         // 都道府県 (詳細 番地 は 除外 line 推奨、 弁護士 judgment)
  addressCity?: string;              // 市区町村 (optional、 弁護士 judgment)

  // ─ 質問 (Section 2 の #7) ─
  question?: string;                 // 自由記入 optional

  // ─ 同意 (Section 2 の #8) ─
  consent: JobSeekerConsent;

  // ─ 除外 line 明示 (Section 2 の #9-10) ─
  // photoUrl: NEVER (顔写真 は 求めない、 rei-side 推奨 継続)
  // resumeUrl: NEVER (履歴書 は 求めない、 rei-side 推奨 継続)

  // ─ Login 補助 情報 ─
  emailVerified: boolean;
  emailVerifiedAt?: string;          // ISO 8601
  lastLoginAt?: string;              // ISO 8601

  // ─ SNS 連携 (kanto.qzin 系) ─
  socialLoginProviders?: SocialLoginProvider[];
}

// ─────────────────────────────────────────────────────────────
// Section B: 同意 (Consent) 明示
// ─────────────────────────────────────────────────────────────

export interface JobSeekerConsent {
  personalInfoHandling: boolean;      // 個人情報 取扱 同意 (必須、 プライバシー ポリシー 独立 page 遷移 後 check)
  personalInfoHandlingConsentDate: string; // ISO 8601
  termsOfService: boolean;            // 利用規約 同意 (必須)
  termsOfServiceConsentDate: string;
  ageConfirmation18Plus: boolean;     // 18 歳 以上 (yorumachi + kanto.qzin 実測 準拠)
  highSchoolStudentDenial: boolean;   // 高校生 でない (kanto.qzin 実測: 「高校生不可」 明示)

  // Marketing / campaign 用 (opt-in、 個情法 目的 明示 必須)
  marketingConsent?: boolean;         // PayPay campaign 等 の 通知 同意 (opt-in)
  marketingConsentDate?: string;
}

// ─────────────────────────────────────────────────────────────
// Section C: SNS 連携 (kanto.qzin 系)
// ─────────────────────────────────────────────────────────────

export type SocialLoginProvider = 'line' | 'twitter' | 'google' | 'apple';

// ─────────────────────────────────────────────────────────────
// Section D: 応募 (Application)
// ─────────────────────────────────────────────────────────────

/**
 * 応募 (per shop) — 求職者 が 店舗 に 応募 する 単位
 *
 * yorumachi 実測: Web / 電話 / Line 3 method
 * 「電話番号 は 応募先 店舗 に 通知」 の 注意 明示 要
 */
export interface Application {
  id: string;                        // uuid
  jobSeekerId: string;               // JobSeekerProfile.id
  shopListingId: string;             // ShopListing.id (from shop-schema.ts)
  applicationMethod: 'web' | 'phone' | 'line';
  submittedAt: string;               // ISO 8601
  status: 'submitted' | 'read' | 'contacted' | 'interviewed' | 'hired' | 'rejected' | 'withdrawn';

  // Web 応募時 の 追加 message (optional)
  message?: string;

  // 電話 応募時 (yorumachi 準拠、 phone number は shop に 通知)
  phoneCallInitiatedAt?: string;

  // Line 応募時
  lineContactInitiatedAt?: string;

  // Rei-project fraud-filter (v0.3 8 軸) の 検出 結果 (application 側 でも re-scan、 admin review 用)
  fraudFilterResult?: {
    flagged: boolean;
    matches: string[];
    riskScore: number;
  };
}

// ─────────────────────────────────────────────────────────────
// Section E: お気に入り / キープリスト (yorumachi + kanto.qzin 実測)
// ─────────────────────────────────────────────────────────────

export interface KeepList {
  jobSeekerId: string;
  shopListingIds: string[];          // 保存 shop listings
  updatedAt: string;                 // ISO 8601
}

// ─────────────────────────────────────────────────────────────
// Section F: 検索 履歴 (両 site 実測、 個情法 対象、 有効期間 明示 必須)
// ─────────────────────────────────────────────────────────────

/**
 * ★ 検索 履歴 は 個情法 「利用目的 の 明示」 対象、
 *   実装時 に 「サービス 改善」 目的 で 90 日 保持 等 の 明示 必須
 */
export interface SearchHistory {
  jobSeekerId: string;
  entries: SearchHistoryEntry[];
  retentionDays: number;             // 90 or 180 等
  purposeStatement: string;          // 個情法 目的 明示 (例: 「サービス改善のため」)
}

export interface SearchHistoryEntry {
  queriedAt: string;                 // ISO 8601
  keyword?: string;
  filters?: {
    prefecture?: string;
    city?: string;
    category?: string;
    stationName?: string;
    featureTags?: string[];
    hourlyWageMin?: number;
  };
}

// ─────────────────────────────────────────────────────────────
// Section G: 口コミ 投稿 (kanto.qzin 系、 誹謗中傷 対応 line 必須)
// ─────────────────────────────────────────────────────────────

/**
 * ★ 口コミ 投稿 は 名誉毀損 / 侮辱 / プロバイダ責任制限法 対応 必須
 *   実装時 に 「投稿 前 の 承認 process」 or 「事後 通報 対応」 の 判断 が 弁護士 monitor 対象
 */
export interface Review {
  id: string;                        // uuid
  jobSeekerId: string;
  shopListingId: string;
  submittedAt: string;               // ISO 8601
  status: 'pending_review' | 'published' | 'rejected' | 'reported_and_removed';
  rating?: number;                   // 1-5 star (optional)
  content: string;                   // review text
  moderationLog?: string;            // admin 側 review 履歴
  reportCount?: number;              // 通報 count
}

// ─────────────────────────────────────────────────────────────
// Section H: Campaign ID (yorumachi PayPay 系)
// ─────────────────────────────────────────────────────────────

export interface CampaignParticipation {
  jobSeekerId: string;
  campaignId: string;                // 'paypay_lottery_500' / 'sns_review_bonus_500' etc
  participatedAt: string;
  paypayId?: string;                 // PayPay ID (yorumachi 準拠、 収集 時 目的 明示 必須)
  status: 'entered' | 'won' | 'rewarded' | 'not_selected';
  rewardAmountYen?: number;
  rewardIssuedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Section I: 個人情報 削除 request (GDPR-style workflow)
// ─────────────────────────────────────────────────────────────

/**
 * 個人情報 削除 request 対応 (個情法 34 条 保有 個人 データ の 削除 請求 対応)
 *
 * ★ 実装時 に 「本人 確認」 process + 削除 実行 + 削除 完了 通知 の workflow 必須
 */
export interface DeletionRequest {
  id: string;                        // uuid
  jobSeekerId: string;
  requestedAt: string;               // ISO 8601
  reason?: string;
  status: 'pending_verification' | 'verified' | 'processing' | 'completed' | 'rejected';
  verifiedAt?: string;
  completedAt?: string;
  responsibleOfficerName: string;   // 個人情報 取扱 責任者 の 記録
}

// ─────────────────────────────────────────────────────────────
// Section J: type-level marker (rei-project HONEST_SCOPE 明示)
// ─────────────────────────────────────────────────────────────

/**
 * 本 file の 実装 (Layer 3) 越境 の 事前 requirement
 * (shop-schema.ts の Layer3ImplementationPrerequisites と 統合、 本 file では marker のみ)
 *
 * ★ 実装 前 に 必ず 弁護士 consultation 経路 で verify
 */
export const JOB_SEEKER_SCHEMA_IMPLEMENTATION_MARKER = {
  layerScope: 'Layer 2 data-only',
  requiresLegalReview: true,
  legalReviewCategories: [
    'kaisei_shokugyou_anteihou_2022',       // 改正職業安定法 2022
    'kojin_jouhou_hogo_hou',                // 個人情報保護法
    'purobaida_sekinin_seigen_hou',         // プロバイダ責任制限法
    'meiyo_kison',                          // 名誉毀損 (口コミ 対応)
    'jidou_fukushi_hou',                    // 児童福祉法 (18 歳 未満 検出)
    'roudou_kijun_hou',                     // 労働基準法
  ],
  crossingReiJobBoardLine: 'requester_information_non_collection_line',
  reiProjectHonestScopeReference: 'project_rei_job_board_scaffold_2026-06-22.md',
} as const;
