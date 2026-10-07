// ════════════════════════════════════════
//  02-render.js — رندر مهارت/پروژه/افتخار/بلاگ/رزومه
//  از js/app.js (خط 42 تا 505) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
// ══════════════════════════════════════════════

// ── Skills ──────────────────────────────────
// مهارت‌ها
// لیست مهارت‌ها رو از فایل داده برمی‌گردونه
function defaultSkills() {
  return window.SiteData.skills || [];
}

// آیکون پیش‌فرض وقتی برای یه مهارت آیکون مشخص نشده باشه
const DEFAULT_SKILL_ICON = 'fa-solid fa-microchip';

// مهارت‌ها رو کاملاً از روی داده می‌سازه (کارت‌ها فقط از skills.js خونده می‌شن)
function renderSkillsToPage(skills) {
  const grid = document.getElementById('skills-grid');
  if (!grid) return false;
  grid.innerHTML = skills.map(s => `<div class="sk">
      <div class="sk-head">
        <div class="ski"><i class="${s.icon || DEFAULT_SKILL_ICON}"></i></div>
        <div>
          <div class="sk-name">${s.name || ''}</div>
          ${s.cat ? `<div class="sk-cat">${s.cat}</div>` : ''}
        </div>
      </div>
      <div class="sb-wrap">
        <div class="sb-lbl" style="justify-content:flex-end"><span>${s.pct}%</span></div>
        <div class="sb-bg"><div class="sb-fill" style="width:${s.pct}%"></div></div>
      </div>
    </div>`).join('');
  renderSkillRadar(skills);
  return true;
}

// ── Dynamic Skill Radar (auto-rebuilt from live skills data) ──
// نمودار راداری مهارت‌ها (خودکار)
// نمودار راداری مهارت‌ها رو رسم می‌کنه
function renderSkillRadar(skills) {
  const wrap = document.getElementById('skill-radar-wrap');
  if (!wrap) return;
  const list = (skills && skills.length ? skills : defaultSkills()).slice(0, 8);
  const n = list.length;
  if (n < 3) {
    wrap.innerHTML = '';
    return;
  }
  const cx = 160,
    cy = 150,
    R = 98;
  const ang = i => -Math.PI / 2 + i * (2 * Math.PI / n);
  const ringPts = p => list.map((s, i) => {
    const a = ang(i),
      r = R * p;
    return (cx + r * Math.cos(a)).toFixed(1) + ',' + (cy + r * Math.sin(a)).toFixed(1)
  }).join(' ');
  const grid = [1, 0.68, 0.36].map(p => `<polygon points="${ringPts(p)}" fill="none" stroke="rgba(255,122,26,.12)" stroke-width="1"/>`).join('');
  const axes = list.map((s, i) => {
    const a = ang(i);
    return `<line x1="${cx}" y1="${cy}" x2="${(cx+R*Math.cos(a)).toFixed(1)}" y2="${(cy+R*Math.sin(a)).toFixed(1)}" stroke="rgba(255,122,26,.1)" stroke-width="1"/>`
  }).join('');
  const pts = list.map((s, i) => {
    const a = ang(i),
      r = R * (Math.max(0, Math.min(100, Number(s.pct) || 0)) / 100);
    return {
      x: cx + r * Math.cos(a),
      y: cy + r * Math.sin(a)
    }
  });
  const poly = pts.map(p => p.x.toFixed(1) + ',' + p.y.toFixed(1)).join(' ');
  const dotColors = ['#FF7A1A', '#35C7C2', '#7FE8A4', '#FFC857', '#B34700', '#FF7A1A', '#35C7C2', '#7FE8A4'];
  const dots = pts.map((p, i) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="4" fill="${dotColors[i%dotColors.length]}"/>`).join('');
  const labels = list.map((s, i) => {
    const a = ang(i),
      lx = cx + (R + 26) * Math.cos(a),
      ly = cy + (R + 26) * Math.sin(a);
    let anchor = 'middle';
    if (Math.cos(a) > 0.25) anchor = 'start';
    else if (Math.cos(a) < -0.25) anchor = 'end';
    const nm = (s.name || '').length > 13 ? (s.name || '').slice(0, 12) + '…' : (s.name || '');
    return `<text x="${lx.toFixed(1)}" y="${ly.toFixed(1)}" text-anchor="${anchor}">${nm} ${s.pct}%</text>`;
  }).join('');
  wrap.innerHTML = `<svg class="radar-svg" viewBox="0 0 320 300" width="320" height="300" xmlns="http://www.w3.org/2000/svg">
    ${grid}${axes}
    <polygon id="radar-data" points="${poly}" fill="rgba(255,122,26,.18)" stroke="url(#radarGrad)" stroke-width="2.5" stroke-linejoin="round" style="transition:all 1s cubic-bezier(.4,0,.2,1)"/>
    <defs><linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%"><stop offset="0%" stop-color="#FF7A1A"/><stop offset="100%" stop-color="#FFC857"/></linearGradient></defs>
    ${dots}${labels}
  </svg>`;
}

// ── Projects ────────────────────────────────
// پروژه‌ها
// لیست پروژه‌ها رو از فایل داده برمی‌گردونه
function defaultProjects() {
  return window.SiteData.projects || [];
}

// چرخ‌فلک دایره‌ای پروژه‌ها روی صفحه اصلی
let pcarProjects = [];
let pcarIndex = 0;
let pcarAutoTimer = null;
let pcarNavBound = false;

function renderProjectsToPage(projs) {
  const stage = document.getElementById('pcar-stage');
  if (!stage) return false;
  pcarProjects = projs;
  if (pcarIndex >= projs.length) pcarIndex = 0;

  stage.innerHTML = projs.map((p, i) => `
      <div class="pcar-item" data-idx="${i}" style="background:${p.gradient}">
        ${p.image ? `<img src="${p.image}" alt="${(p.titleEn || '').replace(/"/g, '&quot;')}" loading="lazy">` : `<i class="${p.icon}"></i>`}
        ${p.featured?`<span class="pfeat" data-en="Featured" data-fa="ویژه">Featured</span>`:''}
      </div>`).join('');
  stage.querySelectorAll('.pcar-item').forEach(item => {
    item.addEventListener('click', () => pcarGoTo(parseInt(item.dataset.idx, 10)));
  });

  pcarRenderDots();
  pcarLayout();
  pcarUpdateInfo();
  pcarBindNav();
  pcarStartAutoplay();
  return true;
}

// چیدمان دایره‌ای آیتم‌ها بر اساس فاصله از آیتم فعال
function pcarLayout() {
  const n = pcarProjects.length;
  document.querySelectorAll('.pcar-item').forEach(item => {
    const i = parseInt(item.dataset.idx, 10);
    let diff = i - pcarIndex;
    if (diff > n / 2) diff -= n;
    if (diff < -n / 2) diff += n;
    item.classList.remove('active', 'side-l1', 'side-r1', 'side-l2', 'side-r2', 'hidden-item');
    if (diff === 0) item.classList.add('active');
    else if (diff === 1) item.classList.add('side-r1');
    else if (diff === -1) item.classList.add('side-l1');
    else if (diff === 2) item.classList.add('side-r2');
    else if (diff === -2) item.classList.add('side-l2');
    else item.classList.add('hidden-item');
  });
  const dots = document.querySelectorAll('.pcar-dot');
  dots.forEach((d, i) => d.classList.toggle('active', i === pcarIndex));
}

// اطلاعات پروژه فعال (عنوان، توضیح، تگ‌ها، لینک‌ها) رو در پنل زیر چرخ‌فلک نشون می‌ده
function pcarUpdateInfo() {
  const p = pcarProjects[pcarIndex];
  if (!p) return;
  const L = (typeof lang !== 'undefined' && lang === 'fa') ? 'fa' : 'en';

  // retrigger the staggered fade/slide-in animation on the text panel
  const infoEl = document.querySelector('.pcar-info');
  if (infoEl) {
    infoEl.classList.remove('pcar-anim');
    void infoEl.offsetWidth; // force reflow so the animation restarts
    infoEl.classList.add('pcar-anim');
  }

  const catEl = document.getElementById('pcar-cat');
  if (catEl) catEl.textContent = p.cat;

  const titleEl = document.getElementById('pcar-title');
  if (titleEl) {
    titleEl.dataset.en = p.titleEn;
    titleEl.dataset.fa = p.titleFa;
    titleEl.textContent = L === 'fa' ? p.titleFa : p.titleEn;
  }

  const descEl = document.getElementById('pcar-desc');
  if (descEl) {
    descEl.dataset.en = p.descEn;
    descEl.dataset.fa = p.descFa;
    descEl.textContent = L === 'fa' ? p.descFa : p.descEn;
  }

  const tagsEl = document.getElementById('pcar-tags');
  if (tagsEl) tagsEl.innerHTML = p.tags.split(',').map(t => `<span class="tag">${t.trim()}</span>`).join('');

  const linksEl = document.getElementById('pcar-links');
  if (linksEl) {
    const esc = s => (s || '').replace(/'/g, "\\'");
    linksEl.innerHTML =
      (p.github ? `<a href="${p.github}" class="plink"><i class="fab fa-github"></i> GitHub</a>` : '') +
      (p.demo ? `<a href="${p.demo}" class="plink"><i class="fa-solid fa-eye"></i> Demo</a>` : '') +
      (p.video ? `<a href="javascript:void(0)" class="plink" onclick="openProjectVideo('${esc(p.video)}','${esc(L === 'fa' ? p.titleFa : p.titleEn)}')"><i class="fa-solid fa-circle-play"></i> ${L === 'fa' ? 'ویدیو' : 'Video'}</a>` : '');
  }
}

function pcarRenderDots() {
  const dots = document.getElementById('pcar-dots');
  if (!dots) return;
  dots.innerHTML = pcarProjects.map((_, i) => `<span class="pcar-dot${i === pcarIndex ? ' active' : ''}" data-idx="${i}"></span>`).join('');
  dots.querySelectorAll('.pcar-dot').forEach(d => {
    d.addEventListener('click', () => pcarGoTo(parseInt(d.dataset.idx, 10)));
  });
}

function pcarGoTo(i) {
  pcarIndex = ((i % pcarProjects.length) + pcarProjects.length) % pcarProjects.length;
  pcarLayout();
  pcarUpdateInfo();
  pcarStartAutoplay();
}

function pcarNext() {
  pcarGoTo(pcarIndex + 1);
}

function pcarPrev() {
  pcarGoTo(pcarIndex - 1);
}

function pcarBindNav() {
  if (pcarNavBound) return;
  const prev = document.getElementById('pcar-prev');
  const next = document.getElementById('pcar-next');
  const carousel = document.getElementById('proj-carousel');
  if (prev) prev.addEventListener('click', pcarPrev);
  if (next) next.addEventListener('click', pcarNext);
  if (carousel) {
    carousel.addEventListener('mouseenter', pcarStopAutoplay);
    carousel.addEventListener('mouseleave', pcarStartAutoplay);
  }
  pcarNavBound = true;
}

function pcarStartAutoplay() {
  pcarStopAutoplay();
  if (pcarProjects.length < 2) return;
  pcarAutoTimer = setInterval(() => {
    pcarIndex = (pcarIndex + 1) % pcarProjects.length;
    pcarLayout();
    pcarUpdateInfo();
  }, 4500);
}

function pcarStopAutoplay() {
  if (pcarAutoTimer) {
    clearInterval(pcarAutoTimer);
    pcarAutoTimer = null;
  }
}

// ── Achievements / Badges ──────────────────
// افتخارات و مدال‌ها
// لیست افتخارات/مدال‌ها رو از فایل داده برمی‌گردونه
function defaultAchievements() {
  return window.SiteData.achievements || [];
}

// کارت‌های افتخارات رو روی صفحه اصلی می‌سازه
function renderAchievementsToPage(achs) {
  const grid = document.getElementById('ach-grid');
  if (!grid) return false;
  const isFA = document.body.classList.contains('rtl');
  grid.innerHTML = achs.map(a => {
    const locked = a.pct < 100;
    const iconInner = a.image ?
      `<img src="${a.image}" alt="${(a.nameEn || '').replace(/"/g, '&quot;')}" loading="lazy">` :
      `<i class="${a.icon}"></i>`;
    return `<div class="ach-card${locked?' locked':''}" style="--ach-c:${a.color||'#FF7A1A'}">
      ${locked?'<i class="fa-solid fa-lock ach-lock-ico"></i>':''}
      <div class="ach-icon">${iconInner}</div>
      <div class="ach-name">${isFA?(a.nameFa||a.nameEn):a.nameEn}</div>
      <div class="ach-desc">${isFA?(a.descFa||a.descEn||''):(a.descEn||'')}</div>
      <div class="ach-bar-bg"><div class="ach-bar-fill" style="width:${a.pct}%"></div></div>
      <span class="ach-pct">${a.pct}%</span>
    </div>`;
  }).join('');
  return true;
}

// ── Latest Posts (Blog) ─────────────────────
// آخرین مقالات
// لیست پست‌های بلاگ رو از فایل داده برمی‌گردونه
function defaultBlogPosts() {
  return window.SiteData.blogPosts || [];
}

// کارت‌های آخرین مقالات رو کاملاً از روی داده می‌سازه
function renderBlogPostsToPage(posts) {
  const grid = document.getElementById('blog-grid');
  if (!grid) return false;
  const isFA = document.body.classList.contains('rtl');
  const esc = s => (s || '').replace(/'/g, "\\'");
  grid.innerHTML = posts.map(p => {
    const color = p.color || '#FF7A1A';
    const cover = p.image ?
      `<img src="${p.image}" alt="${(p.titleEn || '').replace(/"/g, '&quot;')}" loading="lazy" style="width:100%;height:100%;object-fit:cover">` :
      `<i class="${p.icon || 'fa-solid fa-file-lines'}" style="font-size:2.5rem;color:${color}"></i>`;
    const cat = isFA ? (p.catFa || p.catEn || '') : (p.catEn || '');
    const title = isFA ? (p.titleFa || p.titleEn || '') : (p.titleEn || '');
    const excerpt = isFA ? (p.excerptFa || p.excerptEn || '') : (p.excerptEn || '');
    const readTime = isFA ? (p.readTimeFa || p.readTimeEn || '') : (p.readTimeEn || '');
    const clickAttr = p.url ? ` onclick="window.open('${esc(p.url)}','_blank','noopener')" style="cursor:pointer"` : '';
    return `<div class="blog-card"${clickAttr}>
      <div class="blog-img" style="background:linear-gradient(135deg,#0D1319,#0d1b3e)">
        ${cover}
        <span class="blog-cat" style="background:${color}">${cat}</span>
      </div>
      <div class="blog-body">
        <div class="blog-title">${title}</div>
        <div class="blog-excerpt">${excerpt}</div>
        <div class="blog-meta"><span>${p.date || ''}</span><span class="read-time"><i class="fa-regular fa-clock"></i> ${readTime}</span></div>
      </div>
    </div>`;
  }).join('');
  return true;
}

// ── Latest Activity ─────────────────────────
// آخرین فعالیت‌ها
// لیست فعالیت‌ها رو از فایل داده برمی‌گردونه
function defaultLatestActivity() {
  return window.SiteData.latestActivity || [];
}

// خط‌های آخرین فعالیت‌ها رو کاملاً از روی داده می‌سازه
function renderLatestActivityToPage(items) {
  const list = document.getElementById('activity-feed-list');
  if (!list) return false;
  const isFA = document.body.classList.contains('rtl');
  list.innerHTML = items.map(a => {
    const title = isFA ? (a.titleFa || a.titleEn || '') : (a.titleEn || '');
    const meta = isFA ? (a.metaFa || a.metaEn || '') : (a.metaEn || '');
    const badge = isFA ? (a.badgeFa || a.badgeEn || '') : (a.badgeEn || '');
    return `<div class="fi">
      <div class="fi-ico"${a.color ? ` style="color:${a.color}"` : ''}><i class="${a.icon || 'fa-solid fa-circle-info'}"></i></div>
      <div class="fi-body"><div class="fi-title">${title}</div><div class="fi-meta">${meta}</div></div>
      <span class="fi-badge ${a.badgeClass || 'b-act'}">${badge}</span>
    </div>`;
  }).join('');
  return true;
}

// ── مسیر من (My Journey) + رزومه (Education/Experience) ──
// این سه لیست از فایل js/data/journey-resume.js خونده می‌شن
function defaultJourney() {
  return window.SiteData.journey || [];
}
function defaultResumeEducation() {
  return window.SiteData.resumeEducation || [];
}
function defaultResumeExperience() {
  return window.SiteData.resumeExperience || [];
}

// یه لیست تایم‌لاین رو توی یه ظرف با id مشخص رندر می‌کنه
function renderTimelineList(containerId, items) {
  const el = document.getElementById(containerId);
  if (!el) return false;
  const isFA = document.body.classList.contains('rtl');
  el.innerHTML = (items || []).map(t => {
    const date = isFA ? (t.dateFa || t.date || '') : (t.date || '');
    const title = isFA ? (t.titleFa || t.titleEn || '') : (t.titleEn || '');
    const sub = isFA ? (t.subFa || t.subEn || '') : (t.subEn || '');
    return `<div class="tl-item"><div class="tl-dot"></div><div class="tl-date">${date}</div><div class="tl-title">${title}</div><div class="tl-sub">${sub}</div></div>`;
  }).join('');
  return true;
}

function renderJourneyAndResumeToPage() {
  renderTimelineList('journey-timeline-list', defaultJourney());
  renderTimelineList('resume-education-list', defaultResumeEducation());
  renderTimelineList('resume-experience-list', defaultResumeExperience());
}

// ── Skills & Experience ──────────────────────
// مهارت‌ها و تجربه (تب‌های: ابزار و فناوری / تایم‌لاین / گواهی‌نامه‌ها)
// داده‌ی این بخش رو از فایل داده برمی‌گردونه
function defaultExperience() {
  return window.SiteData.experience || { tools: [], timeline: [], certs: [] };
}

// هر سه تب بخش «مهارت‌ها و تجربه» رو کاملاً از روی داده می‌سازه
function renderExperienceToPage(exp) {
  const isFA = document.body.classList.contains('rtl');

  const toolsGrid = document.getElementById('exp-tools-grid');
  if (toolsGrid) {
    toolsGrid.innerHTML = (exp.tools || []).map((t, i) => {
      const title = isFA ? (t.titleFa || t.titleEn || '') : (t.titleEn || '');
      const desc = isFA ? (t.descFa || t.descEn || '') : (t.descEn || '');
      return `<div class="exp-card reveal stagger-${(i % 6) + 1}">
        <div class="exp-icon"${t.color ? ` style="color:${t.color}"` : ''}><i class="${t.icon || 'fa-solid fa-wrench'}"></i></div>
        <h4>${title}</h4><p>${desc}</p>
      </div>`;
    }).join('');
  }

  const tlList = document.getElementById('exp-timeline-list');
  if (tlList) {
    tlList.innerHTML = (exp.timeline || []).map(t => {
      const title = isFA ? (t.titleFa || t.titleEn || '') : (t.titleEn || '');
      const sub = isFA ? (t.subFa || t.subEn || '') : (t.subEn || '');
      const desc = isFA ? (t.descFa || t.descEn || '') : (t.descEn || '');
      const tags = (t.tags || '').split(',').map(s => s.trim()).filter(Boolean)
        .map(tag => `<span class="exp-tl-tag">${tag}</span>`).join('');
      return `<div class="exp-tl-item">
        <div class="exp-tl-dot"></div>
        <div class="exp-tl-header"><div class="exp-tl-title">${title}</div><span class="exp-tl-badge">${t.badge || ''}</span></div>
        <div class="exp-tl-sub">${sub}</div>
        <p style="font-size:.8rem;color:var(--tx2);line-height:1.7">${desc}</p>
        <div class="exp-tl-tags">${tags}</div>
      </div>`;
    }).join('');
  }

  const certsGrid = document.getElementById('exp-certs-grid');
  if (certsGrid) {
    certsGrid.innerHTML = (exp.certs || []).map((c, i) => {
      const title = isFA ? (c.titleFa || c.titleEn || '') : (c.titleEn || '');
      const desc = isFA ? (c.descFa || c.descEn || '') : (c.descEn || '');
      const color = c.color || '#fcd34d';
      const featStyle = c.featured ? ` style="border-color:${color}40;background:linear-gradient(135deg,${color}0D,${color}05)"` : '';
      return `<div class="exp-card reveal stagger-${(i % 6) + 1}"${featStyle}>
        <div class="exp-icon" style="color:${color};background:${color}1A;border-color:${color}33"><i class="${c.icon || 'fa-solid fa-certificate'}"></i></div>
        <h4${c.featured ? ` style="color:${color}"` : ''}>${title}</h4><p>${desc}</p>
      </div>`;
    }).join('');
  }
  return true;
}


// ویدیوها
// رنگ/آیکون/برچسب پیش‌فرض هر دسته‌بندی ویدیو (اگه توی خود آیتم ننویسی از این استفاده می‌شه)
const VIDEO_CAT_META = {
  plc: { color: '', icon: 'fa-solid fa-industry', labelEn: 'PLC', labelFa: 'PLC' },
  iot: { color: '#22C55E', icon: 'fa-solid fa-wifi', labelEn: 'IoT', labelFa: 'IoT' },
  python: { color: '#fbbf24', icon: 'fab fa-python', labelEn: 'Python', labelFa: 'پایتون' },
  esp32: { color: '#f97316', icon: 'fa-solid fa-microchip', labelEn: 'ESP32', labelFa: 'ESP32' }
};

// لیست ویدیوها رو از فایل داده برمی‌گردونه
function defaultVideos() {
  return window.SiteData.videos || [];
}

// وضعیت فعلی فیلتر/جستجو/مرتب‌سازی/صفحه‌بندیِ بخش ویدیوها
const VIDEO_PAGE_SIZE = 6;
let videoUiState = { cat: 'all', query: '', sort: 'newest', duration: 'all', visible: VIDEO_PAGE_SIZE };

// رشته‌ی نمایشی مثل '12.4K' رو به عدد قابل مقایسه تبدیل می‌کنه (برای مرتب‌سازی)
function parseCountStr(s) {
  if (s === undefined || s === null) return 0;
  const str = String(s).trim().toUpperCase();
  const m = str.match(/^([\d.]+)\s*([KM]?)/);
  if (!m) return parseFloat(str) || 0;
  let n = parseFloat(m[1]) || 0;
  if (m[2] === 'K') n *= 1e3;
  if (m[2] === 'M') n *= 1e6;
  return n;
}

// عدد رو به رشته‌ی فشرده مثل '12.4K' / '1.2M' برمی‌گردونه (عکسِ parseCountStr)
function formatCount(n) {
  n = Math.max(0, Math.round(n || 0));
  const fmt = v => { const s = v.toFixed(1); return s.endsWith('.0') ? s.slice(0, -2) : s; };
  if (n >= 1e6) return fmt(n / 1e6) + 'M';
  if (n >= 1e3) return fmt(n / 1e3) + 'K';
  return String(n);
}

