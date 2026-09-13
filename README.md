# وثائق Hermes Agent بالعربية

> Unofficial Arabic translation of the [Hermes Agent documentation](https://hermes-agent.nousresearch.com/docs/) by Nous Research. Not affiliated with or endorsed by Nous Research.

ترجمة عربية غير رسمية لوثائق Hermes Agent، بواجهة RTL كاملة وبحث يعمل محليًا وخطوط مضمّنة (تعمل بدون إنترنت).

**الموقع:** https://3bdalr7man-ai.github.io/hermes-agent-docs-ar/

## المحتوى

| المجلد | الوصف |
|---|---|
| `docs/` | الموقع المبني (442 صفحة HTML ثابتة) — هو ما يُنشر على GitHub Pages |
| `tools/` | أدوات البناء بـ Node.js: جلب الأصل، تجهيز دفعات الترجمة، البناء، اكتشاف التحديثات |
| `tools/work/ar/` | الترجمات العربية (مصدر الحقيقة) |
| `tools/raw/` | النسخ الأصلية الإنجليزية الخام المستخدمة لمقارنة التحديثات |

## الاستخدام محليًا

```bash
cd tools
node update.js            # يفحص sitemap.xml للموقع الأصلي ويعرض الصفحات الجديدة/المتغيّرة/المحذوفة
node update.js --apply    # ينزّل التغييرات ويجهّز دفعات الترجمة في work/update_batches.json
# تُترجم الدفعات وفق work/GUIDE.md ثم:
node build_site.js ../docs
```

يتطلب Node.js 18+ (يستخدم `fetch` المدمج).

## صفحات تبقى بالإنجليزية

- صفحتا Godmode و Obliteratus (استُثنيتا عمدًا).
- أي صفحة أضيفت للأصل بعد تاريخ آخر مزامنة.

## المساهمة

وجدت خطأ في الترجمة؟ افتح Issue بذكر عنوان الصفحة والفقرة، أو عدّل الجزء المقابل في `tools/work/ar/` وأعد البناء ثم افتح Pull Request. راجع `tools/work/GUIDE.md` لقواعد الأسلوب والمصطلحات.

## الترخيص

- الوثائق الأصلية: © Nous Research، ترخيص [MIT](LICENSE). هذه الترجمة عمل مشتق يُوزَّع بنفس الترخيص مع الإبقاء على إشعار الحقوق الأصلي.
- الترجمة العربية © 2026 3bdALR7man-Ai، مرخّصة بـ MIT.
- بعض صفحات المهارات (Skills) تذكر ترخيصًا خاصًا بها (مثل Apache-2.0) في جدول بياناتها وتبقى خاضعة له.
- الخطوط (IBM Plex Sans Arabic، Inter، DM Sans، JetBrains Mono) بترخيص SIL Open Font License 1.1 — راجع [`NOTICE.md`](NOTICE.md).
- «Hermes Agent» و«Nous Research» وشعار Hermes علامات تعود لأصحابها؛ استخدامها هنا للتعريف بالمنتج المترجَم فقط.
