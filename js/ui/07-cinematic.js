// ════════════════════════════════════════
//  07-cinematic.js — موتور سینمایی و اینترو
//  از js/interactions.js (خط 1184 تا 1781) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
/* ═══════════════════ CINEMATIC ENGINE ═══════════════════ */

// ── 0. JSON-DRIVEN VIDEO INTRO (circuit lab / ESP32 / holographic, ~15s) ──
// ۰- اینتروی ویدیویی (حدود ۱۵ ثانیه)
(function videoIntro() {
  const intro = document.getElementById('video-intro');
  if (!intro) return;
  // اینترو فقط بار اول برای هر بازدیدکننده پخش می‌شه.
  // دیدنش بار دوم و سوم فقط ۱۵ ثانیه معطلیه، نه جذابیت.
  // برای دیدن دوباره‌ش: localStorage.removeItem('ahs_intro_seen')
  try {
    if (localStorage.getItem('ahs_intro_seen')) { intro.style.display = 'none'; return; }
    localStorage.setItem('ahs_intro_seen', '1');
  } catch (e) { /* حالت مرور ناشناس — اینترو عادی پخش می‌شه */ }
  // Skip intro entirely if this is an exported file
  if (typeof AHS_IS_EXPORTED !== 'undefined' && AHS_IS_EXPORTED) {
    intro.style.display = 'none';
    return;
  }
  const canvas = document.getElementById('vi-grid-canvas');
  const textEl = document.getElementById('vi-text-target');
  const skipBtn = document.getElementById('vi-skip-btn');

  // text_sequence from the source prompt
  const sequence = [{
      main: 'Amir Hosin Sekhavatfar',
      sub: ''
    },
    {
      main: 'Electrical Engineering Student',
      sub: ''
    },
    {
      main: 'ESP32 & IoT Developer',
      sub: ''
    },
    {
      main: 'Embedded Systems Engineer',
      sub: ''
    },
    {
      main: 'Portfolio 2026',
      sub: ''
    }
  ];
  const STEP_MS = 3000; // matches vi-text-cycle animation duration
  const TOTAL_MS = sequence.length * STEP_MS; // ~15s total, matches "duration":"15s"
  let stepIndex = 0;
  let timers = [];
  let finished = false;

  function clearTimers() {
    timers.forEach(t => clearTimeout(t));
    timers = [];
  }

  function playStep(i) {
    if (finished || i >= sequence.length) return;
    textEl.classList.remove('vi-active');
    textEl.style.animation = 'none';
    textEl.textContent = sequence[i].main;
    void textEl.offsetWidth; // restart animation
    textEl.style.animation = '';
    textEl.classList.add('vi-active');
    if (i < sequence.length - 1) {
      timers.push(setTimeout(() => playStep(i + 1), STEP_MS));
    }
  }

  function finishIntro() {
    if (finished) return;
    finished = true;
    clearTimers();
    intro.classList.add('vi-bars-out');
    const content = intro.querySelector('.vi-chip');
    if (content) content.style.animation = 'none';
    intro.classList.add('vi-zoom-out');
    setTimeout(() => {
      intro.classList.add('vi-hide');
      setTimeout(() => {
        intro.style.display = 'none';
      }, 950);
    }, 380);
  }

  skipBtn?.addEventListener('click', finishIntro);

  // ── circuit-grid canvas: drifting nodes + connecting energy lines ──
  let raf;

  function initGrid() {
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let w, h, nodes = [];

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(60, Math.floor((w * h) / 26000));
      nodes = Array.from({
        length: count
      }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25,
        vy: (Math.random() - 0.5) * 0.25,
        r: Math.random() * 1.6 + 0.6
      }));
    }
    resize();
    window.addEventListener('resize', resize);

    function tick() {
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = 'rgba(255,122,26,0.18)';
      ctx.lineWidth = 1;
      for (let i = 0; i < nodes.length; i++) {
        const a = nodes[i];
        a.x += a.vx;
        a.y += a.vy;
        if (a.x < 0 || a.x > w) a.vx *= -1;
        if (a.y < 0 || a.y > h) a.vy *= -1;
        for (let j = i + 1; j < nodes.length; j++) {
          const b = nodes[j];
          const dx = a.x - b.x,
            dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 140) {
            ctx.globalAlpha = 1 - dist / 140;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      nodes.forEach(n => {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = '#7FE8A4';
        ctx.shadowColor = '#35C7C2';
        ctx.shadowBlur = 6;
        ctx.fill();
      });
      ctx.shadowBlur = 0;
      if (!finished || intro.style.display !== 'none') raf = requestAnimationFrame(tick);
    }
    tick();
  }
  initGrid();

  playStep(0);
  timers.push(setTimeout(finishIntro, TOTAL_MS));
})();

// ── 1. INTRO SEQUENCE ──
// ۱- توالی مقدمه
(function cinemaIntro() {
  const intro = document.getElementById('cinema-intro');
  if (!intro) return;
  // Skip if this is an exported file
  if (typeof AHS_IS_EXPORTED !== 'undefined' && AHS_IS_EXPORTED) {
    intro.style.display = 'none';
    return;
  }
  // After loader finishes (~2.2s), play cinematic outro
  setTimeout(() => {
    intro.classList.add('done');
    setTimeout(() => {
      intro.style.display = 'none';
      startParticleExplosion();
    }, 1200);
  }, 1800);
})();

// ── 2. PARTICLE EXPLOSION ──
// ۲- انفجار ذرات
// افکت انفجار ذرات رو اجرا می‌کنه
function startParticleExplosion() {
  const canvas = document.getElementById('particle-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  canvas.classList.add('active');

  const cx = canvas.width / 2,
    cy = canvas.height / 2;
  const colors = ['#FF7A1A', '#35C7C2', '#7FE8A4', '#FFC857', '#9FEAE6', '#ffffff'];
  const particles = [];

  for (let i = 0; i < 180; i++) {
    const angle = (Math.PI * 2 / 180) * i + Math.random() * 0.3;
    const speed = 3 + Math.random() * 9;
    particles.push({
      x: cx,
      y: cy,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      r: Math.random() * 3 + 1,
      color: colors[Math.floor(Math.random() * colors.length)],
      alpha: 1,
      life: 1,
      decay: 0.012 + Math.random() * 0.018,
      gravity: 0.08 + Math.random() * 0.06
    });
  }

  function drawExplosion() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    let alive = false;
    particles.forEach(p => {
      if (p.alpha <= 0) return;
      alive = true;
      p.x += p.vx;
      p.y += p.vy;
      p.vy += p.gravity;
      p.vx *= 0.98;
      p.life -= p.decay;
      p.alpha = Math.max(0, p.life);
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.color;
      ctx.shadowColor = p.color;
      ctx.shadowBlur = 8;
      ctx.fill();
    });
    ctx.globalAlpha = 1;
    ctx.shadowBlur = 0;
    if (alive) requestAnimationFrame(drawExplosion);
    else {
      canvas.classList.remove('active');
    }
  }
  drawExplosion();
}

// ── 3. 3D TILT EFFECT ──
// ۳- افکت کج‌شدن سه‌بعدی
// افکت کج‌شدن سه‌بعدی کارت‌ها هنگام حرکت ماوس رو راه‌اندازی می‌کنه
function initTilt() {
  const tiltEls = document.querySelectorAll('.pc, .sk, .exp-card, .blog-card, .gh-repo-card, .ach-card');
  tiltEls.forEach(el => {
    // Add shine layer
    if (!el.querySelector('.tilt-shine')) {
      const shine = document.createElement('div');
      shine.className = 'tilt-shine';
      el.style.position = 'relative';
      el.appendChild(shine);
    }
    el.addEventListener('mousemove', function(e) {
      const rect = this.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      const tiltX = y * -14;
      const tiltY = x * 14;
      this.style.transform = `perspective(800px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) translateZ(8px)`;
      const shine = this.querySelector('.tilt-shine');
      if (shine) {
        shine.style.setProperty('--sx', ((e.clientX - rect.left) / rect.width * 100) + '%');
        shine.style.setProperty('--sy', ((e.clientY - rect.top) / rect.height * 100) + '%');
      }
    });
    el.addEventListener('mouseleave', function() {
      this.style.transform = '';
      this.style.transition = 'transform .5s cubic-bezier(.4,0,.2,1), border-color .3s, box-shadow .3s';
      setTimeout(() => this.style.transition = '', 500);
    });
  });
}
setTimeout(initTilt, 2500);

// ── 4. CINEMATIC SCROLL REVEALS ──
// ۴- نمایان‌شدن سینمایی هنگام اسکرول
// افکت نمایان‌شدن سینمایی بخش‌ها هنگام اسکرول رو راه‌اندازی می‌کنه
function initCinScroll() {
  // Add classes to section headers and content
  document.querySelectorAll('.sec-title, .sec-sub, .sec-label').forEach((el, i) => {
    el.classList.add('cin-section');
    el.style.transitionDelay = (i % 3 * 0.1) + 's';
  });
  document.querySelectorAll('.about-bio').forEach(el => el.classList.add('cin-section-left'));
  document.querySelectorAll('.about-grid > div:last-child').forEach(el => el.classList.add('cin-section-right'));
  document.querySelectorAll('.pc').forEach((el, i) => {
    el.classList.add('cin-section');
    el.style.transitionDelay = (i % 3 * 0.12) + 's';
  });
  document.querySelectorAll('.sk').forEach((el, i) => {
    el.classList.add('cin-section');
    el.style.transitionDelay = (i % 3 * 0.1) + 's';
  });
  document.querySelectorAll('.hcard').forEach((el, i) => {
    el.classList.add('cin-section');
    el.style.transitionDelay = (i * 0.1) + 's';
  });
  document.querySelectorAll('.blog-card').forEach((el, i) => {
    el.classList.add('cin-section');
    el.style.transitionDelay = (i * 0.12) + 's';
  });
  document.querySelectorAll('.fi').forEach((el, i) => {
    el.classList.add('cin-section');
    el.style.transitionDelay = (i * 0.08) + 's';
  });
  document.querySelectorAll('.ach-card').forEach((el, i) => {
    el.classList.add('cin-section');
    el.style.transitionDelay = (i % 3 * 0.1) + 's';
  });

  const cinObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('cin-visible');
        cinObs.unobserve(e.target);
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  document.querySelectorAll('.cin-section, .cin-section-left, .cin-section-right').forEach(el => cinObs.observe(el));
}
setTimeout(initCinScroll, 100);

// ── 5. PARALLAX HERO ──
// ۵- پارالاکس بخش اصلی
(function initParallax() {
  const hero = document.getElementById('hero');
  const imgWrap = document.querySelector('.hero-img-wrap');
  const floaters = document.querySelectorAll('.fc');
  if (!hero) return;
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      const y = window.scrollY;
      const prog = Math.min(y / window.innerHeight, 1);
      if (imgWrap) imgWrap.style.transform = `translateY(${y * 0.18}px) scale(${1 - prog * 0.06})`;
      floaters.forEach((f, i) => {
        f.style.transform = `translateY(${y * (0.06 + i * 0.04)}px)`;
      });
      // Fade hero on scroll
      if (hero) hero.style.opacity = Math.max(0, 1 - prog * 1.6);
      ticking = false;
    });
  }, {
    passive: true
  });
})();

// ── 6. TEXT SCRAMBLE EFFECT ──
// ۶- افکت درهم‌ریختن متن
class TextScramble {
  constructor(el) {
    this.el = el;
    this.chars = '!<>-_\/[]{}—=+*^?#ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    this.update = this.update.bind(this);
  }
  setText(newText) {
    const old = this.el.innerText;
    const len = Math.max(old.length, newText.length);
    const p = new Promise(res => this.resolve = res);
    this.queue = [];
    for (let i = 0; i < len; i++) {
      const from = old[i] || '';
      const to = newText[i] || '';
      const start = Math.floor(Math.random() * 16);
      const end = start + Math.floor(Math.random() * 16);
      this.queue.push({
        from,
        to,
        start,
        end
      });
    }
    cancelAnimationFrame(this.frameReq);
    this.frame = 0;
    this.update();
    return p;
  }
  update() {
    let output = '',
      complete = 0;
    this.queue.forEach((item, i) => {
      const {
        from,
        to,
        start,
        end
      } = item;
      if (this.frame >= end) {
        complete++;
        output += to;
      } else if (this.frame >= start) {
        if (!item.char || Math.random() < 0.28) item.char = this.chars[Math.floor(Math.random() * this.chars.length)];
        output += `<span style="color:var(--ac3);opacity:.6">${item.char}</span>`;
      } else output += from;
    });
    this.el.innerHTML = output;
    if (complete === this.queue.length) {
      this.resolve();
    } else {
      this.frameReq = requestAnimationFrame(this.update);
      this.frame++;
    }
  }
}

// Apply scramble to section titles on reveal
setTimeout(() => {
  const titleObs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.scrambled) {
        e.target.dataset.scrambled = '1';
        const scrambler = new TextScramble(e.target);
        const text = e.target.innerText;
        setTimeout(() => scrambler.setText(text), 200);
        titleObs.unobserve(e.target);
      }
    });
  }, {
    threshold: 0.5
  });
  document.querySelectorAll('.sec-label').forEach(el => titleObs.observe(el));
}, 2600);

// ── 7. AMBIENT FLOATING PARTICLES ──
// ۷- ذرات شناور محیطی
(function ambientParticles() {
  const colors = ['rgba(255,122,26,', 'rgba(127,232,164,', 'rgba(255,200,87,'];

  function spawnParticle() {
    if (document.hidden) return;
    const p = document.createElement('div');
    p.className = 'ambient-particle';
    const size = Math.random() * 4 + 2;
    const color = colors[Math.floor(Math.random() * colors.length)];
    const opacity = Math.random() * 0.4 + 0.1;
    const dur = Math.random() * 12 + 8;
    const left = Math.random() * 100;
    p.style.cssText = `width:${size}px;height:${size}px;left:${left}%;bottom:-10px;background:${color}${opacity});box-shadow:0 0 ${size*2}px ${color}0.3);animation-duration:${dur}s;animation-delay:${Math.random()*2}s`;
    document.body.appendChild(p);
    setTimeout(() => p.remove(), (dur + 2) * 1000);
  }
  setInterval(spawnParticle, 600);
})();

// ── 8. CURSOR UPGRADE - expand on hover ──
// ۸- بزرگ‌شدن نشانگر ماوس هنگام هاور
(function upgradeCursor() {
  const cur = document.getElementById('cursor');
  if (!cur) return;
  const interactives = 'a, button, .pc, .sk, .exp-card, .blog-card, .reel-card, .gh-repo-card, input, textarea, select, .fb, .rtab';
  document.querySelectorAll(interactives).forEach(el => {
    el.addEventListener('mouseenter', () => cur.classList.add('expanded'));
    el.addEventListener('mouseleave', () => cur.classList.remove('expanded'));
  });
})();

// ── 9. CINEMATIC NAV SCROLL ──
// ۹- اسکرول سینمایی نوار بالا
window.addEventListener('scroll', () => {
  document.getElementById('navbar')?.classList.toggle('cin-scrolled', window.scrollY > 80);
}, {
  passive: true
});

// ── 10. SKILL BARS glow on fill ──
// ۱۰- درخشش نوار مهارت‌ها هنگام پر شدن
setTimeout(() => {
  document.querySelectorAll('.sb-fill').forEach(bar => {
    bar.classList.add('filled');
  });
}, 3500);

// ── 11. SECTION COUNTER animation upgrade (cinematic) ──
// ۱۱- ارتقای انیمیشن شمارنده بخش‌ها
const cinCounterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting || e.target.dataset.counted) return;
    e.target.dataset.counted = '1';
    const target = parseInt(e.target.dataset.target);
    if (isNaN(target)) return;
    let current = 0;
    const duration = 1800;
    const start = performance.now();

    function easeOut(t) {
      return 1 - Math.pow(1 - t, 3);
    }

    function tick(now) {
      const prog = Math.min((now - start) / duration, 1);
      current = Math.round(easeOut(prog) * target);
      e.target.textContent = current + '+';
      if (prog < 1) requestAnimationFrame(tick);
      else e.target.textContent = target + '+';
    }
    requestAnimationFrame(tick);
  });
}, {
  threshold: 0.6
});
document.querySelectorAll('.stat-num[data-target]').forEach(el => cinCounterObs.observe(el));

/* ═══════════════════ LOCATION MAP ═══════════════════ */
/* بخش نقشه موقعیت مکانی — برای تغییر موقعیت روی نقشه، دیگه لازم نیست
   این فایل رو باز کنید: کافیه در js/data/site-config.js مقدار
   mapLocation.lat و mapLocation.lng رو عوض کنید؛ متن، مختصات و خودِ
   نقشه (هم کارت کوچیک هم نمای بزرگ‌شده) همگی خودکار آپدیت می‌شن. */
const LOCATION_DATA = (window.SiteData && window.SiteData.config && window.SiteData.config.mapLocation) || {
  city: "Yasuj",
  cityFa: "یاسوج",
  country: "Iran",
  countryFa: "ایران",
  lat: 30.6682,
  lng: 51.5880,
  timezone: "Asia/Tehran",
  timezoneLabel: "GMT+3:30",
  available: true
};

/* مختصات عددی رو به رشته‌ی خوانا مثل «30.6682° N, 51.5880° E» تبدیل می‌کنه */
function formatCoords(lat, lng) {
  const latDir = lat >= 0 ? 'N' : 'S';
  const lngDir = lng >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${latDir}, ${Math.abs(lng).toFixed(4)}° ${lngDir}`;
}

/* لینک امبد OpenStreetMap رو بر اساس مختصات و شعاع دلخواه (بزرگ‌نمایی) می‌سازه */
function buildOsmEmbedSrc(lat, lng, lngDelta, latDelta) {
  const bbox = [lng - lngDelta, lat - latDelta, lng + lngDelta, lat + latDelta].join('%2C');
  return `https://www.openstreetmap.org/export/embed.html?bbox=${bbox}&marker=${lat}%2C${lng}&layer=mapnik`;
}

function initLocationMap() {
  const lang = document.documentElement.getAttribute('lang') === 'fa' ? 'fa' : 'en';
  const cityName = lang === 'fa' ? LOCATION_DATA.cityFa : LOCATION_DATA.city;
  const countryName = lang === 'fa' ? LOCATION_DATA.countryFa : LOCATION_DATA.country;
  const fullName = `${cityName}, ${countryName}`;
  const coordsText = formatCoords(LOCATION_DATA.lat, LOCATION_DATA.lng);

  document.querySelectorAll('#loc-name-val, #loc-name-val-lg').forEach(el => {
    el.textContent = fullName;
  });
  document.querySelectorAll('#loc-coords-val, #loc-coords-val-lg').forEach(el => {
    el.textContent = coordsText;
  });

  // کارت کوچک: شعاع نمایش محدودتر (زوم بیشتر)
  const smallMap = document.getElementById('loc-map-iframe');
  if (smallMap) {
    smallMap.src = buildOsmEmbedSrc(LOCATION_DATA.lat, LOCATION_DATA.lng, 0.04, 0.025);
    smallMap.title = `${fullName} map`;
  }

  // نمای بزرگ‌شده: شعاع نمایش وسیع‌تر (زوم کمتر)
  const largeMap = document.getElementById('loc-map-iframe-lg');
  if (largeMap) {
    largeMap.src = buildOsmEmbedSrc(LOCATION_DATA.lat, LOCATION_DATA.lng, 0.065, 0.05);
    largeMap.title = `${fullName} map`;
  }

  const cityEl = document.getElementById('loc-city-val');
  if (cityEl) cityEl.textContent = cityName;
  const countryEl = document.getElementById('loc-country-val');
  if (countryEl) countryEl.textContent = countryName;
  const tzEl = document.getElementById('loc-tz-val');
  if (tzEl) tzEl.textContent = LOCATION_DATA.timezoneLabel;

  const badge = document.getElementById('loc-avail-badge');
  if (badge) badge.style.display = LOCATION_DATA.available ? 'inline-flex' : 'none';

  updateLocationClock();
  setInterval(updateLocationClock, 1000 * 30);
}

function updateLocationClock() {
  const timeEl = document.getElementById('loc-time-val');
  if (!timeEl) return;
  try {
    const now = new Date().toLocaleTimeString('en-US', {
      timeZone: LOCATION_DATA.timezone,
      hour: '2-digit',
      minute: '2-digit'
    });
    timeEl.textContent = now;
  } catch (e) {
    timeEl.textContent = '—';
  }
}

function toggleLocationMap() {
  const overlay = document.getElementById('loc-map-overlay');
  if (!overlay) return;
  overlay.classList.toggle('active');
  document.body.style.overflow = overlay.classList.contains('active') ? 'hidden' : '';
}

document.addEventListener('DOMContentLoaded', initLocationMap);
document.addEventListener('langchange', initLocationMap);

