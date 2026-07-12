/**
 * shop-dashboard-schema.ts — 店舗 side が login 後 に 触れる dashboard 管理 項目 の TypeScript type 定義
 *
 * v0.6 Layer 2 (2026-07-13, 藤本さん 「login 後 の 項目」 確認 request)
 *
 * Source: 実測 7 site + kanto.qzin combined の 掲載 flow + 業界 標準 店舗 dashboard pattern
 *
 * ★★★ Honest note (最重要):
 *   本 file は data structure only、 実装 UI (dashboard page / 統計 chart / 通報 review UI) は
 *   Layer 3 越境 = 弁護士 consultation 経路 待ち、 本 file 範囲外。
 *
 *   店舗 側 dashboard = お店 owner / スタッフ が login 後 に:
 *     - 掲載 情報 更新
 *     - performer 追加 / 削除 / consent 管理
 *     - 予約 受信 / 対応
 *     - 決済 履歴 / 掲載料 支払
 *     - 通報 受信 (お店 が 受けた 通報 の review)
 *     - アクセス 統計 / 予約 集計
 *     - 契約 更新 / 停止
 */

import type { PRShopListing } from './pr-shop-schema';
import type { Reservation, PRUserReview } from './pr-user-schema';

// ─────────────────────────────────────────────────────────────
// Section A: 店舗 dashboard 統計 (お店 が 自 store の 統計 を 見る)
// ─────────────────────────────────────────────────────────────

/**
 * お店 が 自 dashboard で 見る 統計
 *
 * ★ 顧客 個別 特定 不能 な aggregated 統計 のみ (個情法 line 遵守)
 */
export interface ShopDashboardStatistics {
  shopId: string;
  periodStart: string;               // ISO 8601
  periodEnd: string;

  // アクセス 統計
  pageViewCount: number;             // 自 店舗 profile page の view 数
  uniqueVisitorCount: number;
  averageSessionDurationSeconds?: number;

  // 予約 統計
  reservationSubmittedCount: number;
  reservationConfirmedCount: number;
  reservationCancelledCount: number;
  reservationNoShowCount: number;
  reservationCompletedCount: number;
  totalRevenueYen?: number;          // 実収 (自己申告 or 予約 経由 集計)

  // 口コミ 統計
  newReviewsCount: number;
  averageRating?: number;            // 1-5 or 1-10
  reviewSentimentSummary?: {
    positive: number;
    neutral: number;
    negative: number;
  };

  // performer 別 集計
  perPerformerStats?: PerPerformerStat[];

  // 検索 hit 統計
  searchHitCount?: number;           // 自 店舗 が 検索 結果 に 表示 された 回数
  topReferralKeywords?: Array<{
    keyword: string;
    count: number;
  }>;

  // クーポン 集計
  couponClipCount?: number;
  couponUseCount?: number;

  // 通報 受信 統計 (お店 が 受けた 通報)
  reportsReceivedCount: number;
}

export interface PerPerformerStat {
  performerId: string;
  bookingsCount: number;
  averageRating?: number;
  photoDiaryPostsCount: number;
  reportsReceivedCount: number;
}

// ─────────────────────────────────────────────────────────────
// Section B: 店舗 側 予約 管理 (受信 の 予約 の 対応)
// ─────────────────────────────────────────────────────────────

/**
 * 予約 受信 queue (お店 側 が login 後 に 対応 する 予約)
 * pr-user-schema.ts の Reservation status 更新 flow と 連動
 */
export interface ShopReservationInboxItem {
  reservationId: string;             // Reservation.id
  shopId: string;
  receivedAt: string;
  priority: 'normal' | 'urgent';     // 「30 分後 開始」 等 は urgent
  status: 'new_unread' | 'read' | 'action_taken';
  assignedStaffId?: string;          // shop_staff role が 対応 assign
  responseNotes?: string;            // 対応 記録 free text
  respondedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Section C: performer 追加 / 削除 flow
// ─────────────────────────────────────────────────────────────

/**
 * performer 追加 request (contract 締結 flow)
 *
 * ★ pr-shop-schema.ts の PerformerConsent と 連動、
 *   契約 締結 完了 = 業務委託契約書 の 弁護士 monitor 済 版 に 署名
 */
export interface PerformerAdditionWorkflow {
  id: string;
  shopId: string;
  performerCandidateId?: string;     // 候補者 の id (登録 前 は null 可)

  // 契約 段階
  stage:
    | 'initial_contact'              // 初回 接触
    | 'interview_scheduled'          // 面接 予定
    | 'interview_completed'          // 面接 完了
    | 'consent_documents_sent'       // consent 書類 送付 済
    | 'consent_documents_signed'     // consent 書類 署名 済
    | 'contract_signed'              // 業務委託契約書 署名 済
    | 'performer_activated'          // 在籍 開始
    | 'declined'                     // 辞退
    | 'rejected';                    // 不採用

  // Consent + contract 記録
  interviewedAt?: string;
  consentDocumentsSentAt?: string;
  consentDocumentsSignedAt?: string;
  contractSignedAt?: string;
  contractDocumentUrl?: string;      // 業務委託契約書 (admin only)
  performerActivatedAt?: string;

  // Decline / reject
  declinedAt?: string;
  declineReason?: string;
  rejectedAt?: string;
  rejectionReason?: string;

  // フリーランス保護法 2026-11 対応
  freelanceProtectionActCompliance: {
    writtenContractProvided: boolean;
    paymentTermsDisclosed: boolean;
    harassmentContactProvided: boolean;
    withdrawalPolicyExplained: boolean;
  };
}

/**
 * performer 削除 / 退所 flow
 */
export interface PerformerDepartureWorkflow {
  id: string;
  shopId: string;
  performerId: string;

  // 退所 段階
  stage:
    | 'departure_requested'          // 退所 request 受信
    | 'notice_period_active'         // 予告 期間 (30 日 前 予告 = フリーランス保護法 準拠)
    | 'contract_terminated'          // 契約 終了
    | 'data_archival_completed';     // データ archive 完了

  requestedByType: 'performer_self' | 'shop_owner' | 'admin_forced';
  requestedAt: string;
  noticePeriodStartAt?: string;
  contractTerminatedAt?: string;
  dataArchivedAt?: string;

  // Post-departure data handling
  performerPhotosDeletionPolicy: 'immediate' | 'grace_period' | 'kept_with_consent';
  performerDiaryHandling: 'archived' | 'deleted' | 'kept';
  performerReviewsHandling: 'kept' | 'anonymized' | 'deleted';

  // フリーランス保護法 準拠
  noticePeriodDays: number;          // 30 日 が 標準
  finalPaymentSettledAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Section D: 掲載料 決済 履歴 (お店 側 payment records)
// ─────────────────────────────────────────────────────────────

/**
 * お店 側 が 見る 決済 履歴 (admin-schema.ts PaymentRecord の shop-side view)
 */
export interface ShopPaymentHistoryEntry {
  paymentRecordId: string;           // admin-schema PaymentRecord.id
  shopId: string;
  amountYen: number;
  contractManagementFeeYen: number;
  premiumMonthlyPlusYen?: number;
  paymentDate: string;
  paymentMethod: 'bank_transfer' | 'credit_card' | 'other';
  status: 'pending' | 'paid' | 'refunded' | 'failed';
  invoiceUrl?: string;               // インボイス制度 対応
  receiptUrl?: string;
  fiscalYearContribution?: {
    fiscalYear: number;
    quarter: number;
  };
}

/**
 * 掲載 契約 更新 request
 */
export interface ListingRenewalRequest {
  id: string;
  shopId: string;
  currentListingId: string;
  requestedAt: string;
  requestedRenewalPeriod: '3months' | '6months' | '12months';
  requestedNewPlanTier?: 'basic' | 'premium' | 'top_ranking' | 'featured_article';
  status: 'pending_payment' | 'payment_confirmed' | 'renewed' | 'cancelled';
  targetActiveFrom: string;
  targetExpiresAt: string;
}

// ─────────────────────────────────────────────────────────────
// Section E: お店 側 が 受信 する 通報 (review)
// ─────────────────────────────────────────────────────────────

/**
 * お店 側 が 通報 を 受けた 場合 の inbox
 * (admin-schema.ts Report と 連動、 shop-side view)
 */
export interface ShopReceivedReportItem {
  reportId: string;                  // admin-schema Report.id
  shopId: string;
  reportCategory: string;            // Report.reportCategory
  submittedAt: string;
  status: 'new_unread' | 'read_pending_admin' | 'admin_action_taken' | 'resolved';

  // お店 側 の 反応 (admin 側 review の 前段 or 参考)
  shopResponseNotes?: string;
  shopRespondedAt?: string;
  shopResponsePosition?: 'accept' | 'refute' | 'need_more_info';
}

// ─────────────────────────────────────────────────────────────
// Section F: お店 側 system notification (お知らせ 受信)
// ─────────────────────────────────────────────────────────────

/**
 * system → お店 の お知らせ / 通知
 */
export interface ShopSystemNotification {
  id: string;                        // uuid
  shopId: string;
  notificationType:
    | 'contract_expiring_soon'       // 契約 満了 予告 (30 日 前 等)
    | 'contract_renewed'             // 契約 更新 完了
    | 'payment_due'                  // 支払 期日 通知
    | 'payment_confirmed'            // 支払 確認 通知
    | 'new_review_received'          // 新 口コミ 受信
    | 'new_report_received'          // 新 通報 受信
    | 'terms_updated'                // 契約 約款 更新
    | 'system_maintenance'           // メンテナンス 予告
    | 'law_compliance_notice'        // 法令 改正 通知
    | 'other';
  title: string;
  content: string;
  publishedAt: string;
  readAt?: string;
  actionRequired?: boolean;
  actionUrl?: string;
  actionDeadline?: string;
}

// ─────────────────────────────────────────────────────────────
// Section G: お店 profile 更新 履歴 (audit log)
// ─────────────────────────────────────────────────────────────

/**
 * お店 profile 更新 の audit log
 * 個情法 + 労基法 + 景表法 対応 で 変更 履歴 の 記録 推奨
 */
export interface ShopProfileChangeLog {
  id: string;
  shopId: string;
  changedByUserId: string;           // shop_owner or shop_staff の user id
  changedByRole: 'shop_owner' | 'shop_staff' | 'admin_impersonation';
  changedAt: string;
  changedFieldPath: string;          // 'pricingSystem.basePriceYen' 等 の dot-path
  oldValue?: string;                 // JSON stringify
  newValue?: string;
  changeReason?: string;             // free text (「新 メニュー 開始」 等)
  ipAddress: string;
  userAgent: string;
}

// ─────────────────────────────────────────────────────────────
// Section H: shop_staff 権限 管理 (お店 owner が 委任)
// ─────────────────────────────────────────────────────────────

/**
 * shop_owner が shop_staff role に 権限 委任 する 記録
 *
 * ★ 労基法 対応: shop_staff の 雇用 契約 or 業務委託契約 と 連動 (別 layer)
 */
export interface ShopStaffPermissionGrant {
  id: string;
  shopId: string;
  grantedByOwnerId: string;
  grantedToStaffUserId: string;
  grantedAt: string;
  permissions: ShopStaffPermission[];
  expiresAt?: string;
  revokedAt?: string;
  revokedByOwnerId?: string;
}

export type ShopStaffPermission =
  | 'view_dashboard'
  | 'edit_profile'
  | 'manage_performers'
  | 'respond_reservations'
  | 'view_payment_history'
  | 'manage_coupons'
  | 'manage_news_events'
  | 'respond_reports'
  | 'view_reviews';

// ─────────────────────────────────────────────────────────────
// Section I: type-level marker
// ─────────────────────────────────────────────────────────────

export const SHOP_DASHBOARD_SCHEMA_IMPLEMENTATION_MARKER = {
  layerScope: 'Layer 2 data-only',
  requiresLegalReview: true,
  legalReviewCategories: [
    'friilanse_hogo_hou',            // フリーランス保護法 (performer 追加/退所)
    'roudou_kijun_hou',              // 労働基準法 (shop_staff 権限 委任)
    'kojin_jouhou_hogo_hou',         // 個人情報保護法 (統計 目的 明示)
    'keihyou_hou',                   // 景表法 (profile 変更 audit)
    'invoice_seido',                 // インボイス制度 (掲載料 決済)
    'shohisha_keiyaku_hou',          // 消費者契約法 (契約 更新)
    'purobaida_sekinin_seigen_hou',  // プロバイダ責任制限法 (通報 対応)
  ],
  crossingReiJobBoardLine: 'shop_owner_dashboard_new_layer',
  reiProjectHonestScopeReference: 'project_rei_job_board_scaffold_2026-06-22.md',
} as const;
