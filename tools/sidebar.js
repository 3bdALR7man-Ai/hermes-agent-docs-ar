const fs = require('fs');
const path = require('path');
process.chdir(__dirname);
globalThis.webpackChunkwebsite = [];
eval(fs.readFileSync('js/11b43341.54f4f961.js', 'utf8'));
const mods = globalThis.webpackChunkwebsite[0][1];
let data;
for (const k in mods) {
  const m = { exports: {} };
  try { mods[k](m); } catch (e) { continue; }
  if (m.exports && m.exports.version) data = m.exports;
}
const sb = data.version.docsSidebars.docs;
fs.writeFileSync('sidebar.json', JSON.stringify(sb, null, 1));
const labels = new Set();
function walk(items, d) {
  for (const it of items) {
    labels.add(it.label);
    if (it.type === 'category') {
      console.log('  '.repeat(d) + '[C] ' + it.label + (it.href ? '  ->' + it.href : '') + (it.collapsible === false ? ' (nc)' : ''));
      walk(it.items, d + 1);
    } else {
      console.log('  '.repeat(d) + '- ' + it.label + '  ' + (it.href || ''));
    }
  }
}
walk(sb, 0);
console.log(labels.size);
fs.writeFileSync('labels.json', JSON.stringify([...labels], null, 1));
