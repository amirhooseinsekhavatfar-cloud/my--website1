// ════════════════════════════════════════
//  04-video-filters.js — دسته‌بندی، جستجو، مرتب‌سازی
//  از js/app.js (خط 828 تا 991) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
// ── Categories / tabs ────────────────────────
// تب‌های دسته‌بندی رو کاملاً از روی دسته‌بندی‌های موجود توی داده می‌سازه —
// اگه یه دسته‌بندی جدید توی videos.js اضافه کنی، خودش این‌جا هم اضافه می‌شه
function renderVideoTabsToPage() {
  const wrap = document.getElementById('rvtabs');
  if (!wrap) return;
  const isFA = document.body.classList.contains('rtl');
  const cats = [];
  defaultVideos().forEach(v => { if (v.cat && cats.indexOf(v.cat) === -1) cats.push(v.cat); });
  let html = `<button class="rvtab${videoUiState.cat === 'all' ? ' active' : ''}" onclick="filterVideos('all',this)">${isFA ? 'همه' : 'All'}</button>`;
  html += cats.map(cat => {
    const meta = VIDEO_CAT_META[cat] || {};
    const label = isFA ? (meta.labelFa || cat.toUpperCase()) : (meta.labelEn || cat.toUpperCase());
    return `<button class="rvtab${videoUiState.cat === cat ? ' active' : ''}" onclick="filterVideos('${cat}',this)">${label}</button>`;
  }).join('');
  wrap.innerHTML = html;
}

// ── Search / Sort / Load more ────────────────
let videoSearchDebounce = null;
function onVideoSearchInput(value) {
  videoUiState.query = value || '';
  videoUiState.visible = VIDEO_PAGE_SIZE;
  clearTimeout(videoSearchDebounce);
  videoSearchDebounce = setTimeout(() => renderVideosToPage(), 150);
}
function onVideoSortChange(value) {
  videoUiState.sort = value;
  videoUiState.visible = VIDEO_PAGE_SIZE;
  renderVideosToPage();
}
function onVideoDurationChange(value) {
  videoUiState.duration = value;
  videoUiState.visible = VIDEO_PAGE_SIZE;
  renderVideosToPage();
}
function loadMoreVideos() {
  videoUiState.visible += VIDEO_PAGE_SIZE;
  renderVideosToPage();
}


// کارت‌های ویدیو رو کاملاً از روی داده می‌سازه — تصویر بندانگشتی و خود ویدیو
// فقط از طریق لینک (url / image) تنظیم می‌شن، نیازی به آپلود فایل نیست
// یه کارت ویدیوی تکی رو از روی داده می‌سازه (شامل نوار لایک/اشتراک و جای ویدیوهای مرتبط)
function buildVideoCardHtml(v, isFA, esc) {
  const meta = VIDEO_CAT_META[v.cat] || {};
  const color = v.color || meta.color || '';
  const icon = v.icon || meta.icon || 'fa-solid fa-video';
  const title = isFA ? (v.titleFa || v.title || '') : (v.titleEn || v.title || '');
  const desc = isFA ? (v.descFa || v.desc || '') : (v.descEn || v.desc || '');
  const label = isFA ?
    (v.labelFa || v.label || meta.labelFa || (v.cat || '').toUpperCase()) :
    (v.labelEn || v.label || meta.labelEn || (v.cat || '').toUpperCase());
  const thumb = v.image ?
    `<img class="video-thumb-img" src="${v.image}" alt="${(title || '').replace(/"/g, '&quot;')}" loading="lazy">` :
    `<div class="video-thumb-icon"${color ? ` style="color:${color}"` : ''}><i class="${icon}"></i></div>`;
  const urlAttr = esc(v.url);
  const liked = isVideoLiked(v.url);
  const inWatchLater = isInWatchLater(v.url);
  const watched = isVideoWatched(v.url);
  const newBadge = isVideoNew(v) ? `<span class="video-new-badge">${isFA ? 'جدید' : 'NEW'}</span>` : '';
  const watchedBadge = watched ? `<span class="video-watched-badge"><i class="fa-solid fa-check"></i> ${isFA ? 'دیده شده' : 'Watched'}</span>` : '';
  return `<div class="video-card" data-vcat="${v.cat || ''}" data-vurl="${urlAttr}" onclick="playVideo(this,'${urlAttr}')">
    <div class="video-thumb-wrap">
      ${thumb}
      <div class="video-thumb-gradient"></div>
      <div class="video-play-overlay"><div class="video-play-btn"><i class="fa-solid fa-play" style="margin-left:3px"></i></div></div>
      <span class="video-cat-badge"${color ? ` style="background:${color}CC"` : ''}>${label}</span>
      ${newBadge}
      ${watchedBadge}
      <span class="video-duration-badge">${v.dur || ''}</span>
    </div>
    <div class="video-player-wrap"></div>
    <div class="video-related-strip"></div>
    <button class="video-close-player" onclick="event.stopPropagation();stopVideo(this)" style="display:none"><i class="fa-solid fa-xmark"></i></button>
    <div class="video-info">
      <div class="video-title">${title}</div>
      <div class="video-desc">${desc}</div>
      <div class="video-meta-row">
        <div class="video-meta-left">
          <span class="video-stat video-views-stat"><i class="fa-solid fa-eye"></i> <span class="vv-count">${formatCount(getTotalViewsNumber(v))}</span></span>
          <span class="video-stat"><i class="fa-solid fa-heart" style="color:#f87171"></i> <span class="vl-count">${v.likes || '0'}</span></span>
        </div>
        <span style="font-family:var(--mo);font-size:.65rem">${v.date || ''}</span>
      </div>
      <div class="video-actions-row">
        <button class="video-action-btn vab-like${liked ? ' active' : ''}" data-url="${urlAttr}" onclick="event.stopPropagation();toggleVideoLikeBtn(this)"><i class="fa-${liked ? 'solid' : 'regular'} fa-heart"></i><span>${isFA ? 'پسندیدم' : 'Like'}</span></button>
        <button class="video-action-btn vab-share" data-url="${urlAttr}" onclick="event.stopPropagation();shareVideoLink(this)"><i class="fa-solid fa-share-nodes"></i><span>${isFA ? 'اشتراک' : 'Share'}</span></button>
        <button class="video-action-btn icon-only vab-watchlater${inWatchLater ? ' active' : ''}" data-url="${urlAttr}" title="${isFA ? 'بعداً ببین' : 'Watch later'}" onclick="event.stopPropagation();toggleWatchLaterBtn(this)"><i class="fa-${inWatchLater ? 'solid' : 'regular'} fa-bookmark"></i></button>
        <button class="video-action-btn icon-only vab-timestamp" data-url="${urlAttr}" title="${isFA ? 'کپی زمان فعلی ویدیو' : 'Copy current timestamp'}" onclick="event.stopPropagation();copyVideoTimestamp(this)"><i class="fa-solid fa-clock"></i></button>
        <button class="video-action-btn icon-only vab-theater" title="${isFA ? 'حالت تئاتر' : 'Theater mode'}" onclick="event.stopPropagation();openTheaterMode(this.closest('.video-card'))"><i class="fa-solid fa-expand"></i></button>
        <button class="video-action-btn icon-only vab-pip" title="${isFA ? 'پخش شناور (Picture-in-Picture)' : 'Picture-in-picture'}" onclick="event.stopPropagation();toggleMiniPlayer(this.closest('.video-card'))"><i class="fa-regular fa-window-restore"></i></button>
        <button class="video-action-btn icon-only vab-embed" data-url="${urlAttr}" title="${isFA ? 'کپی کد امبد' : 'Copy embed code'}" onclick="event.stopPropagation();copyEmbedLink(this)"><i class="fa-solid fa-code"></i></button>
        <button class="video-action-btn icon-only vab-report" data-url="${urlAttr}" title="${isFA ? 'گزارش لینک خراب' : 'Report broken link'}" onclick="event.stopPropagation();reportBrokenVideo(this)"><i class="fa-solid fa-triangle-exclamation"></i></button>
      </div>
    </div>
  </div>`;
}

// کارت‌های ویدیو رو کاملاً از روی داده می‌سازه — فیلتر دسته‌بندی، جستجو، مرتب‌سازی
// و صفحه‌بندی (نمایش بیشتر) رو هم اعمال می‌کنه. تصویر بندانگشتی و خود ویدیو
// فقط از طریق لینک (url / image) تنظیم می‌شن، نیازی به آپلود فایل نیست
function renderVideosToPage() {
  const grid = document.getElementById('videos-grid');
  if (!grid) return false;
  const isFA = document.body.classList.contains('rtl');
  const esc = s => (s || '').replace(/'/g, "\\'");

  renderVideoTabsToPage();
  renderRecentlyWatchedRow();
  renderWatchStatsPanel();

  const filtered = getFilteredSortedVideos();
  const visible = filtered.slice(0, videoUiState.visible);

  grid.innerHTML = visible.length ?
    visible.map(v => buildVideoCardHtml(v, isFA, esc)).join('') :
    `<div class="video-empty-msg">${isFA ? 'ویدیویی پیدا نشد.' : 'No videos found.'}</div>`;

  // اطمینان از اینکه کارت اول همیشه کامل نمایش داده می‌شه (نه نصفه)،
  // چون بعضی مرورگرهای موبایل موقعیت اسکرول اولیه رو در حالت RTL اشتباه محاسبه می‌کنن
  // (روی موبایل اسکرول عمودیه، پس scrollTop هم ریست می‌شه)
  requestAnimationFrame(() => {
    grid.scrollLeft = 0;
    grid.scrollTop = 0;
    requestAnimationFrame(() => { grid.scrollLeft = 0; grid.scrollTop = 0; });
  });

  const loadMoreBtn = document.getElementById('video-load-more-btn');
  if (loadMoreBtn) {
    loadMoreBtn.style.display = filtered.length > visible.length ? 'inline-flex' : 'none';
    loadMoreBtn.textContent = isFA ? 'نمایش بیشتر' : 'Load more';
  }

  const searchInput = document.getElementById('video-search-input');
  if (searchInput) searchInput.placeholder = isFA ? 'جستجوی ویدیو…' : 'Search videos…';

  const sortSelect = document.getElementById('video-sort-select');
  if (sortSelect) {
    const optNewest = sortSelect.querySelector('option[value="newest"]');
    const optViews = sortSelect.querySelector('option[value="views"]');
    const optLikes = sortSelect.querySelector('option[value="likes"]');
    if (optNewest) optNewest.textContent = isFA ? 'جدیدترین' : 'Newest';
    if (optViews) optViews.textContent = isFA ? 'پربازدیدترین' : 'Most viewed';
    if (optLikes) optLikes.textContent = isFA ? 'پرلایک‌ترین' : 'Most liked';
    sortSelect.value = videoUiState.sort;
  }

  const durSelect = document.getElementById('video-duration-select');
  if (durSelect) {
    const optAll = durSelect.querySelector('option[value="all"]');
    const optShort = durSelect.querySelector('option[value="short"]');
    const optMedium = durSelect.querySelector('option[value="medium"]');
    const optLong = durSelect.querySelector('option[value="long"]');
    if (optAll) optAll.textContent = isFA ? 'همه مدت‌ها' : 'All lengths';
    if (optShort) optShort.textContent = isFA ? 'کوتاه (زیر ۵ دقیقه)' : 'Short (<5 min)';
    if (optMedium) optMedium.textContent = isFA ? 'متوسط (۵ تا ۲۰ دقیقه)' : 'Medium (5-20 min)';
    if (optLong) optLong.textContent = isFA ? 'بلند (بالای ۲۰ دقیقه)' : 'Long (20+ min)';
    durSelect.value = videoUiState.duration;
  }
  return true;
}

