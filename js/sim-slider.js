/* ══════════════════════════════════════════════════════════
   sim-slider.js — اسلایدر شبیه‌سازها (بخش #simulator)
   داده از js/data/simulators.js خونده می‌شه.
   • هر شبیه‌ساز HTML فقط وقتی اسلایدش باز بشه لود می‌شه و با رفتن به اسلاید دیگه
     متوقف می‌شه (صرفه‌جویی در باتری موبایل). وضعیتش با برگشتن ریست می‌شه.
   • ناوبری: دکمه‌های قبلی/بعدی، تب‌ها، کلیدهای جهتی (روی اسلایدر)،
     و کشیدن انگشت روی هدر یا تب‌ها. لینک مستقیم: #sim-<id>
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const fa = () => document.body.classList.contains('rtl');
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const T = (en, f) => `<span data-en="${esc(en)}" data-fa="${esc(f || en)}">${esc(fa() ? (f || en) : en)}</span>`;

  let list = [], cur = -1, root = null, built = false;

  function slideEl(i) { return $(`.ss-slide[data-i="${i}"]`, root); }

  function head(i) {
    const s = list[i];
    $('.ss-title', root).innerHTML = `<i class="${esc(s.icon || 'fa-solid fa-microchip')}"></i> ${T(s.titleEn, s.titleFa)}`;
    $('.ss-desc', root).innerHTML = T(s.descEn || '', s.descFa || s.descEn || '');
    const tags = String(s.tags || '').split(',').map((t) => t.trim()).filter(Boolean);
    $('.ss-tags', root).innerHTML = tags.map((t) => `<span class="tag">${esc(t)}</span>`).join('');
    $('.ss-count', root).textContent = (i + 1) + ' / ' + list.length;
    const isHtml = s.type !== 'builtin' && s.file;
    $('.ss-act', root).style.display = isHtml ? '' : 'none';
    const nt = $('.ss-newtab', root);
    if (isHtml) nt.href = s.file;
    $$('.ss-tab', root).forEach((t, k) => { t.classList.toggle('on', k === i); t.setAttribute('aria-selected', k === i ? 'true' : 'false'); });
    const on = $('.ss-tab.on', root);
    if (on && on.scrollIntoView) { try { on.scrollIntoView({ block: 'nearest', inline: 'nearest' }); } catch (e) { /* ignore */ } }
  }

  function load(i) {
    const s = list[i], el = slideEl(i);
    if (!el || s.type === 'builtin') return;
    const fr = $('iframe', el), err = $('.ss-err', el);
    if (fr.dataset.loaded === '1') return;
    err.style.display = 'none';
    el.classList.add('loading');
    fr.onload = () => {
      el.classList.remove('loading');
      if (fr.getAttribute('src') === 'about:blank') return;
      try { // فقط وقتی هم‌مبدأ باشه قابل‌بررسیه؛ در file:// خطا می‌ده و نادیده گرفته می‌شه
        const d = fr.contentDocument;
        if (d && (!d.body || !d.body.children.length || /404|not found|error response|can.?t be found/i.test(d.title || ''))) {
          err.style.display = ''; $('.ss-err-path', err).textContent = s.file;
        }
      } catch (e) { /* ignore */ }
    };
    fr.dataset.loaded = '1';
    fr.src = s.file;
  }
  function unload(i) {
    const el = slideEl(i);
    if (!el) return;
    const fr = $('iframe', el);
    if (fr && fr.dataset.loaded === '1') { fr.dataset.loaded = '0'; fr.src = 'about:blank'; el.classList.remove('loading'); }
  }

  function go(i) {
    if (!list.length) return;
    i = (i + list.length) % list.length;
    if (i === cur) return;
    if (cur >= 0) { unload(cur); slideEl(cur).classList.remove('on'); }
    cur = i;
    const el = slideEl(i);
    el.classList.add('on');
    head(i);
    load(i);
  }

  function fromHash() {
    const m = /^#sim-([\w-]+)$/.exec(location.hash || '');
    if (!m) return false;
    const k = list.findIndex((s) => s.id === m[1]);
    if (k < 0) return false;
    go(k);
    const sec = $('#simulator'); if (sec) sec.scrollIntoView();
    return true;
  }

  function build() {
    if (built) return;
    root = $('#sim-root');
    if (!root) return;
    list = ((window.SiteData || {}).simulators || []).filter((s) => s && s.id && (s.type === 'builtin' || s.file));
    if (!list.length) { const sec = $('#simulator'); if (sec) sec.style.display = 'none'; return; }
    built = true;
    const multi = list.length > 1;
    root.innerHTML = `
      <div class="ss" role="region" aria-roledescription="carousel" aria-label="Simulators" tabindex="-1">
        <div class="ss-head">
          <div class="ss-meta">
            <h3 class="ss-title"></h3>
            <p class="ss-desc"></p>
            <div class="ss-tags"></div>
          </div>
          <div class="ss-tools">
            ${multi ? `<span class="ss-count" aria-live="polite"></span>
            <button type="button" class="ss-btn" data-ss="prev" aria-label="Previous"><i class="fa-solid fa-chevron-left ss-ico"></i></button>
            <button type="button" class="ss-btn" data-ss="next" aria-label="Next"><i class="fa-solid fa-chevron-right ss-ico"></i></button>` : '<span class="ss-count" style="display:none"></span>'}
            <span class="ss-act">
              <button type="button" class="ss-btn" data-ss="full" title="Fullscreen" aria-label="Fullscreen"><i class="fa-solid fa-expand"></i></button>
              <a class="ss-btn ss-newtab" target="_blank" rel="noopener" title="Open in new tab" aria-label="Open in new tab"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
            </span>
          </div>
        </div>
        <div class="ss-stage">
          ${list.map((s, i) => s.type === 'builtin'
            ? `<div class="ss-slide" data-i="${i}"><div id="sim-builtin"></div></div>`
            : `<div class="ss-slide" data-i="${i}">
                <iframe class="ss-frame" title="${esc(s.titleEn)}" style="height:${Math.max(280, +s.height || 600)}px" allowfullscreen
                  sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-modals allow-downloads" src="about:blank"></iframe>
                <div class="ss-spin" aria-hidden="true"></div>
                <div class="ss-err" style="display:none"><i class="fa-solid fa-triangle-exclamation"></i>
                  <div>${T('This simulator file could not be found:', 'فایل این شبیه‌ساز پیدا نشد:')} <code class="ss-err-path"></code></div>
                  <div class="ss-err-hint">${T('Check the file name in js/data/simulators.js and that the file is inside the simulations folder.', 'نام فایل را در js/data/simulators.js و وجود فایل در پوشه‌ی simulations را بررسی کن.')}</div>
                </div>
              </div>`).join('')}
        </div>
        ${multi ? `<div class="ss-tabs" role="tablist">${list.map((s, i) =>
          `<button type="button" role="tab" class="ss-tab" data-ss-go="${i}" aria-selected="false"><i class="${esc(s.icon || 'fa-solid fa-microchip')}"></i>${T(s.titleEn, s.titleFa)}</button>`).join('')}</div>` : ''}
      </div>`;

    root.addEventListener('click', (e) => {
      const g = e.target.closest('[data-ss-go]');
      if (g) return go(+g.dataset.ssGo);
      const b = e.target.closest('[data-ss]');
      if (!b) return;
      const a = b.dataset.ss;
      if (a === 'next') go(cur + 1);
      else if (a === 'prev') go(cur - 1);
      else if (a === 'full') {
        const s = list[cur];
        if (typeof openEngTool === 'function' && s.file) {
          openEngTool(s.file, null);
          const t = $('#tool-fs-title'); if (t) t.textContent = fa() ? (s.titleFa || s.titleEn) : s.titleEn;
        } else window.open(s.file, '_blank', 'noopener');
      }
    });
    // کلیدهای جهتی؛ داخل فیلدهای ورودی (مثل اسلایدر مصرف) کار نمی‌کنن
    root.addEventListener('keydown', (e) => {
      if (!multi || e.altKey || e.ctrlKey || e.metaKey) return;
      if (/^(INPUT|SELECT|TEXTAREA)$/.test((e.target.tagName || ''))) return;
      if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
      const forward = (e.key === 'ArrowRight') !== fa();
      go(cur + (forward ? 1 : -1));
      e.preventDefault();
    });
    // کشیدن انگشت روی هدر و تب‌ها (روی خود شبیه‌ساز فعال نیست تا با کنترل‌هاش تداخل نکنه)
    let x0 = null, y0 = 0;
    const swipeZones = [$('.ss-head', root), $('.ss-tabs', root)].filter(Boolean);
    swipeZones.forEach((z) => {
      z.addEventListener('touchstart', (e) => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
      z.addEventListener('touchend', (e) => {
        if (x0 == null || !multi) return;
        const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
        x0 = null;
        if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy) * 1.5) go(cur + ((dx < 0) !== fa() ? 1 : -1));
      }, { passive: true });
    });
    window.addEventListener('hashchange', fromHash);
    if (!fromHash()) go(0);
  }

  window.ProSimSlider = { build, go: (i) => go(i), count: () => list.length };
})();
