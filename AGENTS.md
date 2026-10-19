# DRBU 靜態網站維護

本專案是純靜態 HTML 網站。預設以繁體中文溝通。遵守使用者當次授權與全域指令；未經明確授權，不推送、建立 PR、發布網站、變更權限或新增正式依賴。

## 架構與邊界

- 不加入後臺、登入、API、資料庫、框架或 npm 依賴。
- 不讀取或發布 `.local-reference/`、`.local-drafts/`、`.local-qa/`。
- 文章內容必須直接寫在 HTML，不能只靠 JavaScript 動態載入。
- 使用相對路徑，不使用 `/assets/...` 或 `/articles/...`，兼容 GitHub Pages 子路徑與本機開檔。
- 沿用目前視覺、文章模板與 CSS。首頁共用區塊修改 `_templates/index.html`，再執行產生工具；不要只改會被產生工具覆蓋的 `index.html`。

## 新增或更新文章

1. 先讀 `docs/AI_ARTICLE_WORKFLOW.md`、`content/articles.json`、`_templates/article.html` 與既有文章。
2. 用唯一英文小寫 slug 建立 `articles/<slug>.html`。文章正文與來源必須來自使用者授權內容，不編造事實、文獻、日期或完整文章。
3. 同步更新 `content/articles.json`。只有明確要公開的內容可放在此；私人草稿不放進靜態公開目錄。
4. 執行 `node scripts/build-site.mjs`、`node scripts/check-site.mjs`、`node --check assets/site.js`。
5. 預覽首頁與文章的桌面／手機顯示，檢查分類、搜尋、返回連結及圖片。不宣稱未做的視覺 QA。
6. 依當次授權處理 Git。交付時回報修改檔案、驗證、commit 與推送／部署狀態。

`summary-only` 是只有摘要的案例，不得改標為全文。未知發布日為 `null`；不得用移轉日期冒充發布日期。
