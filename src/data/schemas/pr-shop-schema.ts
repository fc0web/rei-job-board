/**
 * pr-shop-schema.ts — PR サイト 店舗 側 (お店側) が 打ち込む 項目 の TypeScript type 定義
 *
 * v0.5 Layer 2 (2026-07-13, 藤本さん 「此方 に 全て 取り込みたい」 選択)
 *
 * Source: 実測 7 site + 前 turn kanto.qzin combined
 *   - シティヘブン (cityheaven.net): 974 店 / 84,013 女性 registered / 業界 最大級
 *   - 風俗じゃぱん (fuzoku.jp)
 *   - 駅ちか (ranking-deli.jp): 「待機中」 real-time indicator
 *   - 口コミ風俗情報局 (fujoho.jp): 15,479 店 / 380,225 口コミ 最大 級
 *   - マンゾク (manzoku.or.jp): 705 店 / 61,060 人 / MC point + weekly TOP30
 *   - YOASOBI HEAVEN: 訪日外国人特化 5 言語
 *   - kanto.qzin.jp (バニラ): 松戸 area 51 店
 *
 * ★★★ Honest note (最重要):
 *   本 file は data structure only、 実装 UI (掲載申込 form / お店 dashboard / performer 管理 panel) は
 *   Layer 3 越境 = 弁護士 consultation 経路 待ち、 本 file 範囲外。
 *
 *   業種 (ShopCategory) は shop-schema.ts の 既存 type を 再利用 = HONEST_SCOPE 除外 line 判定
 *   継続 (isExcludedCategory 経由)、 schema 網羅 と 実装 除外 は 分離 layer。
 */

import type {
  ShopCategory,
  NonAdultNightworkCategory,
  AdultEntertainmentCategory,
  Address,
  NearestStation,
  SocialContact,
} from './shop-schema';

// ─────────────────────────────────────────────────────────────
// Section A: 業界 標準 業種 (7 site 実測 combined)
// ─────────────────────────────────────────────────────────────

/**
 * PR サイト 特化 業種 拡張
 * shop-schema.ts の ShopCategory (求人 side) に加え、
 * 顧客 PR 側 で 頻出 の 追加 category:
 *   - image_club (イメクラ、 マンゾク 実測)
 *   - special_shop (特殊店、 マンゾク 実測)
 *   - outcall_massage (出張 aroma / massage、 YOASOBI 実測)
 *   - social_dining (社交飲食、 駅ちか 実測)
 */
export type PRShopExtendedCategory =
  | 'image_club'          // イメクラ
  | 'special_shop'        // 特殊店
  | 'outcall_massage'     // 出張 aroma / massage
  | 'social_dining';      // 社交飲食

/**
 * 全 PR site 業種 (求人 side + PR 拡張)
 * ★ rei-project HONEST_SCOPE 除外 line 判定 は shop-schema.ts isExcludedCategory() を base に、
 *   PR 拡張 category も 「性風俗特殊営業 該当 か」 で 個別 判定 (弁護士 judgment 領域)
 */
export type PRShopCategory = ShopCategory | PRShopExtendedCategory;

/**
 * PR サイト 特化 「性風俗 該当 判定」
 * ★ image_club / special_shop / outcall_massage の 一部 は 性風俗特殊営業 該当 case あり
 * ★ social_dining は 一般的 に 風営法 1 号 or 2 号 (非 性風俗)
 */
export const isPRShopExcludedCategory = (cat: PRShopCategory): boolean => {
  // shop-schema.ts の isExcludedCategory は adult entertainment のみ carry
  // ここ で PR 拡張 category の 判定 も 統合
  const explicitlyExcluded: string[] = [
    'delivery_health',
    'soap',
    'shop_health',
    'hotel_health',
    'erotic_massage',
    'hand_service',
    'pink_salon',
    'sex_hostess',
    'image_club',           // イメクラ = 一般的 に 性風俗特殊営業 相当
    'special_shop',         // 特殊店 = 弁護士 judgment 領域
    'outcall_massage',      // 出張 aroma = 業態 に より 分岐
  ];
  return explicitlyExcluded.indexOf(cat as string) !== -1;
};

// ─────────────────────────────────────────────────────────────
// Section B: 営業 情報
// ─────────────────────────────────────────────────────────────

export interface BusinessHours {
  openTime: string;         // HH:MM
  closeTime: string;        // HH:MM (翌日 の 場合 は 「26:00」 等 の 表記 か 24 時間 表記)
  regularHoliday?: string[];  // 定休日 (例: ['sunday', 'thursday'])
  seasonalNote?: string;    // 「年末年始 変更 あり」 等
}

export interface BusinessLocation {
  address: Address;                       // shop-schema.ts の Address 継承
  nearestStations?: NearestStation[];     // 最寄り 駅 (600+ 網羅、 shop-schema 継承)
  areaAccessNote?: string;                // 「JR 銀座駅 徒歩 3 分」 等
  displayFullAddress: boolean;            // 詳細 住所 公開 有無
  displayLandmark?: string;               // ランドマーク 公開 (「銀座 4 丁目 交差点 近く」 等 大まか 表示)
}

// ─────────────────────────────────────────────────────────────
// Section C: 料金 system (顧客向け PR 用)
// ─────────────────────────────────────────────────────────────

/**
 * PR サイト の 顧客向け 料金 表示 (シティヘブン + 駅ちか + マンゾク 実測 combined)
 */
export interface PricingSystem {
  basePriceYen: number;              // 基本 料金 (例: 60 分 15,000 円)
  baseDurationMinutes: number;       // 基本 時間 (例: 60)
  optionPrices?: OptionPrice[];      // option 料金 (指名 / コース upgrade 等)
  nightSurchargeStart?: string;      // 深夜 料金 開始 時刻 (HH:MM)
  nightSurchargeYen?: number;        // 深夜 割増 料金
  cardPaymentAccepted: boolean;
  electronicPaymentAccepted: string[];  // ['paypay', 'linepay', 'transportation_ic', 'credit_card']
  pricingNote?: string;              // 料金 詳細 free text (景表法 line 注意 = 誤解 招く 表示 禁止)
}

export interface OptionPrice {
  name: string;
  priceYen: number;
  description?: string;
}

// ─────────────────────────────────────────────────────────────
// Section D: 送迎 (デリバリー 系)
// ─────────────────────────────────────────────────────────────

export interface DeliveryArea {
  centerLocation: string;            // 「新宿」 「銀座」 等 (base)
  deliveryAreaNames: string[];       // 送迎 area 名 の list
  deliveryChargeYen?: number;        // 送迎 料 (無料 / 距離別 の 場合 の base)
  freeDeliveryRadiusKm?: number;     // 無料 送迎 半径 km
  hotelListingUrls?: string[];       // 提携 hotel URL リスト
}

// ─────────────────────────────────────────────────────────────
// Section E: 予約 method
// ─────────────────────────────────────────────────────────────

export type ReservationMethod =
  | 'phone'                          // 電話
  | 'web_form'                       // Web form
  | 'line'                           // LINE
  | 'external_booking_system'        // シティヘブン かんたんネット予約 系
  | 'walk_in';                       // 直接 来店

export interface ReservationConfig {
  acceptedMethods: ReservationMethod[];
  primaryContactPhone?: string;
  webFormEndpoint?: string;
  lineOfficialId?: string;
  externalBookingUrl?: string;
  reservationHoursOpen: string;      // 予約 受付 開始 時刻
  reservationHoursClose: string;
  advanceBookingRequiredMinutes?: number;  // 「30 分前 まで 受付」 等
  cancellationPolicyYen?: number;    // キャンセル 料 (景表法 line = 事前 明示 必須)
  cancellationPolicyText?: string;
}

// ─────────────────────────────────────────────────────────────
// Section F: 店舗 PR content (写真 / 動画 / news / event / coupon)
// ─────────────────────────────────────────────────────────────

export interface ShopMedia {
  photoUrls: string[];               // 複数 upload (interior / atmosphere / logo etc)
  videoUrls?: string[];              // 紹介 動画 (景表法 + 著作権 対応 必須)
  virtualTourUrl?: string;           // 360° tour (option)
  primaryPhotoUrl?: string;          // list 表示 用 の 代表 写真
}

export interface ShopNewsEvent {
  id: string;
  title: string;
  description: string;
  eventType: 'news' | 'campaign' | 'new_arrival' | 'schedule_change' | 'coupon';
  publishedAt: string;               // ISO 8601
  expiresAt?: string;                // 掲載 期限
  imageUrl?: string;
}

export interface ShopCoupon {
  id: string;
  title: string;                     // 例: 「新規 3,000 円 OFF」
  discountAmountYen?: number;
  discountPercentage?: number;
  conditions: string;                // 「初回 のみ」 「平日 12-17 時」 等 (景表法 line = 条件 明示 必須)
  validFrom: string;                 // ISO 8601
  validTo: string;                   // ISO 8601
  couponCode?: string;
  usageCount?: number;               // 何 度 利用 された か (admin 側 集計)
}

// ─────────────────────────────────────────────────────────────
// Section G: 在籍 スタッフ / performer 情報 (顧客向け PR 用)
// ─────────────────────────────────────────────────────────────

/**
 * ★★★ Honest scope critical (最重要):
 *   在籍 スタッフ 情報 の 公開 は 「consent-based」 = 本人 明示 同意 必須。
 *   本 schema は data structure only、 実装時 に consent 記録 + 表示 制御 の layer が
 *   別途 必要 (rei-talent-agency の consent ベース 表示制御 と 同 pattern)。
 *
 *   顔写真 公開 は プライバシー risk 極 高い、 実装時 は 「顔隠し」 「モザイク」 等 の
 *   default 選択肢 明示 + 本人 選択 可 の consent UI 必須。
 *
 *   源氏名 (nickname) 使用 が 業界 標準、 本名 は 収集 しない line 推奨。
 */
export interface PerformerProfile {
  id: string;                        // uuid (本名 と 紐付けない、 site 内 nickname 単位)
  nickname: string;                  // 源氏名 (本名 は 収集 しない)
  age: number;                       // 18+ 必須 verify

  // Profile 詳細 (consent-based、 本人 明示 選択)
  height?: number;                   // cm
  bodyMeasurements?: {               // 業界 慣行、 但し 実装時 に 本人 consent 必須
    bust?: number;                   // cm
    waist?: number;                  // cm
    hip?: number;                    // cm
    cupSize?: string;                // 'A' | 'B' | 'C' | ... (公開 有無 optional)
  };

  // 特徴 tags (consent-based)
  types?: string[];                  // 'スレンダー' / 'グラマー' / 'ロリ' / etc (rei-side は default 表示 しない、 選択 opt-in)
  personality?: string[];            // 'おっとり' / '明るい' / etc

  // 写真 (consent 明示 必須)
  photos?: PerformerPhoto[];

  // 動画 (opt-in、 高 consent requirement)
  profileVideoUrl?: string;

  // 出勤 schedule
  currentlyAvailable: boolean;       // 駅ちか 「待機中」 real-time indicator
  scheduledShifts?: PerformerShift[];

  // Blog / 写メ日記
  photoDiary?: PerformerDiaryEntry[];

  // Consent record (必須)
  consent: PerformerConsent;

  // Status
  status: 'active' | 'on_leave' | 'departed' | 'suspended';
}

export interface PerformerPhoto {
  id: string;
  url: string;
  faceVisibility: 'visible' | 'hidden' | 'masked' | 'stamped'; // 顔 表示 選択
  isPrimary: boolean;
  publishedAt: string;
  consent: {
    consentedAt: string;
    consentDocumentUrl: string;      // 顔写真 公開 同意 書 の 保管 URL (admin only)
  };
}

export interface PerformerShift {
  date: string;                      // YYYY-MM-DD
  startTime: string;                 // HH:MM
  endTime: string;                   // HH:MM
  status: 'scheduled' | 'available' | 'reserved' | 'completed' | 'cancelled';
}

export interface PerformerDiaryEntry {
  id: string;
  title: string;
  content: string;                   // 本人 執筆 の 記事
  imageUrls?: string[];
  publishedAt: string;
  updatedAt?: string;
  reactionCount?: number;            // like 数 等
  commentCount?: number;
}

/**
 * ★ 本人 consent 記録 (フリーランス保護法 2026-11 対応 + 個情法 対応)
 */
export interface PerformerConsent {
  personalInfoHandling: boolean;
  personalInfoHandlingConsentDate: string;
  photoPublishConsent: boolean;
  photoPublishConsentDate?: string;
  bodyMeasurementsPublishConsent: boolean;
  bodyMeasurementsPublishConsentDate?: string;
  diaryPublishConsent: boolean;
  diaryPublishConsentDate?: string;
  videoPublishConsent: boolean;
  videoPublishConsentDate?: string;
  reviewPublishConsent: boolean;     // 口コミ 掲載 同意
  reviewPublishConsentDate?: string;
  withdrawalPolicyExplained: boolean; // 撤回 権利 説明 済 (フリーランス保護法 準拠)
  withdrawalPolicyExplainedDate?: string;
  contractedByAt: string;            // 事務所 と の 業務委託契約 締結 日 (rei-talent-agency 連携)
  contractDocumentUrl: string;       // 業務委託契約書 の 保管 URL (admin only)
}

// ─────────────────────────────────────────────────────────────
// Section H: 口コミ / ランキング / 認証 badge
// ─────────────────────────────────────────────────────────────

export interface ShopReviewConfig {
  acceptReviews: boolean;
  requirePreModeration: boolean;     // 事前 承認 (誹謗中傷 対応 line、 弁護士 monitor 推奨)
  reviewRatingScale?: 5 | 10;
  reviewMinimumCharacterCount?: number;
}

export interface ShopRankingParticipation {
  participateInWeeklyRanking: boolean;  // マンゾク weekly TOP30 相当
  participateInMonthlyRanking: boolean;
  participateInAreaRanking: boolean;    // 銀座 area 上位 等
  ranking上位LabelConsent: boolean;    // 「上位」 表示 の 同意 (景表法 line = 実測 rank に 基づく)
}

export type ShopVerificationBadge =
  | 'verified_business'              // 法人 verify 済
  | 'long_established'               // 老舗 (10 年 以上 継続 等 の 客観的 定義)
  | 'newly_opened'                   // 新規 (開業 1 年 未満)
  | 'excellent_review_rating'        // 口コミ 高評価
  | 'compliance_verified';           // rei-project 独自 = HONEST_SCOPE line 遵守 確認

// ─────────────────────────────────────────────────────────────
// Section I: 契約 プラン (掲載 側 = 前 shop-schema.ts の ListingPricing と 統合)
// ─────────────────────────────────────────────────────────────

/**
 * PR サイト 独自 掲載 プラン (7 site 実測 combined)
 * yorumachi の 3ヶ月/6ヶ月/12ヶ月 model + 上位 表示 special plan と 同 pattern、
 * PR site 特化 で 「代理店 経由」 「特集 記事 掲載」 等 の option 追加。
 */
export type PRListingPlanTier = 'basic' | 'premium' | 'top_ranking' | 'featured_article';

export interface PRListingContract {
  planTier: PRListingPlanTier;
  contractPeriodMonths: 1 | 3 | 6 | 12;
  monthlyPriceYen: number;
  totalContractPriceYen: number;
  contractManagementFeeYen?: number;   // yorumachi 相当 2,200 円
  featuredArticleUrl?: string;         // 「特集」 掲載 の URL
  topRankingSlotDurationDays?: number; // 上位 表示 期間 (景表法 line = 表示 実期間 明示 必須)
  salesAgentId?: string;               // 代理店 経由 (SalesAgent.id, admin-schema.ts)
}

// ─────────────────────────────────────────────────────────────
// Section J: PRShopListing (中核 schema)
// ─────────────────────────────────────────────────────────────

/**
 * PR サイト 店舗 側 が 打ち込む 全 項目 の TypeScript type 定義
 *
 * Source: 実測 7 site + kanto.qzin combined、
 *   - Section B (営業 情報) + Section C (料金) + Section D (送迎) + Section E (予約) + Section F (media) +
 *     Section G (performer) + Section H (口コミ/ランキング/認証) + Section I (契約)
 *
 * ★ 本 schema は data structure only、 実装 UI は Layer 3 越境 = 弁護士 consultation 経路 待ち。
 */
export interface PRShopListing {
  // ─ Meta ─
  id: string;                        // uuid
  status: 'draft' | 'pending_review' | 'active' | 'expired' | 'rejected' | 'suspended';
  createdAt: string;                 // ISO 8601
  updatedAt: string;
  expiresAt?: string;

  // ─ 基本 情報 ─
  name: string;                      // 店舗名
  category: PRShopCategory;          // ★ HONEST_SCOPE 除外 line 判定 対象
  subCategory?: string;              // ジャンル sub (例: 「ロリ系」 「熟女」 等 の 業界 慣行 label)
  descriptionShort: string;          // 短 description (list 用)
  descriptionLong?: string;          // 詳細 description

  // ─ 営業 情報 (Section B) ─
  businessHours: BusinessHours;
  location: BusinessLocation;
  contactPhone: string;
  displayContactPhone: boolean;

  // ─ 料金 (Section C) ─
  pricingSystem: PricingSystem;

  // ─ 送迎 (Section D, デリバリー 系 のみ) ─
  deliveryConfig?: DeliveryArea;

  // ─ 予約 (Section E) ─
  reservationConfig: ReservationConfig;

  // ─ 店舗 media (Section F) ─
  media: ShopMedia;
  newsEvents?: ShopNewsEvent[];
  coupons?: ShopCoupon[];

  // ─ 在籍 performer (Section G) ─
  performers?: PerformerProfile[];

  // ─ 口コミ / ランキング (Section H) ─
  reviewConfig: ShopReviewConfig;
  rankingParticipation?: ShopRankingParticipation;
  verificationBadges?: ShopVerificationBadge[];

  // ─ SNS 連絡 (kanto.qzin 系 継承) ─
  socialContact?: SocialContact;

  // ─ 掲載 契約 (Section I) ─
  listingContract: PRListingContract;

  // ─ 多言語 (YOASOBI HEAVEN 実測) ─
  supportedLanguages?: Array<'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'ko'>;

  // ─ 契約 約款 meta ─
  contractedTermsVersion: string;
  contractedAt: string;
}

// ─────────────────────────────────────────────────────────────
// Section K: type-level marker (rei-project HONEST_SCOPE 明示)
// ─────────────────────────────────────────────────────────────

export const PR_SHOP_SCHEMA_IMPLEMENTATION_MARKER = {
  layerScope: 'Layer 2 data-only',
  requiresLegalReview: true,
  legalReviewCategories: [
    'fuei_hou',                      // 風営法 (性風俗特殊営業 届出)
    'jidou_fukushi_hou',             // 児童福祉法 (18 歳 未満 検出)
    'roudou_kijun_hou',              // 労働基準法
    'kojin_jouhou_hogo_hou',         // 個人情報保護法
    'purobaida_sekinin_seigen_hou',  // プロバイダ責任制限法 (口コミ 対応)
    'meiyo_kison',                   // 名誉毀損
    'keihyou_hou',                   // 景表法 (料金 表示 / 上位表示 の 明示)
    'chosakuken_hou',                // 著作権法 (写真 / 動画 の 権利 処理)
    'friilanse_hogo_hou',            // フリーランス保護法 2026-11 (performer 業務委託 側)
    'shohisha_keiyaku_hou',          // 消費者契約法 (キャンセル 料 等)
  ],
  performerConsentRequired: true,
  performerConsentFields: [
    'personalInfoHandling',
    'photoPublish',
    'bodyMeasurementsPublish',
    'diaryPublish',
    'videoPublish',
    'reviewPublish',
    'withdrawalPolicyExplained',
  ],
  crossingReiJobBoardLine: 'requester_information_non_collection_line_AND_adult_entertainment_exclusion',
  reiProjectHonestScopeReference: 'project_rei_talent_agency_scaffold_2026-06-22.md',
} as const;
