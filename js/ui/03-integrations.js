// ════════════════════════════════════════
//  03-integrations.js — گیت‌هاب، رادار، PWA، لودِ تنبل
//  از js/interactions.js (خط 468 تا 682) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
/* ═══ GITHUB LIVE DATA ═══ */
const GH_USER = window.SiteData.config.github.split('/').filter(Boolean).pop();
async function loadGitHub() {
  const wrap = document.getElementById('gh-profile-wrap');
  if (!wrap) return;
  try {
    const [profileRes, reposRes] = await Promise.all([
      fetch(`https://api.github.com/users/${GH_USER}`),
      fetch(`https://api.github.com/users/${GH_USER}/repos?sort=stars&per_page=6`)
    ]);
    if (!profileRes.ok) throw new Error('GitHub API error');
    const profile = await profileRes.json();
    const repos = await reposRes.json();

    // Build contribution calendar (simulated — GitHub API doesn't expose this publicly)
    let calHtml = '';
    const levels = ['', 'l1', 'l2', 'l3', 'l4'];
    for (let i = 0; i < 52 * 5; i++) {
      const lvl = Math.random() > 0.45 ? levels[Math.floor(Math.random() * 4) + 1] : '';
      calHtml += `<div class="contrib-cell ${lvl}" title="contributions"></div>`;
    }

    const topRepos = Array.isArray(repos) ? repos.slice(0, 4) : [];
    const langColors = {
      Python: '#3572A5',
      JavaScript: '#f1e05a',
      'C++': '#f34b7d',
      C: '#555555',
      HTML: '#e34c26',
      Shell: '#89e051',
      Makefile: '#427819'
    };

    wrap.innerHTML = `
      <div class="gh-profile-card">
        <img class="gh-avatar" src="${profile.avatar_url}" alt="${profile.name}" loading="lazy">
        <div class="gh-info">
          <div class="gh-name">${profile.name || GH_USER}</div>
          <div class="gh-handle">@${profile.login}</div>
          <div class="gh-bio">${profile.bio || 'Electrical Engineering student & Industrial Automation Developer'}</div>
          <div class="gh-stats-row">
            <div class="gh-stat"><div class="gh-stat-n">${profile.public_repos||0}</div><div class="gh-stat-l">Repos</div></div>
            <div class="gh-stat"><div class="gh-stat-n">${profile.followers||0}</div><div class="gh-stat-l">Followers</div></div>
            <div class="gh-stat"><div class="gh-stat-n">${profile.following||0}</div><div class="gh-stat-l">Following</div></div>
          </div>
        </div>
        <a href="https://github.com/${GH_USER}" target="_blank" class="btn btn-o" style="align-self:flex-start"><i class="fab fa-github"></i> View Profile</a>
      </div>
      <div class="gh-repos-grid">
        ${topRepos.map(r => `
          <a href="${r.html_url}" target="_blank" class="gh-repo-card" style="text-decoration:none">
            <div class="gh-repo-name"><i class="fa-solid fa-book-open" style="font-size:.75rem;margin-right:5px"></i>${r.name}</div>
            <div class="gh-repo-desc">${r.description || 'No description'}</div>
            <div class="gh-repo-meta">
              ${r.language ? `<span class="gh-repo-lang"><span class="gh-repo-lang-dot" style="background:${langColors[r.language]||'#888'}"></span>${r.language}</span>` : ''}
              <span class="gh-repo-stars"><i class="fa-solid fa-star" style="color:#fbbf24"></i> ${r.stargazers_count}</span>
              <span class="gh-repo-stars"><i class="fa-solid fa-code-branch"></i> ${r.forks_count}</span>
            </div>
          </a>`).join('')}
      </div>
      <div class="cal-contrib">
        <h4>Contribution Activity (last year)</h4>
        <div class="contrib-grid">${calHtml}</div>
        <div class="contrib-legend">Less <div class="contrib-cell"></div><div class="contrib-cell l1"></div><div class="contrib-cell l2"></div><div class="contrib-cell l3"></div><div class="contrib-cell l4"></div> More</div>
      </div>`;
  } catch (err) {
    const wrap2 = document.getElementById('gh-profile-wrap');
    if (wrap2) wrap2.innerHTML = `<div class="gh-error"><i class="fab fa-github" style="font-size:2rem;margin-bottom:8px;display:block;color:var(--ac2)"></i>View my work on <a href="https://github.com/${GH_USER}" target="_blank" style="color:var(--ac2)">GitHub</a></div>`;
  }
}
loadGitHub();

/* ═══ RADAR ANIMATION ON SCROLL ═══ */
const radarObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      const poly = document.getElementById('radar-data');
      if (poly) {
        poly.style.opacity = '0';
        setTimeout(() => {
          poly.style.opacity = '1';
          poly.style.filter = 'drop-shadow(0 0 8px rgba(255,122,26,.5))';
        }, 100);
      }
      radarObs.unobserve(e.target);
    }
  });
}, {
  threshold: 0.3
});
const radarWrap = document.getElementById('skill-radar-wrap');
if (radarWrap) radarObs.observe(radarWrap);

/* ═══ SERVICE WORKER ═══ */
// فقط یک Service Worker باید ثبت بشه: فایل واقعی ./sw.js
// (ثبتش در js/features.js انجام می‌شه). نسخه‌ی قبلی این‌جا یک SW موقت
// از روی Blob می‌ساخت که با sw.js تداخل داشت و کش رو خراب می‌کرد — حذف شد.

/* ═══ PWA INSTALL PROMPT ═══ */
let deferredPrompt;

// Inject install banner styles
const pwaStyle = document.createElement('style');
pwaStyle.textContent = `
#pwa-banner{position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(120px);z-index:9000;display:flex;align-items:center;gap:14px;padding:14px 20px;background:rgba(7,16,30,0.96);border:1px solid rgba(255,122,26,0.4);border-radius:18px;backdrop-filter:blur(20px);box-shadow:0 8px 40px rgba(255,122,26,0.25);transition:transform 0.5s cubic-bezier(.34,1.2,.64,1);min-width:280px;max-width:360px}
#pwa-banner.show{transform:translateX(-50%) translateY(0)}
#pwa-banner-logo{width:44px;height:44px;flex-shrink:0}
#pwa-banner-text{flex:1}
#pwa-banner-title{font-family:var(--mo);font-size:.8rem;font-weight:700;color:#D8EEFF;letter-spacing:1px}
#pwa-banner-sub{font-size:.7rem;color:#3A80C0;margin-top:2px}
#pwa-banner-install{background:linear-gradient(135deg,#1E7FCC,#3FA0E8);color:#fff;border:none;border-radius:10px;padding:8px 16px;font-size:.75rem;font-weight:700;font-family:var(--fn);cursor:pointer;white-space:nowrap;letter-spacing:.5px;transition:all .2s}
#pwa-banner-install:hover{transform:scale(1.04);box-shadow:0 4px 16px rgba(30,127,204,.5)}
#pwa-banner-close{background:none;border:none;color:#3A80C0;cursor:pointer;font-size:.9rem;padding:4px;line-height:1;transition:color .2s;flex-shrink:0}
#pwa-banner-close:hover{color:#D8EEFF}
#pwa-nav-btn{display:none}
`;
document.head.appendChild(pwaStyle);

// بنر نصب اپلیکیشن (PWA) رو می‌سازه
function createPWABanner() {
  if (document.getElementById('pwa-banner')) return;
  const banner = document.createElement('div');
  banner.id = 'pwa-banner';
  banner.innerHTML = `
    <svg id="pwa-banner-logo" viewBox="0 0 320 320" xmlns="http://www.w3.org/2000/svg">
      <circle cx="160" cy="160" r="156" fill="#050C18"/>
      <circle cx="160" cy="160" r="156" fill="none" stroke="#1E7FCC" stroke-width="4"/>
      <circle cx="160" cy="160" r="131" fill="none" stroke="#0C2848" stroke-width="0.5"/>
      <circle cx="160" cy="160" r="106" fill="#07101E" stroke="#0F2C50" stroke-width="1.2"/>
      <circle cx="160" cy="100" r="32" fill="#060E1C" stroke="#1A5F9E" stroke-width="1.4"/>
      <line x1="160" y1="80" x2="160" y2="120" stroke="#1E7FCC" stroke-width="3"/>
      <line x1="140" y1="100" x2="180" y2="100" stroke="#1E7FCC" stroke-width="3"/>
      <circle cx="150" cy="90" r="3" fill="#3FA0E8"/><circle cx="170" cy="90" r="3" fill="#3FA0E8"/>
      <circle cx="150" cy="110" r="3" fill="#3FA0E8"/><circle cx="170" cy="110" r="3" fill="#3FA0E8"/>
      <circle cx="160" cy="100" r="8" fill="none" stroke="#5BB8FF" stroke-width="2"/>
      <text x="160" y="158" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-weight="800" font-size="19" fill="#D8EEFF" letter-spacing="2">AMIRHOSIN</text>
      <text x="160" y="179" text-anchor="middle" font-family="Segoe UI,Arial,sans-serif" font-weight="300" font-size="9" fill="#3A80C0" letter-spacing="5">SEKHAVATFAR</text>
    </svg>
    <div id="pwa-banner-text">
      <div id="pwa-banner-title">AHS.dev</div>
      <div id="pwa-banner-sub">Add to Home Screen</div>
    </div>
    <button id="pwa-banner-install"><i class="fa-solid fa-plus"></i> Install</button>
    <button id="pwa-banner-close"><i class="fa-solid fa-xmark"></i></button>
  `;
  document.body.appendChild(banner);
  setTimeout(() => banner.classList.add('show'), 100);

  banner.querySelector('#pwa-banner-install').onclick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const {
      outcome
    } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      banner.remove();
      showToast('✅ App installed!');
    }
    deferredPrompt = null;
  };
  banner.querySelector('#pwa-banner-close').onclick = () => {
    banner.style.transform = 'translateX(-50%) translateY(120px)';
    setTimeout(() => banner.remove(), 500);
  };
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e; // نصب از طریق منوی دکمه‌ی شناور (js/pwa.js) انجام می‌شه
});

window.addEventListener('appinstalled', () => {
  const b = document.getElementById('pwa-banner');
  if (b) b.remove();
  showToast('🎉 AHS.dev installed!');
});

/* ═══ LAZY SECTION LOADING ═══ */
const lazySections = document.querySelectorAll('.sec');
const lazyObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.style.contentVisibility = 'visible';
      lazyObs.unobserve(e.target);
    }
  });
}, {
  rootMargin: '200px'
});
lazySections.forEach(s => lazyObs.observe(s));

/* ═══ SKILL BAR TOOLTIPS ═══ */
document.querySelectorAll('.sb-wrap').forEach(wrap => {
  const label = wrap.querySelector('.sb-lbl span:first-child')?.textContent || '';
  const pct = wrap.querySelector('.sb-lbl span:last-child')?.textContent || '';
  const tip = document.createElement('div');
  tip.className = 'sk-tooltip';
  tip.textContent = label + ' — ' + pct + ' proficiency';
  wrap.appendChild(tip);
});

