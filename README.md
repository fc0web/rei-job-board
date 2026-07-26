# rei-job-board

**完全無料 求人マップ Platform — 雑誌型 design (求職者情報非収集ライン厳守)**

## ステータス

- **段階**: v0.8 Phase 5 messaging DM UI skeleton (2026-07-27、 hobby scale, 実装中)
- **配置**: standalone repo (rei-aios とは別 project)
- **License**: MIT (予定、 確定は v0.1 release 時)

### 実装 phase 概要 (v0.7 Layer 3 UI 進行 record)

- v0.4 (2026-07-13): Layer 1 (SCHEMA_REFERENCE.md) + Layer 2 (shop/job-seeker/admin schema)
- v0.5 (2026-07-13): Layer 2 PR schema 3 file (pr-shop / pr-user / pr-content)
- v0.6 (2026-07-13): Layer 2 login 後系 4 file (auth / shop-dashboard / user-mypage / messaging)
- v0.7 Phase 1 (2026-07-16): Layer 3 UI `/shops` + `/reviews` + `/ranking` + shop detail
- v0.7 Phase 2+3+4 (2026-07-17): 検索 multi-filter + `/dashboard/shop` skeleton + `/mypage` skeleton
- v0.8 Phase 5 (2026-07-27): `/messages` DM skeleton (thread 一覧 + [thread] detail)
- v0.8.1 (2026-07-27): `/news` 特集・お知らせ UI skeleton (list + [id] detail、 5 sample news、 pr-content-schema.ts SiteNewsPost 準拠) — 本 phase
- Phase 6: 認証 / DB persistence / message 送信 / editorial CMS 統合 / 発信者情報開示 workflow (弁護士 consultation 後)

### v0.8 note (2026-07-27) — Phase 5 messaging DM UI skeleton

- ✅ `src/pages/messages/index.astro` — thread 一覧 (未読 badge / status label / 最終 msg preview / 3 sample thread 表示)
- ✅ `src/pages/messages/[thread].astro` — thread detail (getStaticPaths で 3 thread 生成、 chat-bubble layout、 自分/相手 左右振り分け、 既読 marker、 AI moderation flagged 表示)
- ✅ `src/data/messages-sample.json` — 3 sample thread (ヘアサロン予約変更 5 msg / エステ問い合わせ 3 msg / カフェアレルギー相談 archived 3 msg)
- ✅ `src/layouts/Base.astro` nav に `/messages` 追加 (title="Phase 5 skeleton (未 login sample)")
- ❌ Layer 3 越境事項 = Phase 6 (弁護士 consultation 後): 実 message 送信 (textarea disabled) / 認証連動 / DB persistence / AI content moderation 実運用 / 削除 request workflow (プロバイダ責任制限法 4 条) / 通報 button / archive/block button / notification 実配信

**honest scope**: 本 messaging は 店舗利用者 (customer) ↔ 店舗 の 想定 skeleton。 求職者 (job-seeker) ↔ 店舗 の DM ではない (求職者情報 非収集 line は main policy として維持、 footer + 各 page で明記)。 実運用時 は プロバイダ責任制限法 + 名誉毀損 + 個情法 + 電気通信事業法 + AI content moderation の 5 系統 全て弁護士 consultation 対象。

### v0.4 note (2026-07-13)

藤本さん 「B (Layer 1+2)」 選択 (2026-07-13) を 受けて 追加:

- ✅ `docs/SCHEMA_REFERENCE.md` — yorumachi.jp + kanto.qzin.jp 実測 項目群 全網羅 (Layer 1 educational reference)
- ✅ `src/data/schemas/shop-schema.ts` — 店舗 側 TypeScript type 定義 (Layer 2 data-only)
- ✅ `src/data/schemas/job-seeker-schema.ts` — 求職者 側 TypeScript type 定義 (Layer 2 data-only)
- ✅ `src/data/schemas/admin-schema.ts` — admin 機能 TypeScript type 定義 (Layer 2 data-only)
- ❌ Layer 3 実装 UI (login form / registration form / admin panel) は **明示 越境** = 弁護士 consultation 経路 待ち、 本 v0.4 範囲外

藤本さん 明示: 「求人サイト は どのみち、 法的な 問題 が 色々 絡みます」 = honest 認識、 段階的 進行 に 整合。

### v0.5 note (2026-07-13, 同日 追加)

藤本さん 明示 (2026-07-13): 「PR サイト の ほう の 全て の 店舗側、 ユーザー側 の 項目 を 見たかった。 此方 に 全て 取り込みたい」

7 site (シティヘブン / 風俗じゃぱん / 駅ちか / fujoho / マンゾク / YOASOBI HEAVEN + kanto.qzin) 実測 の 全項目 を Layer 2 で schema level 網羅:

- ✅ `src/data/schemas/pr-shop-schema.ts` — PR サイト 店舗 側 型 (~350 行) — 営業/料金/送迎/予約/media/performer (consent-based)/口コミ/ランキング/契約 の 10 section
- ✅ `src/data/schemas/pr-user-schema.ts` — PR サイト 顧客 side 型 (~300 行) — 会員 情報/consent/お気に入り/閲覧履歴/予約/口コミ/ランキング vote/写メ日記コメント/point/AI concierge/削除request の 13 section
- ✅ `src/data/schemas/pr-content-schema.ts` — content 系 型 (~250 行) — ランキング/media/news/特集記事/統計/通報/待機中/多言語 の 9 section
- ❌ Layer 3 実装 UI は 明示 越境 = 弁護士 consultation 経路 待ち、 本 v0.5 範囲外

追加 legal review 対象: フリーランス保護法 2026-11 + 著作権法 + ステマ 規制 2023 + 景表法 + プロバイダ責任制限法 + 消費者契約法 + AI content moderation 監視。

honest 継承: 「schema 網羅」 と 「実装 越境」 は 分離 layer、 業種 除外 line は type-level で articulate 済 (isPRShopExcludedCategory)。

### v0.6 note (2026-07-13, 同日 追加) — login 後 flow 補完

藤本さん 確認 (2026-07-13): 「店舗 や ユーザー が login を して、 その 後 の 項目 なども 組み込まれている でしょうか？」

honest 実測 = 不足あり (v0.5 は 「login 前 掲載 情報 + login 後 一部 mypage」 のみ)。 認証 flow + dashboard 管理 + 相互 messaging を 補完:

- ✅ `src/data/schemas/auth-schema.ts` — 認証 系 (~330 行) — Session/PasswordHash/PasswordReset/EmailVerification/MFA (TOTP/SMS/Passkey)/LoginHistory/FailedLoginTracking/TrustedDevice/OAuthLink の 9 section + OWASP Top 10 遵守 marker
- ✅ `src/data/schemas/shop-dashboard-schema.ts` — 店舗 dashboard 管理 (~320 行) — 統計/予約 受信 inbox/performer 追加削除 flow (フリーランス保護法 準拠)/掲載料 決済 履歴/通報 受信/system notification/profile 変更 audit/shop_staff 権限 委任 の 9 section
- ✅ `src/data/schemas/user-mypage-schema.ts` — ユーザー mypage (~280 行) — profile 変更 audit/予約 変更 request/通知 preference (granular)/membership tier 履歴/point 交換/通報 送信 履歴/AI concierge 管理/セキュリティ settings の 9 section
- ✅ `src/data/schemas/messaging-schema.ts` — 相互 messaging (~300 行) — 店舗 ↔ ユーザー DM/system 通知 (20 種)/broadcast/moderation queue/**発信者 情報 開示 request (プロバイダ責任制限法 4 条 対応)** の 6 section

追加 legal review 対象: 不正アクセス禁止法 + 電気通信事業法 + 労基法 (shop_staff 権限) + 電子商取引法 + プロバイダ責任制限法 4 条 (発信者 情報 開示) + OWASP Top 10 + セキュリティ requirement 11 種。

累計 (v0.4 + v0.5 + v0.6): 10 schema files, ~2,700 行, 全 Layer 2 data-only。

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
