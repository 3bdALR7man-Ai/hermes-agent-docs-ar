#!/usr/bin/env bash
# أنبوب تحديث الترجمة العربية لوثائق Hermes Agent
#   check    : فحص فقط — يطبع الجديد/المتغيّر (لا يعدّل شيئًا). exit 0 = لا تغييرات، exit 10 = توجد تغييرات
#   prepare  : يجلب التغييرات ويجهّز دفعات الترجمة (work/update_batches.json) على فرع git جديد
#   finalize : يتحقق من الترجمات، يبني الموقع، يفحصه، يعمل commit + push + Pull Request
#   abort    : يتراجع عن أي تغييرات محلية ويعود إلى main
set -euo pipefail
export PATH="$PATH:/c/Program Files/GitHub CLI"
REPO="/c/Users/a/Desktop/hermes-agent-docs-ar-repo"
TOOLS="$REPO/tools"
MAX_PAGES=60                 # حد أمان: أكثر من هذا = إعادة هيكلة كبيرة تحتاج قرارًا بشريًا
EXCLUDE_RE='(security-godmode|mlops-obliteratus)'   # صفحات مستثناة عمدًا من الترجمة
cd "$REPO"

log(){ printf '%s\n' "$*"; }

case "${1:-check}" in
  check)
    git fetch -q origin main && git checkout -q main && git pull -q --ff-only origin main
    cd "$TOOLS"
    node update.js | tee "$REPO/.update-report.txt"
    n_new=$(grep -oE '^جديدة: [0-9]+' "$REPO/.update-report.txt" | grep -oE '[0-9]+' || echo 0)
    n_chg=$(grep -oE '^متغيّرة: [0-9]+' "$REPO/.update-report.txt" | grep -oE '[0-9]+' || echo 0)
    total=$((n_new + n_chg))
    # استبعاد الصفحات المستثناة من العدّ
    excl=$(grep -E '^(جديدة|متغيّرة):' "$REPO/.update-report.txt" | grep -oE '[a-z0-9/_-]+' | grep -cE "$EXCLUDE_RE" || true)
    total=$((total - excl))
    log "RESULT: total_pages=$total new=$n_new changed=$n_chg excluded=$excl"
    if [ "$total" -le 0 ]; then log "STATUS: NO_CHANGES"; exit 0; fi
    if [ "$total" -gt "$MAX_PAGES" ]; then log "STATUS: TOO_MANY_CHANGES (>$MAX_PAGES) — يحتاج قرارًا بشريًا"; exit 20; fi
    log "STATUS: CHANGES_FOUND"; exit 10 ;;

  prepare)
    branch="update/$(date -u +%Y-%m-%d)"
    git checkout -q main && git pull -q --ff-only origin main
    git checkout -q -B "$branch"
    cd "$TOOLS"
    node update.js --apply
    # إزالة الصفحات المستثناة من قائمة الترجمة
    node -e '
      const fs=require("fs");const p="work/update_batches.json";
      const b=JSON.parse(fs.readFileSync(p,"utf8")).map(x=>({...x,files:x.files.filter(f=>!/'"$EXCLUDE_RE"'/.test(f))})).filter(x=>x.files.length);
      fs.writeFileSync(p,JSON.stringify(b,null,1));
      console.log("chunks to translate:",b.reduce((n,x)=>n+x.files.length,0),"in",b.length,"batches");'
    log "BRANCH: $branch"
    log "BATCHES_FILE: $TOOLS/work/update_batches.json"
    log "GUIDE: $TOOLS/work/GUIDE.md" ;;

  finalize)
    cd "$TOOLS"
    branch=$(git rev-parse --abbrev-ref HEAD)
    [[ "$branch" == update/* ]] || { log "ERROR: not on an update/* branch ($branch)"; exit 1; }
    files=$(node -e 'const b=require("./work/update_batches.json");console.log(b.flatMap(x=>x.files).join(" "))')
    [ -n "$files" ] || { log "ERROR: no batch files"; exit 1; }
    log "== validate =="
    node work/validate.js $files
    log "== extra pages (skills/plugins index) =="
    node extra_pages.js
    log "== build =="
    node build_site.js ../docs
    log "== site checks =="
    python3 - "$REPO/docs" <<'PY'
import os,re,sys
from urllib.parse import urlsplit,unquote
R=sys.argv[1]; files=set(); pages=[]
for dp,dn,fn in os.walk(R):
    for f in fn:
        rel=os.path.relpath(os.path.join(dp,f),R).replace("\\","/"); files.add(rel)
        if f.endswith(".html"): pages.append(rel)
broken=[]; bad_head=[]
for rel in pages:
    t=open(os.path.join(R,rel),encoding="utf-8").read()
    if 'lang="ar" dir="rtl"' not in t[:600] or "<title>" not in t: bad_head.append(rel)
    for h in re.findall(r'href="([^"#]+)',t):
        if re.match(r'^(https?:|mailto:|javascript:|data:)',h) or h in ("Discord","X · Twitter","Reddit","GitHub","Blog","YouTube","GitHub Gist","Hacker News","LinkedIn","Podcast","Product Hunt"): continue
        tgt=os.path.normpath(os.path.join(os.path.dirname(rel),unquote(h))).replace("\\","/")
        if tgt not in files: broken.append((rel,h))
print(f"pages={len(pages)} broken_links={len(broken)} bad_head={len(bad_head)}")
for b in broken[:10]: print("  broken:",b)
sys.exit(1 if (broken or bad_head or len(pages)<400) else 0)
PY
    cd "$REPO"
    git add -A
    n=$(git diff --cached --name-only | wc -l)
    [ "$n" -gt 0 ] || { log "ERROR: nothing to commit"; exit 1; }
    summary=$(grep -E '^(جديدة|متغيّرة|محذوفة من الأصل):' .update-report.txt 2>/dev/null | tr '\n' ' ' | cut -c1-900)
    git commit -q -m "مزامنة الترجمة مع الأصل — $(date -u +%F)" -m "$summary"
    git push -q -u origin "$branch"
    pr=$(gh pr create --base main --head "$branch" --title "تحديث الترجمة — $(date -u +%F)" --body-file .update-report.txt 2>&1 | tail -1)
    log "PR: $pr"
    log "CHANGED_FILES: $n"
    git checkout -q main ;;

  abort)
    git checkout -q -- . 2>/dev/null || true
    git clean -fdq -e .update-report.txt 2>/dev/null || true
    git checkout -q main
    log "aborted; back on main" ;;
  *) log "usage: $0 check|prepare|finalize|abort"; exit 2 ;;
esac
