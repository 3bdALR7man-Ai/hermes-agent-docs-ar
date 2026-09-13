// التحقق من ملفات الترجمة: node validate.js <file.html> [...]
// كل ملف في work/src يقابله ملف في work/ar بنفس الاسم.
// يفشل إذا: الملف غير موجود، أو تغيّرت الوسوم/الخصائص أو ترتيبها، أو تغيّر محتوى <code>، أو بقي نص إنجليزي كامل بلا ترجمة بكثرة.
const fs = require('fs');
const path = require('path');
const W = __dirname;

const AR = /[؀-ۿ]/;
const tagsOf = (h) => (h.match(/<\/?[a-zA-Z][^>]*>/g) || []).map((t) => t.replace(/\s+/g, ' ').replace(/\s*(\/?)>$/, '$1>'));
const codesOf = (h) => (h.match(/<code\b[^>]*>[\s\S]*?<\/code>/g) || []);
function textBlocks(h) {
  const noCode = h.replace(/<code\b[^>]*>[\s\S]*?<\/code>/g, ' ').replace(/<x-keep[^>]*><\/x-keep>/g, ' ');
  return noCode.split(/<\/?(?:p|li|td|th|h[1-6]|div|summary|blockquote|dt|dd|header|figcaption)\b[^>]*>/)
    .map((s) => s.replace(/<[^>]+>/g, ' ').replace(/&[a-z#0-9]+;/gi, ' ').replace(/\s+/g, ' ').trim())
    .filter(Boolean);
}
function englishWords(s) {
  return (s.match(/[A-Za-z][A-Za-z'’-]{2,}/g) || []).length;
}

const files = process.argv.slice(2).map((f) => path.basename(f));
if (!files.length) { console.log('usage: node validate.js <chunk-file.html> ...'); process.exit(2); }
let failed = 0;
for (const f of files) {
  const srcP = path.join(W, 'src', f);
  const arP = path.join(W, 'ar', f);
  const problems = [];
  const warnings = [];
  if (!fs.existsSync(srcP)) { console.log(`✗ ${f}: no such source file`); failed++; continue; }
  if (!fs.existsSync(arP) || fs.statSync(arP).size === 0) { console.log(`✗ ${f}: translation missing (work/ar/${f})`); failed++; continue; }
  const src = fs.readFileSync(srcP, 'utf8');
  const ar = fs.readFileSync(arP, 'utf8');

  if (/^\s*```/.test(ar)) problems.push('output starts with a markdown fence — write raw HTML only');

  const ts = tagsOf(src), ta = tagsOf(ar);
  const n = Math.max(ts.length, ta.length);
  for (let i = 0; i < n; i++) {
    if (ts[i] !== ta[i]) {
      problems.push(`tag #${i + 1} differs: expected ${JSON.stringify(ts[i] || '(end of file)')} but found ${JSON.stringify(ta[i] || '(end of file)')} (source has ${ts.length} tags, translation has ${ta.length}). Previous tag: ${JSON.stringify(ts[i - 1] || '')}`);
      break;
    }
  }

  const cs = codesOf(src), ca = codesOf(ar);
  if (cs.length === ca.length) {
    for (let i = 0; i < cs.length; i++) {
      if (cs[i] !== ca[i]) { problems.push(`inline <code> #${i + 1} was changed: expected ${JSON.stringify(cs[i])} but found ${JSON.stringify(ca[i])}`); break; }
    }
  }

  const bs = textBlocks(src);
  const srcEnglish = bs.filter((b) => englishWords(b) >= 4).length;
  const untranslated = textBlocks(ar).filter((b) => !AR.test(b) && englishWords(b) >= 6);
  if (srcEnglish > 0 && !AR.test(ar)) problems.push('no Arabic text found — the file was not translated');
  else if (untranslated.length) {
    const msg = `${untranslated.length} text block(s) with no Arabic (fine only for pure names/identifiers/lists of product names): ` + untranslated.slice(0, 5).map((u) => JSON.stringify(u.slice(0, 90))).join(' | ');
    if (untranslated.length > Math.max(3, srcEnglish * 0.15)) problems.push(msg); else warnings.push(msg);
  }

  if (problems.length) { failed++; console.log(`✗ ${f}\n   - ` + problems.join('\n   - ')); }
  else console.log(`✓ ${f}` + (warnings.length ? `\n   (warning) ${warnings.join('\n   (warning) ')}` : ''));
}
console.log(failed ? `\n${failed} file(s) FAILED` : '\nALL PASSED');
process.exit(failed ? 1 : 0);
