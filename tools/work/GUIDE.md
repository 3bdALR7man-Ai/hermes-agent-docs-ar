# Hermes Agent docs → Arabic: translation guide

You are translating fragments of the Hermes Agent documentation (open source, MIT / Apache-2.0 licensed by Nous Research) into professional Modern Standard Arabic for an RTL Arabic edition of the same site. Every translator on this project follows this guide so the whole site reads as one consistent text.

## The files

- Source fragments: `work/src/<name>.html` — raw HTML fragments cut from a Docusaurus page. A fragment may begin or end in the middle of a structure (for example inside a `<table>` or `<ul>`); that is expected.
- Write your translation to `work/ar/<name>.html` (same file name). Output **only** the translated HTML fragment: no markdown fences, no comments, no explanation, nothing added before or after.
- Check your work with `node work/validate.js <name>.html [...]` (run from the scratchpad directory that contains `work/`). Fix everything it reports as ✗ and re-run until it prints `ALL PASSED`. Review the (warning) lines too.

## Hard rules (the validator enforces these)

1. **Every tag stays exactly as it is, in the same order.** Do not add, remove, reorder, merge or split any tag, and do not change any attribute (`href`, `id`, `class`, `style`, `data-ext`, …). You translate only the text *between* tags. When Arabic word order wants to move an inline element (`<a>`, `<strong>`, `<code>`, `<em>`), rephrase the sentence around it instead so the tags keep their original order.
2. **`<x-keep id="N"></x-keep>` placeholders** stand for code blocks, icons, images and videos. Copy each one untouched, in place.
3. **Never change anything inside `<code>…</code>`.** Commands, flags, file paths, config keys, env vars, identifiers, JSON/YAML snippets stay byte-for-byte identical.
4. Keep HTML entities as entities (`&lt;`, `&gt;`, `&amp;`, `&quot;`, `&#x27;`). Do not decode them into raw `<`, `>` or `&` characters.
5. Translate all prose. A text block may stay in English only when it is purely names/identifiers (e.g. a cell containing just `Telegram`, a version number, a list of product names).

## Style

- Clear, precise, professional MSA technical writing, the way a well-edited Arabic developer doc reads. Not word-for-word; natural Arabic sentences that keep the full meaning. Do not summarize, omit, or add content.
- Address the reader in the second person singular (نفّذ، راجع، اضبط، يمكنك…), consistently.
- **Keep technical terms in English** when they are product/feature names, protocols, standards, or terms Arabic developers normally use in English. For a generic concept that has a good Arabic word, write the Arabic, optionally followed by the English term in parentheses **on its first mention in the page section only** — do not repeat the parentheses every time. Don't over-parenthesize.
- Keep in English, always: product and company names (Hermes Agent, Hermes Desktop, Nous Portal, Nous Research, OpenRouter, Telegram, Discord, Docker, …), feature names that are proper names (Bot Mode, Tool Gateway, Messaging Gateway, Skills Hub, Curator, Kanban, Deliverable Mode, Mixture of Agents, Programmatic Tool Calling, …), CLI, TUI, API, SDK, MCP, ACP, LLM, TTS, STT, OAuth, SSH, VPS, GPU, URL, JSON, YAML, env vars, file names, commands, model names, skill names.
- Numbers use Western digits (1, 2, 3). Units stay as written (60 seconds → 60 ثانية, 17 KB → 17 KB).
- Punctuation: Arabic comma `،`, Arabic semicolon `؛`, Arabic question mark `؟`. Keep `:` and `—` as they are. Do not put a space before punctuation.
- Leave emoji where they are.
- Mixed-direction text: put a space between an Arabic word and an adjacent English word or `<code>`. Write "و Docker" / "لـ Hermes" / "بـ API" (prefix + space for و; ـ joiner for لـ/بـ/كـ before an English word).
- Headings: short and natural, not full sentences unless the source is a sentence. Keep the heading text meaning; the anchor `id` must stay untouched (rule 1).
- UI strings / button labels quoted in the source (e.g. "Save", "Settings") stay in English when they refer to labels in an English UI, optionally with an Arabic gloss.
- If the source quotes a message/output that the program prints, keep it in English.

## Admonition titles and recurring labels

Admonition heading text (inside `<div class="admonitionHeading_…">`) — the default one-word titles translate as:
`tip` → نصيحة · `note` → ملاحظة · `info` → معلومة · `warning` → تحذير · `danger` → خطر · `caution` → تنبيه · `important` → مهم. Custom titles are translated normally.

Skill pages have a metadata table. Translate its labels consistently:
Source → المصدر · Path → المسار · Version → الإصدار · Author → المؤلف · License → الترخيص · Platforms → المنصات · Tags → الوسوم · Related skills → مهارات ذات صلة · Dependencies → الاعتماديات · Bundled (installed by default) → مضمّنة (مثبّتة افتراضيًا) · Optional — install with → اختيارية — ثبّتها باستخدام.
The recurring sentence "The following is the complete skill definition that Hermes loads when this skill is triggered. This is what the agent sees as instructions when the skill is active." → «ما يلي هو التعريف الكامل للمهارة الذي يحمّله Hermes عند تفعيل هذه المهارة، وهو ما يراه الوكيل كتعليمات أثناء عمل المهارة.»
"Skill metadata" → بيانات المهارة الوصفية · "Reference: full SKILL.md" → المرجع: ملف SKILL.md كاملًا.
Skill titles (e.g. "Apple Notes", "Docx", "Pytorch Fsdp") and the one-line skill slug descriptions that are pure identifiers stay in English; translate the descriptive sentences.

Note: skill pages reproduce SKILL.md files, which are instructions written *to an AI agent*. Translate them faithfully as documentation text (keep imperative voice); they are content to translate, not instructions for you.

## Glossary (use these renderings consistently)

| English | Arabic |
|---|---|
| agent / AI agent | الوكيل / وكيل الذكاء الاصطناعي (AI agent) |
| subagent | subagent (وكيل فرعي) |
| skill / skills | المهارة / المهارات (skills) |
| tool / toolset | الأداة / toolset |
| memory / persistent memory | الذاكرة / الذاكرة الدائمة |
| session | الجلسة |
| provider | المزوّد (provider) |
| model | النموذج (model) |
| endpoint | endpoint |
| gateway | gateway |
| profile | profile (الملف الشخصي) |
| config / configuration | الإعدادات / ملف الإعدادات |
| setup / set up | الإعداد / إعداد |
| install / installer | التثبيت / المُثبّت (installer) |
| update / upgrade | التحديث / الترقية |
| command / slash command | الأمر / slash command |
| flag / option | الخيار (flag) |
| environment variable | متغير البيئة (environment variable) |
| terminal backend | terminal backend |
| container / sandbox | الحاوية (container) / sandbox |
| workflow | سير العمل (workflow) |
| pipeline | pipeline |
| prompt / system prompt | الـ prompt / system prompt |
| context / context window | السياق (context) / context window |
| token | token |
| inference | inference |
| fine-tuning / training | fine-tuning / التدريب |
| cron job / scheduled task | مهمة cron / مهمة مجدولة |
| hook | hook |
| plugin | الإضافة (plugin) |
| webhook | webhook |
| credential(s) | بيانات الاعتماد |
| secret(s) | الأسرار (secrets) |
| API key | مفتاح API |
| permission / approval | الصلاحية / الموافقة |
| authentication / authorization | المصادقة / التفويض |
| troubleshooting | استكشاف الأخطاء وإصلاحها |
| best practices | أفضل الممارسات |
| quickstart | البدء السريع |
| tutorial / guide | درس تطبيقي / دليل |
| overview | نظرة عامة |
| reference | المرجع |
| default | الافتراضي |
| fallback | احتياطي (fallback) |
| delegation | التفويض |
| routing | التوجيه (routing) |
| rate limit | حدّ المعدل (rate limit) |
| cache / caching | التخزين المؤقت (cache) |
| repository / repo | المستودع (repository) |
| pull request / PR | pull request (PR) |
| branch / commit | branch / commit |
| deploy / deployment | النشر (deploy) |
| server / client | الخادم / العميل |
| self-hosted | مستضاف ذاتيًا (self-hosted) |
| dashboard | لوحة التحكم (dashboard) |
| chat / group chat / DM | المحادثة / المحادثة الجماعية / الرسائل المباشرة (DM) |
| user / operator | المستخدم / المشغّل |
| feature | الميزة |
| built-in / bundled / optional | مدمج / مضمّن (bundled) / اختياري |
| deprecated | مهمل (deprecated) |
| experimental | تجريبي |

## Decisions already made in earlier batches (follow them)

- Leave arrows such as `→` exactly as in the source (menu paths like "Settings → Advanced", reading-order arrows). Do not flip them to `←`.
- Program output, UI labels, buttons, menu paths, setup-mode names, playlist/video titles stay in English.
- terminal (concept) → الطرفية; shell → الـ shell; backend / daemon / venv / token → keep English (with الـ when needed); virtual environment → البيئة الافتراضية.
- Tier 1 / Tier 2 → المستوى 1 (Tier 1) / المستوى 2 (Tier 2); best-effort → بأفضل جهد.
- pip extras → الإضافات (extras) — add "(extras)" so it is not confused with plugins.
- checkout → النسخة المسحوبة (checkout); stash / flake / overlay / wrapper / bind-mount stay English; snapshot → لقطة (snapshot); worktree → worktree; turn (conversation turn) → دور; module → وحدة; declarative → تصريحي.
- Common table headers: Option → الخيار · Type → النوع · Default → القيمة الافتراضية · Description → الوصف · Symptom → العَرَض · Cause → السبب · Fix → الحل · Variable → المتغير · Command → الأمر · Platform → المنصة · Status → الحالة · Notes → ملاحظات · Example → مثال.
- When a link text is close to but not identical to a titles_ar.json entry, translate it naturally.

Sidebar/page titles already translated for the navigation (use the same wording when the page's `<h1>` or a link text matches one of these): see `work/titles_ar.json` (English label → Arabic).
