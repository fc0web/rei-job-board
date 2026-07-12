/**
 * pr-content-schema.ts — PR サイト content 系 (ランキング / 動画 / event / 統計 / 通報) の TypeScript type 定義
 *
 * v0.5 Layer 2 (2026-07-13, 藤本さん 「此方 に 全て 取り込みたい」 選択)
 *
 * Source: 実測 7 site combined
 *   - シティヘブン: ランキング天国 + video library + news feed
 *   - 風俗じゃぱん: エロボイス content + 割引 coupon + escort ranking
 *   - 駅ちか: 待機中 real-time indicator + TikTok-style video
 *   - fujoho: 380,225 口コミ 集計 ranking + 「NO.1」 「業界最安」 表示 (景表法 line 注意)
 *   - マンゾク: weekly TOP30 (火曜 更新) + MC point + 特集 記事
 *   - YOASOBI HEAVEN: AI concierge + 多言語 aggregation
 *
 * ★★★ Honest note (最重要):
 *   本 file は data structure only、 実装 UI (ランキング page / video player / statistics dashboard) は
 *   Layer 3 越境 = 弁護士 consultation 経路 待ち、 本 file 範囲外。
 *
 *   ★ ランキング 表示 = 景表法 「実測 rank に 基づく 表示」 line 必須:
 *     - 「NO.1」 「業界最安」 (fujoho 実測) 等 の 表示 は 客観的 根拠 明示 必須
 *     - 「業界 トップ クラス」 「屈指」 (rei-project HONEST_SCOPE 明示 禁止 word)
 *     - 「上位 表示 スロット」 は 掲載料 の 対価 明示 必須 (ステマ 規制 対応)
 */

// ─────────────────────────────────────────────────────────────
// Section A: ランキング (7 site 実測 common feature)
// ─────────────────────────────────────────────────────────────

/**
 * ランキング entry (weekly / monthly / area 別)
 *
 * ★ 実装時 の 景表法 line:
 *   - 「ランキング 基準」 の 明示 (アクセス数 / 予約数 / 口コミ 評価 / 有料 掲載 順 の 明示)
 *   - 「有料 掲載」 順位 の 場合 は 「PR」 label 必須 (ステマ 規制 2023 対応)
 *   - 「実測 rank」 と 「PR rank」 の 分離 表示
 */
export interface RankingEntry {
  id: string;                        // uuid
  rankingType: RankingType;
  weekIdentifier?: string;           // 'YYYY-Www' 形式
  monthIdentifier?: string;          // 'YYYY-MM' 形式
  areaIdentifier?: string;           // 'tokyo/ginza' 等
  targetType: 'shop' | 'performer';
  targetId: string;
  rank: number;
  criteriaVersion: string;           // ランキング 基準 の version (景表法 明示 line)
  isPRSlot: boolean;                 // ★ 有料 掲載 順位 か (true なら 「PR」 label 表示 必須)
  score?: number;                    // 内部 スコア (実装 依存)
  publishedAt: string;
  expiresAt?: string;
}

export type RankingType =
  | 'weekly_top30'                   // マンゾク weekly TOP30 (火曜 更新)
  | 'monthly_top_shops'              // monthly 総合
  | 'area_ranking'                   // 銀座 area TOP10 等
  | 'new_arrivals'                   // 新規 掲載
  | 'popular_by_reviews'             // 口コミ 評価 順
  | 'popular_by_bookings'            // 予約 数 順
  | 'user_vote_ranking'              // 会員 vote 順 (マンゾク MC point 系)
  | 'featured_paid';                 // ★ 有料 掲載 上位 (景表法 「PR」 label 必須)

export interface RankingCriteria {
  version: string;                   // semver
  effectiveFrom: string;
  criteriaDescription: string;       // 「アクセス数 60% + 口コミ 評価 40%」 等 の 明示 (景表法 line)
  weightings?: Record<string, number>;
  publicDisclosureUrl?: string;      // 公開 基準 page URL
}

// ─────────────────────────────────────────────────────────────
// Section B: video / voice content (シティヘブン + 風俗じゃぱん + 駅ちか 実測)
// ─────────────────────────────────────────────────────────────

/**
 * ★ 動画 / 音声 content = 著作権 + 個情法 (被撮影者 consent) + 18 禁 判定 対応 必須
 * ★ 「エロボイス」 (風俗じゃぱん 実測) 等 の 音声 content は 音声 collector の consent + 音声 復元 化 制限
 */
export interface MediaContent {
  id: string;                        // uuid
  mediaType: 'video' | 'voice' | 'photo_gallery';
  title: string;
  description?: string;
  url: string;                       // storage URL
  thumbnailUrl?: string;

  // 関連 owner
  shopId?: string;                   // PRShopListing.id
  performerId?: string;              // PerformerProfile.id

  // 分類
  contentCategory: 'introduction' | 'promotional' | 'diary_video' | 'erobōisu' | 'other';
  language?: 'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'ko';

  // Consent + rights
  performerConsentDocumentUrl?: string;  // 被撮影者 consent 書類 URL (admin only)
  copyrightHolder: string;           // 著作権 保有 者
  hasR18Marking: boolean;            // 18 禁 表示 有無 (実装時 gating 対応)

  // Publication
  publishedAt: string;
  expiresAt?: string;
  status: 'draft' | 'published' | 'archived' | 'removed_by_report';

  // Stats
  viewCount: number;
  likeCount?: number;
  reportCount?: number;
}

// ─────────────────────────────────────────────────────────────
// Section C: news / event feed
// ─────────────────────────────────────────────────────────────

/**
 * site 全体 news feed (店舗 個別 news は pr-shop-schema.ts の ShopNewsEvent)
 */
export interface SiteNewsPost {
  id: string;                        // uuid
  title: string;
  content: string;                   // markdown 想定
  imageUrl?: string;
  postCategory: 'system' | 'campaign' | 'featured_article' | 'notice' | 'legal_notice';
  publishedAt: string;
  expiresAt?: string;
  language?: 'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'ko';
  isPinned: boolean;
  authorName?: string;
}

// ─────────────────────────────────────────────────────────────
// Section D: 特集 記事 (マンゾク + シティヘブン 実測)
// ─────────────────────────────────────────────────────────────

/**
 * 「特集」 = shop を フィーチャー する 記事 (有料 掲載 or 編集 選抜)
 * ★ 有料 の 場合 は 「PR」 label 必須 (ステマ 規制)
 */
export interface FeaturedArticle {
  id: string;                        // uuid
  title: string;
  slug: string;                      // URL slug
  content: string;                   // markdown / html
  featuredShopIds: string[];         // PRShopListing.id[]
  featuredPerformerIds?: string[];   // PerformerProfile.id[]
  articleType: 'editorial' | 'paid_feature' | 'user_generated';
  isPRLabelRequired: boolean;        // ★ ステマ 規制 対応 (true なら 「PR」 label 表示 必須)
  publishedAt: string;
  updatedAt?: string;
  expiresAt?: string;
  viewCount: number;
  authorName?: string;
  language?: 'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'ko';
}

// ─────────────────────────────────────────────────────────────
// Section E: 統計 dashboard (admin 側 の 集計 data)
// ─────────────────────────────────────────────────────────────

/**
 * 顧客 情報 集計 は 個情法 「利用目的 明示」 対象、
 * aggregated 統計 のみ で 個別 特定 不能 を 明示 (実装時 documentation 必須)
 */
export interface SiteAnalytics {
  periodStart: string;
  periodEnd: string;

  // 顧客 側 統計
  activeUserCount: number;
  newRegistrationCount: number;
  reservationSubmittedCount: number;
  reviewSubmittedCount: number;
  rankingVoteCount: number;

  // 店舗 側 統計
  activeShopCount: number;
  activePerformerCount: number;
  newShopListingCount: number;

  // Content 統計
  totalReviewCount: number;
  totalPhotoDiaryPostCount: number;
  totalMediaContentViews: number;

  // 検索 統計
  topSearchKeywords?: Array<{
    keyword: string;
    count: number;
  }>;

  // 多言語
  languageDistribution?: Record<string, number>;

  // 統計 目的 明示
  purposeStatement: string;
  aggregationLevelGuarantee: 'no_individual_identification';
}

// ─────────────────────────────────────────────────────────────
// Section F: 通報 対応 (fujoho 380,225 口コミ scale の 通報 対応 = 大量 想定)
// ─────────────────────────────────────────────────────────────

/**
 * ★ 通報 対応 = プロバイダ責任制限法 準拠 + 名誉毀損 + 侮辱 + 個情法 対応
 * ★ admin-schema.ts の Report と 統合 (本 file は PR 特化 の 通報 category を 拡張)
 */
export type PRReportCategory =
  | 'illegal_content'                // 違法 content
  | 'defamation_review'              // 口コミ 誹謗中傷
  | 'false_ranking_manipulation'     // ランキング 不正 操作
  | 'stealth_marketing_violation'    // ステマ 規制 違反
  | 'age_violation_18_minor'         // 18 歳 未満
  | 'sex_trafficking_suspected'      // 人身 売買 疑い (警察 連絡 案件)
  | 'copyright_infringement'         // 著作権 侵害
  | 'privacy_violation'              // プライバシー 侵害
  | 'ai_generated_content_unlabeled' // AI 生成 content 未 表示
  | 'other';

export interface PRReport {
  id: string;
  reporterType: 'user' | 'shop_owner' | 'performer' | 'third_party' | 'system_auto';
  reporterUserId?: string;
  reportedTargetType: 'shop' | 'performer' | 'review' | 'diary' | 'media_content' | 'ranking' | 'featured_article';
  reportedTargetId: string;
  reportCategory: PRReportCategory;
  description: string;
  submittedAt: string;
  status: 'pending_review' | 'investigating' | 'action_taken' | 'no_action' | 'referred_to_police';
  assignedOfficerName?: string;
  resolvedAt?: string;
  resolutionNotes?: string;
  referralToPoliceLog?: {
    referredAt: string;
    caseNumber?: string;
    referredBy: string;
  };
}

// ─────────────────────────────────────────────────────────────
// Section G: 「待機中」 real-time indicator (駅ちか 実測)
// ─────────────────────────────────────────────────────────────

/**
 * ★ real-time performer 状態
 * ★ 実装時 は performer 側 の 明示 status 更新 UI + 個情法 (在籍 状況 リアルタイム 公開 の 同意) 対応 必須
 */
export interface PerformerAvailabilityStatus {
  performerId: string;
  status: 'available' | 'in_service' | 'break' | 'off_shift';
  updatedAt: string;
  estimatedAvailableAt?: string;     // 「30 分後 に available」 等 の 予告
  currentLocation?: string;          // area label のみ (詳細 住所 は 公開 しない)
  visibilityConsent: boolean;        // 本人 明示 同意 で のみ real-time 表示
}

// ─────────────────────────────────────────────────────────────
// Section H: 多言語 aggregation (YOASOBI HEAVEN model)
// ─────────────────────────────────────────────────────────────

/**
 * 訪日外国人向け 多言語 site の aggregated content
 * YOASOBI HEAVEN 実測: シティヘブン ネットワーク 傘下 の 5 言語 subdomain
 */
export interface MultilingualContentAggregation {
  id: string;
  sourceContentType: 'shop_listing' | 'performer_profile' | 'featured_article' | 'news_post';
  sourceContentId: string;
  originalLanguage: 'ja';
  translations: Array<{
    language: 'en' | 'zh-Hans' | 'zh-Hant' | 'ko';
    translatedTitle?: string;
    translatedContent?: string;
    translationMethod: 'human' | 'ai' | 'ai_reviewed_by_human';
    translatedAt: string;
    translatorId?: string;
  }>;
  aiTranslationDisclosure: boolean;  // AI 翻訳 使用 の 透明性 表示 (実装時 明示 必須)
}

// ─────────────────────────────────────────────────────────────
// Section I: type-level marker
// ─────────────────────────────────────────────────────────────

export const PR_CONTENT_SCHEMA_IMPLEMENTATION_MARKER = {
  layerScope: 'Layer 2 data-only',
  requiresLegalReview: true,
  legalReviewCategories: [
    'keihyou_hou',                   // 景表法 (ランキング 表示 + 「NO.1」 「業界最安」 等)
    'sutema_kisei_2023',             // ステマ 規制 2023 (「PR」 label 必須)
    'purobaida_sekinin_seigen_hou',  // プロバイダ責任制限法 (通報 対応)
    'meiyo_kison',                   // 名誉毀損 (口コミ 通報)
    'chosakuken_hou',                // 著作権法 (動画 / 音声)
    'kojin_jouhou_hogo_hou',         // 個人情報保護法 (統計 目的 明示)
    'jidou_fukushi_hou',             // 児童福祉法 (18 未満 検出)
    'jinshin_baibai_kinshi_hou',     // 人身売買禁止法 (疑い 通報 対応)
  ],
  rankingDisclosureRequirements: [
    'ranking_criteria_publicly_disclosed',
    'paid_slot_labeled_as_PR',
    'stealth_marketing_prohibited',
  ],
  crossingReiJobBoardLine: 'content_aggregation_and_moderation_new_layer',
  reiProjectHonestScopeReference: 'project_rei_talent_agency_scaffold_2026-06-22.md',
} as const;
