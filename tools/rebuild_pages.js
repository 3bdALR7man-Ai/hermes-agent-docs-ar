// يعيد بناء pages.json من الصفحات المنزّلة فعلًا في raw/
const fs = require('fs');
const path = require('path');
process.chdir(__dirname);
const files = [];
(function walk(d) {
  for (const f of fs.readdirSync(d)) {
    const p = path.join(d, f);
    if (fs.statSync(p).isDirectory()) walk(p);
    else if (f.endsWith('.html')) files.push(path.relative('raw', p).split(path.sep).join('/').replace(/\.html$/, ''));
  }
})('raw');
const hrefOf = (s) => (s === 'index' ? '/docs/' : '/docs/' + s.replace(/\/index$/, '/'));
const pages = files.sort().map((s) => ({ href: hrefOf(s), slug: s }));
fs.writeFileSync('pages.json', JSON.stringify(pages, null, 1));
console.log('pages.json rebuilt from raw:', pages.length);
