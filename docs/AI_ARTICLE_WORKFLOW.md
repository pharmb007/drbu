# 以 AI 維護文章

網站沒有上傳介面。你把文章交給可存取此儲存庫的 AI，由它直接建立 HTML、更新首頁，再依你授權推送 GitHub。GitHub 連線與推送權限須由該 AI 所在的環境提供；網站不儲存任何 Token。

## 可直接使用的指令

> 請把以下文章加入 DRBU 網站。先讀 AGENTS.md，沿用文章模板與現有風格，把全文寫進獨立 HTML，同步更新文章索引與首頁，保留其他文章。不要加後臺或框架。完成連結檢查與桌面／手機預覽後，回報結果。這次也授權把確認的變更 commit 並 push 到 origin/main；不要改網站託管設定。文章內容：……

若這次只要本機草稿，改成「先放 .local-drafts/，不要寫入公開索引、commit 或 push」。若要發布網站，另外指定主機及發布範圍；GitHub push 不等於已部署。

## 每篇文章的步驟

1. 複製 `_templates/article.html` 成 `articles/<slug>.html`，slug 使用英文小寫、數字與連字號。
2. 替換 `{{TITLE}}`、`{{SUMMARY}}`、`{{NO}}`、`{{SIGNAL}}`、`{{CATEGORY}}`、`{{DATE}}`、`{{CONTENT}}`、`{{SOURCES}}`。在 HTML 文字與屬性中正確跳脫 `&`、`<`、`>` 與引號。公開全文需移除模板的 `noindex`。新增正文須有一個 h1；段落用 h2/h3 組織。來源使用真實網址，不虛構引用。
3. 圖片放在 `assets/images/<slug>/`，文章內用 `../assets/images/<slug>/...`，填寫 alt。不要引入未知外部腳本。若使用自帶版型，仍要有繁體中文 lang、viewport、標題、摘要、日期與回首頁連結。
4. 在 `content/articles.json` 的 articles 陣列加入一筆，例如以下是欄位示意，需填入本次真實內容才可使用：

```json
{
  "id": "your-article-slug",
  "no": "004",
  "brand": "文章涉及的品牌或留空字串",
  "category": "品牌策略",
  "title": "與文章 h1 完全相同的標題",
  "summary": "首頁顯示的摘要",
  "signal": "BRAND STRATEGY",
  "status": "published",
  "date": "YYYY-MM-DD",
  "href": "articles/your-article-slug.html"
}
```

5. `no` 使用未使用過的流水號；新分類會自動出現在篩選列。`date` 填真實公開日。只有摘要的內容用 `summary-only`，未知日期為 `null`。完整文章使用 `published`。私人草稿不可放進此索引，任何靜態檔案都可能被直接讀取。
6. 執行 `node scripts/build-site.mjs`。它只重建首頁，完整文章按發布日排序在前，再放原始案例摘要；最新完整文章會成為精選閱讀。文章正文仍由 AI 直接寫入 HTML，不依賴產生工具。
7. 執行 `node scripts/check-site.mjs`、`node --check assets/site.js`，再預覽首頁／文章、手機導覽、分類、搜尋及圖片。確認沒有模板字串、壞連結、無來源的新數字或私人資料。
8. 查看 `git diff --stat` 與實際差異，只 stage 此次相關檔案。取得當次推送授權後，commit 並執行 `git push origin main`，不要 force push。最後核對遠端提交。

## 更新既有摘要為全文

保留既有 slug 與網址，填入有來源的正文、真實日期與來源區塊，移除「案例摘要／全文尚待整理」提示，把索引 status 改成 `published`，同步標題與摘要並重新產生首頁。不要把原摘要當作一篇已存在的完整文章。

## 主機需要哪些檔案

訪客實際需要：`index.html`、`404.html`、`articles/`、`assets/`，以及 GitHub Pages 可用的 `.nojekyll`。`content/`、`scripts/`、`_templates/`、說明文件是可公開的維護來源，並非執行服務。

不要上傳本機備份、參考原始碼、私人草稿或驗證暫存。若日後設定 GitHub Pages，應使用儲存庫的 main 分支根目錄，或僅把上述訪客需要的檔案部署到靜態主機；是否啟用與對外公開須另依使用者授權。
