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
  | 'urgency_pressure';

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
};

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
