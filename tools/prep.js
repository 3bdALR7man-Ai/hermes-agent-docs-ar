// يجهّز وحدات الترجمة: يستخرج محتوى كل صفحة، يعزل الكود والأيقونات، ويقسّمها إلى أجزاء صغيرة
const fs = require('fs');
const path = require('path');
process.chdir(__dirname);

const EXCLUDE = new Set(['index', 'user-stories', 'skills', 'plugins']);
const CHUNK_MAX = 28 * 1024;
const BATCH_MAX = 120 * 1024;

const pages = JSON.parse(fs.readFileSync('pages.json', 'utf8')).filter((p) => !EXCLUDE.has(p.slug));
const W = 'work';
for (const d of ['src', 'ar', 'keep']) fs.mkdirSync(path.join(W, d), { recursive: true });

const VOID = new Set(['br', 'hr', 'img', 'input', 'meta', 'link', 'source', 'wbr', 'col', 'area', 'embed', 'track', 'param']);
const idOf = (slug) => slug.replace(/\//g, '__');

function extractMarkdown(s) {
  const open = '<div class="theme-doc-markdown markdown">';
  const a = s.indexOf(open);
  const b = s.indexOf('<footer class="theme-doc-footer');
  if (a < 0 || b < 0) return null;
  let inner = s.slice(a + open.length, b);
  inner = inner.replace(/<\/div>\s*$/, '');
  return inner;
}

// تقسيم على حدود الوسوم بحيث يبقى العمق منخفضًا
function tokenize(html) {
  const out = [];
  const re = /<!--[\s\S]*?-->|<\/?([a-zA-Z][a-zA-Z0-9-]*)\b[^>]*>/g;
  let m;
  while ((m = re.exec(html))) out.push({ i: m.index, end: re.lastIndex, raw: m[0], name: (m[1] || '').toLowerCase() });
  return out;
}
function boundaries(html) {
  // يرجع مواضع يمكن القطع عندها مع العمق
  const toks = tokenize(html);
  const res = [];
  let depth = 0;
  for (const t of toks) {
    if (t.raw.startsWith('<!--') || !t.name) continue;
    const closing = t.raw.startsWith('</');
    const selfClose = t.raw.endsWith('/>') || VOID.has(t.name);
    if (closing) {
      depth--;
      res.push({ pos: t.end, depth, after: t.name, closing: true });
    } else {
      res.push({ pos: t.i, depth, before: t.name, heading: /^h[1-6]$/.test(t.name) });
      if (!selfClose) depth++;
    }
  }
  return res;
}
function split(html) {
  if (html.length <= CHUNK_MAX) return [html];
  const bs = boundaries(html);
  const chunks = [];
  let start = 0;
  while (html.length - start > CHUNK_MAX) {
    const limit = start + CHUNK_MAX;
    const cands = bs.filter((b) => b.pos > start + 2000 && b.pos <= limit);
    const pick = (pred) => { const c = cands.filter(pred); return c.length ? c[c.length - 1] : null; };
    const cut =
      pick((b) => b.depth === 0 && b.before === 'h2') ||
      pick((b) => b.depth === 0 && b.heading) ||
      pick((b) => b.depth === 0) ||
      pick((b) => b.depth <= 2 && (b.before === 'tr' || b.before === 'li')) ||
      pick((b) => b.depth <= 4 && !b.closing) ||
      pick(() => true);
    if (!cut) break;
    chunks.push(html.slice(start, cut.pos));
    start = cut.pos;
  }
  chunks.push(html.slice(start));
  return chunks;
}

const manifest = [];
let totalSrc = 0;
for (const p of pages) {
  const raw = fs.readFileSync(path.join('raw', p.slug + '.html'), 'utf8');
  let md = extractMarkdown(raw);
  if (md == null) { console.log('SKIP no markdown', p.slug); continue; }
  md = md.replace(/<a href="#[^"]*" class="hash-link"[^>]*>​<\/a>/g, '');
  const keep = [];
  const shelve = (m) => { keep.push(m); return `<x-keep id="${keep.length - 1}"></x-keep>`; };
  md = md
    .replace(/<pre\b[\s\S]*?<\/pre>/g, shelve)
    .replace(/<svg\b[\s\S]*?<\/svg>/g, shelve)
    .replace(/<iframe\b[\s\S]*?<\/iframe>/g, shelve)
    .replace(/<video\b[\s\S]*?<\/video>/g, shelve)
    .replace(/<(img|input)\b[^>]*>/g, shelve)
    .replace(/ target="_blank" rel="noopener noreferrer"/g, ' data-ext')
    .replace(/ class=""/g, '')
    .replace(/<!-- -->/g, '');
  fs.writeFileSync(path.join(W, 'keep', idOf(p.slug) + '.json'), JSON.stringify(keep));
  const parts = split(md);
  const chunks = parts.map((c, k) => {
    const file = `${idOf(p.slug)}.${String(k).padStart(2, '0')}.html`;
    fs.writeFileSync(path.join(W, 'src', file), c);
    totalSrc += c.length;
    return { file, bytes: Buffer.byteLength(c) };
  });
  const h1 = (raw.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1] || '';
  manifest.push({ slug: p.slug, href: p.href, title: h1.replace(/<[^>]+>/g, ''), chunks });
}
fs.writeFileSync(path.join(W, 'manifest.json'), JSON.stringify(manifest, null, 1));

// تجميع الأجزاء في دفعات بالترتيب
const batches = [];
let cur = null;
for (const pg of manifest) {
  for (const c of pg.chunks) {
    if (!cur || cur.bytes + c.bytes > BATCH_MAX) { cur = { id: 'b' + String(batches.length + 1).padStart(3, '0'), files: [], bytes: 0 }; batches.push(cur); }
    cur.files.push(c.file);
    cur.bytes += c.bytes;
  }
}
fs.writeFileSync(path.join(W, 'batches.json'), JSON.stringify(batches, null, 1));
const nChunks = manifest.reduce((a, p) => a + p.chunks.length, 0);
const maxChunk = Math.max(...manifest.flatMap((p) => p.chunks.map((c) => c.bytes)));
console.log('pages', manifest.length, 'chunks', nChunks, 'src KB', (totalSrc / 1024) | 0, 'max chunk KB', (maxChunk / 1024) | 0, 'batches', batches.length);
