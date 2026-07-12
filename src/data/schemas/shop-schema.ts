/**
 * shop-schema.ts — 店舗 側 (お店側) が 打ち込む 項目 の TypeScript type 定義
 *
 * v0.4 Layer 2 (2026-07-13, 藤本さん 「B (Layer 1+2)」 選択)
 *
 * Scope:
 *   - Layer 1 = docs/SCHEMA_REFERENCE.md (educational reference)
 *   - Layer 2 = 本 file + job-seeker-schema.ts + admin-schema.ts (TypeScript type 定義)
 *   - Layer 3 = 実装 UI + login + admin panel (★ 弁護士 consultation 経路 待ち、 本 doc 範囲外)
 *
 * Source: yorumachi.jp + kanto.qzin.jp (バニラ) 2026-07-13 factual 実測 の 項目群 combined。
 *
 * ★ Honest note:
 *   - 本 file は data structure 型 定義 の みで、 実装 UI (Astro pages / login form) は 含まない
 *   - 実装 = Layer 3 越境 = 「求職者情報 非収集 line」 明示 越境 = 弁護士 consultation 必須
 *   - 業種 (ShopCategory) は 「非 風俗 nightwork」 と 「風俗業 明示 除外 line」 を type-level で 分離
 *   - rei-project HONEST_SCOPE 明示 line 継承 = 性風俗 / 反社 / マルチ案件 除外
 */

// ─────────────────────────────────────────────────────────────
// Section A: 業種 分類 (ShopCategory)
// ─────────────────────────────────────────────────────────────

/**
 * yorumachi 系 業種 (非 風俗 nightwork)
 * 風営法 1 号 (社交飲食店) / 2 号 (低照度飲食店) 相当 の 一般的 認識
 * 個別 店舗 の 「性風俗 該当 か」 は 弁護士 judgment 領域
 */
export type NonAdultNightworkCategory =
  | 'snack'          // スナック
  | 'lounge'         // ラウンジ
  | 'bar'            // バー
  | 'mini_club'      // ミニクラブ
  | 'karaoke_snack'  // カラオケスナック
  | 'club'           // クラブ
  | 'member_lounge'  // 会員制ラウンジ
  | 'girls_bar';     // ガールズバー

/**
 * kanto.qzin (バニラ) 系 業種 (風俗業 明示)
 * ★ rei-project HONEST_SCOPE 明示 除外 line 該当
 * 本 type は 「除外 判定 で 排除 する 対象」 を articulate するため の enum
 * (Layer 3 実装 で 業種 選択 dropdown から 除外 or 明示 flag で 発動 の 判定 source)
 */
export type AdultEntertainmentCategory =
  | 'delivery_health'  // デリヘル (性風俗特殊営業 2 号)
  | 'soap'             // ソープ (性風俗特殊営業 1 号)
  | 'shop_health'      // 店舗型ヘルス
  | 'hotel_health'     // ホテヘル
  | 'erotic_massage'   // 風俗エステ
  | 'hand_service'     // オナクラ・手コキ
  | 'pink_salon'       // ピンサロ
  | 'sex_hostess'      // セクキャバ・おっパブ
  | 'mens_esthetic';   // メンズエステ (該当 case + 非該当 case 混在、 弁護士 judgment 領域)

/**
 * 全 業種 (Layer 3 実装 時 に 除外 line 発動 or 含める か の 判定 source)
 */
export type ShopCategory = NonAdultNightworkCategory | AdultEntertainmentCategory;

/**
 * rei-project HONEST_SCOPE 明示 除外 line 該当 判定 (type-level)
 * true = 除外 line 該当、 false = 除外 line 該当 せず (弁護士 judgment 領域)
 */
export const isExcludedCategory = (cat: ShopCategory): boolean => {
  const excluded: AdultEntertainmentCategory[] = [
    'delivery_health',
    'soap',
    'shop_health',
    'hotel_health',
    'erotic_massage',
    'hand_service',
    'pink_salon',
    'sex_hostess',
    // 'mens_esthetic' は 判定 pending (弁護士 judgment 領域)
  ];
  // Use indexOf for broad target compatibility (works from es5 baseline).
  return (excluded as ShopCategory[]).indexOf(cat) !== -1;
};

// ─────────────────────────────────────────────────────────────
// Section B: 都道府県 + area (yorumachi 実測 準拠)
// ─────────────────────────────────────────────────────────────

export type Prefecture =
  | 'tokyo' | 'kanagawa' | 'aichi' | 'osaka' | 'hyogo' | 'kyoto' | 'nara' | 'wakayama' | 'fukuoka'
  | 'hokkaido' | 'tohoku' | 'hokuriku' | 'shikoku' | 'kyushu';

export interface Address {
  prefecture: Prefecture;
  city: string;                       // 市区町村 (yorumachi: 銀座 / 新宿・歌舞伎町 / 港区 / 池袋 / 上野・湯島 / etc)
  streetAddress?: string;             // 住所 詳細 (公開 有無 flag で 制御)
  displayStreetAddress: boolean;      // 詳細 住所 を site 上 で 公開 するか
  nearestStations?: NearestStation[]; // yorumachi: 600+ 駅 網羅
}

export interface NearestStation {
  railwayOperator: string;  // 'jr-east' / 'tokyo-metro' / 'toei-municipal-subway' / 'tokyu' / etc
  line: string;             // 'jr-yamanote' / 'ginza' / 'tozai' / etc
  stationName: string;      // '東京' / '新宿' / '銀座' / etc
  walkMinutes?: number;
}

// ─────────────────────────────────────────────────────────────
// Section C: 特徴 tags (yorumachi 実測 12 種)
// ─────────────────────────────────────────────────────────────

export type FeatureTag =
  | 'daily_pay_ok'        // 日払いOK
  | 'weekly_pay_ok'       // 週払いOK
  | 'non_drinker_ok'      // 飲めなくてもOK
  | 'immediate_start_ok'  // 即日勤務OK
  | 'trial_shift_ok'      // 体験入店OK
  | 'short_term_ok'       // 短期勤務OK
  | 'double_work_ok'      // Wワーク対応
  | 'age_30plus_ok'       // 30歳以上活躍中
  | 'free_dress_code'     // 服装自由
  | 'no_experience_ok'    // 未経験歓迎
  | 'no_quota'            // ノルマなし
  | 'near_station';       // 駅チカ

// ─────────────────────────────────────────────────────────────
// Section D: 応募 方法
// ─────────────────────────────────────────────────────────────

export type ApplicationMethod = 'web' | 'phone' | 'line';

// ─────────────────────────────────────────────────────────────
// Section E: 掲載 プラン (yorumachi 実測)
// ─────────────────────────────────────────────────────────────

export type ListingPeriod = '3months' | '6months' | '12months';

/**
 * 掲載 料金 chart (yorumachi 実測、 2026-07-13、 単位 円)
 * 契約管理費 2,200 円 別途、 上位 表示 special plan +月 20,000 円 (税別) option
 */
export interface ListingPricing {
  period: ListingPeriod;
  region: 'tokyo_kanagawa' | 'osaka_kyoto_aichi' | 'hyogo_nara_wakayama' | 'other';
  basePriceYen: number;   // 税込
  premiumMonthlyPlusYen?: number;  // 上位表示 special plan 追加 (税別)
}

// ─────────────────────────────────────────────────────────────
// Section F: SNS 連絡 (kanto.qzin 系 追加)
// ─────────────────────────────────────────────────────────────

export interface SocialContact {
  line?: string;
  x?: string;
  instagram?: string;
  tiktok?: string;
}

// ─────────────────────────────────────────────────────────────
// Section G: ShopListing (中核 schema)
// ─────────────────────────────────────────────────────────────

/**
 * 店舗 側 が 打ち込む 全 項目 の TypeScript type 定義
 *
 * Source: yorumachi.jp + kanto.qzin.jp (バニラ) 2026-07-13 factual 実測 combined。
 *
 * ★ 本 schema は data structure only、 実装 UI (Astro pages / 掲載申込 form / admin dashboard) は
 *   Layer 3 越境 = 弁護士 consultation 経路 待ち、 本 file 範囲外。
 */
export interface ShopListing {
  // ─ Meta ─
  id: string;                        // uuid
  status: 'draft' | 'pending_review' | 'active' | 'expired' | 'rejected' | 'suspended';
  createdAt: string;                 // ISO 8601
  updatedAt: string;                 // ISO 8601
  expiresAt?: string;                // ISO 8601 (契約 期間 満了)

  // ─ 基本 情報 (Section 1 の #1-8) ─
  name: string;                      // 店舗名
  category: ShopCategory;            // 業態 (★ HONEST_SCOPE 除外 line 判定 対象)
  address: Address;                  // 都道府県 + 市区町村 + 住所 + 最寄り 駅
  phoneNumber: string;
  displayPhoneNumber: boolean;       // 公開 有無 checkbox
  title: string;                     // 求人 内容 短文

  // ─ 時給 (Section 1 の #9-11) ─
  hourlyWageMin: number;             // 円
  hourlyWageMax?: number;            // 円 (range 上限)
  wageDetail?: string;               // 割増 / 保証 / 手当 詳細 free text

  // ─ 勤務 (Section 1 の #12-14) ─
  workStartTime: string;             // HH:MM
  workEndTime: string;               // HH:MM
  workDaysPerWeek?: string;          // free text (「週 3-5 日」 etc)

  // ─ 特徴 + 応募 (Section 1 の #15-16) ─
  featureTags?: FeatureTag[];
  applicationMethods: ApplicationMethod[];

  // ─ 写真 (Section 1 の #17) ─
  photoUrls?: string[];              // 複数 upload、 撮影 support あり

  // ─ 契約 プラン (Section 1 の #18-19) ─
  listingPricing: ListingPricing;

  // ─ Profile (Section 1 の #20-21) ─
  profileDescription?: string;       // 雰囲気 / メニュー / 客層 / 内装
  subCategory?: string;              // ジャンル sub-category

  // ─ kanto.qzin 系 追加 項目 (Section 1 の #22-26) ─
  seoKeywords?: string[];            // こだわり検索 keyword
  interviewTransportSubsidy?: boolean; // 面接 交通費 支給 有無
  trialShiftDetail?: string;         // 体験入店 detail
  socialContact?: SocialContact;     // SNS 連絡 情報
  allowReviews?: boolean;            // 口コミ 公開 有無

  // ─ contract meta ─
  contractedTermsVersion: string;    // 契約 約款 version (admin 側 で 履歴 管理)
  contractedAt: string;              // ISO 8601 (約款 同意 日時)
}

// ─────────────────────────────────────────────────────────────
// Section H: Layer 3 越境 判定 helpers (type-level 参照 用)
// ─────────────────────────────────────────────────────────────

/**
 * Layer 3 実装 の 前提 check list (弁護士 consultation 経路 で verify)
 *
 * ★ 本 interface は Layer 3 越境 の 事前 requirement を articulate する type-level marker、
 *   実装 なし (data structure only)
 */
export interface Layer3ImplementationPrerequisites {
  lawyerConsultationDate: string;                        // 弁護士 monitor 完了 日
  tokuteiBoshuJyoho_TeikyoJigyousha_TodokedeCompleted: boolean;  // 特定募集情報等提供事業者 届出 完了
  privacyPolicyPageUrl: string;                          // プライバシー ポリシー 独立 page URL
  termsOfServicePageUrl: string;                         // 利用規約 独立 page URL
  disclaimerPageUrl: string;                             // 免責事項 独立 page URL
  tokushouhouKisaiPageUrl?: string;                      // 特定商取引法 表記 (料金 collection 有 なら 必須)
  personalInfoResponsibleOfficerName: string;            // 個人情報 取扱 責任者
  complaintsResponsibleOfficerName: string;              // 苦情対応 責任者
  categoryExclusionPolicy: 'strict_exclude' | 'case_by_case' | 'none'; // 業種 除外 line 判定
}
