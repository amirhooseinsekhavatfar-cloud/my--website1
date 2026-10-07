// ════════════════════════════════════════
//  05-library-posts.js — کتابخانه کد، PDFها، فید پست‌ها، init
//  از js/app.js (خط 992 تا 1218) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
// ── Code Library ────────────────────────────
// کتابخانه کد
// لیست کدهای کتابخانه کد رو از فایل داده برمی‌گردونه
function defaultCodes() {
  return window.SiteData.codes || [];
}

// کاراکترهای خاص HTML رو برای نمایش امن کد، تبدیل می‌کنه
function escHtml(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

function renderCodesToPage(codes) {
  const grid = document.getElementById('code-grid');
  if (!grid) return false;
  grid.innerHTML = codes.map(c => `<div class="cc"><div class="cc-head"><div class="dots-row"><span></span><span></span><span></span></div><div class="cc-lang">${c.lang}</div><button class="cc-copy" onclick="copyCode(this)"><i class="fa-regular fa-copy"></i></button></div><pre class="cc-pre">${c.code}</pre><div class="cc-foot"><div class="cc-title" data-en="${c.titleEn}" data-fa="${c.titleFa}">${c.titleEn}</div><div class="cc-desc" data-en="${c.descEn}" data-fa="${c.descFa}">${c.descEn}</div></div></div>`).join('');
  return true;
}

// ── PDFs ─────────────────────────────────────
// فایل‌های PDF
// لیست فایل‌های PDF رو از فایل داده برمی‌گردونه
function defaultPdfsData() {
  return window.SiteData.pdfs || [];
}

function renderPdfsToPage(pdfs) {
  const grid = document.getElementById('pdf-grid');
  if (!grid) return false;
  grid.innerHTML = pdfs.map(p => {
    // پسوند فایل رو تشخیص می‌ده تا برای صفحات HTML (به‌جای PDF) آیکون درست نشون بده
    const srcPath = p.file || p.preview || p.dl || '';
    const isHtmlDoc = /\.html?(\?.*)?(#.*)?$/i.test(srcPath);
    const iconInner = p.image ?
      `<img src="${p.image}" alt="${(p.titleEn || '').replace(/"/g, '&quot;')}" loading="lazy">` :
      (isHtmlDoc ? `<i class="fa-solid fa-file-code"></i>` : `<i class="fa-solid fa-file-pdf"></i>`);
    return `<div class="pdf-card"><div class="pdf-icon-wrap">${iconInner}</div><div class="pdf-title" data-en="${p.titleEn}" data-fa="${p.titleFa}">${p.titleEn}</div><div class="pdf-desc" data-en="${p.descEn}" data-fa="${p.descFa}">${p.descEn}</div><div class="pdf-meta" data-en="${p.metaEn}" data-fa="${p.metaFa}">${p.metaEn}</div><div class="pdf-actions"><a href="${p.preview}" class="btn btn-o" style="padding:7px 13px;font-size:.74rem"><i class="fa-solid fa-eye"></i> <span data-en="Preview" data-fa="پیش‌نمایش">Preview</span></a><a href="${p.dl}" class="btn btn-p" style="padding:7px 13px;font-size:.74rem" download><i class="fa-solid fa-download"></i> <span data-en="Download" data-fa="دانلود">Download</span></a></div></div>`;
  }).join('');
  return true;
}

// ── Post type filters (sidebar) ─────────────
// فیلتر «Filter by Type» توی سایدبار پست‌ها
// برچسب/آیکون پیش‌فرض برای انواع شناخته‌شده‌ی پست؛ هر نوع دیگه‌ای که توی
// posts.js بذاری هم خودکار با یه آیکون عمومی و همون اسمِ نوع اضافه می‌شه
const POST_TYPE_META = {
  project: { label: { en: 'Projects', fa: 'پروژه‌ها' }, icon: 'fa-solid fa-rocket' },
  tech: { label: { en: 'Engineering', fa: 'مهندسی' }, icon: 'fa-solid fa-microchip' },
  announcement: { label: { en: 'Announcements', fa: 'اعلان‌ها' }, icon: 'fa-solid fa-bullhorn' },
  insight: { label: { en: 'Insights', fa: 'بینش‌ها' }, icon: 'fa-solid fa-lightbulb' },
  carousel: { label: { en: 'Carousels', fa: 'کاروسل‌ها' }, icon: 'fa-solid fa-images' }
};

// اسم نوع رو برای نمایش (وقتی توی POST_TYPE_META نباشه) خوانا می‌کنه — مثلاً 'behind-the-scenes' -> 'Behind The Scenes'
function humanizePostType(type) {
  return (type || '')
    .replace(/[-_]+/g, ' ')
    .trim()
    .replace(/\b\w/g, c => c.toUpperCase()) || 'Other';
}

// لیست فیلتر «Filter by Type» رو از روی پست‌های واقعی posts.js می‌سازه؛
// یعنی دسته‌ها و شمارشگرها همیشه خودکار با محتوای واقعی هماهنگ می‌مونن
function renderPostFiltersToPage(posts) {
  const list = document.getElementById('post-filter-list');
  if (!list) return false;
  const isFA = document.body.classList.contains('rtl');

  const counts = {};
  posts.forEach(p => {
    const t = p.type || 'other';
    counts[t] = (counts[t] || 0) + 1;
  });
  const types = Object.keys(counts);

  const btn = (type, icon, label, count, active) =>
    `<button class="pfl${active ? ' active' : ''}" onclick="filterPosts('${type}',this)"><i class="${icon}"></i><span>${label}</span><span class="pfl-count">${count}</span></button>`;

  let html = btn('all', 'fa-solid fa-border-all', isFA ? 'همه پست‌ها' : 'All Posts', posts.length, true);
  types.forEach(t => {
    const meta = POST_TYPE_META[t];
    const icon = meta ? meta.icon : 'fa-solid fa-tag';
    const label = meta ? (isFA ? meta.label.fa : meta.label.en) : humanizePostType(t);
    html += btn(t, icon, label, counts[t], false);
  });
  list.innerHTML = html;
  return true;
}

// ── Posts feed (Instagram-style updates) ───
// فید پست‌ها
// رنگ‌های آماده برای برچسب دسته‌بندی هر پست
const POST_BADGE_PALETTE = {
  orange: { bg: 'rgba(255,122,26,.2)', text: 'var(--ac3)', border: 'rgba(255,122,26,.3)' },
  purple: { bg: 'rgba(168,85,247,.2)', text: '#c084fc', border: 'rgba(168,85,247,.3)' },
  yellow: { bg: 'rgba(234,179,8,.15)', text: '#fcd34d', border: 'rgba(234,179,8,.25)' },
  green: { bg: 'rgba(34,197,94,.15)', text: '#4ade80', border: 'rgba(34,197,94,.25)' },
  red: { bg: 'rgba(239,68,68,.15)', text: '#f87171', border: 'rgba(239,68,68,.25)' }
};

// لیست پست‌های فید رو از فایل داده برمی‌گردونه
function defaultPosts() {
  return window.SiteData.posts || [];
}

// فید پست‌ها رو روی صفحه می‌سازه
function renderPostsToPage(posts) {
  const feed = document.getElementById('posts-feed-list');
  if (!feed) return false;
  feed.innerHTML = posts.map(p => {
    const pal = POST_BADGE_PALETTE[p.badgeColor] || POST_BADGE_PALETTE.orange;
    const likes = parseInt(p.likes, 10) || 0;
    const comments = parseInt(p.comments, 10) || 0;
    const eu = p.video ? (typeof getVideoEmbed === 'function' ? getVideoEmbed(p.video) : null) : null;
    let videoHtml = '';
    if (eu) {
      const isMP4 = /\.(mp4|webm|ogg)/i.test(eu);
      const platform = p.video.includes('youtube') || p.video.includes('youtu.be') ? 'YouTube' : p.video.includes('aparat') ? 'Aparat' : 'Video';
      const tag = `<div class="post-video-tag"><i class="fa-solid fa-play-circle"></i>${platform}</div>`;
      videoHtml = isMP4 ?
        tag + `<div class="post-video-wrap"><video src="${eu}" controls></video></div>` :
        tag + `<div class="post-video-wrap"><iframe src="${eu}" allow="autoplay;fullscreen;encrypted-media" allowfullscreen></iframe></div>`;
    }
    return `
    <div class="post-card${p.featured?' featured-post':''}" data-post-type="${p.type||''}">
      <div class="post-header">
        <div class="post-avatar"><i class="fa-solid fa-microchip"></i></div>
        <div class="post-meta">
          <div class="post-author">Amir Hosin Sekhavatfar</div>
          <div class="post-time"><i class="fa-solid fa-clock" style="font-size:.6rem"></i> ${p.date||''}</div>
        </div>
        <span class="post-cat-badge" style="background:${pal.bg};color:${pal.text};border:1px solid ${pal.border}">${p.badgeLabel||'POST'}</span>
      </div>
      <div class="post-body">
        <div class="post-text">${p.text||''}</div>
        ${p.image?`<div class="post-image"><div class="post-image-inner" style="height:240px;font-size:0"><img src="${p.image}" alt="post image" style="width:100%;height:100%;object-fit:cover;border-radius:14px"><div class="post-image-overlay"></div></div></div>`:''}
        ${videoHtml}
        ${p.linkUrl?`<a href="${p.linkUrl}" target="_blank" rel="noopener" class="btn btn-o" style="margin-bottom:10px;font-size:.8rem"><i class="fa-solid fa-arrow-up-right-from-square"></i> ${p.linkLabel||p.linkUrl}</a>`:''}
        <div class="post-hashtags">${(p.tags||'').split(',').filter(t=>t.trim()).map(t=>`<span class="post-hashtag">${t.trim()}</span>`).join('')}</div>
      </div>
      <div class="post-actions">
        <button class="post-action-btn${p.liked?' liked':''}" onclick="togglePostLike(this)"><i class="fa-${p.liked?'solid':'regular'} fa-heart"></i> ${likes}</button>
        <div class="post-action-sep"></div>
        <button class="post-action-btn${comments?' commented':''}" onclick=""><i class="fa-regular fa-comment"></i> ${comments}</button>
        <div class="post-action-sep"></div>
        <button class="post-action-btn" onclick=""><i class="fa-solid fa-share-nodes"></i> Share</button>
        <button class="post-action-btn${p.saved?' saved':''}" onclick="togglePostSave(this)"><i class="fa-${p.saved?'solid':'regular'} fa-bookmark"></i> ${p.saved?'Saved':'Save'}</button>
      </div>
    </div>`;
  }).join('');
  return true;
}

// ── Posts section settings (sidebar profile card + announcement banner) ──
// تنظیمات بخش پست‌ها (کارت پروفایل و بنر اعلان)
// تنظیمات بخش پست‌ها رو از فایل داده برمی‌گردونه
function defaultPostsSettings() {
  return window.SiteData.postsSettings || {};
}

// تنظیمات بخش پست‌ها رو روی صفحه اعمال می‌کنه
function applyPostsSettingsToPage(s) {
  const set = (id, v) => {
    const el = document.getElementById(id);
    if (el) el.textContent = v || ''
  };
  set('pp-name-el', s.name);
  set('pp-handle-el', s.handle);
  set('pp-bio-el', s.bio);
  set('pp-stat-posts-el', s.statPosts);
  set('pp-stat-followers-el', s.statFollowers);
  set('pp-stat-following-el', s.statFollowing);
  set('ann-banner-title-el', s.annTitle);
  set('ann-banner-text-el', s.annText);
}

// ── Apply core content to the page (safe to call repeatedly) ──
// اعمال محتوای اصلی روی صفحه
// نام هیرو، مهارت‌ها، پروژه‌ها و افتخارات رو از فایل‌های داده روی صفحه اعمال می‌کنه
function applyAllToPage() {
  const cfg = window.SiteData.config;
  const isFA = document.body.classList.contains('rtl');

  // Hero name (kept in sync with site-config.js)
  const nameEn = cfg.nameEn,
    lnameEn = cfg.lnameEn;
  const nameFa = cfg.nameFa,
    lnameFa = cfg.lnameFa;
  document.querySelectorAll('.hero-name [data-en]').forEach((el, i) => {
    if (i === 0) {
      el.setAttribute('data-en', nameEn);
      el.setAttribute('data-fa', nameFa)
    } else {
      el.setAttribute('data-en', lnameEn);
      el.setAttribute('data-fa', lnameFa)
    }
    el.textContent = isFA ? el.dataset.fa : el.dataset.en;
  });

  // Skills + Projects + Achievements
  renderSkillsToPage(defaultSkills());
  renderProjectsToPage(defaultProjects());
  renderAchievementsToPage(defaultAchievements());

}

// ── Initial render on page load ──────────────
// رندر اولیه هنگام بارگذاری صفحه
(function() {
  try {
    applyAllToPage();
    applyPostsSettingsToPage(defaultPostsSettings());
    renderPostsToPage(defaultPosts());
    renderPostFiltersToPage(defaultPosts());
    renderCodesToPage(defaultCodes());
    renderPdfsToPage(defaultPdfsData());
    renderVideosToPage();
    renderBlogPostsToPage(defaultBlogPosts());
    renderLatestActivityToPage(defaultLatestActivity());
    renderExperienceToPage(defaultExperience());
    renderJourneyAndResumeToPage();
  } catch (e) {}
  setTimeout(() => { if (typeof updateSimLinkBadge === 'function') updateSimLinkBadge(); }, 500);
})();

