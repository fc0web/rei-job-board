# rei-job-board — Project Instructions (Rei Claude session 用)

## 基本

- **Author**: 藤本 伸樹 (Nobuki Fujimoto / fc0web)
- **License**: MIT
- **Stack**: Astro + Leaflet + Cloudflare Pages (静的 site)
- **Repo**: `fc0web/rei-job-board` (Public, GitHub manual create)
- **Type**: standalone (rei-aios とは別 project, brand 完全分離)

## 永続原則 (機能追加時に必ず再確認)

詳細は [`docs/HONEST_SCOPE.md`](docs/HONEST_SCOPE.md) を **必ず読む**。 要約:

1. **求職者情報を一切収集しない** — 改正職安法 特定 該当回避の core 線
2. **Google Maps URL ベース** — Places API data の永久 DB 保存禁止 (ToS §3.2.3(b))
3. **siren-naming 禁止** — 「最強」 「絶対」 「ブルーオーシャン」 「永久」 等使用禁止
4. **既存大手 (Indeed 等) と honest framing 維持** — 「個人運営の試行プロジェクト」 で 「優位」 claim しない

## ディレクトリ

```
src/
  pages/        Astro page (index / about / post / report)
  components/   (将来) Leaflet wrapper 等
  data/         jobs.json (求人データ、 手動編集 / community PR)
  layouts/      Base.astro (共通 layout + footer honest-banner)
  styles/       CSS (将来)
public/         静的 asset (favicon 等)
docs/           HONEST_SCOPE.md + 設計 / changelog
```

## 機能追加チェックリスト (PR ごと)

- [ ] 求職者情報を収集するか? → Yes なら reject
- [ ] マッチング / レコメンドを行うか? → Yes なら reject
- [ ] Google Maps API data を永久 store するか? → Yes なら reject
- [ ] 掲載 NG 業種 (闇バイト / 風俗 / マルチ等) チェックを弱めるか? → 弱める場合 reject
- [ ] siren-naming を含むか? → Yes なら訂正

## 開発コマンド (manual install 後)

```bash
npm install
npm run dev     # http://localhost:4321
npm run build   # → dist/
npm run preview
```

## TODO (scaffold v0.0 → v0.1)

- [ ] `npm install` (Rei 側でなく 藤本さん manual)
- [ ] GitHub repo create + push (藤本さん manual)
- [ ] Cloudflare Pages 連携 (藤本さん manual)
- [ ] Tally form 開設 + post.astro に embed
- [ ] favicon / OGP 画像
- [ ] 通報メール窓口開設
- [ ] サンプルデータを実データに置換 (or 削除して空 list で start)

## 関連 record (rei-aios memory)

- `project_free_job_posting_platform_intent_2026-06-22.md` (構築意向 record)
- `project_ohmynews_style_citizen_journalism_platform_intent_2026-06-22.md` (姉妹 project)
- `feedback_grep_before_answer_discipline.md` (11 軸目)
- `feedback_dist_renderer_mass_delete_prevention_protocol.md` (10 軸目)
- `feedback_super_naming_siren_family_pattern.md` (7 軸目)
