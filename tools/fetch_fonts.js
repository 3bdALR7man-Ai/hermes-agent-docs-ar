// ينزّل الخطوط من Google Fonts ويحفظها محليًا مع ملف CSS يشير إليها
const fs = require('fs');
const path = require('path');
process.chdir(__dirname);
const OUT = 'fonts';
fs.mkdirSync(OUT, { recursive: true });
const URL = 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans+Arabic:wght@300;400;500;600;700&family=Inter:wght@300;400;500;600;700&family=DM+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36';

(async () => {
  const css = await (await fetch(URL, { headers: { 'User-Agent': UA } })).text();
  const urls = [...new Set([...css.matchAll(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g)].map((m) => m[1]))];
  console.log('font files:', urls.length);
  const map = new Map();
  let n = 0, bytes = 0;
  for (const u of urls) {
    const name = u.split('/').slice(-2).join('-').replace(/[^\w.-]/g, '_');
    const buf = Buffer.from(await (await fetch(u, { headers: { 'User-Agent': UA } })).arrayBuffer());
    fs.writeFileSync(path.join(OUT, name), buf);
    map.set(u, name);
    n++; bytes += buf.length;
  }
  let local = css.replace(/url\((https:\/\/fonts\.gstatic\.com\/[^)]+)\)/g, (all, u) => `url(../fonts/${map.get(u)})`);
  fs.writeFileSync(path.join(OUT, 'fonts.css'), local);
  console.log('saved', n, 'files', (bytes / 1024 / 1024).toFixed(1), 'MB, css', (local.length / 1024).toFixed(0), 'KB');
})();
