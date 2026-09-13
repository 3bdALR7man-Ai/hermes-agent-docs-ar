const fs = require('fs');
const path = require('path');
process.chdir(__dirname);
const BASE = 'https://hermes-agent.nousresearch.com';
const sidebar = JSON.parse(fs.readFileSync('sidebar.json', 'utf8'));

const hrefs = new Set();
(function walk(items) {
  for (const it of items) {
    if (it.href) hrefs.add(it.href);
    if (it.items) walk(it.items);
  }
})(sidebar);
// الصفحة الرئيسية + صفحات شريط التنقل
['/docs/', '/docs/skills', '/docs/plugins'].forEach((h) => hrefs.add(h));
// وأي صفحة مسجّلة سابقًا في pages.json (قد لا تكون في الشريط الجانبي)
if (fs.existsSync('pages.json')) for (const p of JSON.parse(fs.readFileSync('pages.json', 'utf8'))) hrefs.add(p.href);

const slugOf = (h) => {
  let s = h.replace(/^\/docs\/?/, '');
  if (s === '') return 'index';
  if (s.endsWith('/')) s += 'index';
  return s;
};

const list = [...hrefs];
fs.mkdirSync('raw', { recursive: true });
let done = 0, failed = [];
async function one(h) {
  const file = path.join('raw', slugOf(h) + '.html');
  if (fs.existsSync(file) && fs.statSync(file).size > 1000) { done++; return; }
  fs.mkdirSync(path.dirname(file), { recursive: true });
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const r = await fetch(BASE + h);
      if (!r.ok) throw new Error('HTTP ' + r.status);
      fs.writeFileSync(file, await r.text());
      done++;
      return;
    } catch (e) {
      if (attempt === 2) failed.push(h + ' ' + e.message);
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
}
(async () => {
  const q = list.slice();
  await Promise.all(Array.from({ length: 8 }, async () => { while (q.length) await one(q.shift()); }));
  // ندمج مع ما هو موجود حتى لا نفقد صفحات غير مدرجة في الشريط الجانبي
  const merged = fs.existsSync('pages.json') ? JSON.parse(fs.readFileSync('pages.json', 'utf8')) : [];
  for (const h of list) if (!merged.some((p) => p.slug === slugOf(h))) merged.push({ href: h, slug: slugOf(h) });
  fs.writeFileSync('pages.json', JSON.stringify(merged, null, 1));
  console.log('pages', list.length, 'done', done, 'failed', failed.length);
  failed.forEach((f) => console.log(' FAIL', f));
})();
