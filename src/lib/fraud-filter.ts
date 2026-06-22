/**
 * fraud-filter.ts — 闇バイト / 詐欺求人 keyword filter (L1)
 *
 * 警察庁 + 自治体 + Indeed 公開の特徴 keyword を blocklist 化。
 * 100% 防止できない前提、 ROI 悪化目的の cost layer。
 *
 * Sources:
 * - 警察庁: https://www.npa.go.jp/bureau/safetylife/yamibaito/hanzaishaboshu.html
 * - 東京都: https://www.kagaiboushi.metro.tokyo.lg.jp/
 * - 愛知県警: https://www.pref.aichi.jp/police/anzen/R06yarunayamibaito.html
 * - Indeed: https://jp.indeed.com/career-advice/finding-a-job/how-to-identify-illegal-part-time-job-offers
 */

export type FlaggedCategory =
  | 'reward_anomaly'
  | 'task_vague'
  | 'underground_slang'
  | 'sketchy_contact'
  | 'urgency_pressure'
  | 'crypto_lure'
  | 'obfuscation_attempt';

export interface FlagMatch {
  category: FlaggedCategory;
  keyword: string;
  field: 'title' | 'description' | 'contact';
}

export interface FraudFilterResult {
  flagged: boolean;
  matches: FlagMatch[];
  riskScore: number;
}

/**
 * 闇バイト keyword 辞書。
 * 段階的に増やせる構造。 同 keyword でも文脈で誤検出するため、
 * 検出は flag のみで auto-reject ではなく manual audit 待ちにする (本 site policy)。
 */
const KEYWORDS: Record<FlaggedCategory, string[]> = {
  reward_anomaly: [
    '即日即金',
    '即日現金',
    '日払い ' /* 不自然な日払い強調; 単独「日払い」は OK のため要 surround check */,
    '高額報酬',
    '高収入',
    '日給 5 万',
    '日給5万',
    '時給1万',
    '時給 1 万',
    '報酬応相談',
    'バックあり',
    '月収100万',
    '月収 100 万',
  ],
  task_vague: [
    '運ぶだけ',
    '受け取るだけ',
    '電話かけるだけ',
    '電話するだけ',
    '簡単作業のみ',
    '誰でも可',
    '誰でも稼げる',
    '荷物受取',
    '出し子',
    '受け子',
    '叩き',
  ],
  underground_slang: [
    'ホワイト案件',
    'ホワイト',
    'タタキ',
    'UD案件',
    'シノギ',
    '裏案件',
    'グレー案件',
    '飛ばし',
    '即金案件',
  ],
  sketchy_contact: [
    'Signal',
    'シグナル',
    'Telegram',
    'テレグラム',
    'DM のみ',
    'DMのみ',
    'DM限定',
    'TG連絡',
    'Wickr',
    'ウィッカー',
    /* 公式 LINE 公式アカウントは OK だが、 単独 ID + 友達追加要求は要 audit */
  ],
  urgency_pressure: [
    '本日中',
    '今すぐ',
    '至急',
    '即日勤務可',
    '即日採用',
    '即日 OK',
    '即面接即採用',
    '今日中に振込',
  ],
  /**
   * v0.2 追加: 暗号資産誘導 (投資詐欺 / wallet アドレス案件 / web3 詐欺求人)
   * 警察庁: 2024-2026 暗号資産関連詐欺 増加 trend
   */
  crypto_lure: [
    'USDT',
    'Tether',
    'テザー',
    '暗号資産投資',
    '仮想通貨投資',
    'BTC 配布',
    'ETH 配布',
    'wallet アドレス',
    'ウォレット アドレス',
    'NFT 投資',
    'NFT 案件',
    'web3 案件',
    'Web3案件',
    'メタマスク連携',
    'バイナンス招待',
    'Binance 招待',
    '投資コミュニティ',
    '投資グループ',
  ],
  /**
   * v0.2 追加: keyword 検出突破試行 (記号・改行挿入で keyword を分断)
   * 例: 「即・日・即・金」「即.日.即.金」「即／日／即／金」 等
   *
   * 注: normalize 段階で記号除去するため、 KEYWORDS 直接 match では検出されない。
   * `detectObfuscation()` 関数で正規化前後の比較で検出。
   * KEYWORDS 配列は空 (検出 logic 専用 placeholder)、
   * 将来 NLP-based パターン辞書を追加する想定。
   */
  obfuscation_attempt: [],
};

/**
 * v0.2 追加: keyword 突破試行検出
 * 「即・日・即・金」「即.日.即.金」 のような記号挿入 pattern を検出。
 *
 * Logic:
 *   1. text から全 separator (記号 / 中点 / piped 等) を strip した版を生成
 *   2. strip 版で既存 KEYWORDS にヒットするが original では hit しない場合 = obfuscation
 *
 * False positive 注意: 自然な punctuation で偶然 match する可能性。
 * v0.2 では 検出のみ flag、 manual audit で最終判断 (本 site policy)。
 */
const SEPARATOR_PATTERN = /[・.,。、\-_\s/／＼\\|｜<>＜＞()\[\]{}「」『』【】〔〕〈〉《》〝〟"'`~]+/g;

export function detectObfuscation(
  text: string | undefined,
  field: 'title' | 'description' | 'contact'
): FlagMatch[] {
  if (!text) return [];
  const original = normalizeForMatch(text);
  const stripped = original.replace(SEPARATOR_PATTERN, '');
  if (stripped === original) return []; // separator なし → obfuscation 試行なし
  const matches: FlagMatch[] = [];
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    if (category === 'obfuscation_attempt') continue; // 自己再帰回避
    for (const kw of keywords) {
      const normalizedKw = normalizeForMatch(kw).replace(SEPARATOR_PATTERN, '');
      if (!normalizedKw || normalizedKw.length < 3) continue; // 短すぎる kw は偽陽性多い
      if (stripped.includes(normalizedKw) && !original.includes(normalizedKw)) {
        matches.push({
          category: 'obfuscation_attempt',
          keyword: `${kw} (obfuscated)`,
          field,
        });
      }
    }
  }
  return matches;
}

/**
 * Text を 5 軸 keyword でスキャンし、 match を返す。
 * 大文字小文字 + 全角半角は正規化して比較。
 */
export function scanText(
  text: string | undefined,
  field: 'title' | 'description' | 'contact'
): FlagMatch[] {
  if (!text) return [];
  const normalized = normalizeForMatch(text);
  const matches: FlagMatch[] = [];
  for (const [category, keywords] of Object.entries(KEYWORDS)) {
    for (const kw of keywords) {
      const normalizedKw = normalizeForMatch(kw);
      if (!normalizedKw) continue;
      if (normalized.includes(normalizedKw)) {
        matches.push({
          category: category as FlaggedCategory,
          keyword: kw,
          field,
        });
      }
    }
  }
  return matches;
}

/**
 * 全角→半角 + 大文字→小文字 + 空白除去 で正規化。
 * keyword 回避を防ぐが、 NLP 形態素解析までは行わない (cost low に留める)。
 */
function normalizeForMatch(s: string): string {
  return s
    .normalize('NFKC')
    .toLowerCase()
    .replace(/[\s　]+/g, '');
}

/**
 * Job 1 件の全 field を scan し、 result を返す。
 * riskScore = matches.length (simple count)、
 * 3 以上で要 audit / 5 以上で自動 status: "flagged"。
 */
export function evaluateJob(job: {
  title?: string;
  description?: string;
  contact?: { method?: string; example?: string };
}): FraudFilterResult {
  const matches: FlagMatch[] = [
    ...scanText(job.title, 'title'),
    ...scanText(job.description, 'description'),
    ...scanText(job.contact?.method, 'contact'),
    ...scanText(job.contact?.example, 'contact'),
    ...detectObfuscation(job.title, 'title'),
    ...detectObfuscation(job.description, 'description'),
    ...detectObfuscation(job.contact?.method, 'contact'),
    ...detectObfuscation(job.contact?.example, 'contact'),
  ];
  const riskScore = matches.length;
  return {
    flagged: riskScore >= 1,
    matches,
    riskScore,
  };
}

/**
 * 既知の keyword リストを公開 (audit / test 用)。
 * 本リストは security through obscurity でなく、
 * 公開した方が「闇バイト回避済 keyword は別案件で危険」 という community 学習効果がある。
 */
export function getKeywords(): Record<FlaggedCategory, readonly string[]> {
  return KEYWORDS;
}
