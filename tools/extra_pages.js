// يولّد صفحتَي فهرس عربيتين: المهارات والإضافات
const fs = require('fs');
const path = require('path');
process.chdir(__dirname);
const W = 'work';
fs.mkdirSync(path.join(W, 'extra'), { recursive: true });

const read = (f) => fs.readFileSync(path.join(W, 'ar', f), 'utf8');
const CAT_AR = {
  apple: 'Apple', 'autonomous-ai-agents': 'وكلاء الذكاء الاصطناعي', creative: 'الإبداع والتصميم', devops: 'DevOps',
  email: 'البريد الإلكتروني', media: 'الوسائط', 'note-taking': 'تدوين الملاحظات', productivity: 'الإنتاجية',
  research: 'البحث', 'social-media': 'التواصل الاجتماعي', 'software-development': 'تطوير البرمجيات', web: 'الويب',
  blockchain: 'البلوكتشين', communication: 'التواصل', 'data-science': 'علم البيانات', dogfood: 'اختبار Hermes',
  finance: 'المالية', gaming: 'الألعاب', health: 'الصحة', mcp: 'MCP', migration: 'الانتقال من أدوات أخرى',
  mlops: 'MLOps وتعلّم الآلة', payments: 'المدفوعات', security: 'الأمن', 'smart-home': 'المنزل الذكي',
  'web-development': 'تطوير الويب', yuanbao: 'Yuanbao',
};

function parseCatalog(files, kind) {
  const html = files.map(read).join('');
  const out = [];
  let cat = '';
  const re = /<h2[^>]*id="([^"]+)"[^>]*>([\s\S]*?)<\/h2>|<tr><td>(<a href="([^"]+)">[\s\S]*?)<\/td><td>([\s\S]*?)<\/td>/g;
  let m;
  while ((m = re.exec(html))) {
    if (m[1]) { cat = m[1]; continue; }
    const name = m[3].replace(/<[^>]+>/g, '');
    out.push({ kind, cat, name, href: m[4], desc: m[5].trim() });
  }
  return out;
}

const skills = [
  ...parseCatalog(['reference__skills-catalog.00.html'], 'bundled'),
  ...parseCatalog(['reference__optional-skills-catalog.00.html', 'reference__optional-skills-catalog.01.html'], 'optional'),
];
// مهارات لها صفحات مترجمة لكنها غير مدرجة في جداول الكتالوج
{
  const known = new Set(skills.map((s) => s.href));
  for (const f of fs.readdirSync(path.join(W, 'ar'))) {
    const m = f.match(/^user-guide__skills__(bundled|optional)__([^_]+(?:_[^_])*?)__(.+)\.00\.html$/);
    if (!m) continue;
    const slug = f.replace(/\.00\.html$/, '').replace(/__/g, '/');
    const href = '/docs/' + slug;
    if (known.has(href)) continue;
    const html = fs.readFileSync(path.join(W, 'ar', f), 'utf8');
    const name = slug.split('/').pop();
    const desc = ((html.match(/<\/header>\s*<p>([\s\S]*?)<\/p>/) || [])[1] || '').trim();
    skills.push({ kind: m[1], cat: m[2], name, href, desc });
  }
}
const byCat = {};
for (const s of skills) (byCat[s.cat] = byCat[s.cat] || []).push(s);
for (const c of Object.keys(byCat)) byCat[c].sort((a, b) => a.name.localeCompare(b.name));

const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const cards = (list) => list.map((s) => `<a class="xcard" href="${s.href}" data-name="${esc(s.name)}" data-kind="${s.kind}"><div class="xcard-head"><code>${esc(s.name)}</code><span class="xbadge xbadge-${s.kind}">${s.kind === 'bundled' ? 'مضمّنة' : 'اختيارية'}</span></div><p>${s.desc}</p></a>`).join('');

const catOrder = Object.keys(byCat).sort((a, b) => byCat[b].length - byCat[a].length);
const skillsPage = `<header><h1>فهرس المهارات (Skills)</h1></header>
<p>كل مهارات Hermes المضمّنة والاختيارية في مكان واحد: <strong>${skills.length}</strong> مهارة موزّعة على <strong>${catOrder.length}</strong> تصنيفًا. اضغط على أي مهارة لفتح صفحتها المترجمة.</p>
<div class="theme-admonition theme-admonition-info admonition_xJq3 alert alert--info"><div class="admonitionHeading_Gvgb">معلومة</div><div class="admonitionContent_BuS1"><p>هذي الصفحة فهرس محلي للمهارات المرفقة مع Hermes. أما <a href="https://hermes-agent.nousresearch.com/docs/skills" target="_blank" rel="noopener noreferrer">Skills Hub الرسمي</a> فيعرض أكثر من 88 ألف مهارة من سجلات خارجية، ويحتاج اتصالًا بالإنترنت ومحتواه بالإنجليزية.</p></div></div>
<div class="xtools"><input type="search" id="xfilter" placeholder="ابحث باسم المهارة أو وصفها…" autocomplete="off"><span class="xcount"></span></div>
<div class="xfilters"><button type="button" class="xfbtn xfactive" data-kind="*">الكل</button><button type="button" class="xfbtn" data-kind="bundled">المضمّنة</button><button type="button" class="xfbtn" data-kind="optional">الاختيارية</button></div>
${catOrder.map((c) => `<h2 class="anchor anchorTargetStickyNavbar_Vzrq" id="cat-${c}" data-cat-head="${c}">${CAT_AR[c] || c} <span class="xcatcount">${byCat[c].length}</span></h2><div class="xgrid" data-cat="${c}">${cards(byCat[c])}</div>`).join('\n')}`;

// ---------- الإضافات ----------
const PLUGINS = [
  { n: 'hermes-telegram-business', t: 'official', d: 'وضع Telegram Business بأسلوب المراقبة مع الموافقة (بوت سكرتير): كل رد مقترح على العميل يحتاج موافقة المالك قبل إرساله.' },
  { n: 'plugin-llm-async-example', t: 'official', d: 'إضافة مرجعية غير متزامنة لـ <code>ctx.llm</code>، تسجّل الأمر <code>/translate</code> وتنفّذ الترجمة ذهابًا وإيابًا بالتوازي عبر <code>acomplete()</code>.' },
  { n: 'plugin-llm-example', t: 'official', d: 'إضافة مرجعية توضّح وصول LLM المنظّم الذي يديره المضيف عبر <code>ctx.llm.complete_structured()</code>، وتسجّل الأمر <code>/receipt-extract</code>.' },
  { n: 'snyk', t: 'official', d: 'فحص الكود (SAST) والاعتماديات وصور الحاويات والبنية التحتية كشيفرة وملفات SBOM عبر خادم MCP الرسمي لـ Snyk، مع مهارة <code>snyk-security-scan</code>. يحتاج Node.js و npm وحساب Snyk مجاني.' },
  { n: 'touchdesigner', t: 'official', d: 'تشغيل جلسة TouchDesigner حيّة عبر خادم twozero MCP، مع مهارة <code>touchdesigner-mcp</code>. يعمل TouchDesigner نفسه على macOS و Windows.' },
  { n: 'herdr-auto-reconcile', t: 'community', d: 'ينبّه Hermes عندما تحتاج أجزاء Herdr المسموح بها إلى مُطابقة، دون التحكم في عملها أو توجيهها.' },
  { n: 'hermes-plugin-chrome-profiles', t: 'community', d: 'تبديل أدوات المتصفح في Hermes بين ملفات Chrome و Edge المحلية والبعيدة عبر CDP. (أداة واحدة)' },
  { n: 'hermes-plugin-netbox', t: 'community', d: 'إدارة التغييرات في NetBox: الاستعلام عن كائنات DCIM و IPAM، وبناء diff مراجَع على مستوى الحقول، والتطبيق مع سجل وإمكانية التراجع. (5 أدوات)' },
  { n: 'hermes-rustpush-imessage', t: 'community', d: 'إضافة منصة iMessage محلية بالكامل تعتمد على sidecar من OpenBubbles RustPush يديره launchd عبر Unix socket لنفس المستخدم.' },
  { n: 'hermes-snapcompact', t: 'community', d: 'محرّك سياق Snapcompact: يؤرشف تاريخ المحادثة كإطارات PNG نقطية كثيفة تقرأها نماذج الرؤية بثلث تكلفة الـ tokens تقريبًا.' },
  { n: 'jackal-verified', t: 'community', d: 'محوّل مكتوب الأنواع لإصدار JACKAL v1.7.3 القابل لإعادة الإنتاج: 41 أداة تحقق مشتقة من الكتالوج (تحقق دقيق وعددي ومسارات محدودة مدقّقة بـ Lean وإعادة تشغيل الادعاءات).' },
];
const pluginsPage = `<header><h1>كتالوج الإضافات (Plugins)</h1></header>
<p>إضافات Hermes التي يمكنك تثبيتها بالاسم عبر أمر واحد. الإضافات <strong>الرسمية</strong> يصدرها فريق Hermes، و<strong>المجتمعية</strong> يساهم بها المستخدمون ويراجعها الفريق قبل إدراجها.</p>
<div class="theme-admonition theme-admonition-info admonition_xJq3 alert alert--info"><div class="admonitionHeading_Gvgb">معلومة</div><div class="admonitionContent_BuS1"><p>القائمة أدناه تعكس الكتالوج وقت إعداد هذه الترجمة. للاطلاع على أحدث نسخة تفاعلية راجع <a href="https://hermes-agent.nousresearch.com/docs/plugins" target="_blank" rel="noopener noreferrer">صفحة الإضافات الرسمية</a> (بالإنجليزية). ولمعرفة طريقة الإضافة والتثبيت راجع <a href="/docs/user-guide/features/plugin-catalog">كتالوج الإضافات</a> و<a href="/docs/user-guide/features/plugins">نظام الإضافات</a>.</p></div></div>
<div class="xtools"><input type="search" id="xfilter" placeholder="ابحث باسم الإضافة أو وصفها…" autocomplete="off"><span class="xcount"></span></div>
<div class="xfilters"><button type="button" class="xfbtn xfactive" data-kind="*">الكل</button><button type="button" class="xfbtn" data-kind="official">رسمية</button><button type="button" class="xfbtn" data-kind="community">مجتمعية</button></div>
<div class="xgrid" data-cat="plugins">${PLUGINS.map((p) => `<div class="xcard" data-name="${esc(p.n)}" data-kind="${p.t}"><div class="xcard-head"><code>${esc(p.n)}</code><span class="xbadge xbadge-${p.t === 'official' ? 'bundled' : 'optional'}">${p.t === 'official' ? 'رسمية' : 'مجتمعية'}</span></div><p>${p.d}</p><p class="xinstall"><code>hermes plugins install ${esc(p.n)}</code></p></div>`).join('')}</div>`;

fs.writeFileSync(path.join(W, 'extra', 'skills.html'), skillsPage);
fs.writeFileSync(path.join(W, 'extra', 'plugins.html'), pluginsPage);
console.log('skills', skills.length, 'cats', catOrder.length, '| plugins', PLUGINS.length);
