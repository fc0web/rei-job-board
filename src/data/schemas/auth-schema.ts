/**
 * auth-schema.ts — 認証 系 (Session / token / password reset / 2FA / login history) の TypeScript type 定義
 *
 * v0.6 Layer 2 (2026-07-13, 藤本さん 「login 後 の 項目」 確認 request)
 *
 * Source: 業界 標準 (OAuth2 / OpenID Connect / OWASP) + 実測 7 site login flow common pattern
 *
 * ★★★ Honest note (最重要):
 *   本 file は data structure only、 実装 UI (login form / password reset flow / 2FA setup) は
 *   Layer 3 越境 = 弁護士 consultation 経路 待ち、 本 file 範囲外。
 *
 *   認証 系 実装 = セキュリティ + 個情法 + 労基法 (お店 側 employee 認証) 対応 必須:
 *     - OWASP Top 10 遵守 (SQL injection / XSS / CSRF / broken auth 等)
 *     - password は bcrypt / argon2 / scrypt で hash (SHA-256 単体 は不十分)
 *     - Session token は crypto-random + short expiry
 *     - 2FA は SMS / TOTP / passkey 等 の 選択肢
 *     - Login history は 個情法 「利用目的 明示」 対象、 セキュリティ purpose として articulate 必須
 */

// ─────────────────────────────────────────────────────────────
// Section A: User role 分類
// ─────────────────────────────────────────────────────────────

/**
 * 認証 対象 の user role
 * 店舗 owner / performer / customer / admin の 4 種
 * (admin は admin-schema.ts の AdminRole で 詳細 articulate)
 */
export type AuthUserRole =
  | 'customer'                       // PR サイト 顧客 会員 (PRUserProfile)
  | 'shop_owner'                     // お店 owner (PRShopListing owner)
  | 'shop_staff'                     // お店 スタッフ (owner 委任、 権限 制限 あり)
  | 'performer'                      // 在籍 performer (PerformerProfile owner)
  | 'admin_super'                    // site 運営 admin (super)
  | 'admin_shop_review'              // site 運営 admin (審査 権限)
  | 'admin_read_only';               // site 運営 admin (read-only)

// ─────────────────────────────────────────────────────────────
// Section B: Session 管理
// ─────────────────────────────────────────────────────────────

/**
 * Login session (認証 済 の session)
 *
 * ★ 実装時 の セキュリティ line:
 *   - Session token は crypto-random 32+ bytes
 *   - HttpOnly + Secure + SameSite=Strict cookie 推奨
 *   - Absolute expiry 24h / Idle expiry 30min 推奨
 *   - Session fixation 対策: login 時 に session ID 再生成
 */
export interface AuthSession {
  id: string;                        // Session ID (crypto-random, opaque)
  userId: string;                    // User (customer / shop_owner / etc) の id
  userRole: AuthUserRole;
  createdAt: string;                 // ISO 8601
  lastActivityAt: string;
  absoluteExpiresAt: string;         // 最大 有効期限
  idleExpiresAt: string;             // idle expiry (activity で 更新)
  ipAddress: string;                 // login 時 IP (Session hijack 検知 用)
  userAgent: string;                 // login 時 UA (Session hijack 検知 用)
  isMfaVerified?: boolean;           // 2FA 通過 済 か
  revokedAt?: string;                // 明示 revoke 済 (logout / password reset 等)
  revocationReason?: 'logout' | 'password_change' | 'admin_forced' | 'security_incident';
}

// ─────────────────────────────────────────────────────────────
// Section C: Password hash + password reset
// ─────────────────────────────────────────────────────────────

/**
 * Password 保管 (bcrypt / argon2 / scrypt 系 hash)
 *
 * ★ 実装時: SHA-256 単体 保管 は不十分、 slow hash function 必須
 * ★ Password strength check: min 12 chars + zxcvbn library 推奨
 */
export interface PasswordHashRecord {
  userId: string;
  hashAlgorithm: 'bcrypt' | 'argon2id' | 'scrypt';
  hashedPassword: string;            // hash 値
  salt?: string;                     // argon2id は self-contained、 bcrypt も self-contained
  createdAt: string;                 // 設定 日時
  lastRotatedAt?: string;            // 直近 変更 日時
  requiresReset: boolean;            // admin による reset 要求 flag
}

export interface PasswordResetRequest {
  id: string;                        // uuid
  userId: string;
  token: string;                     // crypto-random, single-use, short expiry
  requestedAt: string;
  expiresAt: string;                 // 通常 15-60 分
  ipAddress: string;                 // request 元 IP
  status: 'pending' | 'consumed' | 'expired' | 'revoked';
  consumedAt?: string;
  targetEmail: string;               // reset link 送信 先 email
}

export interface PasswordChangeHistoryEntry {
  id: string;
  userId: string;
  changedAt: string;
  changedByType: 'self' | 'admin' | 'password_reset_flow';
  changedByAdminId?: string;
  ipAddress: string;
  successful: boolean;
}

// ─────────────────────────────────────────────────────────────
// Section D: Email verification
// ─────────────────────────────────────────────────────────────

export interface EmailVerificationToken {
  id: string;                        // uuid
  userId: string;
  email: string;                     // verify 対象 email
  token: string;                     // crypto-random, single-use, short expiry
  createdAt: string;
  expiresAt: string;                 // 通常 24h
  verifiedAt?: string;
  status: 'pending' | 'verified' | 'expired' | 'revoked';
}

export interface EmailChangeRequest {
  id: string;
  userId: string;
  oldEmail: string;
  newEmail: string;
  requestedAt: string;
  status: 'pending_new_email_verification' | 'pending_old_email_notification' | 'completed' | 'cancelled';
  newEmailVerificationTokenId?: string;
  completedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Section E: Two-Factor Authentication (2FA)
// ─────────────────────────────────────────────────────────────

/**
 * 2FA method (TOTP / SMS / passkey)
 *
 * ★ 業界 標準: SMS 2FA は SIM swap 攻撃 risk あり、 TOTP or passkey 推奨
 * ★ Backup code は 別途 生成 (device lost 対応)
 */
export type MFAMethod = 'totp' | 'sms' | 'passkey' | 'email_code';

export interface MFASetup {
  id: string;
  userId: string;
  method: MFAMethod;
  isPrimary: boolean;                // primary method
  isEnabled: boolean;
  setupAt: string;
  lastUsedAt?: string;

  // TOTP 用
  totpSecret?: string;               // encrypted at rest
  totpIssuerLabel?: string;          // 「rei-job-board」

  // SMS 用
  phoneNumber?: string;              // E.164 形式
  phoneVerified?: boolean;

  // Passkey 用 (WebAuthn)
  passkeyCredentialId?: string;
  passkeyPublicKey?: string;
  passkeyDeviceName?: string;        // 「iPhone 15」 「YubiKey 5」 等
}

export interface MFABackupCode {
  id: string;
  userId: string;
  hashedCode: string;                // 使い捨て backup code の hash
  createdAt: string;
  usedAt?: string;
}

// ─────────────────────────────────────────────────────────────
// Section F: Login history (個情法 「利用目的 明示」 = セキュリティ purpose)
// ─────────────────────────────────────────────────────────────

/**
 * Login history log
 *
 * ★ 個情法 目的 明示: 「不正 access 検知 目的」 + 「監査 目的」
 * ★ 実装時 の 保持期間 = 90-365 日 (弁護士 judgment)
 */
export interface LoginHistoryEntry {
  id: string;                        // uuid
  userId: string;
  userRole: AuthUserRole;
  attemptedAt: string;               // ISO 8601
  ipAddress: string;
  userAgent: string;
  geoLocationCountry?: string;       // GeoIP 由来 (個情法 目的 明示 対象)
  geoLocationRegion?: string;
  success: boolean;
  failureReason?: 'wrong_password' | 'user_not_found' | 'account_locked' | 'mfa_required' | 'mfa_failed' | 'other';
  mfaMethodUsed?: MFAMethod;
  sessionIdIfSuccess?: string;
}

// ─────────────────────────────────────────────────────────────
// Section G: Failed login attempt tracking (account lockout)
// ─────────────────────────────────────────────────────────────

/**
 * Brute force 対策 の attempt tracking
 *
 * ★ 業界 標準: 5-10 回 失敗 で account lockout (15-30 分)
 * ★ IP-based rate limiting も 併用 (別 layer)
 */
export interface FailedLoginTracking {
  userId: string;
  failureCount: number;              // 現在 の 連続 失敗 数
  firstFailureAt: string;
  lastFailureAt: string;
  lockoutUntil?: string;             // account lock 期限
  requiresCaptcha: boolean;          // CAPTCHA 要求 flag (3 回 失敗 後)
}

// ─────────────────────────────────────────────────────────────
// Section H: Device tracking (信頼済 device の 管理)
// ─────────────────────────────────────────────────────────────

/**
 * Trusted device (「この device で は 2FA 記憶」 機能)
 *
 * ★ 個情法 目的 明示: 「利便性 目的 (2FA 免除)」 + 「セキュリティ 目的 (新規 device 検知)」
 */
export interface TrustedDevice {
  id: string;                        // uuid
  userId: string;
  deviceFingerprint: string;         // UA + IP + browser features の hash
  deviceName?: string;               // user が 設定 する label
  firstSeenAt: string;
  lastSeenAt: string;
  trustedUntil?: string;             // trust 期限 (通常 30 日)
  mfaBypassAllowed: boolean;
  revokedAt?: string;
  revocationReason?: 'user_action' | 'admin_action' | 'security_incident';
}

// ─────────────────────────────────────────────────────────────
// Section I: SSO / OAuth linking (SNS 連携)
// ─────────────────────────────────────────────────────────────

/**
 * External identity provider linking (LINE / Google / Apple / Twitter / etc)
 * pr-user-schema.ts の PRSocialLoginProvider と 統合
 */
export interface OAuthLink {
  id: string;
  userId: string;
  provider: 'line' | 'twitter' | 'google' | 'apple' | 'facebook';
  externalUserId: string;            // provider 側 の user id (encrypted)
  linkedAt: string;
  lastAuthenticatedAt?: string;
  scopes: string[];                  // granted scopes
  refreshTokenExpiresAt?: string;    // provider 依存
  status: 'active' | 'revoked_by_user' | 'revoked_by_provider' | 'expired';
}

// ─────────────────────────────────────────────────────────────
// Section J: type-level marker
// ─────────────────────────────────────────────────────────────

export const AUTH_SCHEMA_IMPLEMENTATION_MARKER = {
  layerScope: 'Layer 2 data-only',
  requiresLegalReview: true,
  legalReviewCategories: [
    'kojin_jouhou_hogo_hou',         // 個人情報保護法 (login history + device tracking + geo)
    'huseinaakusesukinshihou',       // 不正アクセス禁止法 (failed login + rate limiting)
    'denki_tsushin_jigyou_hou',      // 電気通信事業法 (通信 記録 の 保管)
    'roudou_kijun_hou',              // 労働基準法 (shop_staff / performer 認証 の 労働 契約 対応)
  ],
  securityRequirements: [
    'password_hash_bcrypt_or_argon2_or_scrypt',  // slow hash 必須
    'session_token_crypto_random_min_32_bytes',
    'session_cookie_httponly_secure_samesite_strict',
    'session_id_regenerated_on_login',           // Session fixation 対策
    'rate_limiting_ip_based',
    'account_lockout_after_5_to_10_failures',
    'mfa_supported_totp_or_passkey',             // SMS 2FA は SIM swap risk 明示
    'password_strength_min_12_chars_zxcvbn',
    'password_change_notification_email',
    'email_verification_token_short_expiry_24h',
    'password_reset_token_short_expiry_15_to_60min',
  ],
  owaspTop10Compliance: [
    'A01_broken_access_control',
    'A02_cryptographic_failures',
    'A03_injection',
    'A04_insecure_design',
    'A05_security_misconfiguration',
    'A06_vulnerable_and_outdated_components',
    'A07_identification_and_authentication_failures',
    'A08_software_and_data_integrity_failures',
    'A09_security_logging_and_monitoring_failures',
    'A10_server_side_request_forgery',
  ],
  crossingReiJobBoardLine: 'authentication_layer_new',
  reiProjectHonestScopeReference: 'project_rei_job_board_scaffold_2026-06-22.md',
} as const;
