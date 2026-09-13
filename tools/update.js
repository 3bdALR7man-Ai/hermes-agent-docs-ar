// يفحص الموقع الأصلي ويحدد الصفحات الجديدة أو المتغيّرة فقط
//   node update.js            فحص فقط (لا يغيّر شيئًا)
//   node update.js --apply    ينزّل الجديد، يعيد تجهيز الأجزاء المتغيّرة، ويطبع دفعات الترجمة
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { execFileSync } = require('child_process');
process.chdir(__dirname);

const BASE = 'https://hermes-agent.nousresearch.com';
const APPLY = process.argv.includes('--apply');
const W = 'work';
const md5 = (s) => crypto.createHash('md5').update(s).digest('hex');

function markdownOf(html) {
  const a = html.indexOf('<div class="theme-doc-markdown markdown">');
  const b = html.indexOf('<footer class="theme-doc-footer');
  return a < 0 || b < 0 ? null : html.slice(a, b);
}

(async () => {
  // 1) قائمة الصفحات الحالية من sitemap.xml (أشمل من llms.txt: يضم صفحات المهارات كلها)
  const xml = await (await fetch(BASE + '/docs/sitemap.xml')).text();
  let hrefs = [...new Set([...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
    .map((m) => m[1].replace(BASE, '').replace(/#.*$/, ''))
    .filter((h) => h.startsWith('/docs/'))
    .filter((h) => !/\/(search|skills|plugins)\/?$/.test(h))
    .filter((h) => !/\.(txt|png|zip|xml)$/.test(h)))];
  const liveHrefs = hrefs.slice();
  console.log(`sitemap.xml: ${liveHrefs.length} رابط`);

  const known = JSON.parse(fs.readFileSync('pages.json', 'utf8'));
  const slugOf = (h) => { let s = h.replace(/^\/docs\/?/, ''); if (s === '') return 'index'; if (s.endsWith('/')) s += 'index'; return s; };
  const knownSlugs = new Set(known.map((p) => p.slug));

  // نفحص روابط الفهرس + الصفحات المعروفة (لاكتشاف المحذوف)
  const checkList = [...new Set([...liveHrefs, ...known.map((p) => p.href)])];
  const added = [], changed = [], removed = [];
  const queue = checkList.slice();
  await Promise.all(Array.from({ length: 8 }, async () => {
    while (queue.length) {
      const href = queue.shift();
      let slug = slugOf(href);
      // الموقع يقدّم بعض الصفحات بمسارين (مع / وبدونها) — نعتبرها نفس الصفحة
      if (!knownSlugs.has(slug) && knownSlugs.has(slug + '/index')) slug += '/index';
      const file = path.join('raw', slug + '.html');
      let res;
      try { res = await fetch(BASE + href); } catch (e) { continue; }
      if (res.status === 404) { if (knownSlugs.has(slug)) removed.push(slug); continue; }
      if (!res.ok) continue;
      const html = await res.text();
      const fresh = markdownOf(html);
      if (!fresh) continue;
      if (!knownSlugs.has(slug) || !fs.existsSync(file)) { added.push({ href, slug, html }); continue; }
      const old = markdownOf(fs.readFileSync(file, 'utf8'));
      if (md5(fresh) !== md5(old)) changed.push({ href, slug, html });
    }
  }));

  console.log(`الصفحات المفحوصة: ${checkList.length}`);
  console.log(`جديدة: ${added.length}${added.length ? ' → ' + added.map((x) => x.slug).join(', ') : ''}`);
  console.log(`متغيّرة: ${changed.length}${changed.length ? ' → ' + changed.map((x) => x.slug).join(', ') : ''}`);
  console.log(`محذوفة من الأصل: ${removed.length}${removed.length ? ' → ' + removed.join(', ') : ''}`);
  if (!APPLY) { console.log('\n(فحص فقط. أضف --apply لتنزيل التغييرات وتجهيز دفعات الترجمة)'); return; }
  if (!added.length && !changed.length) { console.log('\nلا شيء للتحديث.'); return; }

  // 2) حفظ الصفحات الجديدة/المتغيّرة وإزالة ترجمتها القديمة
  fs.mkdirSync(path.join(W, 'outdated'), { recursive: true });
  const manifest = JSON.parse(fs.readFileSync(path.join(W, 'manifest.json'), 'utf8'));
  for (const p of [...added, ...changed]) {
    const file = path.join('raw', p.slug + '.html');
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, p.html);
    const pg = manifest.find((m) => m.slug === p.slug);
    if (pg) for (const c of pg.chunks) {
      const ar = path.join(W, 'ar', c.file);
      if (fs.existsSync(ar)) fs.renameSync(ar, path.join(W, 'outdated', c.file));
    }
  }
  const pages = JSON.parse(fs.readFileSync('pages.json', 'utf8'));
  for (const p of added) if (!pages.find((x) => x.slug === p.slug)) pages.push({ href: p.href, slug: p.slug });
  fs.writeFileSync('pages.json', JSON.stringify(pages, null, 1));

  // 3) إعادة التجهيز ثم طباعة الدفعات المطلوبة
  execFileSync(process.execPath, ['prep.js'], { stdio: 'inherit' });
  const fresh = JSON.parse(fs.readFileSync(path.join(W, 'manifest.json'), 'utf8'));
  const done = new Set(fs.readdirSync(path.join(W, 'ar')));
  const todo = fresh.flatMap((p) => p.chunks).filter((c) => !done.has(c.file));
  const MAX = 100 * 1024;
  const batches = [];
  let cur = null;
  for (const c of todo) {
    if (!cur || cur.bytes + c.bytes > MAX) { cur = { id: 'u' + String(batches.length + 1).padStart(2, '0'), files: [], bytes: 0 }; batches.push(cur); }
    cur.files.push(c.file); cur.bytes += c.bytes;
  }
  fs.writeFileSync(path.join(W, 'update_batches.json'), JSON.stringify(batches.map((b) => ({ id: b.id, files: b.files })), null, 1));
  console.log(`\nأجزاء تحتاج ترجمة: ${todo.length} في ${batches.length} دفعة`);
  console.log(`الدفعات محفوظة في ${path.join(W, 'update_batches.json')} — مرّرها إلى workflow الترجمة، ثم نفّذ: node build_site.js <مجلد الموقع>`);
})();
