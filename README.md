# rei-job-board

**完全無料 求人マップ Platform — 雑誌型 design (求職者情報非収集ライン厳守)**

## ステータス

- **段階**: v0.4 Layer 1+2 schema reference 追加 (2026-07-13、 hobby scale, 実装中)
- **配置**: standalone repo (rei-aios とは別 project)
- **License**: MIT (予定、 確定は v0.1 release 時)

### v0.4 note (2026-07-13)

藤本さん 「B (Layer 1+2)」 選択 (2026-07-13) を 受けて 追加:

- ✅ `docs/SCHEMA_REFERENCE.md` — yorumachi.jp + kanto.qzin.jp 実測 項目群 全網羅 (Layer 1 educational reference)
- ✅ `src/data/schemas/shop-schema.ts` — 店舗 側 TypeScript type 定義 (Layer 2 data-only)
- ✅ `src/data/schemas/job-seeker-schema.ts` — 求職者 側 TypeScript type 定義 (Layer 2 data-only)
- ✅ `src/data/schemas/admin-schema.ts` — admin 機能 TypeScript type 定義 (Layer 2 data-only)
- ❌ Layer 3 実装 UI (login form / registration form / admin panel) は **明示 越境** = 弁護士 consultation 経路 待ち、 本 v0.4 範囲外

藤本さん 明示: 「求人サイト は どのみち、 法的な 問題 が 色々 絡みます」 = honest 認識、 段階的 進行 に 整合。

## 設計原則 (永続)

### 求職者情報非収集ライン (=届出不要 design)

本 platform は **改正職業安定法 2022-10-01 施行** の **特定募集情報等提供事業者 届出制** の **対象外** になるよう、 以下を **永続原則** として厳守する:

1. **求職者の登録機能を実装しない**
2. **求職者の氏名 / メール / 経歴 / 履歴 / 閲覧履歴 等を収集しない**
3. **応募連絡は求人投稿者の連絡先 (Google Maps URL / メール / 電話番号 / 公式 site URL 等) を表示するのみ**、 platform 側で transfer / store しない
4. **トラッキング cookie / analytics で個人を追える形での収集は行わない** (アクセス数の集計レベルは可、 個人特定形は不可)

→ これらを破った時点で **特定募集情報等提供事業者** に該当し、 厚労省への届出 + 苦情対応体制 + 個情法対応 + 業務体制構築 義務が発生する。 機能追加意向時は **必ず本原則を再確認** し、 該当する場合は 別 branch / 別 product として 法務 design から re-start する。

参考 (厚労省一次源):
- https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/boshuujouhouteikyou.html
- https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000172497_00003.html

### Honest scope (権限なし claim を作らない)

- 「最強」 「ブルーオーシャン」 「完全無敵」 「不沈戦艦」 「永久無料」 「絶対」 等の siren-naming を **広告 / README / UI 全てで使用禁止**
- 既存大手 (Indeed / タウンワーク / バイトル / Engage / Google for Jobs / 食べログ求人) に対し 全国 + 完全無料 だけでは **red ocean direct competitor**、 sustainability には niche 軸 (地域 / 業種 / 時間帯 / 障がい者就労 / 高齢者短時間 等) を後付けする必要あり (architecture は後付け可能設計)

### Google Maps Platform ToS 厳守

- 求人投稿は Google Maps **URL を貼るだけ** (place_id / address のみ参照可)
- API 経由で取得した data の **永久 DB 保存禁止** (Maps Platform ToS §3.2.3(b))
- 取得 data は 30 日 cache 上限、 必ず Google Maps source を表示
- Navigation は Google Maps / Apple Maps URL scheme へ **丸投げ** (自前 routing なし)

## Tech stack

- **Framework**: Astro (静的 site generator)
- **Map**: Leaflet (MIT) + OSM tile (or OpenFreeMap free tier)
- **Host**: Cloudflare Pages (1 site 無料 tier)
- **Form**: 投稿フォームは Tally / Formspree / Cloudflare Forms 等の **外部サービスへ委託** (求人投稿者の連絡先のみ受信、 求職者情報を Rei 側で扱わない)
- **Data**: `src/data/jobs.json` 手動編集 / community PR で更新 (MVP)

## MVP scope (A1 design)

- [ ] Leaflet 地図 (全国デフォルト中心 = 東京駅 35.681, 139.767)
- [ ] 求人 pin 表示 (`src/data/jobs.json` から read)
- [ ] pin click → popup (求人タイトル + 投稿者連絡先 + Google Maps 詳細 URL)
- [ ] 投稿フォーム (外部サービス link、 仮 Tally 想定)
- [ ] 通報窓口 (闇バイト / 受け子・出し子募集 / 詐欺 / 反社 等の community 通報用)
- [ ] honest-scope footer (改正職安法 design 線 + 既存大手 honest framing + Google Maps ToS 表示)

## ディレクトリ

```
src/
  pages/        # Astro page (index.astro 等)
  components/   # Leaflet wrapper 等
  data/         # jobs.json (求人データ、 手動編集)
  layouts/      # 共通 layout
  styles/       # CSS
public/         # 静的 asset
docs/           # 設計 / honest scope / changelog
```

## scaffold 段階の TODO

- [ ] `npm install` (astro + @astrojs/cloudflare + leaflet) は 藤本さん manual で実施 (Rei 側は scaffold ファイル生成のみ)
- [ ] GitHub repo `fc0web/rei-job-board` Public で作成 (藤本さん manual)
- [ ] Cloudflare Pages 連携 (藤本さん manual)
- [ ] 投稿フォーム外部サービス (Tally 等) アカウント開設 (藤本さん manual)

## 関連 record

- 構築意向 record (rei-aios memory): `project_free_job_posting_platform_intent_2026-06-22.md`
- 改正職安法 軸訂正 record (rei-aios memory): 同上 (2026-06-22 厚労省一次源 verify 後)

## 着手日

2026-06-22 (Rei session、 (A) 雑誌型 design 確定 → scaffold start)
