// يبني الموقع العربي الكامل متعدد الصفحات
// node build_site.js <outDir>
const fs = require('fs');
const path = require('path');
process.chdir(__dirname);

const BASE = 'https://hermes-agent.nousresearch.com';
const OUT = process.argv[2] || 'site';
const W = 'work';

const sidebar = JSON.parse(fs.readFileSync('sidebar.json', 'utf8'));
const LABELS = JSON.parse(fs.readFileSync('labels_ar.json', 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(W, 'manifest.json'), 'utf8'));
const pagesAll = JSON.parse(fs.readFileSync('pages.json', 'utf8'));

const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
const unesc = (s) => String(s).replace(/&#x27;/g, "'").replace(/&quot;/g, '"').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&');
const stripTags = (s) => String(s).replace(/<[^>]+>/g, '');
// أسماء مهارات وُلِّدت آليًا من أسماء الملفات — نعيدها لصيغتها الصحيحة
const DISPLAY = {
  'Imessage': 'iMessage', 'Findmy': 'FindMy', 'Comfyui': 'ComfyUI', 'Llama Cpp': 'llama.cpp', 'P5Js': 'p5.js',
  'Tensorrt Llm': 'TensorRT-LLM', 'Pytorch Fsdp': 'PyTorch FSDP', 'Pytorch Lightning': 'PyTorch Lightning',
  'Huggingface Hub': 'Hugging Face Hub', 'Huggingface Tokenizers': 'Hugging Face Tokenizers',
  'Evaluating Llms Harness': 'Evaluating LLMs (Harness)', 'Serving Llms Vllm': 'Serving LLMs (vLLM)',
  'Llm Wiki': 'LLM Wiki', 'Dspy': 'DSPy', 'Peft': 'PEFT', 'Trl Fine Tuning': 'TRL Fine-Tuning', 'Saelens': 'SAELens',
  'Nemo Curator': 'NeMo Curator', 'Simpo': 'SimPO', 'Clip': 'CLIP', 'Llava': 'LLaVA', 'Faiss': 'FAISS',
  'Ast Grep': 'ast-grep', 'Rss Feeds': 'RSS Feeds', 'Osint Investigation': 'OSINT Investigation', 'Qmd': 'QMD',
  'Xurl': 'xurl', 'Ascii Art': 'ASCII Art', 'Ascii Video': 'ASCII Video', 'Sdlc Review': 'SDLC Review',
  'Adversarial Ux Test': 'Adversarial UX Test', 'Design Md': 'DESIGN.md', 'Docx': 'DOCX', 'Pdf': 'PDF',
  'Xlsx': 'XLSX', 'Nano Pdf': 'Nano PDF', 'Ocr And Documents': 'OCR & Documents', 'Powerpoint': 'PowerPoint',
  'Pptx Author': 'PPTX Author', 'Dcf Model': 'DCF Model', 'Lbo Model': 'LBO Model', 'Mpp Agent': 'MPP Agent',
  'Rest Graphql Debug': 'REST & GraphQL Debug', 'Har Derived Api Client': 'HAR-derived API Client',
  'Antigravity Cli': 'Antigravity CLI', 'Inference Sh Cli': 'inference.sh CLI', 'Parallel Cli': 'Parallel CLI',
  'Stripe Link Cli': 'Stripe Link CLI', 'Fastmcp': 'FastMCP', 'Mcporter': 'MCPorter', 'Unreal Mcp': 'Unreal MCP',
  'Mcp Oauth Remote Gateway': 'MCP OAuth Remote Gateway', 'Evm': 'EVM', 'Neuroskill Bci': 'NeuroSkill BCI',
  'Duckduckgo Search': 'DuckDuckGo Search', 'Searxng Search': 'SearXNG Search', 'Gitnexus Explorer': 'GitNexus Explorer',
  'Siyuan': 'SiYuan', 'Tldraw Offline': 'tldraw Offline', 'Youtube Content': 'YouTube Content', 'Gif Search': 'GIF Search',
  'Github': 'GitHub', 'Github Auth': 'GitHub Auth', 'Github Code Review': 'GitHub Code Review',
  'Github Issue To Pr': 'GitHub Issue → PR', 'Github Issues': 'GitHub Issues', 'Github Pr Workflow': 'GitHub PR Workflow',
  'Github Repo Management': 'GitHub Repo Management', 'Pr Lens': 'PR Lens', 'Openhands': 'OpenHands',
  'Opencode': 'OpenCode', 'Openhue': 'OpenHue', 'Openclaw Migration': 'OpenClaw Migration', 'Agentmail': 'AgentMail',
  'Songwriting And Ai Music': 'Songwriting & AI Music', 'Weights And Biases': 'Weights & Biases',
  'Hermes S6 Container Supervision': 'Hermes s6 Container Supervision', 'Python Debugpy': 'Python debugpy',
  'Node Inspect Debugger': 'Node --inspect Debugger', 'Inspecting Hermes Desktop Dom': 'Inspecting Hermes Desktop DOM',
  '3 Statement Model': 'Three-Statement Model',
};
const tr = (en) => LABELS[en] || LABELS[DISPLAY[en]] || DISPLAY[en] || en;
// يطبّق خريطة الأسماء على أول <h1> في الصفحة (عنوان الصفحة المولَّد آليًا من اسم الملف)
function fixTitleH1(html) {
  return html.replace(/<h1([^>]*)>([\s\S]*?)<\/h1>/, (all, attrs, inner) => {
    const plain = unesc(stripTags(inner)).trim();
    return DISPLAY[plain] ? `<h1${attrs}>${esc(DISPLAY[plain])}</h1>` : all;
  });
}

// ---------- bidi ----------
const HAS_AR = /[؀-ۿ]/;
function bidiText(s) {
  if (!s.trim()) return s;
  if (!HAS_AR.test(s)) return /[()]/.test(s) ? `<bdi>${s}</bdi>` : s;
  return s.replace(/\(([A-Za-z0-9@][^()؀-ۿ<>]*)\)/g, '<bdi class="term">($1)</bdi>');
}
function bidiHtml(html) {
  return html
    .split(/(<pre[\s\S]*?<\/pre>|<code[\s\S]*?<\/code>|<x-keep[^>]*><\/x-keep>|<[^>]+>)/)
    .map((part, i) => (i % 2 ? part : bidiText(part)))
    .join('');
}

// ---------- الصفحات المترجمة ----------
const slugOfHref = (h) => {
  let s = h.replace(/^\/docs\/?/, '');
  if (s === '') return 'index';
  if (s.endsWith('/')) s += 'index';
  return s;
};
const built = new Map(); // slug -> {href}
const missing = [];
for (const pg of manifest) {
  const ok = pg.chunks.every((c) => fs.existsSync(path.join(W, 'ar', c.file)) && fs.statSync(path.join(W, 'ar', c.file)).size > 0);
  if (ok) built.set(pg.slug, pg); else missing.push(pg.slug);
}
built.set('index', { slug: 'index', href: '/docs/' });
const STORY_FILES = [1, 2, 3, 4].map((k) => path.join(W, 'stories', `ar_${k}.json`));
const HAS_STORIES = STORY_FILES.every((f) => fs.existsSync(f));
if (HAS_STORIES) built.set('user-stories', { slug: 'user-stories', href: '/docs/user-stories', title: 'User Stories & Use Cases' });
const EXTRA = [
  { slug: 'skills', href: '/docs/skills', title: 'فهرس المهارات (Skills)' },
  { slug: 'plugins', href: '/docs/plugins', title: 'كتالوج الإضافات (Plugins)' },
].filter((e) => fs.existsSync(path.join(W, 'extra', e.slug + '.html')));
for (const e of EXTRA) built.set(e.slug, e);

const fileOf = (slug) => slug + '.html';
const rootOf = (slug) => '../'.repeat(slug.split('/').length - 1);
function findSlug(p) {
  const cands = [];
  const clean = p.replace(/\/$/, '');
  if (p === '' || p === '/') cands.push('index');
  cands.push(clean, clean + '/index', p.endsWith('/') ? p + 'index' : null);
  return cands.find((c) => c && built.has(c));
}
function resolveHref(href, fromSlug) {
  let m = href.match(/^(?:https:\/\/hermes-agent\.nousresearch\.com)?\/docs\/?([^#?]*)([?#].*)?$/);
  if (!m) return href;
  const p = m[1] || '';
  const tail = m[2] || '';
  // ملفات llms المولَّدة بهاش يتغيّر مع كل نشر → المسار الثابت الرسمي
  if (/^assets\/files\/llms-full-[0-9a-f]+\.txt$/.test(p)) return BASE + '/docs/llms-full.txt';
  if (/^assets\/files\/llms-[0-9a-f]+\.txt$/.test(p)) return BASE + '/docs/llms.txt';
  if (/^(assets|img)\//.test(p) || /\.(txt|png|jpe?g|gif|svg|xml|json|ico|mp4|webm)$/i.test(p)) return BASE + '/docs/' + p + tail;
  const slug = findSlug(p);
  if (slug) return rootOf(fromSlug) + fileOf(slug) + tail;
  return BASE + '/docs/' + p + tail;
}
const rewriteLinks = (html, fromSlug) =>
  html.replace(/(href)="([^"]*)"/g, (all, a, h) => `${a}="${resolveHref(h, fromSlug)}"`)
      // أي وسيط (صور، فيديو، مصادر) بمسار مطلق من الموقع الأصلي
      .replace(/(\bsrc=")(\/docs\/[^"]*)"/g, (all, pre, s) => `${pre}${BASE}${s}"`)
      .replace(/(\bposter=")(\/docs\/[^"]*)"/g, (all, pre, s) => `${pre}${BASE}${s}"`);

// ---------- أصول ----------
const assetsDir = path.join(OUT, 'assets');
for (const d of ['css', 'js', 'img']) fs.mkdirSync(path.join(assetsDir, d), { recursive: true });
let css = fs.readFileSync('styles.rtl.css', 'utf8');
css = css.replace(/@import url\([^)]*\);?/g, '')
  .replace(/"Inter",-apple-system/g, '"Inter","IBM Plex Sans Arabic",-apple-system')
  .replace(/DM Sans,sans-serif/g, 'DM Sans,IBM Plex Sans Arabic,sans-serif')
  .replace(/DM Sans,-apple-system/g, 'DM Sans,IBM Plex Sans Arabic,-apple-system');
css += `
[hidden]{display:none!important}
.markdown p,.markdown li,.markdown td{line-height:1.85}
pre,.prism-code,.codeBlockLines_e6Vv,.token-line{direction:ltr;text-align:left}
.markdown code,kbd{direction:ltr;unicode-bidi:isolate}
.DocSearch-Button-Keys{direction:ltr}
.navbar__title{direction:ltr;text-align:right}
bdi.term{white-space:nowrap}
html[data-theme=light]{background-color:#fff}
.translation-note{margin-top:.5rem;font-size:.8rem;opacity:.75}
.DocSearch-Hit-path{direction:rtl}
.local-search-empty{padding:1.5rem;text-align:center;color:var(--docsearch-muted-color)}
.xtools{display:flex;align-items:center;gap:.75rem;margin:1rem 0 .5rem}
.xtools input{flex:1;padding:.6rem .9rem;border-radius:8px;border:1px solid var(--ifm-color-emphasis-300);background:var(--ifm-background-surface-color);color:inherit;font:inherit}
.xcount{font-size:.85rem;opacity:.7;white-space:nowrap}
.xfilters{display:flex;flex-wrap:wrap;gap:.4rem;margin-bottom:1.5rem}
.xfbtn{padding:.3rem .8rem;border-radius:999px;border:1px solid var(--ifm-color-emphasis-300);background:transparent;color:inherit;font:inherit;font-size:.82rem;cursor:pointer}
.xfbtn:hover{border-color:var(--ifm-color-primary)}
.xfactive{background:var(--ifm-color-primary);color:#07070d;border-color:var(--ifm-color-primary);font-weight:600}
.xgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:.9rem;margin-bottom:2rem}
.xcard{display:block;padding:.9rem 1rem;border:1px solid var(--ifm-color-emphasis-200);border-radius:10px;background:var(--ifm-background-surface-color);text-decoration:none!important;color:inherit;transition:border-color .15s,transform .15s}
a.xcard:hover{border-color:var(--ifm-color-primary);transform:translateY(-2px)}
.xcard-head{display:flex;align-items:center;gap:.5rem;justify-content:space-between;margin-bottom:.45rem}
.xcard-head code{font-size:.86rem}
.xcard p{margin:0;font-size:.86rem;line-height:1.7;opacity:.85}
.xcard .xinstall{margin-top:.6rem;font-size:.78rem;opacity:1}
.xbadge{font-size:.68rem;padding:.1rem .5rem;border-radius:999px;white-space:nowrap}
.xbadge-bundled{background:#ffd7001f;color:var(--ifm-color-primary);border:1px solid #ffd70033}
.xbadge-optional{background:var(--ifm-color-emphasis-200);border:1px solid var(--ifm-color-emphasis-300)}
.xcatcount{font-size:.8rem;opacity:.6;font-weight:400}
h2[data-cat-head]{scroll-margin-top:5rem}
`;
// خطوط محلية حتى يعمل الموقع بدون إنترنت
let fontsCss = '';
if (fs.existsSync(path.join('fonts', 'fonts.css'))) {
  fs.mkdirSync(path.join(assetsDir, 'fonts'), { recursive: true });
  for (const f of fs.readdirSync('fonts')) {
    if (f !== 'fonts.css') fs.copyFileSync(path.join('fonts', f), path.join(assetsDir, 'fonts', f));
  }
  fontsCss = fs.readFileSync(path.join('fonts', 'fonts.css'), 'utf8') + '\n';
}
fs.writeFileSync(path.join(assetsDir, 'css', 'styles.css'), fontsCss + css);
fs.copyFileSync('logo128.png', path.join(assetsDir, 'img', 'logo.png'));
fs.copyFileSync('favicon.ico', path.join(assetsDir, 'img', 'favicon.ico'));

// ---------- SVG ----------
const SVG = {
  sprite: '<svg style="display: none;"><defs><symbol id="theme-svg-external-link" viewBox="0 0 24 24"><path fill="currentColor" d="M21 13v10h-21v-19h12v2h-10v15h17v-8h2zm3-12h-10.988l4.035 4-6.977 7.07 2.828 2.828 6.977-7.07 4.125 4.172v-11z"/></symbol></defs></svg>',
  hamburger: '<svg width="30" height="30" viewBox="0 0 30 30" aria-hidden="true"><path stroke="currentColor" stroke-linecap="round" stroke-miterlimit="10" stroke-width="2" d="M4 7h22M4 15h22M4 23h22"></path></svg>',
  ext: '<svg width="13.5" height="13.5" aria-label="(يُفتح في علامة تبويب جديدة)" class="iconExternalLink_nPIU"><use href="#theme-svg-external-link"></use></svg>',
  lang: '<svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" class="iconLanguage_nlXk"><path fill="currentColor" d="M12.87 15.07l-2.54-2.51.03-.03c1.74-1.94 2.98-4.17 3.71-6.53H17V4h-7V2H8v2H1v1.99h11.17C11.5 7.92 10.44 9.75 9 11.35 8.07 10.32 7.3 9.19 6.69 8h-2c.73 1.63 1.73 3.17 2.98 4.56l-5.09 5.02L4 19l5-5 3.11 3.11.76-2.04zM18.5 10h-2L12 22h2l1.12-3h4.75L21 22h2l-4.5-12zm-2.62 7l1.62-4.33L19.12 17h-3.24z"></path></svg>',
  light: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" class="toggleIcon_g3eP lightToggleIcon_pyhR"><path fill="currentColor" d="M12,9c1.65,0,3,1.35,3,3s-1.35,3-3,3s-3-1.35-3-3S10.35,9,12,9 M12,7c-2.76,0-5,2.24-5,5s2.24,5,5,5s5-2.24,5-5 S14.76,7,12,7L12,7z M2,13l2,0c0.55,0,1-0.45,1-1s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S1.45,13,2,13z M20,13l2,0c0.55,0,1-0.45,1-1 s-0.45-1-1-1l-2,0c-0.55,0-1,0.45-1,1S19.45,13,20,13z M11,2v2c0,0.55,0.45,1,1,1s1-0.45,1-1V2c0-0.55-0.45-1-1-1S11,1.45,11,2z M11,20v2c0,0.55,0.45,1,1,1s1-0.45,1-1v-2c0-0.55-0.45-1-1-1C11.45,19,11,19.45,11,20z M5.99,4.58c-0.39-0.39-1.03-0.39-1.41,0 c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0s0.39-1.03,0-1.41L5.99,4.58z M18.36,16.95 c-0.39-0.39-1.03-0.39-1.41,0c-0.39,0.39-0.39,1.03,0,1.41l1.06,1.06c0.39,0.39,1.03,0.39,1.41,0c0.39-0.39,0.39-1.03,0-1.41 L18.36,16.95z M19.42,5.99c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06c-0.39,0.39-0.39,1.03,0,1.41 s1.03,0.39,1.41,0L19.42,5.99z M7.05,18.36c0.39-0.39,0.39-1.03,0-1.41c-0.39-0.39-1.03-0.39-1.41,0l-1.06,1.06 c-0.39,0.39-0.39,1.03,0,1.41s1.03,0.39,1.41,0L7.05,18.36z"></path></svg>',
  dark: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" class="toggleIcon_g3eP darkToggleIcon_wfgR"><path fill="currentColor" d="M9.37,5.51C9.19,6.15,9.1,6.82,9.1,7.5c0,4.08,3.32,7.4,7.4,7.4c0.68,0,1.35-0.09,1.99-0.27C17.45,17.19,14.93,19,12,19 c-3.86,0-7-3.14-7-7C5,9.07,6.81,6.55,9.37,5.51z M12,3c-4.97,0-9,4.03-9,9s4.03,9,9,9s9-4.03,9-9c0-0.46-0.04-0.92-0.1-1.36 c-0.98,1.37-2.58,2.26-4.4,2.26c-2.98,0-5.4-2.42-5.4-5.4c0-1.81,0.89-3.42,2.26-4.4C12.92,3.04,12.46,3,12,3L12,3z"></path></svg>',
  system: '<svg viewBox="0 0 24 24" width="24" height="24" aria-hidden="true" class="toggleIcon_g3eP systemToggleIcon_QzmC"><path fill="currentColor" d="m12 21c4.971 0 9-4.029 9-9s-4.029-9-9-9-9 4.029-9 9 4.029 9 9 9zm4.95-13.95c1.313 1.313 2.05 3.093 2.05 4.95s-0.738 3.637-2.05 4.95c-1.313 1.313-3.093 2.05-4.95 2.05v-14c1.857 0 3.637 0.737 4.95 2.05z"></path></svg>',
  search: '<svg width="20" height="20" class="DocSearch-Search-Icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" stroke-width="1.4"></circle><path d="m21 21-4.3-4.3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg>',
  collapse: '<g fill="#7a7a7a"><path d="M9.992 10.023c0 .2-.062.399-.172.547l-4.996 7.492a.982.982 0 01-.828.454H1c-.55 0-1-.453-1-1 0-.2.059-.403.168-.551l4.629-6.942L.168 3.078A.939.939 0 010 2.528c0-.548.45-.997 1-.997h2.996c.352 0 .649.18.828.45L9.82 9.472c.11.148.172.347.172.55zm0 0"></path><path d="M19.98 10.023c0 .2-.058.399-.168.547l-4.996 7.492a.987.987 0 01-.828.454h-3c-.547 0-.996-.453-.996-1 0-.2.059-.403.168-.551l4.625-6.942-4.625-6.945a.939.939 0 01-.168-.55 1 1 0 01.996-.997h3c.348 0 .649.18.828.45l4.996 7.492c.11.148.168.347.168.55zm0 0"></path></g>',
  home: '<svg viewBox="0 0 24 24" class="breadcrumbHomeIcon_YNFT"><path d="M10 19v-5h4v5c0 .55.45 1 1 1h3c.55 0 1-.45 1-1v-7h1.7c.46 0 .68-.57.33-.87L12.67 3.6c-.38-.34-.96-.34-1.34 0l-8.36 7.53c-.34.3-.13.87.33.87H5v7c0 .55.45 1 1 1h3c.55 0 1-.45 1-1z" fill="currentColor"></path></svg>',
  tip: '<svg viewBox="0 0 12 16"><path fill-rule="evenodd" d="M6.5 0C3.48 0 1 2.19 1 5c0 .92.55 2.25 1 3 1.34 2.25 1.78 2.78 2 4v1h5v-1c.22-1.22.66-1.75 2-4 .45-.75 1-2.08 1-3 0-2.81-2.48-5-5.5-5zm3.64 7.48c-.25.44-.47.8-.67 1.11-.86 1.41-1.25 2.06-1.45 3.23-.02.05-.02.11-.02.17H5c0-.06 0-.13-.02-.17-.2-1.17-.59-1.83-1.45-3.23-.2-.31-.42-.67-.67-1.11C2.44 6.78 2 5.65 2 5c0-2.2 2.02-4 4.5-4 1.22 0 2.36.42 3.22 1.19C10.55 2.94 11 3.94 11 5c0 .66-.44 1.78-.86 2.48zM4 14h5c-.23 1.14-1.3 2-2.5 2s-2.27-.86-2.5-2z"></path></svg>',
  edit: '<svg fill="currentColor" height="20" width="20" viewBox="0 0 40 40" class="iconEdit_Z9Sw" aria-hidden="true"><g><path d="m34.5 11.7l-3 3.1-6.3-6.3 3.1-3q0.5-0.5 1.2-0.5t1.1 0.5l3.9 3.9q0.5 0.4 0.5 1.1t-0.5 1.2z m-29.5 17.1l18.4-18.5 6.3 6.3-18.4 18.4h-6.3v-6.2z"></path></g></svg>',
  close: '<svg viewBox="0 0 15 15" width="21" height="21"><g stroke="var(--ifm-color-emphasis-600)" stroke-width="1.2"><path d="M.75.75l13.5 13.5M14.25.75L.75 14.25"></path></g></svg>',
};
// التأكد من مطابقة الأيقونات للأصل
{
  const orig = fs.readFileSync('page.html', 'utf8');
  for (const k of ['hamburger', 'lang', 'light', 'dark', 'system', 'search', 'home', 'tip', 'edit']) {
    if (!orig.includes(SVG[k])) console.warn('SVG differs from original:', k);
  }
}

// ---------- بيانات الشريط الجانبي ----------
function sideData(items) {
  return items.map((it) => {
    const o = { l: bidiText(esc(tr(it.label))) };
    if (it.href) {
      const slug = findSlug(it.href.replace(/^\/docs\/?/, ''));
      if (slug) o.f = fileOf(slug); else o.u = BASE + it.href;
      o.s = slug || null;
    }
    if (it.type === 'category') {
      o.i = sideData(it.items);
      if (!it.href) delete o.s;
    }
    return o;
  });
}
// صفحات موجودة في الموقع لكن غير مدرجة في شريطه الجانبي — ندرجها في قسمها المناسب
function injectOrphans(rawTitles) {
  const inSidebar = new Set();
  (function walk(items) { for (const it of items) { if (it.href) inSidebar.add(it.href.replace(/\/$/, '')); if (it.items) walk(it.items); } })(sidebar);
  const findCat = (labels) => {
    let node = { items: sidebar };
    for (const l of labels) {
      const next = (node.items || []).find((x) => x.type === 'category' && x.label === l);
      if (!next) return null;
      node = next;
    }
    return node;
  };
  const catFor = (slug) => {
    let m;
    if ((m = slug.match(/^user-guide\/skills\/(bundled|optional)\/([^/]+)\//))) {
      const branch = m[1] === 'bundled' ? 'Bundled' : 'Optional';
      const top = findCat(['Features', 'Skills', branch]);
      if (!top) return null;
      let sub = (top.items || []).find((x) => x.type === 'category' && x.label === m[2]);
      if (!sub) { sub = { type: 'category', label: m[2], items: [] }; top.items.push(sub); }
      return sub;
    }
    if (slug.startsWith('user-guide/skills/')) return findCat(['Features', 'Skills']);
    if (slug.startsWith('user-guide/features/')) return findCat(['Features']);
    if (slug.startsWith('user-guide/messaging/')) return findCat(['Messaging Platforms']);
    if (slug.startsWith('user-guide/')) return findCat(['Using Hermes']);
    if (slug.startsWith('guides/')) return findCat(['Guides & Tutorials']);
    if (slug.startsWith('developer-guide/')) return findCat(['Developer Guide']);
    if (slug.startsWith('reference/')) return findCat(['Reference']);
    if (slug.startsWith('integrations/')) return findCat(['Integrations']);
    return null;
  };
  let n = 0;
  for (const [slug, pg] of built) {
    if (['index', 'skills', 'plugins', 'user-stories'].includes(slug)) continue;
    const href = (pg.href || '/docs/' + slug).replace(/\/$/, '');
    if (inSidebar.has(href) || inSidebar.has(href + '/')) continue;
    const cat = catFor(slug);
    if (!cat) continue;
    cat.items.push({ type: 'link', href: pg.href || '/docs/' + slug, label: rawTitles.get(slug) || slug.split('/').pop() });
    n++;
  }
  return n;
}

// ---------- قوالب مشتركة ----------
const colorToggle = `<div class="toggle_vylO colorModeToggle_DEke"><button class="clean-btn toggleButton_gllP color-mode-btn" type="button" title="وضع النظام" aria-label="التبديل بين الوضع الداكن والفاتح (الوضع الحالي: وضع النظام)">${SVG.light}${SVG.dark}${SVG.system}</button></div>`;

function navbar(root, enHref) {
  const brand = `<a class="navbar__brand" href="${root}index.html"><div class="navbar__logo"><img src="${root}assets/img/logo.png" alt="Hermes Agent" class="themedComponent_mlkZ themedComponent--light_NVdE"><img src="${root}assets/img/logo.png" alt="Hermes Agent" class="themedComponent_mlkZ themedComponent--dark_xIcU"></div><b class="navbar__title text--truncate">Hermes Agent</b></a>`;
  const zh = BASE + '/docs/zh-Hans/' + enHref.replace(/^\/docs\/?/, '');
  const langItems = (cls) => `<li><a href="#" class="${cls} ${cls}--active" lang="ar">العربية</a></li><li><a href="${BASE}${enHref}" target="_self" rel="noopener noreferrer" class="${cls}" lang="en">English</a></li><li><a href="${zh}" target="_self" rel="noopener noreferrer" class="${cls}" lang="zh-Hans">简体中文</a></li>`;
  const primaryMobile = `<ul class="menu__list">
<li class="menu__list-item"><a aria-current="page" class="menu__link menu__link--active" href="${root}index.html">الوثائق</a></li>
<li class="menu__list-item"><a class="menu__link" href="${root}skills.html">المهارات</a></li>
<li class="menu__list-item"><a class="menu__link" href="${root}plugins.html">الإضافات</a></li>
<li class="menu__list-item"><a href="${BASE}/" target="_blank" rel="noopener noreferrer" class="menu__link">التنزيل${SVG.ext}</a></li>
<li class="menu__list-item menu__list-item--collapsed"><a role="button" aria-expanded="false" class="menu__link menu__link--sublist menu__link--sublist-caret" href="#">${SVG.lang}العربية</a><ul class="menu__list" hidden>${langItems('menu__link')}</ul></li>
<li class="menu__list-item"><a href="${BASE}" target="_blank" rel="noopener noreferrer" class="menu__link">الرئيسية${SVG.ext}</a></li>
<li class="menu__list-item"><a href="https://github.com/NousResearch/hermes-agent" target="_blank" rel="noopener noreferrer" class="menu__link">GitHub${SVG.ext}</a></li>
<li class="menu__list-item"><a href="https://discord.gg/NousResearch" target="_blank" rel="noopener noreferrer" class="menu__link">Discord${SVG.ext}</a></li>
</ul>`;
  return `<nav aria-label="القائمة الرئيسية" class="theme-layout-navbar navbar navbar--fixed-top"><div class="navbar__inner"><div class="theme-layout-navbar-left navbar__items"><button aria-label="إظهار أو إخفاء شريط التنقل" aria-expanded="false" class="navbar__toggle clean-btn" type="button">${SVG.hamburger}</button>${brand}<a aria-current="page" class="navbar__item navbar__link navbar__link--active" href="${root}index.html">الوثائق</a><a class="navbar__item navbar__link" href="${root}skills.html">المهارات</a><a class="navbar__item navbar__link" href="${root}plugins.html">الإضافات</a><a href="${BASE}/" target="_blank" rel="noopener noreferrer" class="navbar__item navbar__link">التنزيل${SVG.ext}</a></div><div class="theme-layout-navbar-right navbar__items navbar__items--right"><div class="navbar__item dropdown dropdown--hoverable dropdown--right"><a href="#" aria-haspopup="true" aria-expanded="false" role="button" class="navbar__link">${SVG.lang}العربية</a><ul class="dropdown__menu">${langItems('dropdown__link')}</ul></div><a href="${BASE}" target="_blank" rel="noopener noreferrer" class="navbar__item navbar__link">الرئيسية${SVG.ext}</a><a href="https://github.com/NousResearch/hermes-agent" target="_blank" rel="noopener noreferrer" class="navbar__item navbar__link">GitHub${SVG.ext}</a><a href="https://discord.gg/NousResearch" target="_blank" rel="noopener noreferrer" class="navbar__item navbar__link">Discord${SVG.ext}</a>${colorToggle}<div class="navbarSearchContainer_Bca1"><button type="button" class="DocSearch DocSearch-Button search-btn" aria-label="بحث (Ctrl+K)" aria-keyshortcuts="Control+k"><span class="DocSearch-Button-Container">${SVG.search}<span class="DocSearch-Button-Placeholder">بحث</span></span><span class="DocSearch-Button-Keys"><kbd class="DocSearch-Button-Key DocSearch-Button-Key--ctrl">Ctrl</kbd><kbd class="DocSearch-Button-Key">K</kbd></span></button></div></div></div><div role="presentation" class="navbar-sidebar__backdrop"></div><div class="navbar-sidebar"><div class="navbar-sidebar__brand">${brand}${colorToggle}<button type="button" aria-label="إغلاق شريط التنقل" class="clean-btn navbar-sidebar__close">${SVG.close}</button></div><div class="navbar-sidebar__items navbar-sidebar__items--show-secondary"><div class="navbar-sidebar__item menu">${primaryMobile}</div><div class="navbar-sidebar__item menu"><button type="button" class="clean-btn navbar-sidebar__back">→ العودة إلى القائمة الرئيسية</button><ul class="theme-doc-sidebar-menu menu__list" data-sidebar></ul></div></div></div></nav>`;
}

function footer(root, slug, enHref) {
  const L = (p) => resolveHref(p, slug);
  return `<footer class="theme-layout-footer footer footer--dark"><div class="container container-fluid"><div class="row footer__links">
<div class="theme-layout-footer-column col footer__col"><div class="footer__title">الوثائق</div><ul class="footer__items clean-list"><li class="footer__item"><a class="footer__link-item" href="${L('/docs/getting-started/quickstart')}">البدء</a></li><li class="footer__item"><a class="footer__link-item" href="${L('/docs/user-guide/cli')}">دليل المستخدم</a></li><li class="footer__item"><a class="footer__link-item" href="${L('/docs/developer-guide/architecture')}">دليل المطوّر</a></li><li class="footer__item"><a class="footer__link-item" href="${L('/docs/reference/cli-commands')}">المرجع</a></li></ul></div>
<div class="theme-layout-footer-column col footer__col"><div class="footer__title">المجتمع</div><ul class="footer__items clean-list"><li class="footer__item"><a href="https://discord.gg/NousResearch" target="_blank" rel="noopener noreferrer" class="footer__link-item">Discord${SVG.ext}</a></li><li class="footer__item"><a href="https://github.com/NousResearch/hermes-agent/issues" target="_blank" rel="noopener noreferrer" class="footer__link-item">GitHub Issues${SVG.ext}</a></li><li class="footer__item"><a href="https://agentskills.io" target="_blank" rel="noopener noreferrer" class="footer__link-item">Skills Hub${SVG.ext}</a></li></ul></div>
<div class="theme-layout-footer-column col footer__col"><div class="footer__title">المزيد</div><ul class="footer__items clean-list"><li class="footer__item"><a href="${BASE}/" target="_blank" rel="noopener noreferrer" class="footer__link-item">تنزيل Desktop${SVG.ext}</a></li><li class="footer__item"><a href="https://github.com/NousResearch/hermes-agent" target="_blank" rel="noopener noreferrer" class="footer__link-item">GitHub${SVG.ext}</a></li><li class="footer__item"><a href="https://nousresearch.com" target="_blank" rel="noopener noreferrer" class="footer__link-item">Nous Research${SVG.ext}</a></li></ul></div>
</div><div class="footer__bottom text--center"><div class="footer__copyright">من تطوير <a href="https://nousresearch.com">Nous Research</a> · رخصة MIT · 2026</div><div class="footer__copyright translation-note">ترجمة عربية غير رسمية (نسخة معدّلة بالترجمة) <a href="${BASE}${enHref}">للصفحة الأصلية</a> · Copyright (c) 2025 Nous Research · <a href="${root}LICENSE.txt">MIT License</a></div></div></div></footer>`;
}

const themeInit = `!function(){var t;try{t=localStorage.getItem("theme")}catch(e){}var d=document.documentElement;d.setAttribute("data-theme",t||(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"));d.setAttribute("data-theme-choice",t||"system")}();`;

function page({ slug, title, enHref, article, toc, editUrl, pagination }) {
  const root = rootOf(slug);
  const tocCol = toc ? `<div class="col col--3"><div class="tableOfContents_bqdL thin-scrollbar theme-doc-toc-desktop"><ul class="table-of-contents table-of-contents__left-border">${toc}</ul></div></div>` : '';
  const tocMobile = toc ? `<div class="tocCollapsible_ETCw theme-doc-toc-mobile tocMobile_ITEo"><button type="button" class="clean-btn tocCollapsibleButton_TO0P">في هذه الصفحة</button><div class="tocCollapsibleContent_vkbj" hidden><ul class="table-of-contents">${toc}</ul></div></div>` : '';
  const [breadcrumbs, markdown] = article;
  return `<!doctype html>
<!-- ترجمة عربية غير رسمية لوثائق Hermes Agent (${BASE}${enHref}) · Copyright (c) 2025 Nous Research · MIT License — راجع LICENSE.txt -->
<html lang="ar" dir="rtl" class="docs-wrapper plugin-docs plugin-id-default docs-version-current docs-doc-page" data-theme="dark" data-theme-choice="system" data-root="${root}" data-slug="${slug}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title} | Hermes Agent</title>
<meta property="og:title" content="${title} | Hermes Agent">
<meta property="og:locale" content="ar">
<link rel="icon" href="${root}assets/img/favicon.ico">
<link rel="stylesheet" href="${root}assets/css/styles.css">
<script>${themeInit}</script>
<script src="${root}assets/js/data.js"></script>
</head>
<body>
${SVG.sprite}
<div id="__docusaurus"><div role="region" aria-label="تخطَّ إلى المحتوى الرئيسي"><a class="skipToContent_fXgn" href="#__docusaurus_skipToContent_fallback">تخطَّ إلى المحتوى الرئيسي</a></div>
${navbar(root, enHref)}
<div id="__docusaurus_skipToContent_fallback" class="theme-layout-main main-wrapper mainWrapper_z2l0"><div class="docsWrapper_hBAB"><button aria-label="العودة إلى الأعلى" class="clean-btn theme-back-to-top-button backToTopButton_sjWU" type="button"></button><div class="docRoot_UBD9"><aside class="theme-doc-sidebar-container docSidebarContainer_YfHR"><div class="sidebarViewport_aRkj"><div class="sidebar_njMd"><nav aria-label="الشريط الجانبي للوثائق" class="menu thin-scrollbar menu_SIkG"><ul class="theme-doc-sidebar-menu menu__list" data-sidebar></ul></nav><button type="button" title="طي الشريط الجانبي" aria-label="طي الشريط الجانبي" class="button button--secondary button--outline collapseSidebarButton_PEFL"><svg width="20" height="20" aria-hidden="true" class="collapseSidebarButtonIcon_kv0_">${SVG.collapse}</svg></button></div><div class="expandButton_TmdG" title="توسيع الشريط الجانبي" aria-label="توسيع الشريط الجانبي" tabindex="0" role="button" hidden><svg width="20" height="20" aria-hidden="true" class="expandButtonIcon_i1dp">${SVG.collapse}</svg></div></div></aside><script>HermesAR.renderSidebars()</script><main class="docMainContainer_TBSr"><div class="container padding-top--md padding-bottom--lg"><div class="row"><div class="col${toc ? ' docItemCol_VOVn' : ''}"><div class="docItemContainer_Djhp"><article>${breadcrumbs}${tocMobile}<div class="theme-doc-markdown markdown">${markdown}</div><footer class="theme-doc-footer docusaurus-mt-lg"><div class="row margin-top--sm theme-doc-footer-edit-meta-row"><div class="col noPrint_WFHX"><a href="${editUrl}" target="_blank" rel="noopener noreferrer" class="theme-edit-this-page">${SVG.edit}تعديل هذه الصفحة</a></div><div class="col lastUpdated_JAkA"></div></div></footer></article>${pagination}</div></div>${tocCol}</div></div></main></div></div></div>
${footer(root, slug, enHref)}
</div>
<script src="${root}assets/js/app.js"></script>
</body>
</html>
`;
}

// ---------- ترتيب الشريط الجانبي (مسار التنقل وسابق/تالي للصفحات المُدرجة تلقائيًا) ----------
let flatSidebar = []; // [{ slug, chain: [category labels] }] بترتيب الشريط الجانبي
function flattenSidebar() {
  flatSidebar = [];
  const seen = new Set();
  (function walk(items, chain) {
    for (const it of items) {
      if (it.href) {
        const slug = findSlug(it.href.replace(/^\/docs\/?/, ''));
        if (slug && !seen.has(slug)) { seen.add(slug); flatSidebar.push({ slug, chain }); }
      }
      if (it.items) walk(it.items, chain.concat(it.label));
    }
  })(sidebar, []);
}
const chainOf = (slug) => (flatSidebar.find((x) => x.slug === slug) || {}).chain || null;
function neighborsOf(slug) {
  const i = flatSidebar.findIndex((x) => x.slug === slug);
  if (i < 0) return {};
  return { prev: i > 0 ? flatSidebar[i - 1].slug : null, next: i < flatSidebar.length - 1 ? flatSidebar[i + 1].slug : null };
}

// ---------- أجزاء الصفحة من الأصل ----------
function breadcrumbsFrom(raw, slug, arTitle) {
  const root = rootOf(slug);
  const m = raw.match(/<ul class="breadcrumbs">([\s\S]*?)<\/ul><\/nav>/);
  let items = '';
  if (m) {
    const lis = [...m[1].matchAll(/<li class="(breadcrumbs__item[^"]*)">([\s\S]*?)<\/li>/g)];
    for (const [, cls, inner] of lis) {
      if (inner.includes('breadcrumbHomeIcon')) {
        items += `<li class="breadcrumbs__item"><a aria-label="الصفحة الرئيسية" class="breadcrumbs__link" href="${root}index.html">${SVG.home}</a></li>`;
        continue;
      }
      const a = inner.match(/<a class="breadcrumbs__link" href="([^"]*)">([\s\S]*?)<\/a>/);
      const sp = inner.match(/<span class="breadcrumbs__link">([\s\S]*?)<\/span>/);
      const en = unesc(stripTags((a ? a[2] : sp ? sp[1] : '')));
      const label = cls.includes('--active') ? (LABELS[en] ? esc(LABELS[en]) : arTitle) : esc(tr(en));
      items += a
        ? `<li class="${cls}"><a class="breadcrumbs__link" href="${resolveHref(a[1], slug)}">${bidiText(label)}</a></li>`
        : `<li class="${cls}"><span class="breadcrumbs__link">${bidiText(label)}</span></li>`;
    }
  } else {
    items = `<li class="breadcrumbs__item"><a aria-label="الصفحة الرئيسية" class="breadcrumbs__link" href="${root}index.html">${SVG.home}</a></li>`;
    // الأصل بلا مسار تنقل (صفحة خارج شريطه الجانبي) — نشتقه من موضعها في شريطنا الجانبي
    const chain = chainOf(slug);
    if (chain) {
      for (const l of chain) items += `<li class="breadcrumbs__item"><span class="breadcrumbs__link">${bidiText(esc(tr(l)))}</span></li>`;
      items += `<li class="breadcrumbs__item breadcrumbs__item--active"><span class="breadcrumbs__link">${bidiText(arTitle)}</span></li>`;
    }
  }
  return `<nav class="theme-doc-breadcrumbs breadcrumbsContainer_Z_bl" aria-label="مسار التنقل"><ul class="breadcrumbs">${items}</ul></nav>`;
}
function paginationFrom(raw, slug, titles) {
  const m = raw.match(/<nav class="docusaurus-mt-lg pagination-nav"[^>]*>([\s\S]*?)<\/nav>/);
  const links = m ? [...m[1].matchAll(/<a class="(pagination-nav__link pagination-nav__link--(prev|next))" href="([^"]*)">[\s\S]*?<div class="pagination-nav__label">([\s\S]*?)<\/div><\/a>/g)] : [];
  let html;
  if (links.length) {
    html = links.map(([, cls, dir, href, label]) => {
      const en = unesc(stripTags(label));
      const tslug = findSlug(href.replace(/^\/docs\/?/, ''));
      const ar = LABELS[en] ? esc(LABELS[en]) : (tslug && titles.get(tslug)) || esc(en);
      return `<a class="${cls}" href="${resolveHref(href, slug)}"><div class="pagination-nav__sublabel">${dir === 'prev' ? 'السابق' : 'التالي'}</div><div class="pagination-nav__label">${bidiText(ar)}</div></a>`;
    }).join('');
  } else {
    // الأصل بلا سابق/تالي — نشتقهما من ترتيب شريطنا الجانبي
    const { prev, next } = neighborsOf(slug);
    const mk = (dir, tslug) => tslug
      ? `<a class="pagination-nav__link pagination-nav__link--${dir}" href="${rootOf(slug)}${fileOf(tslug)}"><div class="pagination-nav__sublabel">${dir === 'prev' ? 'السابق' : 'التالي'}</div><div class="pagination-nav__label">${bidiText(titles.get(tslug) || esc(tslug))}</div></a>`
      : '';
    html = mk('prev', prev) + mk('next', next);
  }
  return `<nav class="docusaurus-mt-lg pagination-nav" aria-label="صفحات الوثائق">${html}</nav>`;
}
function tocFrom(raw, headings) {
  const m = raw.match(/<ul class="table-of-contents table-of-contents__left-border">([\s\S]*?)<\/ul><\/div><\/div>/);
  if (!m) return '';
  return m[1].replace(/<a href="#([^"]+)" class="table-of-contents__link toc-highlight">([\s\S]*?)<\/a>/g, (all, id, en) => {
    const h = headings.get(id);
    return `<a href="#${id}" class="table-of-contents__link toc-highlight">${h != null ? h : en}</a>`;
  });
}
function addHashLinks(html) {
  return html.replace(/<(h[1-6])\b([^>]*\bclass="anchor[^"]*"[^>]*\bid="([^"]+)"[^>]*)>([\s\S]*?)<\/\1>/g, (all, tag, attrs, id, inner) => {
    const t = esc(unesc(stripTags(inner)).trim());
    return `<${tag}${attrs}>${inner}<a href="#${id}" class="hash-link" aria-label="رابط مباشر إلى ${t}" title="رابط مباشر إلى ${t}" translate="no">​</a></${tag}>`;
  });
}
function headingsOf(html) {
  const map = new Map();
  for (const m of html.matchAll(/<(h[2-6])\b[^>]*\bid="([^"]+)"[^>]*>([\s\S]*?)<\/\1>/g)) map.set(m[2], m[3]);
  return map;
}

// ---------- بناء الصفحات ----------
const titles = new Map(); // slug -> Arabic title (escaped html text)
const rawTitles = new Map(); // slug -> Arabic title (plain text)
const search = [];
const contents = new Map();
for (const [slug, pg] of built) {
  if (slug === 'index' || slug === 'user-stories' || EXTRA.some((e) => e.slug === slug)) continue;
  const keep = JSON.parse(fs.readFileSync(path.join(W, 'keep', slug.replace(/\//g, '__') + '.json'), 'utf8'));
  let html = pg.chunks.map((c) => fs.readFileSync(path.join(W, 'ar', c.file), 'utf8')).join('');
  html = html.replace(/[‎‏]/g, '');
  html = bidiHtml(html);
  html = html.replace(/ data-ext\b/g, ' target="_blank" rel="noopener noreferrer"');
  html = html.replace(/<x-keep id="(\d+)"><\/x-keep>/g, (all, n) => keep[+n]);
  html = rewriteLinks(html, slug);
  html = fixTitleH1(html);
  const h1 = (html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/) || [])[1];
  const title = h1 ? esc(unesc(stripTags(h1)).trim()) : esc(tr(pg.title));
  titles.set(slug, title);
  rawTitles.set(slug, unesc(stripTags(h1 || tr(pg.title))).trim());
  contents.set(slug, html);
}
// الصفحة الرئيسية
{
  let content = fs.readFileSync('content_ar.html', 'utf8');
  content = content.replace(/\{\{H([234]):([^:]+):([^}]+)\}\}/g, (_, n, id, text) => `<h${n} class="anchor anchorTargetStickyNavbar_Vzrq" id="${id}">${text}</h${n}>`);
  content = content.split('{{COPY_BTN}}').join('').split('{{TIP_ICON}}').join(SVG.tip);
  content = bidiHtml(content);
  content = rewriteLinks(content, 'index');
  contents.set('index', content);
  titles.set('index', 'وثائق Hermes Agent');
  rawTitles.set('index', 'وثائق Hermes Agent');
}

// صفحة قصص المستخدمين: عناوين مترجمة + ملخصات عربية قصيرة + رابط المنشور الأصلي
if (HAS_STORIES) {
  const T = JSON.parse(fs.readFileSync(path.join(W, 'stories', 'tiles.json'), 'utf8'));
  const AR = new Map(STORY_FILES.flatMap((f) => JSON.parse(fs.readFileSync(f, 'utf8'))).map((x) => [x.i, x]));
  const CATS = {
    'All': 'الكل', 'Dev Workflow': 'سير عمل التطوير', 'Personal Assistant': 'مساعد شخصي', 'Integrations': 'التكاملات',
    'Creative': 'الإبداع', 'Business Ops': 'عمليات الأعمال', 'Meta &amp; Ecosystem': 'المنظومة والمجتمع',
    'Cost Optimization': 'خفض التكاليف', 'Privacy &amp; Self-Hosted': 'الخصوصية والاستضافة الذاتية',
    'Content Creation': 'صناعة المحتوى', 'Research': 'البحث', 'Enterprise': 'المؤسسات', 'Messaging': 'المراسلة',
    'General': 'عام', 'Trading &amp; Markets': 'التداول والأسواق', 'Marketing': 'التسويق',
  };
  const SRCS = { 'All sources': 'كل المصادر', 'Blog': 'مدونة', 'Podcast': 'بودكاست' };
  const trCat = (c) => CATS[c] || c;
  const trSrc = (c) => SRCS[c] || c;

  let pre = T.pre;
  pre = pre.replace('<h1>User Stories &amp; Use Cases</h1>', '<h1>قصص المستخدمين وحالات الاستخدام</h1>');
  pre = pre.replace(/<p>What the Hermes Agent community[\s\S]*?<\/p>/, '<p>ما يبنيه مجتمع Hermes Agent فعليًا. كل بطاقة أدناه مرتبطة بمنشور أو issue أو فيديو أو gist حقيقي يشرح فيه صاحبه كيف يستخدم Hermes، وقد جُمعت من X و GitHub و Reddit و Hacker News و YouTube والمدونات والبودكاست. تعرض كل بطاقة ملخصًا عربيًا قصيرًا بصياغتنا؛ اضغط على البطاقة لقراءة المنشور الأصلي كاملًا عند صاحبه.</p>');
  pre = pre.replace('<span><strong>326</strong> stories</span><span><strong>15</strong> categories</span><span><strong>11</strong> sources</span>', '<span><strong>326</strong> قصة</span><span><strong>15</strong> تصنيفًا</span><span><strong>11</strong> مصدرًا</span>');
  let group = 0;
  pre = pre.replace(/<div class="filters_hmDD"[^>]*>[\s\S]*?<\/div>/g, (block) => {
    group++;
    return block.replace(/<button type="button" class="(filterBtn_OcS4[^"]*)"( style="[^"]*")?>([^<]*)/g, (all, cls, style, label) => {
      const key = label === 'All' || label === 'All sources' ? '*' : label;
      const text = group === 1 ? trCat(label) : trSrc(label);
      return `<button type="button" class="${cls}"${style || ''} data-story-${group === 1 ? 'cat' : 'src'}="${key}">${text}`;
    });
  });

  const tiles = T.tiles.map((t, i) => {
    const x = AR.get(i);
    const cat = t.match(/catTag_Iw2e">([^<]*)</)[1];
    const src = t.match(/<\/span>([^<]*)<\/span><span class="catTag_Iw2e">/)[1];
    return t
      .replace('<a class="tile_PdK3', `<a data-cat="${cat}" data-src="${src}" class="tile_PdK3`)
      .replace(/(<span class="catTag_Iw2e">)[^<]*/, `$1${trCat(cat)}`)
      .replace(/(<\/span>)([^<]*)(<\/span><span class="catTag_Iw2e">)/, (all, a, s, b) => a + trSrc(s) + b)
      .replace(/(<h3 class="headline_pbFy">)[\s\S]*?(<\/h3>)/, `$1${esc(x.h)}$2`)
      .replace(/(<p class="quote_nTVj">)[\s\S]*?(<\/p>)/, `$1${esc(x.s)}$2`)
      .replace(/(<span class="author_pjbp")>/, '$1 dir="ltr">')
      .replace(/<!-- -->/g, '');
  });
  const tail = '</div><div class="footer_Y73n">بنيت شيئًا باستخدام Hermes؟ <a href="https://github.com/NousResearch/hermes-agent/edit/main/website/src/data/userStories.json" target="_blank" rel="noopener noreferrer">أضف قصتك إلى هذه الصفحة</a> بتعديل <code>userStories.json</code>، أو انشرها في <a href="https://discord.gg/NousResearch" target="_blank" rel="noopener noreferrer">Discord الخاص بـ Nous Research</a> وسنضيفها.</div></div></div>';
  let content = pre.replace('<div class="theme-doc-markdown markdown">', '') + '<div class="grid_obPV">' + tiles.join('') + tail;
  content = content.replace(/<\/div>$/, '');
  content = bidiHtml(content);
  content = rewriteLinks(content, 'user-stories');
  contents.set('user-stories', content);
  titles.set('user-stories', 'قصص المستخدمين وحالات الاستخدام');
}

// صفحتا فهرس المهارات وكتالوج الإضافات
for (const e of EXTRA) {
  let html = fs.readFileSync(path.join(W, 'extra', e.slug + '.html'), 'utf8');
  html = rewriteLinks(bidiHtml(html), e.slug);
  contents.set(e.slug, html);
  titles.set(e.slug, e.title);
  rawTitles.set(e.slug, e.title);
}

// إدراج الصفحات اليتيمة في الشريط الجانبي قبل بناء الصفحات حتى يُشتق منه مسار التنقل وسابق/تالي
const injected = injectOrphans(rawTitles);
flattenSidebar();

let count = 0;
for (const [slug, pg] of built) {
  const raw = fs.readFileSync(path.join('raw', slug + '.html'), 'utf8');
  let html = addHashLinks(contents.get(slug));
  const headings = headingsOf(contents.get(slug));
  const toc = slug === 'index' ? '' : tocFrom(raw, headings);
  const editUrl = (raw.match(/<a href="([^"]+)" target="_blank" rel="noopener noreferrer" class="theme-edit-this-page">/) || [])[1] || 'https://github.com/NousResearch/hermes-agent';
  const title = titles.get(slug);
  const out = page({
    slug,
    title,
    enHref: pg.href,
    article: [breadcrumbsFrom(raw, slug, title), html],
    toc,
    editUrl,
    pagination: slug === 'index' ? '<nav class="docusaurus-mt-lg pagination-nav" aria-label="صفحات الوثائق"></nav>' : paginationFrom(raw, slug, titles),
  });
  const file = path.join(OUT, fileOf(slug));
  fs.mkdirSync(path.dirname(file), { recursive: true });
  fs.writeFileSync(file, out);
  count++;
  const heads = [...headings.entries()].map(([id, h]) => [id, unesc(stripTags(h)).trim()]).slice(0, 60);
  search.push([fileOf(slug), unesc(title), DISPLAY[pg.title] || unesc(pg.title || ''), heads]);
}

// ---------- JS ----------
const SIDE = sideData(sidebar);
console.log('orphan pages added to sidebar:', injected);
fs.writeFileSync(path.join(assetsDir, 'js', 'data.js'), `window.HermesAR={sidebar:${JSON.stringify(SIDE)}};\n` + fs.readFileSync('site_sidebar.js', 'utf8'));
fs.writeFileSync(path.join(assetsDir, 'js', 'search-index.js'), `window.HermesSearch=${JSON.stringify(search)};`);
fs.copyFileSync('site_app.js', path.join(assetsDir, 'js', 'app.js'));

// ---------- الترخيص ----------
fs.writeFileSync(path.join(OUT, 'LICENSE.txt'), `ترجمة عربية غير رسمية لوثائق Hermes Agent
المصدر الأصلي: ${BASE}/docs/
الكود المصدري للوثائق: https://github.com/NousResearch/hermes-agent/tree/main/website/docs

هذه نسخة معدّلة: تُرجم النص إلى العربية وأُعيد تنسيق الصفحات لاتجاه RTL.
بعض صفحات المهارات (Skills) تذكر ترخيصها الخاص في جدول بياناتها (مثل Apache-2.0)، وتبقى خاضعة لذلك الترخيص.

MIT License

Copyright (c) 2025 Nous Research

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`);

fs.writeFileSync(path.join(OUT, 'اقرأني.md'), `# وثائق Hermes Agent بالعربية

ترجمة عربية غير رسمية لوثائق Hermes Agent. افتح \`index.html\` في المتصفح.

## المحتويات

- \`index.html\` — الصفحة الرئيسية.
- \`skills.html\` — فهرس كل المهارات المضمّنة والاختيارية، مع بحث وتصفية.
- \`plugins.html\` — كتالوج الإضافات.
- \`user-stories.html\` — قصص المستخدمين (عناوين مترجمة وملخصات عربية، والرابط يفتح المنشور الأصلي).
- باقي المجلدات — صفحات الوثائق مرتّبة بنفس مسارات الموقع الأصلي.
- \`assets/\` — التصميم والخطوط والقوائم والبحث. لازم يبقى بجانب الصفحات.

## يعمل بدون إنترنت

الخطوط مضمّنة داخل \`assets/fonts\`، والبحث يعمل محليًا. تحتاج إنترنت فقط لفتح الروابط الخارجية والصور ومقاطع الفيديو المضمّنة.

## صفحات تبقى بالإنجليزية

- صفحتا Godmode و Obliteratus (أدلة تعطيل حماية النماذج، استُثنيت عمدًا).
- أي صفحة أضيفت للموقع الأصلي بعد تاريخ هذه الترجمة.

## تحديث الترجمة لاحقًا

أدوات البناء موجودة في مجلد \`hermes-agent-docs-ar-tools\`. من داخله:

    node update.js            # يفحص sitemap.xml للموقع الأصلي ويعرض الصفحات الجديدة والمتغيّرة والمحذوفة
    node update.js --apply    # ينزّل التغييرات ويجهّز دفعات الترجمة في work/update_batches.json

ثم تُترجم الدفعات (عبر وكلاء الترجمة بنفس دليل \`work/GUIDE.md\`)، وأخيرًا:

    node build_site.js "مسار مجلد الموقع"

## الترخيص

الوثائق الأصلية من Nous Research بترخيص MIT (وبعض صفحات المهارات بترخيص Apache-2.0). راجع \`LICENSE.txt\`.
`);

console.log('built pages', count, '| not yet translated', missing.length);
