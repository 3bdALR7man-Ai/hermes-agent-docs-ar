// سلوك الواجهة: بديل خفيف لسلوك Docusaurus في النسخة العربية
(function () {
  var root = document.documentElement;
  var ROOT = root.getAttribute('data-root') || '';

  // ---------- الوضع الداكن / الفاتح ----------
  var LABELS = { system: 'وضع النظام', light: 'الوضع الفاتح', dark: 'الوضع الداكن' };
  var mq = window.matchMedia('(prefers-color-scheme: dark)');
  function getChoice() { try { return localStorage.getItem('theme') || 'system'; } catch (e) { return 'system'; } }
  function applyTheme(choice) {
    root.setAttribute('data-theme-choice', choice);
    root.setAttribute('data-theme', choice === 'system' ? (mq.matches ? 'dark' : 'light') : choice);
    document.querySelectorAll('.color-mode-btn').forEach(function (b) {
      b.title = LABELS[choice];
      b.setAttribute('aria-label', 'التبديل بين الوضع الداكن والفاتح (الوضع الحالي: ' + LABELS[choice] + ')');
    });
  }
  applyTheme(getChoice());
  if (mq.addEventListener) mq.addEventListener('change', function () { if (getChoice() === 'system') applyTheme('system'); });
  document.querySelectorAll('.color-mode-btn').forEach(function (b) {
    b.addEventListener('click', function () {
      var next = { system: 'light', light: 'dark', dark: 'system' }[getChoice()];
      try { if (next === 'system') localStorage.removeItem('theme'); else localStorage.setItem('theme', next); } catch (e) {}
      applyTheme(next);
    });
  });

  // ---------- فئات الشريط الجانبي ----------
  document.addEventListener('click', function (e) {
    var t = e.target.closest('a.menu__link--sublist-caret, button.menu__caret');
    if (!t) return;
    e.preventDefault();
    var li = t.closest('li');
    var ul = li.querySelector(':scope > ul');
    var collapsed = li.classList.toggle('menu__list-item--collapsed');
    if (ul) ul.hidden = collapsed;
    t.setAttribute('aria-expanded', String(!collapsed));
  });

  // ---------- طي الشريط الجانبي ----------
  var aside = document.querySelector('.docSidebarContainer_YfHR');
  if (aside) {
    var sb = aside.querySelector('.sidebar_njMd');
    var expand = aside.querySelector('.expandButton_TmdG');
    var mainC = document.querySelector('.docMainContainer_TBSr');
    var wrap = mainC.querySelector('.container');
    var setHidden = function (h) {
      aside.classList.toggle('docSidebarContainerHidden_DPk8', h);
      sb.classList.toggle('sidebarHidden_VK0M', h);
      expand.hidden = !h;
      mainC.classList.toggle('docMainContainerEnhanced_lQrH', h);
      wrap.classList.toggle('docItemWrapperEnhanced_JWYK', h);
    };
    aside.querySelector('.collapseSidebarButton_PEFL').addEventListener('click', function () { setHidden(true); });
    expand.addEventListener('click', function () { setHidden(false); });
    expand.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setHidden(false); } });
  }

  // ---------- قائمة الجوال ----------
  var nav = document.querySelector('nav.navbar');
  var items = nav.querySelector('.navbar-sidebar__items');
  function mobile(open) {
    nav.classList.toggle('navbar-sidebar--show', open);
    nav.querySelector('.navbar__toggle').setAttribute('aria-expanded', String(open));
    document.body.style.overflow = open ? 'hidden' : '';
    if (open) items.classList.add('navbar-sidebar__items--show-secondary');
  }
  nav.querySelector('.navbar__toggle').addEventListener('click', function () { mobile(true); });
  nav.querySelector('.navbar-sidebar__close').addEventListener('click', function () { mobile(false); });
  nav.querySelector('.navbar-sidebar__backdrop').addEventListener('click', function () { mobile(false); });
  nav.querySelector('.navbar-sidebar__back').addEventListener('click', function () { items.classList.remove('navbar-sidebar__items--show-secondary'); });
  window.addEventListener('resize', function () { if (window.innerWidth > 996) mobile(false); });

  // ---------- قائمة اللغة ----------
  var dd = nav.querySelector('.dropdown');
  dd.querySelector(':scope > a').addEventListener('click', function (e) { e.preventDefault(); dd.classList.toggle('dropdown--show'); });
  document.addEventListener('click', function (e) { if (!dd.contains(e.target)) dd.classList.remove('dropdown--show'); });

  // ---------- نسخ الكود ----------
  var COPY = '<button type="button" aria-label="نسخ الكود إلى الحافظة" title="نسخ" class="clean-btn"><span class="copyButtonIcons_IEyt" aria-hidden="true"><svg viewBox="0 0 24 24" class="copyButtonIcon_TrPX"><path fill="currentColor" d="M19,21H8V7H19M19,5H8A2,2 0 0,0 6,7V21A2,2 0 0,0 8,23H19A2,2 0 0,0 21,21V7A2,2 0 0,0 19,5M16,1H4A2,2 0 0,0 2,3V17H4V3H16V1Z"></path></svg><svg viewBox="0 0 24 24" class="copyButtonSuccessIcon_cVMy"><path fill="currentColor" d="M21,7L9,19L3.5,13.5L4.91,12.09L9,16.17L19.59,5.59L21,7Z"></path></svg></span></button>';
  document.querySelectorAll('.codeBlockContent_QJqH').forEach(function (box) {
    if (box.querySelector('.buttonGroup_M5ko')) return;
    var g = document.createElement('div');
    g.className = 'buttonGroup_M5ko';
    g.innerHTML = COPY;
    box.appendChild(g);
    var btn = g.firstChild;
    btn.addEventListener('click', function () {
      var code = box.querySelector('pre').innerText.replace(/\n$/, '');
      var done = function () {
        btn.classList.add('copyButtonCopied_Vdqa'); btn.title = 'تم النسخ'; btn.setAttribute('aria-label', 'تم النسخ');
        setTimeout(function () { btn.classList.remove('copyButtonCopied_Vdqa'); btn.title = 'نسخ'; btn.setAttribute('aria-label', 'نسخ الكود إلى الحافظة'); }, 1000);
      };
      var fallback = function () { var ta = document.createElement('textarea'); ta.value = code; document.body.appendChild(ta); ta.select(); try { document.execCommand('copy'); done(); } catch (e) {} ta.remove(); };
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(done, fallback); else fallback();
    });
  });

  // ---------- العودة للأعلى ----------
  var topBtn = document.querySelector('.theme-back-to-top-button');
  var onScrollTop = function () { topBtn.classList.toggle('backToTopButtonShow_xfvO', window.scrollY > 300); };
  window.addEventListener('scroll', onScrollTop, { passive: true }); onScrollTop();
  topBtn.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });

  // ---------- فهرس الصفحة (الجوال) ----------
  var tocM = document.querySelector('.tocCollapsible_ETCw');
  if (tocM) {
    var tb = tocM.querySelector('button'), tc = tocM.querySelector('.tocCollapsibleContent_vkbj');
    tb.addEventListener('click', function () {
      var open = tc.hidden;
      tc.hidden = !open;
      tocM.classList.toggle('tocCollapsibleExpanded_sAul', open);
      tb.classList.toggle('tocCollapsibleButtonExpanded_MG3E', open);
    });
    tc.addEventListener('click', function (e) { if (e.target.closest('a')) { tc.hidden = true; tocM.classList.remove('tocCollapsibleExpanded_sAul'); tb.classList.remove('tocCollapsibleButtonExpanded_MG3E'); } });
  }

  // ---------- تمييز العنوان الحالي في الفهرس ----------
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.theme-doc-toc-desktop .table-of-contents__link'));
  if (tocLinks.length) {
    var targets = tocLinks.map(function (a) { return document.getElementById(decodeURIComponent(a.getAttribute('href').slice(1))); });
    var onScrollToc = function () {
      var idx = -1;
      for (var i = 0; i < targets.length; i++) { if (targets[i] && targets[i].getBoundingClientRect().top < 110) idx = i; }
      tocLinks.forEach(function (a, i) { a.classList.toggle('table-of-contents__link--active', i === idx); });
    };
    window.addEventListener('scroll', onScrollToc, { passive: true }); onScrollToc();
  }

  // ---------- details ----------
  document.querySelectorAll('details.details_lb9f').forEach(function (d) {
    d.classList.add('isBrowser_bmU9');
    d.setAttribute('data-collapsed', String(!d.open));
    d.addEventListener('toggle', function () { d.setAttribute('data-collapsed', String(!d.open)); });
  });

  // ---------- فهرس المهارات / الإضافات ----------
  var xCards = Array.prototype.slice.call(document.querySelectorAll('.xcard'));
  if (xCards.length) {
    var xInput = document.getElementById('xfilter');
    var xCountEl = document.querySelector('.xcount');
    var xKind = '*';
    var xNorm = function (s) { return String(s).toLowerCase().replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه'); };
    var xApply = function () {
      var q = xNorm((xInput && xInput.value || '').trim());
      var shown = 0;
      xCards.forEach(function (c) {
        var ok = (xKind === '*' || c.getAttribute('data-kind') === xKind) &&
          (!q || xNorm(c.getAttribute('data-name') + ' ' + c.textContent).indexOf(q) >= 0);
        c.hidden = !ok;
        if (ok) shown++;
      });
      document.querySelectorAll('.xgrid').forEach(function (g) {
        var any = Array.prototype.some.call(g.children, function (c) { return !c.hidden; });
        g.hidden = !any;
        var head = g.previousElementSibling;
        if (head && head.hasAttribute && head.hasAttribute('data-cat-head')) head.hidden = !any;
      });
      if (xCountEl) xCountEl.textContent = shown + ' من ' + xCards.length;
    };
    if (xInput) xInput.addEventListener('input', xApply);
    document.querySelectorAll('.xfbtn').forEach(function (b) {
      b.addEventListener('click', function () {
        xKind = b.getAttribute('data-kind');
        document.querySelectorAll('.xfbtn').forEach(function (x) { x.classList.toggle('xfactive', x === b); });
        xApply();
      });
    });
    xApply();
  }

  // ---------- فلاتر قصص المستخدمين ----------
  var storyTiles = Array.prototype.slice.call(document.querySelectorAll('a.tile_PdK3[data-cat]'));
  if (storyTiles.length) {
    var sel = { cat: '*', src: '*' };
    var applyStories = function () {
      storyTiles.forEach(function (t) {
        t.hidden = !((sel.cat === '*' || t.getAttribute('data-cat') === sel.cat) && (sel.src === '*' || t.getAttribute('data-src') === sel.src));
      });
    };
    ['cat', 'src'].forEach(function (kind) {
      var btns = Array.prototype.slice.call(document.querySelectorAll('[data-story-' + kind + ']'));
      btns.forEach(function (b) {
        b.addEventListener('click', function () {
          sel[kind] = b.getAttribute('data-story-' + kind);
          btns.forEach(function (x) { x.classList.toggle('filterActive_BUc1', x === b); });
          applyStories();
        });
      });
    });
  }

  // ---------- البحث المحلي ----------
  var ICON_PAGE = '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M17 6v12c0 .52-.2 1-1 1H4c-.7 0-1-.33-1-1V2c0-.55.42-1 1-1h8l5 5zM14 8h-3.13c-.51 0-.87-.34-.87-.87V4" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linejoin="round"></path></svg>';
  var ICON_HASH = '<svg width="20" height="20" viewBox="0 0 20 20"><path d="M13 13h4-4V8H7v5h6v4-4H7V8H3h4V3v5h6V3v5h4-4v5zm-6 0v4-4H3h4z" stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  var ICON_ENTER = '<svg class="DocSearch-Hit-Select-Icon" width="20" height="20" viewBox="0 0 20 20"><g stroke="currentColor" fill="none" fill-rule="evenodd" stroke-linecap="round" stroke-linejoin="round"><path d="M18 3v4c0 2-2 4-4 4H2"></path><path d="M8 17l-6-6 6-6"></path></g></svg>';
  var ICON_SEARCH = '<svg width="20" height="20" class="DocSearch-Search-Icon" viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="8" stroke="currentColor" fill="none" stroke-width="1.4"></circle><path d="m21 21-4.3-4.3" stroke="currentColor" fill="none" stroke-linecap="round" stroke-linejoin="round"></path></svg>';
  var modal = null, input, results, selected = 0, hits = [];

  var norm = function (s) {
    return String(s).toLowerCase().replace(/[ً-ٰٟـ]/g, '').replace(/[أإآ]/g, 'ا').replace(/ى/g, 'ي').replace(/ة/g, 'ه');
  };
  var escH = function (s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); };

  function loadIndex(cb) {
    if (window.HermesSearch) return cb();
    var s = document.createElement('script');
    s.src = ROOT + 'assets/js/search-index.js';
    s.onload = cb;
    document.head.appendChild(s);
  }
  function renderResults() {
    var q = norm(input.value.trim());
    if (!q) { results.innerHTML = '<div class="local-search-empty">اكتب كلمة للبحث في عناوين الصفحات والأقسام (بالعربية أو الإنجليزية)</div>'; hits = []; return; }
    var terms = q.split(/\s+/);
    var pages = [], heads = [];
    (window.HermesSearch || []).forEach(function (p) {
      var t = norm(p[1] + ' ' + p[2]);
      if (terms.every(function (w) { return t.indexOf(w) >= 0; })) pages.push({ href: ROOT + p[0], title: p[1], path: p[2], score: norm(p[1]).indexOf(terms[0]) === 0 ? 0 : 1 });
      p[3].forEach(function (h) {
        if (terms.every(function (w) { return norm(h[1]).indexOf(w) >= 0; })) heads.push({ href: ROOT + p[0] + '#' + h[0], title: h[1], path: p[1], head: true });
      });
    });
    pages.sort(function (a, b) { return a.score - b.score; });
    hits = pages.slice(0, 20).concat(heads.slice(0, 30));
    if (!hits.length) { results.innerHTML = '<div class="local-search-empty">لا توجد نتائج لـ «' + escH(input.value) + '»</div>'; return; }
    selected = 0;
    var section = function (title, list, offset) {
      if (!list.length) return '';
      return '<section class="DocSearch-Hits"><div class="DocSearch-Hit-source">' + title + '</div><ul role="listbox">' + list.map(function (h, i) {
        return '<li class="DocSearch-Hit" data-i="' + (i + offset) + '" aria-selected="' + (i + offset === selected) + '"><a href="' + h.href + '"><div class="DocSearch-Hit-Container"><div class="DocSearch-Hit-icon">' + (h.head ? ICON_HASH : ICON_PAGE) + '</div><div class="DocSearch-Hit-content-wrapper"><span class="DocSearch-Hit-title">' + escH(h.title) + '</span><span class="DocSearch-Hit-path">' + escH(h.path) + '</span></div><div class="DocSearch-Hit-action">' + ICON_ENTER + '</div></div></a></li>';
      }).join('') + '</ul></section>';
    };
    var np = Math.min(pages.length, 20);
    results.innerHTML = section('الصفحات', hits.slice(0, np), 0) + section('الأقسام', hits.slice(np), np);
  }
  function select(i) {
    if (!hits.length) return;
    selected = (i + hits.length) % hits.length;
    results.querySelectorAll('.DocSearch-Hit').forEach(function (li) {
      var on = +li.getAttribute('data-i') === selected;
      li.setAttribute('aria-selected', String(on));
      if (on) li.scrollIntoView({ block: 'nearest' });
    });
  }
  function closeSearch() { if (modal) { modal.hidden = true; document.body.classList.remove('DocSearch--active'); } }
  function openSearch() {
    loadIndex(function () {
      if (!modal) {
        modal = document.createElement('div');
        modal.className = 'DocSearch DocSearch-Container';
        modal.innerHTML = '<div class="DocSearch-Modal" role="dialog" aria-modal="true" aria-label="بحث"><header class="DocSearch-SearchBar"><form class="DocSearch-Form" role="search"><label class="DocSearch-MagnifierLabel" for="hermes-search-input">' + ICON_SEARCH + '</label><input class="DocSearch-Input" id="hermes-search-input" type="search" placeholder="ابحث في الوثائق" autocomplete="off" autocorrect="off" spellcheck="false" maxlength="64"></form><button type="button" class="DocSearch-Cancel">إلغاء</button></header><div class="DocSearch-Dropdown"><div class="DocSearch-Dropdown-Container"></div></div><footer class="DocSearch-Footer"><ul class="DocSearch-Commands"><li><kbd class="DocSearch-Commands-Key">↵</kbd><span class="DocSearch-Label">للفتح</span></li><li><kbd class="DocSearch-Commands-Key">↓</kbd><kbd class="DocSearch-Commands-Key">↑</kbd><span class="DocSearch-Label">للتنقل</span></li><li><kbd class="DocSearch-Commands-Key">esc</kbd><span class="DocSearch-Label">للإغلاق</span></li></ul></footer></div>';
        document.body.appendChild(modal);
        input = modal.querySelector('input');
        results = modal.querySelector('.DocSearch-Dropdown-Container');
        modal.addEventListener('click', function (e) { if (e.target === modal) closeSearch(); });
        modal.querySelector('.DocSearch-Cancel').addEventListener('click', closeSearch);
        modal.querySelector('form').addEventListener('submit', function (e) { e.preventDefault(); });
        input.addEventListener('input', renderResults);
        input.addEventListener('keydown', function (e) {
          if (e.key === 'ArrowDown') { e.preventDefault(); select(selected + 1); }
          else if (e.key === 'ArrowUp') { e.preventDefault(); select(selected - 1); }
          else if (e.key === 'Enter') { e.preventDefault(); if (hits[selected]) { closeSearch(); location.href = hits[selected].href; } }
        });
        renderResults();
      }
      modal.hidden = false;
      document.body.classList.add('DocSearch--active');
      input.focus();
      input.select();
    });
  }
  document.querySelectorAll('.search-btn').forEach(function (b) { b.addEventListener('click', openSearch); });
  document.addEventListener('keydown', function (e) {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') { e.preventDefault(); if (modal && !modal.hidden) closeSearch(); else openSearch(); }
    else if (e.key === 'Escape') closeSearch();
    else if (e.key === '/' && !/INPUT|TEXTAREA/.test(document.activeElement.tagName)) { e.preventDefault(); openSearch(); }
  });
})();
