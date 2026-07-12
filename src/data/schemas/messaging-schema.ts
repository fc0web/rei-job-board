/**
 * messaging-schema.ts — 相互 messaging + notification system の TypeScript type 定義
 *
 * v0.6 Layer 2 (2026-07-13, 藤本さん 「login 後 の 項目」 確認 request)
 *
 * Source: 実測 7 site の messaging pattern + 業界 標準 notification system
 *
 * Coverage:
 *   - 店舗 ↔ ユーザー direct message (問い合わせ / 予約 変更 相談)
 *   - system → 店舗 通知 (shop-dashboard-schema.ts ShopSystemNotification と 連動)
 *   - system → ユーザー 通知 (mypage 側 notification inbox)
 *   - performer ↔ ユーザー コメント (pr-user-schema DiaryComment 経由 の 間接)
 *   - admin → 全 role broadcast (system-wide announcement)
 *
 * ★★★ Honest note:
 *   本 file は data structure only、 実装 UI (chat UI / notification bell / DM inbox) は
 *   Layer 3 越境 = 弁護士 consultation 経路 待ち、 本 file 範囲外。
 *
 *   Messaging 実装 = プロバイダ責任制限法 + 名誉毀損 + 個情法 + 電気通信事業法 対応 必須:
 *     - 送信 記録 保管 (プロバイダ責任制限法 4 条 発信者 情報 開示)
 *     - 誹謗中傷 対応 (削除 request 受付)
 *     - end-to-end encryption 有無 判定 (電気通信事業法 対応)
 *     - AI content moderation (悪質 message 自動 検知)
 */

// ─────────────────────────────────────────────────────────────
// Section A: Direct message (店舗 ↔ ユーザー)
// ─────────────────────────────────────────────────────────────

/**
 * 店舗 ↔ ユーザー の direct message thread
 *
 * ★ プロバイダ責任制限法 対応:
 *   - 送受信 記録 は 90 日 以上 保持 (通常)
 *   - 発信者 情報 開示 request 対応 workflow 必要
 */
export interface DirectMessageThread {
  id: string;                        // uuid
  participantUserId: string;         // customer user id
  participantShopId: string;         // shop id
  createdAt: string;
  lastMessageAt: string;
  status: 'active' | 'archived' | 'blocked_by_shop' | 'blocked_by_user' | 'moderator_locked';

  // Meta
  relatedReservationId?: string;     // 予約 相談 経由 の thread の 場合
  unreadCountForUser: number;
  unreadCountForShop: number;

  // Moderation
  hasReportedMessage?: boolean;
  moderationLog?: string;
}

export interface DirectMessage {
  id: string;                        // uuid
  threadId: string;                  // DirectMessageThread.id
  senderType: 'user' | 'shop_owner' | 'shop_staff' | 'admin_intervention';
  senderId: string;
  content: string;                   // message body
  contentType: 'text' | 'image' | 'coupon_share' | 'system_note';
  attachmentUrls?: string[];
  sentAt: string;
  readByRecipientAt?: string;

  // Moderation
  aiModerationResult?: {
    flagged: boolean;
    categories?: string[];
    confidence?: number;
  };
  moderationDecision?: 'auto_approved' | 'auto_hidden' | 'pending_human_review' | 'human_approved' | 'human_removed';

  // Reporting
  reportCount?: number;

  // 削除 (プロバイダ責任制限法 対応)
  softDeletedAt?: string;
  softDeletedReason?: 'sender_request' | 'moderation_removal' | 'report_removal' | 'account_deletion';
}

// ─────────────────────────────────────────────────────────────
// Section B: Notification (system → user / shop)
// ─────────────────────────────────────────────────────────────

/**
 * User 側 notification inbox
 * shop-dashboard-schema.ts ShopSystemNotification と 対応 する user-side
 */
export interface UserNotification {
  id: string;                        // uuid
  userId: string;
  notificationType:
    | 'reservation_confirmed'        // 予約 確認
    | 'reservation_reminder'         // 予約 前日 リマインド
    | 'reservation_cancelled_by_shop'
    | 'reservation_modified_by_shop'
    | 'review_response_received'     // 口コミ に お店 が 返信
    | 'favorite_performer_diary_update'
    | 'favorite_performer_shift_added'
    | 'realtime_availability_favorite_shop'
    | 'point_earned'
    | 'point_expiry_warning'
    | 'coupon_expiry_warning'
    | 'membership_tier_upgrade'
    | 'featured_article_published'
    | 'weekly_ranking_published'
    | 'terms_of_service_updated'
    | 'privacy_policy_updated'
    | 'security_alert_new_login'
    | 'security_alert_password_change'
    | 'campaign_started'
    | 'other';
  title: string;
  content: string;
  createdAt: string;
  readAt?: string;
  actionUrl?: string;                // notification click 先 URL
  actionDeadline?: string;
  imageUrl?: string;
  language?: 'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'ko';
  deliveryChannels: Array<'in_app' | 'email' | 'push' | 'line'>;
  deliveryAttempts?: NotificationDeliveryAttempt[];
}

export interface NotificationDeliveryAttempt {
  channel: 'in_app' | 'email' | 'push' | 'line';
  attemptedAt: string;
  status: 'delivered' | 'failed' | 'user_declined';
  failureReason?: string;
}

// ─────────────────────────────────────────────────────────────
// Section C: broadcast announcement (admin → 全 role)
// ─────────────────────────────────────────────────────────────

/**
 * admin が 全 user / 全 shop に 発信 する system-wide announcement
 */
export interface SystemBroadcast {
  id: string;                        // uuid
  broadcastType: 'maintenance' | 'law_compliance' | 'feature_release' | 'incident' | 'other';
  targetAudience: Array<'all_users' | 'all_shops' | 'all_performers' | 'admins_only' | 'specific_role'>;
  specificRoleFilter?: string[];     // targetAudience に 'specific_role' が 含まれる 場合
  title: string;
  content: string;
  publishedAt: string;
  expiresAt?: string;
  actionRequired: boolean;
  actionDeadline?: string;
  actionUrl?: string;
  language?: 'ja' | 'en' | 'zh-Hans' | 'zh-Hant' | 'ko';
  publishedByAdminId: string;
}

// ─────────────────────────────────────────────────────────────
// Section D: Message moderation queue
// ─────────────────────────────────────────────────────────────

/**
 * AI content moderation で flag された message の human review queue
 * pr-user-schema.ts の AIConciergeMessage の contentModerationResult と 同 pattern
 */
export interface MessageModerationQueueItem {
  id: string;                        // uuid
  targetMessageType: 'direct_message' | 'ai_concierge_message' | 'review' | 'diary_comment' | 'diary_entry';
  targetMessageId: string;
  aiModerationTriggeredAt: string;
  aiModerationCategories: string[];
  aiModerationConfidence: number;

  // human review
  reviewStatus: 'pending' | 'reviewed_approved' | 'reviewed_removed' | 'reviewed_edited' | 'escalated_to_law_enforcement';
  reviewedByAdminId?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  removalReason?: string;
}

// ─────────────────────────────────────────────────────────────
// Section E: 発信者 情報 開示 request (プロバイダ責任制限法 対応)
// ─────────────────────────────────────────────────────────────

/**
 * プロバイダ責任制限法 4 条 発信者 情報 開示 request
 * 誹謗中傷 被害者 が 弁護士 経由 で 送信者 情報 開示 request する 場合 の workflow
 *
 * ★ 実装時 は 弁護士 (代理人) からの request を 受付、
 *   意見 聴取 (7 日) → 開示 判断 → 対応 の flow が 法定
 */
export interface DisclosureRequestForSenderInfo {
  id: string;                        // uuid
  requestedAt: string;
  requesterName: string;
  requesterLegalRepresentative: string; // 弁護士名 (法定 代理人)
  requesterBarAssociationNumber?: string; // 弁護士 登録番号
  requesterContactEmail: string;

  // 対象
  targetMessageType: 'direct_message' | 'review' | 'diary_comment' | 'ai_concierge_message';
  targetMessageId: string;

  // 開示 対象 情報
  disclosureScope: {
    senderIpAddress: boolean;
    senderUserId: boolean;
    senderEmail: boolean;
    senderPhone: boolean;
    accessLogs: boolean;
  };

  // 意見 聴取 (発信者 側 への 通知)
  senderOpinionCollectionDeadline?: string;  // 通常 7 日
  senderResponse?: 'consent' | 'objection' | 'no_response';
  senderResponseAt?: string;

  // 判断
  status: 'pending_opinion_collection' | 'pending_decision' | 'disclosed' | 'rejected' | 'court_ordered';
  decisionMadeByAdminId?: string;
  decisionMadeAt?: string;
  decisionNotes?: string;

  // 開示 実施
  disclosedAt?: string;
  disclosedInformationLog?: string;

  // 監査 記録
  responsibleOfficerName: string;    // 個人情報 取扱 責任者 or 苦情対応 責任者
}

// ─────────────────────────────────────────────────────────────
// Section F: type-level marker
// ─────────────────────────────────────────────────────────────

export const MESSAGING_SCHEMA_IMPLEMENTATION_MARKER = {
  layerScope: 'Layer 2 data-only',
  requiresLegalReview: true,
  legalReviewCategories: [
    'purobaida_sekinin_seigen_hou',  // プロバイダ責任制限法 (4 条 発信者 情報 開示)
    'meiyo_kison',                   // 名誉毀損 (message 通報 対応)
    'kojin_jouhou_hogo_hou',         // 個人情報保護法 (発信者 情報 の 開示)
    'denki_tsushin_jigyou_hou',      // 電気通信事業法 (通信 記録 保管)
    'chosakuken_hou',                // 著作権法 (message 内 attachment)
    'benkyou_ho_kaikaku',            // プロバイダ責任制限法 改正 対応 (2022 情報 開示 命令 制度)
  ],
  aiContentModerationRequired: true,
  senderInfoDisclosureWorkflowRequired: true,
  crossingReiJobBoardLine: 'messaging_and_notification_new_layer',
  reiProjectHonestScopeReference: 'project_rei_job_board_scaffold_2026-06-22.md',
} as const;
