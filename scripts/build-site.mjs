// Optional authoring helper; the deployed site needs no Node.js or build step.
import { readFile, writeFile, access } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = fileURLToPath(new URL('../', import.meta.url));
const read = name => readFile(path.join(root, name), 'utf8');
const esc = value => String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
const data = JSON.parse(await read('content/articles.json'));
if (!Array.isArray(data.articles)) throw new Error('articles 必須是陣列');
const seen = new Set();
const numbers = new Set();
for (const article of data.articles) {
  for (const field of ['id', 'no', 'title', 'summary', 'category', 'signal', 'status', 'href']) {
    if (typeof article[field] !== 'string' || !article[field].trim()) throw new Error(`缺少 ${field}`);
  }
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(article.id) || seen.has(article.id)) throw new Error(`文章 id 無效或重複：${article.id}`);
  seen.add(article.id);
  if (!/^\d{3,}$/.test(article.no) || numbers.has(article.no)) throw new Error(`文章編號無效或重複：${article.no}`);
  numbers.add(article.no);
  if (!['published', 'summary-only'].includes(article.status)) throw new Error('公開目錄只接受 published 或 summary-only；草稿請放 .local-drafts/');
  if (article.href !== `articles/${article.id}.html`) throw new Error(`文章路徑必須與 id 一致：${article.id}`);
  if (article.date !== null) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(article.date) || !Number.isFinite(Date.parse(article.date)) || new Date(article.date).toISOString().slice(0, 10) !== article.date) throw new Error(`日期無效：${article.id}`);
  } else if (article.status === 'published') throw new Error(`完整文章須提供發布日期：${article.id}`);
  await access(path.join(root, article.href));
}
// Complete articles come first, newest first. Source-only summaries have no invented date.
const articles = [...data.articles].sort((a, b) =>
  Number(b.status === 'published') - Number(a.status === 'published') ||
  (b.date || '').localeCompare(a.date || '') || Number(b.no) - Number(a.no));
const label = article => article.status === 'published' ? '閱讀文章' : '查看案例摘要';
function card(article) {
  return `<article class="article-card" id="case-${esc(article.no)}" data-category="${esc(article.category)}">
  <div class="card-top"><span>CASE ${esc(article.no)}</span><span>${esc(article.signal)}</span></div>
  <div class="case-visual" aria-hidden="true"><b>${esc((article.brand || article.title).slice(0, 1))}</b><i></i><i></i><i></i></div>
  <div class="article-body"><p>${esc(article.category)} / ${article.status === 'published' ? '文章' : '案例摘要'}</p>
    <h3><a href="${esc(article.href)}">${esc(article.title)}</a></h3><span>${esc(article.summary)}</span>
    <a class="article-link" href="${esc(article.href)}" aria-label="${label(article)}：${esc(article.title)}">${label(article)} →</a>
  </div>
</article>`;
}
const categories = ['全部', ...new Set(articles.map(article => article.category))];
const filters = categories.map((name, index) => `<button type="button" data-filter="${esc(name)}" class="${index ? '' : 'active'}" aria-pressed="${!index}">${esc(name)}</button>`).join('\n');
const featured = articles[0];
const latest = featured ? `<div class="latest-card">
  <div class="radar-graphic" aria-hidden="true"><div></div><b>CASE<br>${esc(featured.no)}</b></div>
  <div class="latest-copy"><div class="meta"><span>${esc(featured.category)}</span><span>${featured.status === 'published' ? '文章' : '案例摘要'}</span>${featured.date ? `<time datetime="${featured.date}">${featured.date.replaceAll('-', '.')}</time>` : ''}</div>
    <h2>${esc(featured.title)}</h2><p>${esc(featured.summary)}</p>
    <a href="${esc(featured.href)}">${label(featured)} <span>→</span></a>
  </div>
</div>` : '<p>文章整理中，歡迎稍後再訪。</p>';
let html = await read('_templates/index.html');
for (const [key, value] of Object.entries({ FEATURED: latest, FILTERS: filters, ARTICLES: articles.map(card).join('\n'), ARTICLE_COUNT: String(articles.length) })) {
  const marker = `<!-- ${key} -->`;
  if (html.split(marker).length !== 2) throw new Error(`模板需有一個 ${marker}`);
  html = html.replace(marker, () => value);
}
await writeFile(path.join(root, 'index.html'), html);
console.log(`已更新首頁：${articles.length} 篇，無伺服器依賴。`);
