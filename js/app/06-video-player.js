// ════════════════════════════════════════
//  06-video-player.js — پخش‌کننده ویدیو، تئاتر، PiP، میان‌برها
//  از js/app.js (خط 1219 تا 1737) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
// ══════════════════════════════════════════════
//  INLINE VIDEO PLAYER (Videos Section)
// پخش‌کننده ویدیوی داخلی (بخش ویدیوها)
// ══════════════════════════════════════════════
// لینک ویدیو رو به آدرس قابل embed تبدیل می‌کنه
function buildEmbedUrl(url) {
  if (!url) return null;
  url = url.trim();
  // Already an embed URL
  if (url.includes('/embed/')) return url.includes('autoplay') ? url : url + (url.includes('?') ? '&' : '?') + 'autoplay=1';
  // YouTube watch
  let m = url.match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/)([^&?\s\/#]+)/);
  if (m) return 'https://www.youtube.com/embed/' + m[1] + '?autoplay=1&rel=0&modestbranding=1';
  // YouTube shorts
  m = url.match(/youtube\.com\/shorts\/([^?&\s\/#]+)/);
  if (m) return 'https://www.youtube.com/embed/' + m[1] + '?autoplay=1&rel=0';
  // Aparat /v/
  m = url.match(/aparat\.com\/v\/([^/?&#\s]+)/);
  if (m) return 'https://www.aparat.com/video/video/embed/videohash/' + m[1] + '/vt/frame?autoplay=1';
  // Aparat short
  m = url.match(/aparat\.com\/([A-Za-z0-9]{5,8})(?:$|[/?#])/);
  if (m) return 'https://www.aparat.com/video/video/embed/videohash/' + m[1] + '/vt/frame?autoplay=1';
  // Direct file
  if (/\.(mp4|webm|ogg)/i.test(url)) return url;
  return null;
}

// از لینک ویدیو، آیدی یوتیوب رو استخراج می‌کنه (اگه یوتیوب باشه)
function getYouTubeId(url) {
  if (!url) return null;
  let m = url.match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/)([^&?\s\/#]+)/);
  if (m) return m[1];
  m = url.match(/youtube\.com\/shorts\/([^?&\s\/#]+)/);
  if (m) return m[1];
  m = url.match(/youtube\.com\/embed\/([^?&\s\/#]+)/);
  if (m) return m[1];
  return null;
}

// اسکریپت YouTube IFrame API رو (فقط یه‌بار) لود می‌کنه — لازم برای «پخش خودکار ویدیوی بعدی» و «کپی زمان فعلی»
let ytApiLoadPromise = null;
function loadYouTubeApi() {
  if (window.YT && window.YT.Player) return Promise.resolve(window.YT);
  if (ytApiLoadPromise) return ytApiLoadPromise;
  ytApiLoadPromise = new Promise((resolve) => {
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = function() {
      if (typeof prev === 'function') { try { prev(); } catch (e) {} }
      resolve(window.YT);
    };
    if (!document.querySelector('script[src*="youtube.com/iframe_api"]')) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.head.appendChild(tag);
    }
  });
  return ytApiLoadPromise;
}

// وضعیت پخش‌کننده‌ی هر کارت (پلیر یوتیوب یا المنت ویدیوی مستقیم) رو نگه می‌داره —
// لازم برای «کپی زمان فعلی» و «پخش خودکار ویدیوی بعدی»
let ytPlayerUid = 0;
const videoPlayerState = new WeakMap();

// پلیر فعال یه کارت رو (اگه یوتیوبه) نابود می‌کنه تا حافظه/چندتایی پخش شدن نشتی نکنه
function destroyCardPlayer(card) {
  const state = videoPlayerState.get(card);
  if (!state) return;
  if (state.type === 'youtube' && state.player && typeof state.player.destroy === 'function') {
    try { state.player.destroy(); } catch (e) {}
  }
  videoPlayerState.delete(card);
}

// لینک ویدیو رو داخل یه player-wrap مشخص، پخش می‌کنه (برای پخش اول و برای سوییچ به ویدیوی مرتبط هم استفاده می‌شه)
// یوتیوب: از YouTube IFrame API استفاده می‌شه (برای پخش خودکار بعدی و کپی زمان فعلی)
// فایل مستقیم (mp4/webm/ogg): با <video> واقعی، رویداد ended هم گوش داده می‌شه
// آپارات/سایر: امبد ساده (بدون پشتیبانی از تایم‌استمپ/پخش خودکار بعدی)
function embedIntoPlayerWrap(playerWrap, url, card) {
  if (!url) return false;
  url = url.trim();
  const isFile = /\.(mp4|webm|ogg)(\?|#|$)/i.test(url);
  const ytId = !isFile ? getYouTubeId(url) : null;
  const fallbackEmbedUrl = (!isFile && !ytId) ? buildEmbedUrl(url) : null;
  if (!isFile && !ytId && !fallbackEmbedUrl) return false;

  if (card) destroyCardPlayer(card);
  playerWrap.innerHTML = '';
  const wrap = document.createElement('div');
  wrap.className = 'vp-iframe-wrap';
  playerWrap.appendChild(wrap);
  playerWrap.classList.add('vp-active');

  if (ytId) {
    const holderId = 'yt-player-' + (++ytPlayerUid);
    const holder = document.createElement('div');
    holder.id = holderId;
    wrap.appendChild(holder);
    loadYouTubeApi().then(YT => {
      if (!document.getElementById(holderId)) return; // کاربر قبل از لود شدن API بست
      const player = new YT.Player(holderId, {
        videoId: ytId,
        playerVars: { autoplay: 1, rel: 0, modestbranding: 1 },
        events: {
          onStateChange: e => {
            if (e.data === YT.PlayerState.ENDED && card) {
              markVideoWatched(card.dataset.vurl);
              playNextRelatedVideoForCard(card);
            }
          }
        }
      });
      if (card) videoPlayerState.set(card, { type: 'youtube', player });
    }).catch(() => {});
    return true;
  }

  if (isFile) {
    const v = document.createElement('video');
    v.src = url;
    v.controls = true;
    v.autoplay = true;
    v.playsInline = true;
    v.addEventListener('ended', () => {
      if (card) {
        markVideoWatched(card.dataset.vurl);
        playNextRelatedVideoForCard(card);
      }
    });
    wrap.appendChild(v);

    // کنترل سرعت پخش (0.5x تا 2x) — فقط برای فایل مستقیم چون پلیر واقعی <video> داریم
    const speedSel = document.createElement('select');
    speedSel.className = 'video-speed-select';
    speedSel.innerHTML = [0.5, 0.75, 1, 1.25, 1.5, 2].map(r => `<option value="${r}"${r === 1 ? ' selected' : ''}>${r}x</option>`).join('');
    speedSel.addEventListener('click', e => e.stopPropagation());
    speedSel.addEventListener('change', e => { e.stopPropagation(); v.playbackRate = parseFloat(speedSel.value); });
    wrap.appendChild(speedSel);

    if (card) videoPlayerState.set(card, { type: 'file', el: v });
    return true;
  }

  const fr = document.createElement('iframe');
  fr.src = fallbackEmbedUrl;
  fr.setAttribute('allow', 'autoplay; fullscreen; picture-in-picture; encrypted-media');
  fr.allowFullscreen = true;
  fr.frameBorder = '0';
  wrap.appendChild(fr);
  if (card) videoPlayerState.set(card, { type: 'iframe' });
  return true;
}

// پخش یک ویدیو رو شروع می‌کنه
function playVideo(card, url) {
  // stop others
  document.querySelectorAll('.video-card.playing').forEach(c => {
    if (c !== card) stopVideo(c.querySelector('.video-close-player'));
  });
  // toggle off
  if (card.classList.contains('playing')) {
    stopVideo(card.querySelector('.video-close-player'));
    return;
  }

  const playerWrap = card.querySelector('.video-player-wrap');
  const closeBtn = card.querySelector('.video-close-player');
  if (!embedIntoPlayerWrap(playerWrap, url, card)) {
    alert('لینک ویدیو معتبر نیست');
    return;
  }
  card.classList.add('playing');
  if (closeBtn) closeBtn.style.display = 'flex';
  const video = findVideoByUrl(url);
  if (video) {
    renderRelatedStrip(card, video);
    bumpViewUiForCard(card, video);
    addRecentlyWatched(video.url);
  }
  card.scrollIntoView({
    behavior: 'smooth',
    block: 'nearest'
  });
}

// پخش ویدیو رو متوقف می‌کنه
function stopVideo(btn) {
  if (!btn) return;
  const card = btn.closest('.video-card');
  if (!card) return;
  destroyCardPlayer(card);
  const playerWrap = card.querySelector('.video-player-wrap');
  if (playerWrap) {
    playerWrap.innerHTML = '';
    playerWrap.classList.remove('vp-active');
  }
  const relWrap = card.querySelector('.video-related-strip');
  if (relWrap) relWrap.innerHTML = '';
  card.classList.remove('playing');
  if (card.classList.contains('theater-mode')) closeTheaterMode(card);
  if (card.classList.contains('mini-player')) closeMiniPlayer(card);
  btn.style.display = 'none';
}

// ویدیوها رو بر اساس دسته‌بندی فیلتر می‌کنه
function filterVideos(cat) {
  videoUiState.cat = cat;
  videoUiState.visible = VIDEO_PAGE_SIZE;
  renderVideosToPage();
}

// ── Autoplay next: وقتی ویدیو تموم شد خودکار می‌ره سراغ اولین ویدیوی مرتبط ──
function playNextRelatedVideoForCard(card) {
  if (!card) return;
  const url = card.dataset.vurl;
  const current = findVideoByUrl(url);
  if (!current) return;
  const related = defaultVideos().filter(v => v.cat === current.cat && v.url !== current.url);
  if (!related.length) return;
  playRelatedVideo(card, related[0].url);
}

// ── Theater / fullscreen mode ──
// پخش‌کننده رو بزرگ و وسط صفحه (به‌جای فقط داخل کارت) نشون می‌ده
function openTheaterMode(card) {
  if (!card) return;
  if (!card.classList.contains('playing')) {
    const url = card.dataset.vurl;
    if (url) playVideo(card, url);
  }
  if (card.classList.contains('mini-player')) closeMiniPlayer(card);
  document.querySelectorAll('.video-card.theater-mode').forEach(c => { if (c !== card) closeTheaterMode(c); });
  card.classList.add('theater-mode');
  document.body.style.overflow = 'hidden';
  if (!card.querySelector('.video-theater-close')) {
    const btn = document.createElement('button');
    btn.className = 'video-theater-close';
    btn.innerHTML = '<i class="fa-solid fa-compress"></i>';
    btn.onclick = e => { e.stopPropagation(); closeTheaterMode(card); };
    card.appendChild(btn);
  }
}
function closeTheaterMode(card) {
  if (!card) return;
  card.classList.remove('theater-mode');
  document.body.style.overflow = '';
  const btn = card.querySelector('.video-theater-close');
  if (btn) btn.remove();
}
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const tcard = document.querySelector('.video-card.theater-mode');
    if (tcard) closeTheaterMode(tcard);
  }
});

// ── Picture-in-Picture / پخش شناور هنگام اسکرول ──
// برای فایل مستقیم از PiP واقعی مرورگر استفاده می‌کنه (پنجره‌ی سیستمی، حتی بیرون از تب).
// برای یوتیوب/آپارات (که به‌خاطر محدودیت cross-origin نمی‌شه PiP واقعی گرفت)، یه حالت
// «پخش شناور» با CSS می‌سازه: خود کارت کوچیک و ثابت گوشه‌ی صفحه می‌مونه.
function toggleMiniPlayer(card) {
  if (!card) return;
  if (card.classList.contains('mini-player')) { closeMiniPlayer(card); return; }
  if (!card.classList.contains('playing')) {
    const url = card.dataset.vurl;
    if (url) playVideo(card, url);
  }
  const state = videoPlayerState.get(card);
  if (state && state.type === 'file' && state.el && document.pictureInPictureEnabled && !state.el.disablePictureInPicture) {
    state.el.requestPictureInPicture().catch(() => enableCssMiniPlayer(card));
    return;
  }
  enableCssMiniPlayer(card);
}
function enableCssMiniPlayer(card) {
  if (card.classList.contains('theater-mode')) closeTheaterMode(card);
  document.querySelectorAll('.video-card.mini-player').forEach(c => { if (c !== card) closeMiniPlayer(c); });
  card.classList.add('mini-player');
  if (!card.querySelector('.video-mini-close')) {
    const btn = document.createElement('button');
    btn.className = 'video-mini-close';
    btn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
    btn.onclick = e => { e.stopPropagation(); closeMiniPlayer(card); };
    card.appendChild(btn);
  }
}
function closeMiniPlayer(card) {
  if (!card) return;
  card.classList.remove('mini-player');
  const btn = card.querySelector('.video-mini-close');
  if (btn) btn.remove();
}

// ── میان‌بر صفحه‌کلید هنگام پخش: Space پلی/پاز، فلش چپ/راست عقب/جلو ۱۰ ثانیه ──
function toggleCardPlayPause(card) {
  const state = videoPlayerState.get(card);
  if (!state) return;
  if (state.type === 'file' && state.el) {
    if (state.el.paused) state.el.play(); else state.el.pause();
  } else if (state.type === 'youtube' && state.player) {
    try {
      const s = state.player.getPlayerState();
      if (s === 1) state.player.pauseVideo(); else state.player.playVideo();
    } catch (e) {}
  }
}
function seekCardBy(card, delta) {
  const state = videoPlayerState.get(card);
  if (!state) return;
  if (state.type === 'file' && state.el) {
    state.el.currentTime = Math.max(0, (state.el.currentTime || 0) + delta);
  } else if (state.type === 'youtube' && state.player && typeof state.player.getCurrentTime === 'function') {
    try {
      const cur = state.player.getCurrentTime();
      state.player.seekTo(Math.max(0, cur + delta), true);
    } catch (e) {}
  }
}
document.addEventListener('keydown', e => {
  const activeTag = document.activeElement ? document.activeElement.tagName : '';
  if (activeTag === 'INPUT' || activeTag === 'TEXTAREA' || (document.activeElement && document.activeElement.isContentEditable)) return;
  const card = document.querySelector('.video-card.playing');
  if (!card) return;
  if (e.code === 'Space' || e.key === ' ') { e.preventDefault(); toggleCardPlayPause(card); }
  else if (e.key === 'ArrowRight') { e.preventDefault(); seekCardBy(card, 10); }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); seekCardBy(card, -10); }
});

// ── Copy current timestamp link ──
// زمان فعلی پخش رو از پلیر می‌گیره (یوتیوب یا ویدیوی مستقیم) و لینک قابل‌اشتراک‌گذاری می‌سازه
function getCurrentPlaybackSeconds(card) {
  const state = videoPlayerState.get(card);
  if (!state) return null;
  if (state.type === 'youtube' && state.player && typeof state.player.getCurrentTime === 'function') {
    try { return Math.floor(state.player.getCurrentTime()); } catch (e) { return null; }
  }
  if (state.type === 'file' && state.el) return Math.floor(state.el.currentTime || 0);
  return null;
}
function buildTimestampLink(url, seconds) {
  if (!url) return '';
  if (/youtube\.com|youtu\.be/.test(url)) {
    const base = url.split(/[?&]t=\d+s?/)[0].replace(/[?&]$/, '');
    const sep = base.includes('?') ? '&' : '?';
    return base + sep + 't=' + seconds + 's';
  }
  if (/\.(mp4|webm|ogg)/i.test(url)) return url.split('#')[0] + '#t=' + seconds;
  const mm = Math.floor(seconds / 60), ss = seconds % 60;
  return url + ' @ ' + mm + ':' + String(ss).padStart(2, '0');
}
function copyVideoTimestamp(btn) {
  const isFA = document.body.classList.contains('rtl');
  const card = btn.closest('.video-card');
  if (!card || !card.classList.contains('playing')) {
    alert(isFA ? 'اول ویدیو رو پخش کن تا بشه زمانش رو کپی کرد.' : 'Play the video first to copy its timestamp.');
    return;
  }
  const seconds = getCurrentPlaybackSeconds(card);
  if (seconds === null) {
    alert(isFA ? 'برای این نوع ویدیو کپی زمان پشتیبانی نمی‌شه.' : "Timestamp copy isn't supported for this video source.");
    return;
  }
  const link = buildTimestampLink(card.dataset.vurl, seconds);
  const icon = btn.querySelector('i');
  const showDone = () => { if (icon) { const old = icon.className; icon.className = 'fa-solid fa-check'; setTimeout(() => { icon.className = old; }, 1500); } };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(link).then(showDone).catch(() => prompt(isFA ? 'کپی کن:' : 'Copy this link:', link));
  } else prompt(isFA ? 'کپی کن:' : 'Copy this link:', link);
}

// ── Copy embed code (for developers) ──
function copyEmbedLink(btn) {
  const isFA = document.body.classList.contains('rtl');
  const url = btn.dataset.url;
  const ytId = getYouTubeId(url);
  const embedUrl = ytId ? ('https://www.youtube.com/embed/' + ytId) : buildEmbedUrl(url);
  if (!embedUrl) { alert(isFA ? 'این لینک قابل امبد نیست.' : "This link can't be embedded."); return; }
  const isFile = /\.(mp4|webm|ogg)/i.test(embedUrl);
  const code = isFile ?
    `<video src="${embedUrl}" controls style="width:100%;aspect-ratio:16/9"></video>` :
    `<iframe src="${embedUrl}" width="560" height="315" frameborder="0" allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe>`;
  const icon = btn.querySelector('i');
  const showDone = () => { if (icon) { const old = icon.className; icon.className = 'fa-solid fa-check'; setTimeout(() => { icon.className = old; }, 1500); } };
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(code).then(showDone).catch(() => prompt(isFA ? 'کد امبد:' : 'Embed code:', code));
  } else prompt(isFA ? 'کد امبد:' : 'Embed code:', code);
}

// ── Report broken video link ──
// اگه ویدیویی پخش نشه، کاربر می‌تونه از طریق ایمیل به توسعه‌دهنده خبر بده
function reportBrokenVideo(btn) {
  const isFA = document.body.classList.contains('rtl');
  const url = btn.dataset.url;
  const video = findVideoByUrl(url);
  const title = video ? (isFA ? (video.titleFa || video.titleEn) : (video.titleEn || video.titleFa)) : '';
  const email = (window.SiteData && window.SiteData.config && window.SiteData.config.email) || '';
  const subject = isFA ? 'گزارش لینک خراب ویدیو' : 'Broken video link report';
  const body = (isFA ? 'عنوان ویدیو: ' : 'Video title: ') + (title || '-') + '\n' +
    (isFA ? 'لینک ویدیو: ' : 'Video link: ') + (url || '-') + '\n' +
    (isFA ? 'توضیح مشکل: ' : 'Describe the issue: ') + '\n';
  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

// ══════════════════════════════════════════════
//  SIMLINK PAGE
// صفحه سیم‌لینک
// ══════════════════════════════════════════════
// صفحه سیم‌لینک رو باز می‌کنه
function openSimLink() {
  document.getElementById('simlink-page').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderSimLinkFeed();
}

// صفحه سیم‌لینک رو می‌بنده
function closeSimLink() {
  document.getElementById('simlink-page').classList.remove('open');
  document.body.style.overflow = '';
}

// لیست پست‌های سیم‌لینک رو از فایل داده برمی‌گردونه
function defaultSimLinkPosts() {
  return window.SiteData.simlinkPosts || [];
}

// نشان تعداد پست‌های جدید سیم‌لینک رو به‌روزرسانی می‌کنه
function updateSimLinkBadge() {
  const count = defaultSimLinkPosts().length;
  const b1 = document.getElementById('simlink-count-badge');
  const b2 = document.getElementById('sl-badge-count');
  if (b1) b1.textContent = count;
  if (b2) b2.textContent = count + ' پست';
}

// فید پست‌های سیم‌لینک رو روی صفحه می‌سازه
function renderSimLinkFeed() {
  const feed = document.getElementById('sl-feed');
  const empty = document.getElementById('sl-empty');
  if (!feed) return;
  const posts = defaultSimLinkPosts();
  updateSimLinkBadge();
  if (!posts.length) {
    if (empty) empty.style.display = 'block';
    feed.innerHTML = '';
    feed.appendChild(empty || document.createElement('div'));
    return;
  }
  if (empty) empty.style.display = 'none';
  const typeBadge = {
    project: 'PROJECT UPDATE',
    tech: 'ENGINEERING',
    insight: 'INSIGHT',
    announcement: 'ANNOUNCEMENT',
    link: 'LINK'
  };
  const typeColor = {
    project: 'rgba(255,122,26,.2)',
    tech: 'rgba(34,197,94,.15)',
    insight: 'rgba(251,191,36,.15)',
    announcement: 'rgba(239,68,68,.15)',
    link: 'rgba(179,71,0,.2)'
  };
  const typeTextColor = {
    project: 'var(--ac3)',
    tech: '#4ade80',
    insight: '#fcd34d',
    announcement: '#f87171',
    link: '#c084fc'
  };
  feed.innerHTML = posts.map((p, i) => `
    <div class="post-card" style="border-color:rgba(179,71,0,.2)">
      <div class="post-header">
        <div class="post-avatar sl-post-avatar" style="background:linear-gradient(135deg,#B34700,#4f46e5)"><i class="fa-solid fa-diagram-project"></i></div>
        <div class="post-meta">
          <div class="post-author">Amir Hosin Sekhavatfar</div>
          <div class="post-time"><i class="fa-solid fa-clock" style="font-size:.6rem"></i> ${p.date||''}</div>
        </div>
        <span class="post-cat-badge" style="background:${typeColor[p.type]||typeColor.project};color:${typeTextColor[p.type]||typeTextColor.project};border:1px solid ${typeColor[p.type]||typeColor.project}">${typeBadge[p.type]||'POST'}</span>
      </div>
      <div class="post-body">
        <div class="post-text">${p.text||''}</div>
        ${p.image?`<div class="post-image"><div class="post-image-inner" style="height:240px;font-size:0"><img src="${p.image}" alt="post image" style="width:100%;height:100%;object-fit:cover;border-radius:14px"><div class="post-image-overlay"></div></div></div>`:''}
        ${(()=>{
          if(!p.video) return '';
          const eu=getVideoEmbed?getVideoEmbed(p.video):null;
          if(!eu) return '';
          const isMP4=/\.(mp4|webm|ogg)/i.test(eu);
          const platform=p.video.includes('youtube')||p.video.includes('youtu.be')?'YouTube':p.video.includes('aparat')?'Aparat':'Video';
          const tag=`<div class="post-video-tag"><i class="fa-solid fa-play-circle"></i>${platform}</div>`;
          if(isMP4) return tag+`<div class="post-video-wrap"><video src="${eu}" controls></video></div>`;
          return tag+`<div class="post-video-wrap"><iframe src="${eu}" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe></div>`;
        })()}
        ${p.linkUrl?`<a href="${p.linkUrl}" target="_blank" rel="noopener" class="styled-button" style="margin-bottom:10px">
          ${p.linkLabel||'ورود به سیمولیشن'}
          <div class="inner-button">
            <svg id="Arrow-sl-${i}" viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg" height="30px" width="30px" class="icon">
              <defs>
                <linearGradient y2="100%" x2="100%" y1="0%" x1="0%" id="iconGradient-sl-${i}">
                  <stop style="stop-color:#FFFFFF;stop-opacity:1" offset="0%"></stop>
                  <stop style="stop-color:#AAAAAA;stop-opacity:1" offset="100%"></stop>
                </linearGradient>
              </defs>
              <path fill="url(#iconGradient-sl-${i})" d="M4 15a1 1 0 0 0 1 1h19.586l-4.292 4.292a1 1 0 0 0 1.414 1.414l6-6a.99.99 0 0 0 .292-.702V15c0-.13-.026-.26-.078-.382a.99.99 0 0 0-.216-.324l-6-6a1 1 0 0 0-1.414 1.414L24.586 14H5a1 1 0 0 0-1 1z"></path>
            </svg>
          </div>
        </a>`:''}
        <div class="post-hashtags">${(p.tags||'').split(',').filter(t=>t.trim()).map(t=>`<span class="post-hashtag">${t.trim()}</span>`).join('')}</div>
      </div>
      <div class="post-actions">
        <button class="post-action-btn" onclick="togglePostLike(this)"><i class="fa-regular fa-heart"></i> 0</button>
        <div class="post-action-sep"></div>
        <button class="post-action-btn" onclick=""><i class="fa-regular fa-comment"></i> 0</button>
        <div class="post-action-sep"></div>
        <button class="post-action-btn" onclick=""><i class="fa-solid fa-share-nodes"></i> Share</button>
        <button class="post-action-btn" onclick="togglePostSave(this)"><i class="fa-regular fa-bookmark"></i> Save</button>
      </div>
    </div>`).join('');
}

