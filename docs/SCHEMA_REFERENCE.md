# SCHEMA_REFERENCE.md — 項目群 全網羅 educational reference (v0.4 Layer 1)

**最終更新**: 2026-07-13
**Scope**: Layer 1 (educational reference) + Layer 2 (TypeScript type 定義) のみ
**Layer 3 (実装 UI + login + admin panel) は 弁護士 consultation 経路 待ち、 本 doc 範囲 外**

## 目的

藤本さん の 依頼 「yorumachi.jp + kanto.qzin.jp (バニラ) の 項目群 全て を Rei site に 反映、 店舗側 と 求人側 が login して どんな 項目 を 打ち込むか」 を **educational reference + TypeScript type 定義 まで** の scope で articulate する。

**実装 UI (login form / registration form / admin panel) は 本 doc 範囲外** — Layer 3 実装 は 弁護士 consultation + 特定募集情報等提供事業者 届出 + 個情法 対応 業務体制 構築 の 前提 が 必要。

## 経緯

2026-07-13 session で:

1. Rei-side が yorumachi.jp (2026-06-22 memory の 20 日 update) を factual 実測
2. Rei-side が kanto.qzin.jp/area3063_1.html (バニラ、 松戸 風俗求人) を factual 実測
3. 藤本さん 「先の 2 サイト の 項目群 全て を 私 の サイト の ほう に 入れて 頂きたい」 + 「店舗側 と 求人側 が login して、 どんな 項目 を 打ち込んで、 サイト に 反映 させる か を 知りたい」
4. Rei-side が **honest scope 3 layer** で articulate:
   - **Layer 1**: educational schema doc (実装 なし、 100% safe)
   - **Layer 2**: TypeScript / JSON schema 型 定義 (data structure のみ、 実装 UI なし)
   - **Layer 3**: 実装 UI + login + admin panel build (**明示 越境** + 弁護士 consultation 経路 必須)
5. 藤本さん 「B (Layer 1+2) で お願い できますか？ 求人サイト は どのみち、 法的な 問題 が 色々 絡みます」 と 選択

## Honest scope 明示 (最重要)

本 doc は **rei-job-board v0.3 現状 の 「雑誌型 = 求職者情報 非収集 line」 の 境界 を 明示する 素材**。

- ✅ 本 doc (Layer 1) = 参考情報 の 網羅 のみ、 実装 なし → 現状 line 遵守
- ✅ TypeScript type 定義 (Layer 2) = data structure のみ、 実装 UI なし → 現状 line 遵守
- ⚠ Layer 3 実装 UI + login + admin panel = **line 越境** → 弁護士 consultation + 届出 + 個情法 対応 業務体制 構築 の 前提 必須

Layer 3 に 進む 判断 は 藤本さん の 明示 judgment + 弁護士 consultation 経由 の みで 可能。 本 doc は Layer 3 判断 の **素材 提供 のみ**。

## Section 1: 店舗 側 (お店側) が 打ち込む 項目 全網羅

yorumachi + kanto.qzin combined の 全 項目 網羅 chart (21 項目):

| # | 項目 | source | 型 | required | 備考 |
|---|---|---|---|---|---|
| 1 | 店舗名 | 両方 | string | ✓ | display name |
| 2 | 業態 (ShopCategory) | 両方 | enum | ✓ | yorumachi: snack / lounge / bar / mini_club / karaoke_snack / club / member_lounge / girls_bar / kanto.qzin: delivery_health / soap / shop_health / hotel_health / erotic_massage / hand_service / pink_salon / sex_hostess / mens_esthetic (**★ 業種 で HONEST_SCOPE 除外 line 該当 有無 分岐**) |
| 3 | 都道府県 | 両方 | enum | ✓ | 東京 / 神奈川 / 愛知 / 大阪 / 兵庫 / 京都 / 奈良 / 和歌山 / 福岡 + secondary |
| 4 | 市区町村 | 両方 | string | ✓ | free text or dropdown |
| 5 | 最寄り 駅 | yorumachi | string[] | optional | JR / Metro / Toei / 私鉄 (600+ 駅 網羅) |
| 6 | 住所 詳細 | 両方 | string | ✓ | 番地 レベル |
| 7 | 電話番号 | 両方 | string | ✓ | 公開 有無 選択 checkbox |
| 8 | 求人 内容 (title) | 両方 | string | ✓ | free text 短文 |
| 9 | 時給 range min | yorumachi | number | ✓ | 円 単位 |
| 10 | 時給 range max | yorumachi | number | optional | 円 単位 |
| 11 | 時給 詳細 | 両方 | string | optional | 割増 / 保証 / 手当 詳細 |
| 12 | 勤務 時間 開始 | 両方 | string (HH:MM) | ✓ | |
| 13 | 勤務 時間 終了 | 両方 | string (HH:MM) | ✓ | |
| 14 | 週 何日 勤務 | 両方 | string | optional | free text |
| 15 | 特徴 tags (multi-select) | yorumachi | string[] | optional | 日払いOK / 週払いOK / 飲めなくてもOK / 即日勤務OK / 体験入店OK / 短期勤務OK / Wワーク対応 / 30歳以上活躍中 / 服装自由 / 未経験歓迎 / ノルマなし / 駅チカ (12 種) |
| 16 | 応募方法 (multi-select) | 両方 | string[] | ✓ | Web / 電話 / Line |
| 17 | 写真 URLs | 両方 | string[] | optional | 複数 upload、 撮影 support あり |
| 18 | 契約 期間 プラン | yorumachi | enum | ✓ | 3ヶ月 / 6ヶ月 / 12ヶ月 |
| 19 | 上位表示 special plan | yorumachi | boolean | optional | +月 20,000 円 (税別) |
| 20 | お店 profile 詳細 | 両方 | string | optional | 雰囲気 / メニュー / 客層 / 内装 free text |
| 21 | ジャンル sub-category | kanto.qzin | string | optional | 業種内 sub 分類 |

**kanto.qzin 系 追加 項目** (風俗業 系、 ★ rei-project HONEST_SCOPE 明示 除外 line 該当):

| # | 項目 | 型 | 備考 |
|---|---|---|---|
| 22 | こだわり検索 keyword | string[] | free text SEO tag |
| 23 | 面接 交通費 支給 有無 | boolean | |
| 24 | 体験入店 detail | string | free text |
| 25 | SNS 連絡 情報 | object | Line / X / Instagram 等 |
| 26 | 口コミ 公開 有無 | boolean | (yorumachi は 「対応保証 なし」 iken form のみ) |

## Section 2: 求職者 側 が 打ち込む 項目 全網羅

yorumachi + kanto.qzin combined の 全 項目 網羅 chart (15 項目):

| # | 項目 | source | 型 | required | 備考 |
|---|---|---|---|---|---|
| 1 | 名前 (ニックネーム OK) | yorumachi | string | ✓ | display name |
| 2 | 年齢 | yorumachi | number | ✓ | **18 歳 以上** check、 dropdown 18-50+ (kanto.qzin は 「18歳以上 高校生不可」 明示) |
| 3 | Email | yorumachi | string | ✓ | verification 送信 用 |
| 4 | Password | yorumachi | string (hashed) | ✓ | login 用 |
| 5 | 携帯番号 | yorumachi | string | ✓ | 応募 通知 用 (「応募先 店舗 に 通知」 の 注意 明示 要) |
| 6 | 住所 | yorumachi | object | ✓ | 都道府県 / 市区町村 レベル (詳細 番地 不要 かどうか 弁護士 judgment) |
| 7 | 質問内容 (自由記入) | yorumachi | string | optional | free text |
| 8 | 個人情報 取扱 同意 | yorumachi | boolean | ✓ | checkbox、 プライバシー ポリシー 別途 独立 page 必須 |
| 9 | 顔写真 | ✗ 両方 で **求めない** | — | — | consent risk 高い、 実装 除外 line 推奨 |
| 10 | 履歴書 | ✗ 両方 で **求めない** | — | — | 個情法 高 risk、 実装 除外 line 推奨 |
| 11 | 応募 form (per shop) | 両方 | object | ✓ | shop 選択 → 応募 送信 |
| 12 | お気に入り / キープリスト | 両方 | string[] | optional | login user 機能 |
| 13 | 検索 履歴 | 両方 | object[] | optional | 自動 保存 (個情法 対象、 有効期間 明示 必須) |
| 14 | 口コミ 投稿 | kanto.qzin | object | optional | 会員 login 後、 誹謗中傷 対応 line 必須 |
| 15 | Campaign ID (PayPay 等) | yorumachi | string | optional | 登録時 optional |

## Section 3: Admin (site 運営側) 機能

| # | 機能 | 型 | 備考 |
|---|---|---|---|
| 1 | 店舗 承認 / 却下 | queue + status | 掲載申込 → 審査 → 承認 / 却下 |
| 2 | 求職者 承認 / 却下 | queue + status | 会員 登録 → 審査 → 承認 / 却下 (実装 line 越境) |
| 3 | 掲載 期間 管理 | scheduler | 契約 期間 満了 の 自動 非表示 |
| 4 | 料金 collection tracking | payment records | 掲載料 + 契約管理費 の 記録 |
| 5 | 契約 約款 管理 | versioning | terms 更新 履歴 |
| 6 | 通報 対応 | ticket system | 求職者 側 / お店 側 通報 受付 |
| 7 | 個人情報 削除 request 対応 | GDPR-style workflow | 個情法 対応 requirement |
| 8 | fraud-filter 結果 review | filter log | v0.3 fraud-filter 8 軸 の 検出 結果 review |
| 9 | 統計 dashboard | analytics | 掲載数 / 応募数 / 検索 数 (求職者 情報 収集 line 判定 必要) |
| 10 | 代理店 管理 (kanto.qzin 系) | agent tracking | 営業代理店 経由 掲載 追跡 (yorumachi staff.html 参考) |

## Section 4: 業種 分類 と rei-project HONEST_SCOPE 判定

### 4.1 yorumachi 系 (非 風俗 nightwork)

| 業種 | rei-project scope |
|---|---|
| snack (スナック) | 判断 待ち (社交飲食 = 風営法 1 号 相当) |
| lounge (ラウンジ) | 判断 待ち |
| bar (バー) | 判断 待ち |
| mini_club (ミニクラブ) | 判断 待ち |
| karaoke_snack (カラオケスナック) | 判断 待ち |
| club (クラブ) | 判断 待ち |
| member_lounge (会員制ラウンジ) | 判断 待ち |
| girls_bar (ガールズバー) | 判断 待ち |

上記 全て 明示 除外 では ない、 rei-project 側 の 明示 line は 「性風俗 / 反社 / マルチ案件 を 受けない」 (memory `project_rei_talent_agency_scaffold_2026-06-22.md`)。 個別 業種 の 「性風俗 該当 か」 の 判定 は **弁護士 judgment 領域**。 一般的 に は 「風営法 1 号 (社交飲食店) / 2 号 (低照度飲食店) 該当 業種 は 性風俗 特殊 営業 と は 別」 の 認識 だが、 個別 case で line 変動。

### 4.2 kanto.qzin 系 (風俗業 明示)

| 業種 | rei-project scope |
|---|---|
| delivery_health (デリヘル) | ★ **明示 除外 line 該当** (性風俗特殊営業 2 号) |
| soap (ソープ) | ★ **明示 除外 line 該当** (性風俗特殊営業 1 号) |
| shop_health (店舗型ヘルス) | ★ **明示 除外 line 該当** |
| hotel_health (ホテヘル) | ★ **明示 除外 line 該当** |
| erotic_massage (風俗エステ) | ★ **明示 除外 line 該当** |
| hand_service (オナクラ・手コキ) | ★ **明示 除外 line 該当** |
| pink_salon (ピンサロ) | ★ **明示 除外 line 該当** |
| sex_hostess (セクキャバ・おっパブ) | ★ **明示 除外 line 該当** |
| mens_esthetic (メンズエステ) | 判断 待ち (性風俗特殊営業 該当 case + 非該当 case 混在、 弁護士 judgment 領域) |

**Rei-project HONEST_SCOPE 継続 推奨**: `project_rei_talent_agency_scaffold_2026-06-22.md` § 「永続原則 (機能追加時 に 必ず 再確認)」 line 継承:

> ❌ **性風俗 / 反社 / マルチ案件 を 受けない** (各種法令違反)

Layer 3 実装時 に 業種 選択 dropdown で **明示 除外 line 発動** or **含む** の 判断 は 藤本さん judgment + 弁護士 consultation 必須。

## Section 5: Legal architecture 比較

| 軸 | yorumachi | kanto.qzin (バニラ) | rei-job-board 現状 v0.3 |
|---|---|---|---|
| 有料職業紹介事業 許可 | ✓ (27-ユ-303917) | 推定 有 (page で 明示 なし) | ✗ 不要 line (雑誌型) |
| 特定募集情報等提供事業 届出 | ✓ (51-募-000021) | ✓ (推定) | ✗ 届出 外 line (求職者情報 非収集) |
| 電気通信事業 届出 | ✓ (E-04-04982) | 推定 有 | 該当 判断 必要 |
| 風営法 対応 | ✗ 非対応 (非 風俗) | ✓ 必要 | ✗ 非対応 |
| プライバシー ポリシー 独立 page | ✗ 見当たらず (弱点) | ✓ 有 | v0.4 で 追加 想定 |
| 業種 明示 除外 line | ✗ なし | ✗ なし (風俗業 全域 対応) | ✓ HONEST_SCOPE 明示 (性風俗 / 反社 / マルチ) |
| 求職者情報 収集 | ✓ (name/age/email/pass/phone/address) | ✓ (registration + login) | ✗ 非収集 line 厳守 |

**Layer 3 で rei-job-board が 求職者情報 収集 に 越境 する 場合**:
- 特定募集情報等提供事業者 届出 (厚労省)
- 個情法 対応 業務体制 構築
- プライバシー ポリシー 独立 page (必須)
- 苦情対応 責任者 選任
- 弁護士 / 行政書士 / 社労士 consultation
- 特定商取引法 表記 独立 page
- 利用規約 独立 page
- 免責事項 独立 page

## Section 6: Layer 3 実装 判断 素材 (藤本さん judgment 待ち 事項)

Layer 3 実装 に 進む 場合 の 判断 point (弁護士 consultation 経由 で 判定):

1. **業種 scope**: 性風俗 除外 line 継続 (memory 遵守) or 見直し (現時点 継続 推奨)
2. **料金 model**: 掲載料 collection (yorumachi model) or 完全 無料 (現状 rei-job-board line) or hybrid
3. **求職者 情報 収集 range**: minimum (name / email のみ) or full (yorumachi 相当) or none 継続 (現状 line)
4. **応募 中継**: site 内 form + 通知 or 直接 shop 連絡 (現状 雑誌型 line) or hybrid
5. **代理店 model**: yorumachi staff.html 系 の 3 面 収益 model 採用 判断
6. **登録 flow 年齢 check**: 18 歳 or 20 歳 (お酒 提供業 は 20 歳 line も 判断可)
7. **写真 upload**: 顔写真 / 履歴書 = 現状 **両 site で 求めない** (rei-side 推奨 継続、 consent risk 高い)
8. **プライバシー ポリシー**: 独立 page 必須 (yorumachi 弱点 継承 しない)
9. **弁護士 監修**: 業務委託契約書 (talent-agency) + 店舗 掲載 契約書 (job-board) 両方
10. **届出 timing**: 実装 完了後 or 実装 前 (推奨 = 前、 業務体制 構築 と 並行)

## Section 7: 参考 legal reference

- **改正職業安定法 2022 (令和 4 年 10 月 1 日 施行)**: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/boshuujouhouteikyou.html
- **特定募集情報等提供事業者 届出 案内**: https://www.mhlw.go.jp/stf/seisakunitsuite/bunya/0000172497_00003.html
- **個人情報保護法**: 個人情報保護委員会 https://www.ppc.go.jp/
- **フリーランス保護法 (2026 年 11 月 施行 予定)**: https://www.chusho.meti.go.jp/keiei/torihiki/2024/240301furiran.html
- **有料職業紹介事業 許可 概要 (大阪労働局)**: https://jsite.mhlw.go.jp/osaka-roudoukyoku/hourei_seido_tetsuzuki/yuryou_muryou_shokugyou/hourei_seido/kyoka.html
- **法テラス (日本司法支援センター)**: https://www.houterasu.or.jp/ / 0570-078374
- **公取委 相談窓口**: https://www.jftc.go.jp/soudan/index.html

## Section 8: Rei-project 側 連携 memory

- `project_ohmynews_style_citizen_journalism_platform_intent_2026-06-22.md` — WebSearch fact-check 4 軸 (改正職安法 axis + Indeed XML feed + 投票ちゃんねる + ヨルナビ)
- `project_rei_job_board_scaffold_2026-06-22.md` — 「雑誌型 = 求職者情報 非収集」 line load-bearing
- `project_rei_talent_agency_scaffold_2026-06-22.md` — 「性風俗 / 反社 / マルチ案件 除外」 line 継承
- `reference_kaisei_shokuanho_correct_axis_2022.md` — 改正職安法 axis
- `feedback_super_naming_siren_family_pattern.md` — Pattern 5 siren-family 禁止 word list
- `feedback_evaluation_symmetry_principle.md` — inflate / deflate 両禁止
- `feedback_no_rush_publication.md` — 急がず ゆっくりと

## honest scope 最終 明示

- 本 doc は **educational reference + TypeScript type 定義 の 前提 のみ**
- Layer 3 実装 = **明示 越境**、 弁護士 consultation + 届出 + 業務体制 構築 の 前提 必須
- 「求人 サイト は どのみち 法的 問題 が 色々 絡む」 (藤本さん 明示、 2026-07-13) = **honest 認識** で、 本 doc は その 認識 に 基づき Layer 1+2 scope に 限定
- 特定 業界 site (yorumachi / kanto.qzin / シティヘブン / 風俗じゃぱん / 駅ちか / fujoho / マンゾク / YOASOBI HEAVEN) の 直接 模倣 は Pattern 5 super-naming risk、 本 doc は **factual 素材** の articulate のみ、 「模倣 推奨」 は 行わない
- 業種 scope (性風俗 除外 line) の 継続 は memory 系譜 遵守 で 私 side 推奨、 見直し 判断 は 藤本さん judgment + 弁護士 consultation 必須

## v0.5 追加 (2026-07-13) — PR サイト 全項目 schema 取り込み

藤本さん 明示 (2026-07-13): 「PR サイト の ほう の 全て の 店舗側、 ユーザー側 の 項目 を 見たかった。 此方 に 全て 取り込みたい」

これを 受けて 追加 (Layer 2 data-only):

### 追加 file (3 schema files)

- **`src/data/schemas/pr-shop-schema.ts`** — PR サイト 店舗 側 型
  - Section A: PR 拡張 業種 (image_club / special_shop / outcall_massage / social_dining) + isPRShopExcludedCategory
  - Section B-E: BusinessHours / BusinessLocation / PricingSystem / DeliveryArea / ReservationConfig
  - Section F: ShopMedia / ShopNewsEvent / ShopCoupon
  - **Section G: PerformerProfile (在籍 スタッフ、 ★ consent-based)** + PerformerPhoto + PerformerShift + PerformerDiaryEntry + **PerformerConsent (フリーランス保護法 2026-11 対応)**
  - Section H: ShopReviewConfig / ShopRankingParticipation / ShopVerificationBadge
  - Section I: PRListingContract (4 tier: basic / premium / top_ranking / featured_article)
  - Section J: PRShopListing (中核 schema)
  - PR_SHOP_SCHEMA_IMPLEMENTATION_MARKER (10 legal review categories)

- **`src/data/schemas/pr-user-schema.ts`** — PR サイト 顧客 side 型
  - Section A: PRUserProfile (基本 会員 情報)
  - Section B: PRUserConsent (marketing opt-in + cookie consent 別 layer)
  - Section D: FavoriteShopList + FavoritePerformerList
  - Section E: BrowseHistory (個情法 目的 明示 対象)
  - Section F: Reservation (シティヘブン かんたんネット予約 model + 消費者契約法 対応)
  - Section G: PRUserReview (fujoho 380,225 口コミ model + 誹謗中傷 対応)
  - Section H: RankingVote (マンゾク weekly TOP30 vote)
  - Section I: DiaryComment (シティヘブン + 駅ちか 実測)
  - Section J: UserPointTransaction (マンゾク MC point) + UserCouponClip
  - **Section K: AIConciergeSession + AIConciergeMessage (YOASOBI HEAVEN 実測、 ★ content moderation 必須)**
  - Section L: PRUserDeletionRequest (GDPR-style workflow)
  - PR_USER_SCHEMA_IMPLEMENTATION_MARKER (9 legal review categories + AI concierge monitoring 3 point)

- **`src/data/schemas/pr-content-schema.ts`** — PR サイト content 系 型
  - Section A: RankingEntry + RankingType (8 種: weekly_top30 / monthly_top_shops / area_ranking / new_arrivals / popular_by_reviews / popular_by_bookings / user_vote_ranking / featured_paid) + RankingCriteria (景表法 明示 line)
  - Section B: MediaContent (video / voice / photo_gallery + hasR18Marking + 著作権 対応)
  - Section C: SiteNewsPost (系 news feed)
  - Section D: FeaturedArticle (**★ ステマ 規制 対応 = isPRLabelRequired**)
  - Section E: SiteAnalytics (aggregated 統計、 個情法 目的 明示)
  - Section F: PRReport (通報 category 10 種) + 警察 連絡 log
  - **Section G: PerformerAvailabilityStatus (駅ちか 「待機中」 real-time indicator)**
  - Section H: MultilingualContentAggregation (YOASOBI HEAVEN 5 言語 model)
  - PR_CONTENT_SCHEMA_IMPLEMENTATION_MARKER (8 legal review categories + ranking disclosure 3 requirements)

### 網羅 項目 数 (v0.5 追加後)

- **店舗 側 (求人 side + PR side combined)**: 21 (v0.4 求人) + PRShopListing 主 field 22 + PerformerProfile 追加 = **60+ 項目**
- **ユーザー 側 (求職者 side + PR 顧客 side combined)**: 15 (v0.4) + PRUserProfile 主 field 12 + Reservation/Review/RankingVote/Diary/Point/Coupon/AI/Deletion 追加 = **50+ 項目**
- **content 系**: RankingEntry / MediaContent / SiteNewsPost / FeaturedArticle / SiteAnalytics / PRReport / PerformerAvailabilityStatus / MultilingualContentAggregation = **8 type**
- **業種**: 8 (非 風俗 nightwork) + 9 (性風俗 明示 除外) + 4 (PR 拡張) = **21 業種 total**

### Layer 3 越境 前 追加 requirement (v0.5)

- **フリーランス保護法 2026-11 対応**: performer consent + 撤回 権利 説明
- **著作権法 対応**: 動画 / 音声 / 写真 の 権利 処理
- **ステマ 規制 2023 対応**: 「PR」 label 必須 (掲載料 有料 slot + 特集 記事)
- **景表法 対応**: ランキング 基準 明示 + 「NO.1」 「業界最安」 の 客観的 根拠
- **プロバイダ責任制限法 対応**: 口コミ + 通報 workflow
- **消費者契約法 対応**: 予約 + キャンセル 料 明示
- **AI content moderation 監視**: AIConciergeSession の output 検閲

### honest scope 継承 (v0.5)

- ✅ 「schema 網羅」 と 「実装 越境」 は 分離 layer
- ✅ 業種 除外 line 判定 は **type-level で articulate 済** (isPRShopExcludedCategory)、 memory 系譜 遵守
- ✅ performer 情報 は **consent-based schema** (顔写真 default 「masked」 選択肢 明示)
- ⚠ 「取り込み」 = schema data structure level のみ、 実装 UI は Layer 3 越境 = 弁護士 consultation 経路 必須
- 業種 選択 で HONEST_SCOPE 除外 line 発動 or 含める か の 判定 は 藤本さん judgment + 弁護士 consultation 必須

## v0.6 追加 (2026-07-13, 同日) — login 後 flow 補完 4 schema

藤本さん 確認 (2026-07-13): 「店舗 や ユーザー が login を して、 その 後 の 項目 なども 組み込まれている でしょうか？」

honest 実測 = **不足 あり** (v0.5 は 「login 前 掲載 情報 + login 後 一部 mypage」 のみ)。 認証 flow + dashboard 管理 + 相互 messaging を 補完:

### v0.6 追加 file (4 schema files, ~1,230 行)

- **`src/data/schemas/auth-schema.ts`** (~330 行) — 認証 系
  - AuthUserRole (7 種: customer / shop_owner / shop_staff / performer / admin_super / admin_shop_review / admin_read_only)
  - AuthSession (crypto-random token + IP + UA + expiry)
  - PasswordHashRecord (bcrypt / argon2id / scrypt) + PasswordResetRequest + PasswordChangeHistory
  - EmailVerificationToken + EmailChangeRequest
  - MFASetup (TOTP / SMS / Passkey / email_code) + MFABackupCode
  - LoginHistoryEntry (個情法 セキュリティ purpose 明示)
  - FailedLoginTracking (account lockout 対応)
  - TrustedDevice (「この device で 2FA 記憶」 機能)
  - OAuthLink (LINE / Google / Apple / Twitter / Facebook 連携)
  - AUTH_SCHEMA_IMPLEMENTATION_MARKER (**11 セキュリティ requirement + OWASP Top 10 全 10 項目**)

- **`src/data/schemas/shop-dashboard-schema.ts`** (~320 行) — 店舗 側 dashboard 管理
  - ShopDashboardStatistics (アクセス / 予約 / 口コミ / performer 別 集計 / 検索 hit / クーポン / 通報 受信)
  - ShopReservationInboxItem (予約 受信 queue、 shop_staff assign)
  - **PerformerAdditionWorkflow** (7 stage、 フリーランス保護法 2026-11 準拠 = 書面 交付 / 支払 条件 / harassment 窓口 / 撤回 policy)
  - **PerformerDepartureWorkflow** (30 日 予告 期間、 post-departure data handling policy)
  - ShopPaymentHistoryEntry (インボイス制度 対応)
  - ListingRenewalRequest (契約 更新 request)
  - ShopReceivedReportItem (お店 が 受けた 通報 の shop-side view + response position)
  - ShopSystemNotification (10 種: contract_expiring_soon / new_review / terms_updated / etc)
  - ShopProfileChangeLog (audit log + IP + UA)
  - ShopStaffPermissionGrant + ShopStaffPermission (9 種 権限 委任)

- **`src/data/schemas/user-mypage-schema.ts`** (~280 行) — ユーザー mypage 管理
  - UserProfileChangeLog (audit log + email change verification 連動)
  - ReservationModificationRequest (change_date_time / change_options / cancel / refund_request)
  - **UserNotificationPreference** (granular opt-in / opt-out、 email 8 種 + push 3 種 + LINE 通知 + 頻度 制限 + quiet hours)
  - MembershipTierChangeLog (upgrade / downgrade audit)
  - PointRedemptionHistoryEntry (coupon / gift_card / content_unlock)
  - UserSubmittedReportHistoryItem (通報 送信 履歴 user-side view)
  - AIConciergeChatManagementView (削除 request + personal info 自動 flag)
  - **UserSecuritySettingsView** (active sessions / trusted devices / MFA methods / recent login history)

- **`src/data/schemas/messaging-schema.ts`** (~300 行) — 相互 messaging + notification
  - DirectMessageThread + DirectMessage (店舗 ↔ ユーザー DM、 AI moderation + report tracking + soft delete)
  - UserNotification (**20 種 notification type**: reservation_confirmed / favorite_performer_diary_update / realtime_availability_favorite_shop / security_alert_new_login / etc)
  - NotificationDeliveryAttempt (delivery channel: in_app / email / push / line)
  - SystemBroadcast (admin → 全 role 通知 + 5 種 broadcast type)
  - MessageModerationQueueItem (AI flag → human review escalation)
  - **DisclosureRequestForSenderInfo** (プロバイダ責任制限法 4 条 発信者 情報 開示 request workflow、 弁護士 request + 意見 聴取 7 日 + 判断 + 開示 実施)

### 累計 網羅 (v0.4 + v0.5 + v0.6 = 10 schema files, ~2,700 行)

| Layer | 網羅 内容 |
|---|---|
| **店舗 側 (login 前 + 後)** | 掲載 情報 21 (v0.4) + PR 拡張 22 (v0.5) + dashboard 統計 + 予約 受信 + performer flow + 決済 履歴 + 通報 受信 + system notification + audit log + shop_staff 権限 (v0.6) = **100+ 項目** |
| **ユーザー 側 (login 前 + 後)** | 求職者 15 (v0.4) + PR 顧客 会員 (v0.5) + 予約/口コミ/point/AI (v0.5) + profile 変更 + 予約 変更 + 通知 preference + 通報 履歴 + セキュリティ settings (v0.6) = **80+ 項目** |
| **相互 messaging** | 店舗 ↔ ユーザー DM + moderation + 発信者 情報 開示 request (v0.6) = **6 type** |
| **content 系** | v0.5 の 8 type + admin/user notification 20 種 + broadcast (v0.6) = **拡張** |
| **認証 系 (共通)** | Session + Password/MFA/OAuth + login history + trusted device (v0.6) = **9 section** |
| **業種** | 21 total (非 風俗 8 + 性風俗 明示 除外 9 + PR 拡張 4) |

### Layer 3 越境 前 追加 requirement (v0.6)

- **OWASP Top 10 遵守** (broken auth / crypto failures / injection / etc 全 10 項目)
- **セキュリティ requirement 11 種** (bcrypt/argon2 hash / crypto-random token / HttpOnly Secure SameSite cookie / session ID 再生成 / rate limiting / account lockout / MFA / password strength / password change notification / email verification token expiry / password reset token expiry)
- **不正アクセス禁止法**
- **電気通信事業法** (通信 記録 保管)
- **労基法** (shop_staff / performer 認証 の 労働 契約 対応)
- **プロバイダ責任制限法 4 条** (発信者 情報 開示 request workflow、 弁護士 request + 意見 聴取 7 日 + 判断 + 開示 実施)
- **AI content moderation** (message + review + diary comment 全 layer 対応)
