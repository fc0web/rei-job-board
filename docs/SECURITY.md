# Security Architecture — rei-job-board

詐欺求人 / 闇バイト / 反社 / オレオレ詐欺受け子・出し子募集 の混入を防ぐための **layered defense** 設計。

## 前提認識 (永続)

- **完全防止は不可能** (Indeed / タイミー / タウンワーク等の大手でも混入実例あり)
- 設計目標 = **「闇バイト犯罪者の運営コストを上げ ROI を悪化させる」** 多層 filter
- 単独認証 (メール / SMS / 所在地) は **全て突破される** 前提で設計
  - メール → 使い捨て (10minutemail / Mailinator)
  - SMS → 飛ばし携帯 / SMS 受信代行
  - 所在地 → バーチャルオフィス (月 5,000 円〜)
  - マイナンバーカード → 偽造 / 他人名義

→ **複数 anchor の組み合わせ** が効く

## Layered Defense (L0-L6)

### L0. 物理 anchor 必須 (最強・最安)

- **Google Maps URL 必須**入力 + place_id 検証
- 闇バイトは物理店舗を持たない傾向 (持つと警察通報されるため)
- Google Business Profile 登録済の住所のみ受付 (= Google 側で実在 audit 済)
- 実装: `src/data/jobs.json` schema で `location.googleMapsUrl` を required field 化 (v0.0 で既設)

### L1. NLP keyword フィルタ (自動・無料)

警察庁 + 自治体 + Indeed 公開の闇バイト特徴 keyword を `src/lib/fraud-filter.ts` で blocklist 化:

| カテゴリ | flagged keyword 例 |
|---|---|
| 報酬 | 即日即金 / 高額 / 日給 5 万 / 報酬○万〜 (時給記載なし) |
| 業務曖昧 | 運ぶだけ / 受け取るだけ / 電話かけるだけ / 簡単作業 / 誰でも可 |
| 業界隠語 | ホワイト案件 / 叩き / タタキ / UD / シノギ |
| 連絡 | Signal / Telegram / DM のみ / 公式以外 Line ID |
| 急かし | 即日勤務 / 本日中 / 至急 / 今すぐ |

- build-time に `scripts/audit-jobs.ts` で `jobs.json` を scan
- match した job は `status: "flagged"` に自動変更 + audit 待ち
- 表示時に黄色 banner で「審査保留中」 と表示

### L2. 投稿者の身元 anchor

- **法人**: 国税庁法人番号 Web-API (無料、 アプリケーション ID 取得のみ) で法人番号 verify
- **個人事業主**: 開業届 PDF をコミュニティ PR の comment に添付 (画像審査)
- **コールバック認証** (最強): 固定電話 / 代表電話を入力 → こちらから営業時間中に電話 callback → 通じたら公開
  - 闇バイトは IP 電話 / 飛ばし携帯のため固定電話を持たない傾向

### L3. ドメイン age + 投稿頻度 anomaly

- 連絡先 URL の WHOIS で domain age 取得 (無料)
- 30 日未満 = `domainAge: "fresh"` flag → 要 audit
- 同 IP / 同 メール / 同 電話 からの大量投稿 = bot/詐欺集団 fingerprint (community PR model では PR 履歴で観察可)

### L4. Community moderation (既設)

- GitHub Issue 通報窓口 ✅
- 求人 list / popup に「⚠ 怪しいと思ったら通報」 banner ✅
- 通報 1 件で 一時非公開 → 目視 audit (Rei + 藤本さん manual)

### L5. 警察 / 公的相談窓口への誘導 (既設)

- 警察庁 #9110 / 警察総合相談電話
- 厚生労働省 労働局
- 消費者ホットライン 188 (いやや!)
- 闇バイト相談窓口

### L6. 求職者教育 (表示時)

- 各求人 popup 下部に「闇バイト見分け方」 リンク
- 警察庁 / 東京都 闇バイトクイズ等の公的資料へリンク
- Indeed 等の見分け方記事へリンク (rivalry より連携)

## ROI 悪化の論拠

闇バイト犯罪者にとって、 本 site への投稿コストは:

| 要件 | コスト |
|---|---|
| Google Business Profile 登録の物理店舗 (L0) | 数十万円 (虚偽でも住所確保 + Google 審査通過要) |
| 固定電話 + 営業時間 callback 対応 (L2) | 数万円 / 月 + 人員時間 |
| 法人番号 取得 + 登記 (L2) | 設立費用数十万円 + 登記住所要 |
| Keyword フィルタ回避 (L1) | NLP 経由で曖昧化、 だが「闇バイト感」 が薄まり応募者が来ない trade-off |

→ 大半の闇バイトは 「Telegram + 飛ばし携帯 + 高額即日 keyword」 という最低コスト model なので、 L0 + L1 だけで大半は flag される。

## 限界 (overclaim 防止)

- 規模拡大時は大手と同様に audit cost が線形増加、 hobby scale で持続困難
- 「100% 防げる」 と主張しない (本書 / UI / 広告全て)
- 通報窓口 + 警察誘導 を **必ず明示** することで運営者 (藤本さん) の法的責任を minimize

## 関連法令

- 改正職業安定法 2022-10-01 (求人情報の的確性義務付け)
- プロバイダ責任制限法 改正 2022 (発信者情報開示請求対応窓口設置義務)
- 個人情報保護法 (本 design では求職者情報非収集ライン厳守で適用最小化)

## 更新履歴

- 2026-06-22: 初版作成 (L0-L6 構造確定)
