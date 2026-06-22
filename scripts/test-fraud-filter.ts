/**
 * test-fraud-filter.ts — fraud-filter.ts の smoke test
 *
 * Usage: tsx scripts/test-fraud-filter.ts
 */

import { evaluateJob, scanText, getKeywords } from '../src/lib/fraud-filter.ts';

let passed = 0;
let failed = 0;

function assert(condition: boolean, msg: string) {
  if (condition) {
    passed++;
    console.log(`  PASS: ${msg}`);
  } else {
    failed++;
    console.error(`  FAIL: ${msg}`);
  }
}

console.log('=== Test 1: 闇バイト典型 keyword 検出 ===');
const yamiJob = {
  title: '【高額】即日即金!! 簡単作業のみ',
  description: '荷物を運ぶだけのお仕事です。Telegramで連絡ください。',
  contact: {
    method: 'Telegram',
    example: 'DM のみ。 本日中に返信ください。',
  },
};
const result1 = evaluateJob(yamiJob);
assert(result1.flagged, '闇バイト求人が flagged になる');
assert(result1.riskScore >= 5, `riskScore ${result1.riskScore} >= 5`);
assert(
  result1.matches.some((m) => m.category === 'reward_anomaly'),
  'reward_anomaly 検出'
);
assert(
  result1.matches.some((m) => m.category === 'task_vague'),
  'task_vague 検出'
);
assert(
  result1.matches.some((m) => m.category === 'sketchy_contact'),
  'sketchy_contact 検出'
);
assert(
  result1.matches.some((m) => m.category === 'urgency_pressure'),
  'urgency_pressure 検出'
);

console.log('\n=== Test 2: 通常求人は flag されない ===');
const normalJob = {
  title: 'カフェスタッフ募集',
  description: '東京駅前カフェ。 時給 1,200 円。 接客 + ドリンク調理。',
  contact: {
    method: '電話',
    example: '03-1234-5678 へお電話ください',
  },
};
const result2 = evaluateJob(normalJob);
assert(!result2.flagged, '通常求人は flag されない');
assert(result2.riskScore === 0, `riskScore ${result2.riskScore} === 0`);

console.log('\n=== Test 3: 業界隠語の検出 ===');
const slangJob = {
  title: 'ホワイト案件あり',
  description: 'UD案件 + シノギ可能',
  contact: { method: '応相談', example: '' },
};
const result3 = evaluateJob(slangJob);
assert(result3.flagged, '業界隠語が flag される');
assert(
  result3.matches.some((m) => m.category === 'underground_slang'),
  'underground_slang 検出'
);

console.log('\n=== Test 4: 全角/半角/大文字小文字の正規化 ===');
const variationJob = {
  title: 'ｓｉｇｎａｌ で連絡',
  description: 'TELEGRAM のみ',
  contact: { method: '', example: '' },
};
const result4 = evaluateJob(variationJob);
assert(
  result4.matches.some((m) => /signal/i.test(m.keyword) || /telegram/i.test(m.keyword)),
  '全角/大文字 variation も検出'
);

console.log('\n=== Test 5: scanText 単体動作 ===');
const titleMatches = scanText('即日即金!! 高額', 'title');
assert(titleMatches.length >= 1, 'scanText で title match');
assert(
  titleMatches.every((m) => m.field === 'title'),
  '全 match の field が title'
);

console.log('\n=== Test 6: getKeywords 公開 ===');
const kw = getKeywords();
assert('reward_anomaly' in kw, 'reward_anomaly category 存在');
assert('task_vague' in kw, 'task_vague category 存在');
assert('underground_slang' in kw, 'underground_slang category 存在');
assert('sketchy_contact' in kw, 'sketchy_contact category 存在');
assert('urgency_pressure' in kw, 'urgency_pressure category 存在');
assert('crypto_lure' in kw, 'crypto_lure category 存在 (v0.2)');
assert('obfuscation_attempt' in kw, 'obfuscation_attempt category 存在 (v0.2)');
assert(kw.reward_anomaly.length > 0, 'reward_anomaly に keyword あり');
assert(kw.crypto_lure.length > 0, 'crypto_lure に keyword あり (v0.2)');

console.log('\n=== Test 7: 暗号資産誘導 (v0.2 crypto_lure) ===');
const cryptoJob = {
  title: 'USDT 高配当 投資案件',
  description: 'メタマスク連携で受取。 wallet アドレスお送りください。',
  contact: { method: 'Telegram', example: '' },
};
const result7 = evaluateJob(cryptoJob);
assert(result7.flagged, 'crypto_lure 求人が flagged');
assert(
  result7.matches.some((m) => m.category === 'crypto_lure'),
  'crypto_lure category 検出'
);
const cryptoMatches = result7.matches.filter((m) => m.category === 'crypto_lure');
assert(cryptoMatches.length >= 2, `crypto_lure match ${cryptoMatches.length} >= 2`);

console.log('\n=== Test 8: keyword 突破試行 (v0.2 obfuscation_attempt) ===');
const obfuscatedJob = {
  title: '即・日・即・金 OK!',
  description: '荷物 ・ 運ぶ ・ だけ',
  contact: { method: '', example: '' },
};
const result8 = evaluateJob(obfuscatedJob);
assert(result8.flagged, 'obfuscation 試行求人が flagged');
assert(
  result8.matches.some((m) => m.category === 'obfuscation_attempt'),
  'obfuscation_attempt category 検出'
);

console.log('\n=== Test 9: 通常 punctuation で false positive しない ===');
const normalPunctJob = {
  title: 'カフェスタッフ募集 (週 3 日〜)',
  description: '時給 1,200 円。 接客 + ドリンク調理 + 簡単な清掃。 大学生 / 主婦歓迎。',
  contact: { method: '電話', example: '03-1234-5678' },
};
const result9 = evaluateJob(normalPunctJob);
assert(
  !result9.matches.some((m) => m.category === 'obfuscation_attempt'),
  '通常 punctuation は obfuscation flag されない'
);

console.log(`\n=== 結果: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
