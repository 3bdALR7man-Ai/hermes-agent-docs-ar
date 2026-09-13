// رسم الشريط الجانبي (يُستدعى مباشرة بعد عنصر aside لتفادي الوميض)
HermesAR.renderSidebars = function () {
  var root = document.documentElement.getAttribute('data-root') || '';
  var slug = document.documentElement.getAttribute('data-slug');
  var file = slug + '.html';

  function contains(it) {
    if (it.f === file) return true;
    return !!(it.i && it.i.some(contains));
  }
  function hrefOf(it) { return it.f ? root + it.f : it.u; }

  function render(items, level) {
    var html = '';
    items.forEach(function (it) {
      var active = it.f === file;
      if (!it.i) {
        html += '<li class="theme-doc-sidebar-item-link theme-doc-sidebar-item-link-level-' + level + ' menu__list-item"><a class="menu__link' + (active ? ' menu__link--active" aria-current="page' : '') + '" href="' + hrefOf(it) + '"><span class="linkLabel_WmDU">' + it.l + '</span></a></li>';
        return;
      }
      var open = contains(it);
      var head;
      if (it.f || it.u) {
        head = '<a class="categoryLink_byQd menu__link menu__link--sublist' + (open ? ' menu__link--active' : '') + '"' + (active ? ' aria-current="page"' : '') + ' href="' + hrefOf(it) + '"><span class="categoryLinkLabel_W154">' + it.l + '</span></a><button aria-label="' + (open ? 'طي' : 'توسيع') + ' فئة الشريط الجانبي" aria-expanded="' + open + '" type="button" class="clean-btn menu__caret"></button>';
      } else {
        head = '<a href="#" class="categoryLink_byQd menu__link menu__link--sublist menu__link--sublist-caret' + (open ? ' menu__link--active' : '') + '" role="button" aria-expanded="' + open + '"><span class="categoryLinkLabel_W154">' + it.l + '</span></a>';
      }
      html += '<li class="theme-doc-sidebar-item-category theme-doc-sidebar-item-category-level-' + level + ' menu__list-item' + (open ? '' : ' menu__list-item--collapsed') + '"><div class="menu__list-item-collapsible">' + head + '</div><ul class="menu__list"' + (open ? '' : ' hidden') + '>' + render(it.i, level + 1) + '</ul></li>';
    });
    return html;
  }

  var html = render(HermesAR.sidebar, 1);
  var lists = document.querySelectorAll('[data-sidebar]');
  for (var i = 0; i < lists.length; i++) lists[i].innerHTML = html;

  // إظهار العنصر النشط داخل الشريط الجانبي
  var menu = document.querySelector('.menu_SIkG');
  var act = menu && menu.querySelector('.menu__link[aria-current="page"]');
  if (act) {
    var r = act.getBoundingClientRect(), mr = menu.getBoundingClientRect();
    if (r.bottom > mr.bottom - 40) menu.scrollTop += r.top - mr.top - mr.height / 3;
  }
};
