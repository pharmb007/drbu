// Dependency-free checks for the delivered static website, not a backend test suite.
import { readFile, readdir, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
const root = fileURLToPath(new URL('../', import.meta.url));
const errors = [];
const pages = ['index.html', '404.html', ...(await readdir(path.join(root, 'articles'))).filter(name => name.endsWith('.html')).map(name => `articles/${name}`)];
const documents = new Map(await Promise.all(pages.map(async name => [name, await readFile(path.join(root, name), 'utf8')])));
const attrs = /\b(?:href|src)\s*=\s*["']([^"']+)["']/gi;
for (const [name, html] of documents) {
  if ((html.match(/<h1\b/gi) || []).length !== 1) errors.push(`${name}: 必須有一個 h1`);
  if (!/<html\b[^>]*lang="zh-Hant(?:-TW)?"/.test(html)) errors.push(`${name}: 缺少繁體中文 lang`);
  if (!/<meta\s+name="viewport"/.test(html)) errors.push(`${name}: 缺少 viewport`);
  if (!/<title>[^<]+<\/title>/.test(html)) errors.push(`${name}: 缺少標題`);
  if (/\{\{\w+\}\}|<!-- (?:FEATURED|FILTERS|ARTICLES|ARTICLE_COUNT) -->/.test(html)) errors.push(`${name}: 模板尚未完成`);
  if (/\/api\/|\/admin\b|chatgpt\.site|<iframe\b|<form\b/i.test(html)) errors.push(`${name}: 仍有後臺依賴`);
  const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(match => match[1]);
  if (new Set(ids).size !== ids.length) errors.push(`${name}: 重複 id`);
  for (const match of html.matchAll(attrs)) {
    const raw = match[1].replaceAll('&amp;', '&');
    if (/^(?:https?:|mailto:|tel:|data:)/i.test(raw)) continue;
    if (/^(?:javascript:|\/\/|\/)/i.test(raw)) { errors.push(`${name}: 不允許非相對網址 ${raw}`); continue; }
    const [filePart, hash] = raw.split('#');
    const relative = decodeURIComponent(filePart.split('?')[0]);
    const target = relative ? path.resolve(root, path.dirname(name), relative) : path.join(root, name);
    if (!target.startsWith(root)) { errors.push(`${name}: 路徑超出網站 ${raw}`); continue; }
    try { if (!(await stat(target)).isFile()) throw Error(); }
    catch { errors.push(`${name}: 檔案不存在 ${raw}`); continue; }
    if (hash && target.endsWith('.html')) {
      const targetHtml = await readFile(target, 'utf8');
      if (!targetHtml.includes(`id="${decodeURIComponent(hash)}"`)) errors.push(`${name}: 錨點不存在 ${raw}`);
    }
  }
}
const manifest = JSON.parse(await readFile(path.join(root, 'content/articles.json'), 'utf8'));
const home = documents.get('index.html');
for (const article of manifest.articles) {
  if (!home.includes(`href="${article.href}"`)) errors.push(`首頁遺漏文章 ${article.id}`);
  const articleHtml = documents.get(article.href);
  if (!articleHtml) { errors.push(`缺少文章頁 ${article.id}`); continue; }
  const esc = value => value.replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  if (!articleHtml.includes(`<h1>${esc(article.title)}</h1>`)) errors.push(`${article.id}: 標題與目錄不一致`);
  if (article.status === 'summary-only' && !articleHtml.includes('這是案例摘要')) errors.push(`${article.id}: 缺少摘要標示`);
  if (article.status === 'published' && (!articleHtml.includes(`datetime="${article.date}"`) || articleHtml.includes('content="noindex"'))) errors.push(`${article.id}: 完整文章日期或索引設定不正確`);
}
const css = await readFile(path.join(root, 'assets/site.css'), 'utf8');
const js = await readFile(path.join(root, 'assets/site.js'), 'utf8');
if (/@import|https?:\/\//i.test(css)) errors.push('CSS 不應依賴外部套件或網路字型');
if (/\bfetch\s*\(|XMLHttpRequest|localStorage|\/api\//.test(js)) errors.push('前端不應呼叫後端或儲存登入狀態');
for (const [name, text] of [...documents, ['assets/site.js', js]]) {
  if (/-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|sk-(?:proj-)?[A-Za-z0-9_-]{20,}|gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,}/.test(text)) errors.push(`${name}: 疑似敏感字串，需人工檢查`);
}
if (errors.length) { console.error(errors.join('\n')); process.exitCode = 1; }
else console.log(`PASS：${pages.length} 個 HTML、${manifest.articles.length} 個文章索引；本機連結、錨點、資源與靜態架構檢查通過。`);
