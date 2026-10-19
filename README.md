# 大鬍子藥師商業解剖室｜純靜態網站

HTML + 本機 CSS + 少量原生 JavaScript。沒有後臺、登入、資料庫、API、React 或執行期依賴。訪客閱讀不需要 Node.js；直接開啟 `index.html` 或上傳到靜態主機即可。

## 檔案

- `index.html`：可直接使用的首頁，文章卡片已寫入 HTML。
- `articles/*.html`：可直接分享與開啟的獨立文章。
- `assets/`：本機樣式、選單／分類／搜尋互動與圖片，不依賴外部字型。
- `content/articles.json`：給 AI 維護的文章索引，不由瀏覽器載入。
- `_templates/article.html`：新增文章的基底；`_templates/index.html`：首頁來源。
- `scripts/build-site.mjs`：選用的本機首頁更新工具，只用 Node.js 內建模組。
- `scripts/check-site.mjs`：檢查本機連結、錨點、文章索引與靜態架構。
- `docs/AI_ARTICLE_WORKFLOW.md`：AI 新增文章與推送流程。

## 使用與預覽

雙擊 `index.html` 即可閱讀；手機選單、分類與搜尋使用原生 JavaScript。關閉 JavaScript 時仍顯示全部文章，連結與文章正文可用。

需要 HTTP 預覽時，可在此資料夾執行 `python -m http.server 8080 --bind 127.0.0.1`，開啟 `http://127.0.0.1:8080/`。此命令只供本機預覽，正式網站不需要 Python。

## AI 新增文章

把文章交給 AI，請它依照 `AGENTS.md` 與 `docs/AI_ARTICLE_WORKFLOW.md` 建立文章頁、更新索引，執行：

```text
node scripts/build-site.mjs
node scripts/check-site.mjs
node --check assets/site.js
```

確認差異與預覽後，依當次授權 commit / push。網站根目錄全部靜態檔案即可交給 GitHub Pages 或其他靜態主機，無須 `npm install`、後臺或建置服務。未設定 GitHub Pages、網域或變更託管權限；推送原始碼與發布網站是不同操作。

## 移轉範圍與原始內容

參考檔：`DRBU_Business_Lab_Full_Source_v2_20261019.zip`。保留黑紅米白視覺、首頁各區塊、原圖與三張案例卡片的觀察方向。原 ZIP 的文章快照為空，沒有三篇全文，因此三篇獨立頁明確標示「案例摘要」，未虛構完整文章、來源或發布日期。

移除後臺管理入口與雲端依賴。原圖表的 `87%` 為無來源裝飾數字，改成文字；AG1 標題移除未附來源的營收數字。Facebook 連結保留原提供網址，標示為專頁入口，沒有冒充單支影片連結。外部連結的目前內容未重新查核。

原 `index.html` 由 Git 提交 `a4cebba` 保留，另有本機備份 `.local-reference/index.before-static-20261019.html`；參考資料與備份均被 Git 忽略，不應作為網站檔案發布。原始 ZIP 保留在 Downloads。
