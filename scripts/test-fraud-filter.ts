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
assert(kw.reward_anomaly.length > 0, 'reward_anomaly に keyword あり');

console.log(`\n=== 結果: ${passed} passed, ${failed} failed ===`);
if (failed > 0) {
  process.exit(1);
}
