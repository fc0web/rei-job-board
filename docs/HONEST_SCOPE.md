# Honest Scope — rei-job-board 永続原則

このドキュメントは scaffold 段階 (v0.0) で確定した honest discipline を、 機能拡張時に毎回 re-confirm するためのものです。

## v0.4 note (2026-07-13) — Layer 1+2 schema reference 追加

藤本さん 「B (Layer 1+2)」 選択 (2026-07-13):
> 「求人サイト は どのみち、 法的な 問題 が 色々 絡みます」

これを 受けて v0.4 で 追加:
- ✅ `docs/SCHEMA_REFERENCE.md` (Layer 1 educational reference、 yorumachi.jp + kanto.qzin.jp 実測 項目群 全網羅)
- ✅ `src/data/schemas/shop-schema.ts` (Layer 2 店舗 側 TypeScript type 定義)
- ✅ `src/data/schemas/job-seeker-schema.ts` (Layer 2 求職者 側 TypeScript type 定義)
- ✅ `src/data/schemas/admin-schema.ts` (Layer 2 admin 機能 TypeScript type 定義)
- ❌ Layer 3 実装 UI (login form / registration form / admin panel / etc) は **明示 越境** で、 弁護士 consultation 経路 待ち、 本 v0.4 範囲外

**Layer 3 越境 前 の requirement** (再確認):
- 弁護士 / 行政書士 / 社労士 consultation 完了
- 特定募集情報等提供事業者 届出 (厚労省)
- 個情法 対応 業務体制 構築 (個人情報 取扱 責任者 + 苦情対応 責任者 選任)
- プライバシー ポリシー + 利用規約 + 免責事項 + 特定商取引法 表記 独立 page 追加
- 業種 除外 line 判定 (性風俗 / 反社 / マルチ案件 除外 継続 = memory 遵守 推奨)

`docs/SCHEMA_REFERENCE.md` § Section 6 「Layer 3 実装 判断 素材 (藤本さん judgment 待ち 事項)」 参照。

## 0. 設計の核 (永続)

本サイトは **改正職業安定法 2022-10-01 施行 の特定募集情報等提供事業者 届出制 の対象外** となるよう設計された **雑誌型 求人マップ** です。

「特定」 該当 trigger = **求職者 (労働者になろうとする者) に関する情報を収集して情報提供に使用しているか yes/no**
(無料 / 有料 / 業 / hobby scale は届出 trigger ではない)

参考:
- https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/boshuujouhouteikyou.html
- https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000172497_00003.html

## 1. 禁止事項 (永続原則 / 触る前に再 articulate)

### 1.1 機能設計上の禁止

- ❌ 求職者の登録機能を追加しない
- ❌ 求職者の氏名 / メール / 経歴 / 履歴 / 閲覧履歴 を収集しない
- ❌ サイト経由で応募を受け付け投稿者へ転送する機能を追加しない (Rei DB を通る形は届出対象になりうる)
- ❌ 求職者へのマッチング推薦 / レコメンド機能を追加しない
- ❌ 個人を追跡可能な形の analytics / cookie を導入しない

これらを **1 つでも実装しようとした時点**、 本サイトは「雑誌型」 でなく **「特定募集情報等提供事業者」** に該当する可能性があり、 厚労省への届出 + 苦情対応体制 + 個情法対応 + 業務体制構築 義務が発生します。

機能追加意向時は **本ファイルを必ず再確認**、 該当する場合は 別 branch / 別 product として 法務 design から re-start すること。

### 1.2 表現上の禁止 (siren-naming 警戒)

UI / README / 広告 / SNS 投稿等で以下の語を **使用禁止**:

- 「最強」 「不沈戦艦」 「完全無敵」 「ブルーオーシャン」 「絶対」 「永久無料」 「永久」 「世界初」 「日本初」 「業界初」 (audit 不能 claim)
- 「これさえあれば」 「これだけで OK」 「リスクなし」 「ノーリスク」
- 「Indeed より優位」 等の direct compare claim (factual evidence なし)

### 1.3 Google Maps Platform ToS 遵守

- ❌ Places API 取得 data の永久 DB 保存禁止 (ToS §3.2.3(b))
- ❌ Google Maps 以外の自前 routing 実装禁止 (ToS §3.2.4 違反 risk)
- ✅ Google Maps URL を貼るだけの参照は OK
- ✅ Place ID は永久 cache 識別子として保持可、 ただし他 fields は 30 日以内
- ✅ 必ず Google Maps source を表示

### 1.4 掲載できない求人

- 違法業務 (受け子 / 出し子 / 闇バイト)
- 反社会的勢力関連
- 18 歳未満就労が労基法 / 児福法 抵触
- 性風俗 / アダルト (Google Maps Platform ToS + 決済 ToS 違反)
- マルチ商法 / ねずみ講 (特商法違反)
- 個人情報を過度に要求する応募要件 (本サイトを装った収集含む)

## 2. 既存大手との honest framing (永続)

本サイトは Indeed / タウンワーク / バイトル / マイナビバイト / Engage / Google for Jobs / 食べログ求人 等の **既存大手と直接競合できる規模ではない**。

「全国 + 完全無料 + 求人」 単独では red ocean direct competitor。 sustainability には niche 軸 (地域 / 業種 / 時間帯 / 障がい者就労 / 高齢者短時間 等) を後付けする必要がある (architecture は後付け可能設計済)。

UI / README / SNS で 「既存大手より優れている」 と読める表現は使わない。 「個人運営の試行プロジェクト」 framing を厳守。

## 3. 機能追加時のチェックリスト (新機能 PR ごとに確認)

新機能 / API / 連携 追加時は、 PR description に以下を記載:

- [ ] **求職者情報を収集するか?** → Yes なら 本書 §1.1 違反、 reject
- [ ] **求職者へのマッチング / レコメンドを行うか?** → Yes なら 本書 §1.1 違反、 reject
- [ ] **Google Maps API data を永久 store するか?** → Yes なら 本書 §1.3 違反、 reject
- [ ] **「掲載できない求人」 §1.4 を強化するか弱めるか?** → 弱める場合は reject
- [ ] **siren-naming を含むか?** → Yes なら 表現を訂正してから merge

## 4. 訂正履歴

- 2026-06-22: scaffold v0.0 で本書作成。 改正職安法 軸 = 「求職者情報収集 yes/no」 確定 (前 turn の 「業/hobby scale」 framing は厚労省一次源 verify で誤りと判明)。
