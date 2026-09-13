// node validate_stories.js <k>   (k = 1..4)
const fs = require('fs');
const path = require('path');
const k = process.argv[2];
const src = JSON.parse(fs.readFileSync(path.join(__dirname, `src_${k}.json`), 'utf8'));
const outP = path.join(__dirname, `ar_${k}.json`);
if (!fs.existsSync(outP)) { console.log(`✗ ar_${k}.json missing`); process.exit(1); }
let ar;
try { ar = JSON.parse(fs.readFileSync(outP, 'utf8')); } catch (e) { console.log(`✗ ar_${k}.json is not valid JSON: ${e.message}`); process.exit(1); }
const AR = /[؀-ۿ]/;
const problems = [];
const byI = new Map();
for (const x of ar) {
  if (byI.has(x.i)) problems.push(`i=${x.i} appears twice`);
  byI.set(x.i, x);
}
for (const s of src) {
  const x = byI.get(s.i);
  if (!x) { problems.push(`i=${s.i} missing`); continue; }
  const h = String(x.h || ''), sum = String(x.s || '');
  if (!AR.test(h)) problems.push(`i=${s.i}: headline "h" has no Arabic`);
  if (h.length > 160) problems.push(`i=${s.i}: headline too long (${h.length} chars)`);
  if (!AR.test(sum)) problems.push(`i=${s.i}: summary "s" has no Arabic`);
  if (sum.length < 20 || sum.length > 200) problems.push(`i=${s.i}: summary must be 20-200 characters (is ${sum.length})`);
  if (/[“”"«»]/.test(sum)) problems.push(`i=${s.i}: summary must not contain quotation marks — write a paraphrase, not a quote`);
  if (/([A-Za-z][\w'’.-]*[\s,]+){5,}[A-Za-z]/.test(sum)) problems.push(`i=${s.i}: summary contains a run of 6+ English words — paraphrase in Arabic instead of carrying over the original wording`);
  if ((sum.match(/[.؟!]/g) || []).length > 2) problems.push(`i=${s.i}: summary should be one short sentence`);
}
if (problems.length) { console.log(`✗ ar_${k}.json\n - ` + problems.slice(0, 40).join('\n - ') + (problems.length > 40 ? `\n ... and ${problems.length - 40} more` : '')); process.exit(1); }
console.log(`✓ ar_${k}.json: ${src.length} stories OK\nALL PASSED`);
