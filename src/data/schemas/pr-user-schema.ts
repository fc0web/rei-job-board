/**
 * pr-user-schema.ts — PR サイト ユーザー 側 (顧客 側) が 打ち込む 項目 の TypeScript type 定義
 *
 * v0.5 Layer 2 (2026-07-13, 藤本さん 「此方 に 全て 取り込みたい」 選択)
 *
 * Source: 実測 7 site combined
 *   - シティヘブン: 会員 登録 + かんたんネット予約 + 写メ日記 + 口コミ + クーポン + video content
 *   - 風俗じゃぱん: 会員 登録 + 口コミ + 割引 coupon + video / ranking
 *   - 駅ちか: お気に入り + ランキング + 待機中 real-time notification
 *   - fujoho: 会員 (マイページ) + 380,225 口コミ (投稿 中心)
 *   - マンゾク: 会員 登録 + MC ポイント system + weekly TOP30 vote
 *   - YOASOBI HEAVEN: 5 言語 + AI concierge chat + 訪日外国人 特化
 *   - kanto.qzin: 会員 登録 + login + SNS 連携
 *
 * ★★★ Honest note (最重要):
 *   本 file は data structure only、 実装 UI (会員 登録 form / 予約 form / 口コミ 投稿 form) は
 *   Layer 3 越境 = 弁護士 consultation 経路 待ち、 本 file 範囲外。
 *
 *   顧客 個人情報 収集 = 個情法 対応 業務体制 構築 必須:
 *     - プライバシー ポリシー 独立 page (7 site 中 独立 有 は half half)
 *     - 個人情報 取扱 責任者 選任
 *     - 苦情対応 責任者 選任
 *     - 削除 request workflow (GDPR-style)
 *     - marketing consent opt-in 別 layer 管理
 *
 *   ★ 業界 標準 と rei-project HONEST_SCOPE 対比:
 *     - 業界: 会員 登録 で email + password + 年齢 + 都道府県 のみ (最小)
 *     - シティヘブン: 会員 4.5M+ / 月間 PV 23 億 = 個情法 対応 大規模
 *     - rei-project: 除外 line 継続 = schema 網羅 は Layer 2 のみ、 Layer 3 実装 越境 判断
 */

// ─────────────────────────────────────────────────────────────
// Section A: 基本 会員 情報 (7 site 実測 combined)
// ─────────────────────────────────────────────────────────────

/**
 * PR サイト 顧客 会員 profile
 *
 * ★ 「顧客 個人情報 収集」 は 個情法 対応 必須、 業界 標準 は minimum 収集
 */
export interface PRUserProfile {
  // ─ Meta ─
  id: string;                        // uuid
  registeredAt: string;              // ISO 8601
  status: 'pending_verification' | 'active' | 'suspended' | 'deletion_requested';

  // ─ 基本 情報 ─
  username: string;                  // 会員 name (nickname、 匿名 可)
  email: string;                     // verification 送信 用
  passwordHash: string;              // bcrypt / argon2 (実装時)
  age: number;                       // ★ 18 歳 以上 必須 (業界 標準)、 高校生 不可 明示

  // ─ Optional 情報 (marketing 目的 明示 必須) ─
  prefectureOfInterest?: string;     // 都道府県 (推奨 表示 用)
  cityOfInterest?: string;           // 市区町村 (optional)

  // ─ 個人情報 取扱 同意 (必須) ─
  consent: PRUserConsent;

  // ─ 多言語 preference (YOASOBI HEAVEN 実測) ─
  languagePreference?: 'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'ko';

  // ─ SNS 連携 (kanto.qzin 系) ─
  socialLoginProviders?: PRSocialLoginProvider[];

  // ─ Login 補助 ─
  emailVerified: boolean;
  emailVerifiedAt?: string;
  lastLoginAt?: string;

  // ─ Membership tier (マンゾク MC point 系) ─
  membershipTier?: 'free' | 'regular' | 'gold' | 'platinum';
  membershipPoints?: number;         // MC ポイント 等 の 独自 point
}

// ─────────────────────────────────────────────────────────────
// Section B: 同意 (Consent) 明示
// ─────────────────────────────────────────────────────────────

export interface PRUserConsent {
  personalInfoHandling: boolean;      // 個人情報 取扱 同意 (必須)
  personalInfoHandlingConsentDate: string;
  termsOfService: boolean;            // 利用規約 同意 (必須)
  termsOfServiceConsentDate: string;
  ageConfirmation18Plus: boolean;     // 18 歳 以上 確認 (必須、 業界 標準)
  highSchoolStudentDenial: boolean;   // 高校生 でない (kanto.qzin + シティヘブン 実測)

  // Marketing / campaign 用 (opt-in、 個情法 目的 明示 必須)
  marketingEmailConsent?: boolean;    // marketing email 同意
  marketingEmailConsentDate?: string;
  pushNotificationConsent?: boolean;
  pushNotificationConsentDate?: string;

  // Cookie / analytics (個情法 目的 明示)
  analyticsCookieConsent?: boolean;
  analyticsCookieConsentDate?: string;
}

// ─────────────────────────────────────────────────────────────
// Section C: SNS 連携
// ─────────────────────────────────────────────────────────────

export type PRSocialLoginProvider = 'line' | 'twitter' | 'google' | 'apple' | 'facebook';

// ─────────────────────────────────────────────────────────────
// Section D: お気に入り list (7 site 全 実装)
// ─────────────────────────────────────────────────────────────

export interface FavoriteShopList {
  userId: string;
  favoriteShopIds: string[];         // PRShopListing.id[]
  updatedAt: string;
}

export interface FavoritePerformerList {
  userId: string;
  favoritePerformerIds: string[];    // PerformerProfile.id[]
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Section E: 閲覧 履歴 (個情法 目的 明示 対象)
// ─────────────────────────────────────────────────────────────

/**
 * ★ 閲覧 履歴 は 個情法 「利用目的 の 明示」 対象、
 *   実装時 に 「サービス 改善」 + 「レコメンド」 目的 明示 + 保持期間 明示 必須
 */
export interface BrowseHistory {
  userId: string;
  entries: BrowseHistoryEntry[];
  retentionDays: number;             // 30 / 90 / 180 等
  purposeStatement: string;          // 個情法 目的 statement (「サービス改善のため」 + 「レコメンドのため」)
}

export interface BrowseHistoryEntry {
  browsedAt: string;                 // ISO 8601
  targetType: 'pr_shop' | 'performer' | 'ranking_page' | 'coupon' | 'photo_diary';
  targetId: string;
  referrerType?: 'search' | 'ranking' | 'favorite' | 'external';
}

// ─────────────────────────────────────────────────────────────
// Section F: 予約 form (7 site 実測、 シティヘブン かんたんネット予約 主軸)
// ─────────────────────────────────────────────────────────────

/**
 * ★ 予約 = 個人情報 収集 + 決済 誘導 (場合 に よって)、
 *   実装時 に 特定商取引法 表記 + 消費者契約法 対応 必須
 */
export interface Reservation {
  id: string;                        // uuid
  userId: string;                    // PRUserProfile.id
  shopId: string;                    // PRShopListing.id
  performerId?: string;              // PerformerProfile.id (指名 予約)

  reservationMethod: 'phone' | 'web_form' | 'line' | 'external_booking_system';
  reservationDate: string;           // YYYY-MM-DD
  reservationStartTime: string;      // HH:MM
  reservationDurationMinutes: number;

  // 顧客 側 情報 (予約 時 に 送信)
  customerContactPhone: string;      // 応対 先 電話 (店舗 側 に 通知、 「電話番号 は 店舗 に 通知」 明示 要)
  customerNotes?: string;            // 希望 コース / option 選択 free text

  // 選択 option
  selectedOptions?: string[];        // OptionPrice.name[]
  estimatedTotalPriceYen?: number;   // 概算 料金

  // Status
  status: 'submitted' | 'confirmed' | 'cancelled_by_customer' | 'cancelled_by_shop' | 'completed' | 'no_show';
  confirmedAt?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  cancellationFeeChargedYen?: number; // キャンセル 料 (景表法 line = 事前 明示 済 前提)

  // Log
  submittedAt: string;
  updatedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Section G: 口コミ 投稿 (fujoho 380,225 口コミ 最大 級 model)
// ─────────────────────────────────────────────────────────────

/**
 * ★ 口コミ 投稿 = 名誉毀損 / 侮辱 / プロバイダ責任制限法 対応 必須
 *   pr-shop-schema.ts の ShopReviewConfig で 「事前 承認 or 事後 通報 対応」 判定
 */
export interface PRUserReview {
  id: string;                        // uuid
  userId: string;                    // PRUserProfile.id
  shopId: string;                    // PRShopListing.id
  performerId?: string;              // 指名 performer 口コミ

  rating: number;                    // 1-5 or 1-10 (ShopReviewConfig.reviewRatingScale)
  title?: string;
  content: string;                   // review text
  photoUrls?: string[];              // 顧客 side 写真 upload (個情法 + 著作権 対応)

  visitedAt?: string;                // 訪問 日 (optional)
  submittedAt: string;

  // Moderation
  status: 'pending_review' | 'published' | 'rejected' | 'reported_and_removed';
  moderationLog?: string;
  reportCount?: number;              // 誹謗中傷 通報 count

  // Sentiment / analysis
  sentimentTags?: string[];          // 「接客良い」 「価格 高い」 「清潔」 等 (fujoho 実測 hashtag 系)

  // Anti-abuse
  isVerifiedVisit?: boolean;         // 予約 履歴 と 紐付け 済 か
  helpfulCount?: number;             // 「参考 に なった」 count
}

// ─────────────────────────────────────────────────────────────
// Section H: ランキング 参加 (マンゾク weekly TOP30 vote model)
// ─────────────────────────────────────────────────────────────

/**
 * 顧客 側 が 参加する ランキング vote system
 * マンゾク 実測: weekly TOP30 更新 + MC point 付与
 */
export interface RankingVote {
  id: string;                        // uuid
  userId: string;
  targetType: 'shop' | 'performer';
  targetId: string;
  votedAt: string;                   // ISO 8601
  weekIdentifier: string;            // 「2026-W28」 等 (week 単位 vote 単位 集計)
  pointsAwarded?: number;            // MC point 付与 数
}

// ─────────────────────────────────────────────────────────────
// Section I: 写メ日記 コメント (シティヘブン + 駅ちか 実測)
// ─────────────────────────────────────────────────────────────

/**
 * ★ performer 写メ日記 (PerformerDiaryEntry) へ の 顧客 side コメント
 *   pr-shop-schema.ts の PerformerDiaryEntry.commentCount と 紐付け
 */
export interface DiaryComment {
  id: string;                        // uuid
  userId: string;
  diaryEntryId: string;              // PerformerDiaryEntry.id
  content: string;
  submittedAt: string;
  status: 'published' | 'pending_moderation' | 'reported_and_removed';
  reportCount?: number;
}

// ─────────────────────────────────────────────────────────────
// Section J: MC point / clip / coupon 受取
// ─────────────────────────────────────────────────────────────

/**
 * マンゾク MC ポイント system 相当
 * yorumachi PayPay 500 円 + SNS review 500 円 と 同 pattern
 */
export interface UserPointTransaction {
  id: string;
  userId: string;
  transactionType: 'earned' | 'redeemed' | 'expired' | 'refunded';
  amount: number;                    // point 数
  reason: string;                    // 'weekly_vote' / 'review_bonus' / 'referral' / 'coupon_redemption' / etc
  relatedEntityType?: 'review' | 'ranking_vote' | 'coupon' | 'referral';
  relatedEntityId?: string;
  occurredAt: string;
  balanceAfter: number;              // 取引 後 残高
}

export interface UserCouponClip {
  id: string;
  userId: string;
  couponId: string;                  // ShopCoupon.id
  clippedAt: string;
  usedAt?: string;
  status: 'clipped' | 'used' | 'expired';
}

// ─────────────────────────────────────────────────────────────
// Section K: AI concierge (YOASOBI HEAVEN 実測)
// ─────────────────────────────────────────────────────────────

/**
 * YOASOBI HEAVEN 実測: AI concierge chat 履歴
 * ★ AI が 「性風俗 推奨」 を 出力 する 場合 = 実装時 に content moderation 必須
 * ★ 個情法 + 消費者契約法 (AI 推奨 の 責任 帰属) 弁護士 monitor 必須
 */
export interface AIConciergeSession {
  id: string;
  userId: string;
  startedAt: string;
  lastMessageAt: string;
  status: 'active' | 'closed' | 'archived';
  language: 'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'ko';
  messages: AIConciergeMessage[];
}

export interface AIConciergeMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  sentAt: string;
  aiModel?: string;                  // 使用 model name (透明性)
  contentModerationResult?: {
    flagged: boolean;
    categories?: string[];           // 検閲 category
  };
}

// ─────────────────────────────────────────────────────────────
// Section L: 個人情報 削除 request (GDPR-style workflow)
// ─────────────────────────────────────────────────────────────

/**
 * 個情法 34 条 保有 個人 データ の 削除 請求 対応
 */
export interface PRUserDeletionRequest {
  id: string;
  userId: string;
  requestedAt: string;
  reason?: string;
  status: 'pending_verification' | 'verified' | 'processing' | 'completed' | 'rejected';
  verifiedAt?: string;
  completedAt?: string;
  responsibleOfficerName: string;
  deletionScope: {
    profileDeleted: boolean;
    reservationsAnonymized: boolean;  // 契約 履行 記録 は 法令 上 保持 義務 あり (匿名 化)
    reviewsDeleted: boolean;
    favoritesDeleted: boolean;
    browseHistoryDeleted: boolean;
    pointsForfeited: boolean;
    diaryCommentsDeleted: boolean;
  };
}

// ─────────────────────────────────────────────────────────────
// Section M: type-level marker (rei-project HONEST_SCOPE 明示)
// ─────────────────────────────────────────────────────────────

export const PR_USER_SCHEMA_IMPLEMENTATION_MARKER = {
  layerScope: 'Layer 2 data-only',
  requiresLegalReview: true,
  legalReviewCategories: [
    'kojin_jouhou_hogo_hou',         // 個人情報保護法
    'shohisha_keiyaku_hou',          // 消費者契約法 (予約 + キャンセル)
    'tokutei_shou_torihiki_hou',     // 特定商取引法 (決済 誘導 有 なら 必須)
    'purobaida_sekinin_seigen_hou',  // プロバイダ責任制限法 (口コミ 対応)
    'meiyo_kison',                   // 名誉毀損
    'jidou_fukushi_hou',             // 児童福祉法 (18 未満 検出)
    'chosakuken_hou',                // 著作権法 (顧客 upload 写真 の 権利 処理)
    'fuei_hou',                      // 風営法 (業種 が 該当 の 場合)
    'keihyou_hou',                   // 景表法 (クーポン / ランキング 表示 の 明示)
  ],
  aiConciergeMonitoringRequired: true,
  aiConciergeMonitoringPoints: [
    'content_moderation_output',     // AI 出力 の content moderation
    'liability_attribution',         // AI 推奨 の 責任 帰属
    'transparency_disclosure',       // AI 使用 の 透明性
  ],
  crossingReiJobBoardLine: 'requester_information_non_collection_line_AND_customer_information_layer_new',
  reiProjectHonestScopeReference: 'project_rei_talent_agency_scaffold_2026-06-22.md',
} as const;
