/**
 * user-mypage-schema.ts — ユーザー side が login 後 に 触れる mypage 管理 項目 の TypeScript type 定義
 *
 * v0.6 Layer 2 (2026-07-13, 藤本さん 「login 後 の 項目」 確認 request)
 *
 * Source: 実測 7 site + 業界 標準 user mypage pattern
 *
 * ★★★ Honest note:
 *   本 file は data structure only、 実装 UI (mypage / settings page / preference form) は
 *   Layer 3 越境 = 弁護士 consultation 経路 待ち、 本 file 範囲外。
 *
 *   User mypage = 顧客 会員 が login 後 に:
 *     - profile 変更 (email / 住所 / password / 表示 名 等)
 *     - 予約 履歴 の 変更 / キャンセル
 *     - 通知 preference 設定
 *     - marketing consent の 変更
 *     - 削除 request 送信
 *     - 通報 送信 履歴 の 確認
 *     - membership tier upgrade 履歴
 *     - point 使用 / 交換 履歴
 *     - AI concierge chat 履歴 の 確認 / 削除
 */

// ─────────────────────────────────────────────────────────────
// Section A: profile 変更 request (self-service)
// ─────────────────────────────────────────────────────────────

/**
 * User profile 変更 の audit log
 *
 * ★ 変更 履歴 は 個情法 「本人 の 権利 (訂正 / 追加 / 削除)」 対応 の 記録 として 保持
 */
export interface UserProfileChangeLog {
  id: string;                        // uuid
  userId: string;
  changedAt: string;
  changedFieldPath: string;          // 'email' / 'prefectureOfInterest' / 'username' 等
  oldValue?: string;
  newValue?: string;
  ipAddress: string;
  userAgent: string;
  requiresEmailVerification?: boolean;  // email 変更 の 場合
  emailVerificationTokenId?: string;    // auth-schema.ts EmailChangeRequest との 連動
}

// ─────────────────────────────────────────────────────────────
// Section B: 予約 変更 / キャンセル request (self-service)
// ─────────────────────────────────────────────────────────────

/**
 * 顧客 側 が login 後 に 送信 する 予約 変更 request
 * pr-user-schema.ts の Reservation status 変更 と 連動
 */
export interface ReservationModificationRequest {
  id: string;                        // uuid
  reservationId: string;             // Reservation.id
  userId: string;
  requestedAt: string;
  requestType: 'change_date_time' | 'change_options' | 'cancel' | 'refund_request';

  // 変更 内容 (change_date_time の 場合)
  newReservationDate?: string;       // YYYY-MM-DD
  newReservationStartTime?: string;  // HH:MM
  newReservationDurationMinutes?: number;

  // 変更 内容 (change_options の 場合)
  newSelectedOptions?: string[];

  // キャンセル / 返金 理由 (cancel / refund_request の 場合)
  reason?: string;

  // 状態
  status: 'pending_shop_approval' | 'approved' | 'rejected' | 'cancelled_by_user_after_submission' | 'auto_expired';
  respondedByShopAt?: string;
  responseNotes?: string;

  // キャンセル 料 (景表法 事前 明示 前提)
  cancellationFeeYen?: number;
  refundAmountYen?: number;
}

// ─────────────────────────────────────────────────────────────
// Section C: 通知 preference (marketing / push / promotion)
// ─────────────────────────────────────────────────────────────

/**
 * User 通知 preference (marketing consent 変更 の granular control)
 *
 * ★ 個情法 「利用目的 変更 の 同意 撤回 権利」 対応
 * ★ 実装時 の GDPR-style granular opt-in / opt-out
 */
export interface UserNotificationPreference {
  userId: string;
  updatedAt: string;

  // Email 通知
  emailNewShopArrival: boolean;
  emailReservationReminder: boolean;
  emailReviewResponse: boolean;
  emailPointExpiryWarning: boolean;
  emailWeeklyRanking: boolean;
  emailFeaturedArticle: boolean;
  emailMarketingCampaign: boolean;
  emailPromotionalCoupon: boolean;

  // Push 通知 (mobile)
  pushEnabled: boolean;
  pushReservationReminder: boolean;
  pushFavoritePerformerDiary: boolean;
  pushRealtimeAvailability: boolean;

  // LINE 通知 (LINE 連携 有 の 場合)
  lineNotifyEnabled: boolean;
  lineNotifyChannelId?: string;

  // 通知 頻度 制限
  emailFrequencyLimit?: 'immediate' | 'daily_digest' | 'weekly_digest';
  quietHoursStart?: string;          // HH:MM (通知 停止 開始)
  quietHoursEnd?: string;            // HH:MM
}

// ─────────────────────────────────────────────────────────────
// Section D: Membership tier upgrade 履歴
// ─────────────────────────────────────────────────────────────

/**
 * membership tier upgrade / downgrade 履歴
 */
export interface MembershipTierChangeLog {
  id: string;                        // uuid
  userId: string;
  changedAt: string;
  oldTier: 'free' | 'regular' | 'gold' | 'platinum';
  newTier: 'free' | 'regular' | 'gold' | 'platinum';
  changeReason: 'point_threshold_reached' | 'admin_grant' | 'payment_upgrade' | 'inactivity_downgrade' | 'user_request';
  pointsAtChange?: number;
  paymentReferenceId?: string;
}

// ─────────────────────────────────────────────────────────────
// Section E: point 使用 / 交換 履歴 (詳細 view)
// ─────────────────────────────────────────────────────────────

/**
 * point 交換 (coupon 引換 / gift 交換 等) の 詳細 履歴
 * pr-user-schema.ts の UserPointTransaction と 連動 (詳細)
 */
export interface PointRedemptionHistoryEntry {
  id: string;                        // uuid
  userId: string;
  redemptionType: 'coupon' | 'gift_card' | 'special_content_unlock' | 'other';
  pointsUsed: number;
  redemptionValueYen?: number;
  redeemedAt: string;
  targetEntityType?: string;         // 'coupon' / 'gift_card' etc
  targetEntityId?: string;
  status: 'completed' | 'pending_delivery' | 'refunded' | 'cancelled';
}

// ─────────────────────────────────────────────────────────────
// Section F: 通報 送信 履歴
// ─────────────────────────────────────────────────────────────

/**
 * User が 送信 した 通報 の 履歴 (user-side view)
 * admin-schema.ts Report との 連動 (submitted_by_user_id 側 view)
 */
export interface UserSubmittedReportHistoryItem {
  reportId: string;                  // admin-schema Report.id
  userId: string;
  submittedAt: string;
  reportCategory: string;            // Report.reportCategory
  targetType: string;
  targetId: string;
  description: string;
  currentStatus: 'pending_review' | 'investigating' | 'action_taken' | 'no_action' | 'referred_to_police';
  adminResponseNotes?: string;
  adminRespondedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Section G: AI concierge chat 履歴 (詳細 + 削除 request)
// ─────────────────────────────────────────────────────────────

/**
 * User が 自身 の AI concierge chat 履歴 を 管理 する UI 用
 * pr-user-schema.ts AIConciergeSession の user-facing 詳細
 */
export interface AIConciergeChatManagementView {
  sessionId: string;                 // AIConciergeSession.id
  userId: string;
  summary?: string;                  // AI が 生成 する chat summary
  createdAt: string;
  lastMessageAt: string;
  status: 'active' | 'closed' | 'archived' | 'deletion_requested';
  language: 'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'ko';
  messageCount: number;
  containsPersonalInfo?: boolean;    // AI が 自動 flag (削除 request 判断 素材)
  userInitiatedDeletionRequestId?: string;
}

// ─────────────────────────────────────────────────────────────
// Section H: user side settings (session 管理 / device 管理)
// ─────────────────────────────────────────────────────────────

/**
 * User が login 後 に 見る セキュリティ settings
 * auth-schema.ts の Session / TrustedDevice / MFASetup と 連動
 */
export interface UserSecuritySettingsView {
  userId: string;

  // Active sessions
  activeSessions: Array<{
    sessionId: string;               // AuthSession.id
    ipAddress: string;
    userAgent: string;
    lastActivityAt: string;
    isCurrent: boolean;
    geoLocationLabel?: string;
  }>;

  // Trusted devices
  trustedDevices: Array<{
    deviceId: string;                // TrustedDevice.id
    deviceName: string;
    lastSeenAt: string;
    trustedUntil?: string;
  }>;

  // MFA setup status
  mfaEnabled: boolean;
  mfaMethods: Array<{
    method: 'totp' | 'sms' | 'passkey' | 'email_code';
    isPrimary: boolean;
    lastUsedAt?: string;
  }>;

  // Recent login history (上位 N 件)
  recentLoginHistory: Array<{
    attemptedAt: string;
    ipAddress: string;
    success: boolean;
    geoLocationLabel?: string;
  }>;
}

// ─────────────────────────────────────────────────────────────
// Section I: type-level marker
// ─────────────────────────────────────────────────────────────

export const USER_MYPAGE_SCHEMA_IMPLEMENTATION_MARKER = {
  layerScope: 'Layer 2 data-only',
  requiresLegalReview: true,
  legalReviewCategories: [
    'kojin_jouhou_hogo_hou',         // 個人情報保護法 (訂正 / 追加 / 削除 権利)
    'shohisha_keiyaku_hou',          // 消費者契約法 (予約 変更 / キャンセル)
    'tokutei_shou_torihiki_hou',     // 特定商取引法 (point 交換 が 商取引 該当 の 場合)
    'purobaida_sekinin_seigen_hou',  // プロバイダ責任制限法 (通報 送信 履歴)
    'e_shou_hou',                    // 電子商取引法 (予約 契約 の 電子 化)
  ],
  granularConsentManagementRequired: true,
  crossingReiJobBoardLine: 'user_mypage_new_layer',
  reiProjectHonestScopeReference: 'project_rei_job_board_scaffold_2026-06-22.md',
} as const;
