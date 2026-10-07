// ════════════════════════════════════════
//  03-video-data.js — بازدید، لایک، تماشای بعداً، تاریخچه
//  از js/app.js (خط 506 تا 827) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
// ── Real view counter (persisted in the browser) ──
// شمارنده‌ی بازدید واقعی که روی مرورگر کاربر ذخیره و به عدد نمایشی پایه اضافه می‌شه
function getVideoViewsStore() {
  try { return JSON.parse(localStorage.getItem('videoViewsV1') || '{}'); } catch (e) { return {}; }
}
function setVideoViewsStore(store) {
  try { localStorage.setItem('videoViewsV1', JSON.stringify(store)); } catch (e) {}
}
function getExtraViews(url) {
  if (!url) return 0;
  return getVideoViewsStore()[url] || 0;
}
function getTotalViewsNumber(v) {
  return parseCountStr(v.views) + getExtraViews(v.url);
}
// یه بازدید واقعی جدید رو برای این لینک ثبت می‌کنه
function registerVideoView(url) {
  if (!url) return 0;
  const store = getVideoViewsStore();
  store[url] = (store[url] || 0) + 1;
  setVideoViewsStore(store);
  return store[url];
}
// بعد از شروع پخش، شمارنده‌ی بازدید رو هم در حافظه و هم روی خودِ کارت آپدیت می‌کنه
function bumpViewUiForCard(card, video) {
  if (!video) return;
  registerVideoView(video.url);
  const el = card && card.querySelector('.vv-count');
  if (el) el.textContent = formatCount(getTotalViewsNumber(video));
}

// ── NEW badge ──
// اگه تاریخ ویدیو (dateISO یا date) به امروز نزدیک باشه (کمتر از ۱۴ روز)، برچسب «جدید» نشون داده می‌شه
function isVideoNew(v) {
  const raw = v.dateISO || v.date;
  if (!raw) return false;
  const t = Date.parse(raw);
  if (isNaN(t)) return false;
  const diffDays = (Date.now() - t) / 86400000;
  return diffDays > -2 && diffDays <= 14;
}

// ── Duration filter (short / medium / long) ──
// رشته‌ی مدت زمان مثل '3:42' یا '1:02:10' رو به ثانیه تبدیل می‌کنه
function durationToSeconds(dur) {
  if (!dur) return 0;
  const parts = String(dur).trim().split(':').map(s => parseInt(s, 10));
  if (!parts.length || parts.some(n => isNaN(n))) return 0;
  if (parts.length === 3) return parts[0] * 3600 + parts[1] * 60 + parts[2];
  if (parts.length === 2) return parts[0] * 60 + parts[1];
  return parts[0] || 0;
}
// دسته مدت‌زمان رو برمی‌گردونه: short (زیر ۵ دقیقه) / medium (۵ تا ۲۰ دقیقه) / long (بالای ۲۰ دقیقه)
function getDurationCategory(dur) {
  const s = durationToSeconds(dur);
  if (s <= 0) return 'unknown';
  if (s < 300) return 'short';
  if (s <= 1200) return 'medium';
  return 'long';
}

// لیست ویدیوها رو بر اساس دسته‌بندی فعلی، متن جستجو، فیلتر مدت‌زمان و نوع مرتب‌سازی فیلتر می‌کنه
function getFilteredSortedVideos() {
  const isFA = document.body.classList.contains('rtl');
  let list = defaultVideos().slice();
  if (videoUiState.cat !== 'all') list = list.filter(v => (v.cat || '') === videoUiState.cat);
  if (videoUiState.duration && videoUiState.duration !== 'all') list = list.filter(v => getDurationCategory(v.dur) === videoUiState.duration);
  const q = videoUiState.query.trim().toLowerCase();
  if (q) {
    list = list.filter(v => {
      const t = (isFA ? (v.titleFa || v.title) : (v.titleEn || v.title) || '').toLowerCase();
      const d = (isFA ? (v.descFa || v.desc) : (v.descEn || v.desc) || '').toLowerCase();
      return t.indexOf(q) !== -1 || d.indexOf(q) !== -1;
    });
  }
  if (videoUiState.sort === 'views') list.sort((a, b) => getTotalViewsNumber(b) - getTotalViewsNumber(a));
  else if (videoUiState.sort === 'likes') list.sort((a, b) => parseCountStr(b.likes) - parseCountStr(a.likes));
  return list;
}

// ── Video likes (persisted in the browser) ──
// لایک واقعی ویدیو که توی مرورگر کاربر ذخیره می‌مونه
function getVideoLikesStore() {
  try { return JSON.parse(localStorage.getItem('videoLikesV1') || '{}'); } catch (e) { return {}; }
}
function setVideoLikesStore(store) {
  try { localStorage.setItem('videoLikesV1', JSON.stringify(store)); } catch (e) {}
}
function isVideoLiked(url) {
  return !!(url && getVideoLikesStore()[url]);
}

// ── Watch Later (persisted in the browser) ──
function getWatchLaterStore() {
  try { return JSON.parse(localStorage.getItem('watchLaterV1') || '{}'); } catch (e) { return {}; }
}
function setWatchLaterStore(store) {
  try { localStorage.setItem('watchLaterV1', JSON.stringify(store)); } catch (e) {}
}
function isInWatchLater(url) {
  return !!(url && getWatchLaterStore()[url]);
}
// لیست «بعداً ببین» رو (ذخیره‌شده در مرورگر) toggle می‌کنه
function toggleWatchLaterBtn(btn) {
  const url = btn.dataset.url;
  if (!url) return;
  const store = getWatchLaterStore();
  store[url] = !store[url];
  setWatchLaterStore(store);
  btn.classList.toggle('active', !!store[url]);
  const icon = btn.querySelector('i');
  if (icon) icon.className = store[url] ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
}

// ── Watched badge (وقتی ویدیو کامل تا انتها پخش بشه) ──
function getWatchedStore() {
  try { return JSON.parse(localStorage.getItem('watchedVideosV1') || '[]'); } catch (e) { return []; }
}
function setWatchedStore(list) {
  try { localStorage.setItem('watchedVideosV1', JSON.stringify(list)); } catch (e) {}
}
function isVideoWatched(url) {
  return !!url && getWatchedStore().indexOf(url) !== -1;
}
// یه ویدیو رو «دیده‌شده» علامت می‌زنه، برچسبش رو (اگه کارتش توی صفحه باشه) زنده آپدیت می‌کنه، و پنل آمار رو دوباره می‌سازه
function markVideoWatched(url) {
  if (!url) return;
  const list = getWatchedStore();
  if (list.indexOf(url) === -1) {
    list.push(url);
    setWatchedStore(list);
  }
  const isFA = document.body.classList.contains('rtl');
  document.querySelectorAll('.video-card[data-vurl]').forEach(c => {
    if (c.dataset.vurl !== url || c.querySelector('.video-watched-badge')) return;
    const thumbWrap = c.querySelector('.video-thumb-wrap');
    if (!thumbWrap) return;
    const b = document.createElement('span');
    b.className = 'video-watched-badge';
    b.innerHTML = `<i class="fa-solid fa-check"></i> ${isFA ? 'دیده شده' : 'Watched'}`;
    thumbWrap.appendChild(b);
  });
  renderWatchStatsPanel();
}

// ── پنل کوچیک «آمار تماشای من» (از روی داده‌های ذخیره‌شده در مرورگر) ──
function renderWatchStatsPanel() {
  const el = document.getElementById('video-watch-stats');
  if (!el) return;
  const isFA = document.body.classList.contains('rtl');
  const watchedUrls = getWatchedStore();
  const vids = defaultVideos().filter(v => watchedUrls.indexOf(v.url) !== -1);
  if (!vids.length) {
    el.style.display = 'none';
    el.innerHTML = '';
    return;
  }
  const totalSec = vids.reduce((s, v) => s + durationToSeconds(v.dur), 0);
  const mins = Math.max(1, Math.round(totalSec / 60));
  el.style.display = 'flex';
  el.innerHTML = `<i class="fa-solid fa-chart-simple"></i>` +
    `<span>${isFA ? `${vids.length} ویدیو دیده‌ای` : `${vids.length} video${vids.length === 1 ? '' : 's'} watched`}</span>` +
    `<span class="vws-dot">·</span>` +
    `<span>${isFA ? `حدود ${mins} دقیقه` : `~${mins} min`}</span>`;
}
// لایک/آنلایک یه ویدیو رو ذخیره و روی دکمه اعمال می‌کنه
function toggleVideoLikeBtn(btn) {
  const url = btn.dataset.url;
  if (!url) return;
  const store = getVideoLikesStore();
  store[url] = !store[url];
  setVideoLikesStore(store);
  btn.classList.toggle('active', !!store[url]);
  const icon = btn.querySelector('i');
  if (icon) icon.className = store[url] ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
}

// لینک ویدیو رو کپی می‌کنه (اشتراک‌گذاری)
function shareVideoLink(btn) {
  const url = btn.dataset.url;
  if (!url) return;
  const isFA = document.body.classList.contains('rtl');
  const span = btn.querySelector('span');
  const original = span ? span.textContent : '';
  const showDone = () => {
    if (!span) return;
    span.textContent = isFA ? 'کپی شد!' : 'Copied!';
    setTimeout(() => { span.textContent = original; }, 1800);
  };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(url).then(showDone).catch(() => prompt(isFA ? 'کپی کن:' : 'Copy this link:', url));
  } else {
    prompt(isFA ? 'کپی کن:' : 'Copy this link:', url);
  }
}

// یه ویدیو رو از روی لینکش توی داده پیدا می‌کنه
function findVideoByUrl(url) {
  return defaultVideos().find(v => v.url === url);
}

// ── Recently Watched (persisted in the browser) ──
// تاریخچه‌ی آخرین ویدیوهایی که کاربر پخش کرده، توی مرورگرش ذخیره می‌مونه
const RECENTLY_WATCHED_KEY = 'recentlyWatchedV1';
const RECENTLY_WATCHED_MAX = 10;
function getRecentlyWatched() {
  try { return JSON.parse(localStorage.getItem(RECENTLY_WATCHED_KEY) || '[]'); } catch (e) { return []; }
}
function setRecentlyWatched(list) {
  try { localStorage.setItem(RECENTLY_WATCHED_KEY, JSON.stringify(list)); } catch (e) {}
}
// یه ویدیو رو به اول تاریخچه‌ی «اخیراً دیده‌شده» اضافه می‌کنه و نوار بالای گرید رو دوباره می‌سازه
function addRecentlyWatched(url) {
  if (!url) return;
  let list = getRecentlyWatched().filter(u => u !== url);
  list.unshift(url);
  if (list.length > RECENTLY_WATCHED_MAX) list = list.slice(0, RECENTLY_WATCHED_MAX);
  setRecentlyWatched(list);
  renderRecentlyWatchedRow();
}
// نوار کوچیک «اخیراً دیده‌شده» رو بالای گرید ویدیوها می‌سازه
function renderRecentlyWatchedRow() {
  const wrap = document.getElementById('recently-watched-row');
  if (!wrap) return;
  const isFA = document.body.classList.contains('rtl');
  const esc = s => (s || '').replace(/'/g, "\\'");
  const items = getRecentlyWatched().map(u => findVideoByUrl(u)).filter(Boolean);
  if (!items.length) { wrap.innerHTML = ''; wrap.style.display = 'none'; return; }
  wrap.style.display = 'block';
  const label = isFA ? 'اخیراً دیده‌شده' : 'Recently watched';
  wrap.innerHTML = `<div class="rw-label">${label}</div><div class="rw-strip">` + items.map(v => {
    const title = isFA ? (v.titleFa || v.titleEn || '') : (v.titleEn || v.titleFa || '');
    const meta = VIDEO_CAT_META[v.cat] || {};
    const icon = v.icon || meta.icon || 'fa-solid fa-video';
    const thumb = v.image ?
      `<img src="${v.image}" alt="">` :
      `<div class="rw-thumb-icon"><i class="${icon}"></i></div>`;
    return `<button class="rw-item" onclick="jumpToVideoFromHistory('${esc(v.url)}')">${thumb}<span>${(title || '').replace(/</g, '&lt;')}</span></button>`;
  }).join('') + `</div>`;
}
// روی یه آیتم تاریخچه کلیک می‌شه: فیلترها ریست می‌شن، تا اون ویدیو اسکرول و پخش می‌شه
function jumpToVideoFromHistory(url) {
  videoUiState.cat = 'all';
  videoUiState.query = '';
  videoUiState.duration = 'all';
  const searchInput = document.getElementById('video-search-input');
  if (searchInput) searchInput.value = '';
  const durSelect = document.getElementById('video-duration-select');
  if (durSelect) durSelect.value = 'all';
  const filtered = getFilteredSortedVideos();
  const idx = filtered.findIndex(v => v.url === url);
  if (idx === -1) return;
  videoUiState.visible = Math.max(videoUiState.visible, idx + 1);
  renderVideosToPage();
  requestAnimationFrame(() => {
    let card = null;
    try { card = document.querySelector(`.video-card[data-vurl="${CSS.escape(url)}"]`); } catch (e) {}
    if (!card) card = Array.from(document.querySelectorAll('.video-card')).find(c => c.dataset.vurl === url);
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setTimeout(() => playVideo(card, url), 350);
    }
  });
}

// نوار «ویدیوهای مرتبط» زیر پخش‌کننده رو می‌سازه (بر اساس دسته‌بندی یکسان)
function renderRelatedStrip(card, currentVideo) {
  const wrap = card.querySelector('.video-related-strip');
  if (!wrap) return;
  const isFA = document.body.classList.contains('rtl');
  const esc = s => (s || '').replace(/'/g, "\\'");
  const related = defaultVideos().filter(v => v.cat === currentVideo.cat && v.url !== currentVideo.url).slice(0, 3);
  if (!related.length) { wrap.innerHTML = ''; return; }
  const label = isFA ? 'ویدیوهای مرتبط' : 'Related videos';
  wrap.innerHTML = `<div class="video-related-label">${label}</div>` + related.map(v => {
    const title = isFA ? (v.titleFa || v.title || '') : (v.titleEn || v.title || '');
    return `<button class="video-related-item" onclick="event.stopPropagation();playRelatedVideo(this.closest('.video-card'), '${esc(v.url)}')"><span class="video-related-dot"></span>${title}</button>`;
  }).join('');
}

// یه ویدیوی مرتبط رو داخل همون کارتِ درحال پخش، جایگزین می‌کنه
function playRelatedVideo(card, url) {
  const video = findVideoByUrl(url);
  if (!video || !card) return;
  const isFA = document.body.classList.contains('rtl');
  card.dataset.vcat = video.cat || '';
  card.dataset.vurl = video.url || '';
  const titleEl = card.querySelector('.video-title');
  const descEl = card.querySelector('.video-desc');
  if (titleEl) titleEl.textContent = isFA ? (video.titleFa || video.title || '') : (video.titleEn || video.title || '');
  if (descEl) descEl.textContent = isFA ? (video.descFa || video.desc || '') : (video.descEn || video.desc || '');
  const likeBtn = card.querySelector('.vab-like');
  if (likeBtn) {
    likeBtn.dataset.url = video.url;
    const liked = isVideoLiked(video.url);
    likeBtn.classList.toggle('active', liked);
    const icon = likeBtn.querySelector('i');
    if (icon) icon.className = liked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  }
  const shareBtn = card.querySelector('.vab-share');
  if (shareBtn) shareBtn.dataset.url = video.url;
  const watchLaterBtn = card.querySelector('.vab-watchlater');
  if (watchLaterBtn) {
    watchLaterBtn.dataset.url = video.url;
    const inWL = isInWatchLater(video.url);
    watchLaterBtn.classList.toggle('active', inWL);
    const wlIcon = watchLaterBtn.querySelector('i');
    if (wlIcon) wlIcon.className = inWL ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
  }
  const timestampBtn = card.querySelector('.vab-timestamp');
  if (timestampBtn) timestampBtn.dataset.url = video.url;
  const embedBtn = card.querySelector('.vab-embed');
  if (embedBtn) embedBtn.dataset.url = video.url;
  const reportBtn = card.querySelector('.vab-report');
  if (reportBtn) reportBtn.dataset.url = video.url;
  const playerWrap = card.querySelector('.video-player-wrap');
  if (playerWrap) embedIntoPlayerWrap(playerWrap, video.url, card);
  renderRelatedStrip(card, video);
  bumpViewUiForCard(card, video);
  addRecentlyWatched(video.url);
}

