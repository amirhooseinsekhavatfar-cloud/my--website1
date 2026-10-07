// ════════════════════════════════════════
//  01-shell.js — پس‌زمینه، منوی موبایل، تم، زبان
//  از js/interactions.js (خط 1 تا 317) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
// این متغیر عمداً اول فایل تعریف شده: اگه هر بخش دیگه‌ای از این اسکریپت
// (مثلاً افکت‌های دکوری) روی مرورگر کاربر خطا بده، باز هم دکمهٔ چت باید کار کنه
let chatOpen = false;

/* ═══════════════════ پس‌زمینه سایت (Background) ═══════════════════ */
/* تنظیمات واقعی از js/data/site-config.js (آبجکت background) خونده می‌شه.
   این تابع فقط همون تنظیمات رو به‌صورت متغیرهای CSS و attribute روی
   body اعمال می‌کنه — برای تغییر پس‌زمینه هیچ‌وقت این فایل رو ویرایش نکنید. */
function applyBackgroundConfig() {
  const cfg = (window.SiteData && window.SiteData.config && window.SiteData.config.background) || {};
  const type = cfg.type || 'grid';
  const root = document.documentElement;
  const body = document.body;
  if (!body) return;

  body.setAttribute('data-bg', type);

  if (cfg.gridSize) root.style.setProperty('--bg-grid-size', cfg.gridSize + 'px');
  if (cfg.gridOpacityDark != null) root.style.setProperty('--bg-grid-color', `rgba(255, 176, 32, ${cfg.gridOpacityDark})`);
  if (cfg.gridOpacityLight != null) root.style.setProperty('--bg-grid-color-light', `rgba(224, 110, 20, ${cfg.gridOpacityLight})`);
  if (cfg.gradientFrom) root.style.setProperty('--bg-gradient-from', cfg.gradientFrom);
  if (cfg.gradientTo) root.style.setProperty('--bg-gradient-to', cfg.gradientTo);
  if (cfg.gradientAngle != null) root.style.setProperty('--bg-gradient-angle', cfg.gradientAngle + 'deg');
  if (cfg.imageUrl) root.style.setProperty('--bg-image', `url("${cfg.imageUrl}")`);
  if (cfg.imageOverlay != null) root.style.setProperty('--bg-image-overlay', `rgba(10, 14, 20, ${cfg.imageOverlay})`);

  // روی موبایل، اگه simplifyOnMobile فعال باشه، پس‌زمینه رو ساده (رنگ تخت) کن
  const isMobile = window.matchMedia('(max-width: 768px)').matches;
  body.classList.toggle('bg-mobile-simple', !!cfg.simplifyOnMobile && isMobile);
  // background-attachment: fixed روی موبایل توی بعضی مرورگرها کند/باگ‌داره،
  // پس فقط روی دسکتاپ (و فقط اگه fixedOnDesktop فعال باشه) استفاده می‌شه
  root.style.setProperty('--bg-image-attachment', (cfg.fixedOnDesktop !== false && !isMobile) ? 'fixed' : 'scroll');
}

applyBackgroundConfig();
window.matchMedia('(max-width: 768px)').addEventListener('change', applyBackgroundConfig);

if (typeof AOS !== 'undefined') {
  AOS.init({
    duration: 640,
    easing: 'ease-out-cubic',
    once: true,
    offset: 40
  })
} else {
  document.querySelectorAll('[data-aos]').forEach(el => {
    el.style.opacity = '1';
    el.style.transform = 'none'
  })
}

let pct = 0;
const lpct = document.getElementById('lpct');
const loaderDiv = document.getElementById('loader');
if (loaderDiv && !(typeof AHS_IS_EXPORTED !== 'undefined' && AHS_IS_EXPORTED) && !loaderDiv.classList.contains('loader-done')) {
  const lt = setInterval(() => {
    pct += Math.random() * 20;
    if (pct > 100) pct = 100;
    if (lpct) lpct.textContent = Math.floor(pct) + '%';
    if (pct >= 100) {
      clearInterval(lt);
      setTimeout(() => {
        loaderDiv.style.transition = 'opacity .55s';
        loaderDiv.style.opacity = '0';
        setTimeout(() => loaderDiv.classList.add('loader-done'), 560)
      }, 180)
    }
  }, 80);
} else if (loaderDiv) {
  loaderDiv.classList.add('loader-done');
}

const progressBar = document.getElementById('scroll-progress');
const navbar = document.getElementById('navbar');
const backTop = document.getElementById('back-top');
const secs = document.querySelectorAll('section[id]');
const nlinks = document.querySelectorAll('.nav-links a');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  const dh = document.documentElement.scrollHeight - window.innerHeight;
  progressBar.style.width = (y / dh * 100) + '%';
  navbar.classList.toggle('scrolled', y > 60);
  backTop.classList.toggle('visible', y > 400);
  secs.forEach(s => {
    if (y >= s.offsetTop - 100 && y < s.offsetTop + s.offsetHeight - 100) {
      nlinks.forEach(a => a.classList.toggle('active', a.getAttribute('href') === '#' + s.id))
    }
  });
}, {
  passive: true
});

const cursor = document.getElementById('cursor'),
  ring = document.getElementById('cursor-ring');
if (cursor && ring && window.matchMedia('(hover:hover)').matches) {
  let mx = 0,
    my = 0,
    rx = 0,
    ry = 0;
  document.addEventListener('mousemove', e => {
    mx = e.clientX;
    my = e.clientY
  });
  (function animC() {
    cursor.style.left = mx + 'px';
    cursor.style.top = my + 'px';
    rx += (mx - rx) * .12;
    ry += (my - ry) * .12;
    ring.style.left = rx + 'px';
    ring.style.top = ry + 'px';
    requestAnimationFrame(animC)
  })();
  document.querySelectorAll('a,button,.pc,.sk,.hcard').forEach(el => {
    el.addEventListener('mouseenter', () => {
      cursor.style.width = '6px';
      cursor.style.height = '6px';
      ring.style.width = '50px';
      ring.style.height = '50px'
    });
    el.addEventListener('mouseleave', () => {
      cursor.style.width = '10px';
      cursor.style.height = '10px';
      ring.style.width = '36px';
      ring.style.height = '36px'
    })
  });
}

const phrases = ['PLC Programmer', 'IoT Developer', 'Embedded Systems Dev', 'Python Enthusiast', 'Automation Engineer', 'ESP32 Hacker'];
let pi = 0,
  ci = 0,
  del = false;
const tel = document.getElementById('typing-el');
(function type() {
  const ph = phrases[pi];
  tel.textContent = del ? ph.slice(0, ci--) : ph.slice(0, ci++);
  if (!del && ci > ph.length) {
    del = true;
    setTimeout(type, 1300);
    return
  }
  if (del && ci < 0) {
    del = false;
    pi = (pi + 1) % phrases.length;
    ci = 0
  }
  setTimeout(type, del ? 44 : 78)
})();

const cobs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    const t = parseInt(e.target.dataset.target);
    let n = 0;
    const step = Math.ceil(t / 30);
    const ti = setInterval(() => {
      n += step;
      if (n >= t) {
        n = t;
        clearInterval(ti)
      }
      e.target.textContent = n + '+'
    }, 48);
    cobs.unobserve(e.target)
  })
}, {
  threshold: .5
});
document.querySelectorAll('.stat-num[data-target]').forEach(el => cobs.observe(el));

const bobs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    e.target.querySelectorAll('.sb-fill').forEach(b => b.style.width = b.dataset.width + '%');
    bobs.unobserve(e.target)
  })
}, {
  threshold: .25
});
document.querySelectorAll('.sk').forEach(c => bobs.observe(c));

document.querySelectorAll('.fb').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.fb').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const f = btn.dataset.filter;
    document.querySelectorAll('.pc').forEach(c => {
      const show = f === 'all' || c.dataset.category === f;
      c.style.display = show ? 'flex' : 'none'
    })
  })
});

document.querySelectorAll('.pc,.sk,.hcard').forEach(card => {
  card.addEventListener('mousemove', e => {
    const r = card.getBoundingClientRect(),
      x = (e.clientX - r.left) / r.width - .5,
      y = (e.clientY - r.top) / r.height - .5;
    card.style.transform = `translateY(-5px) rotateX(${-y*5}deg) rotateY(${x*5}deg)`
  });
  card.addEventListener('mouseleave', () => card.style.transform = '')
});

// کد نمایش داده‌شده رو در کلیپ‌بورد کپی می‌کنه
function copyCode(btn) {
  const txt = btn.closest('.cc').querySelector('.cc-pre').innerText;
  navigator.clipboard.writeText(txt).then(() => {
    btn.innerHTML = '<i class="fa-solid fa-check"></i>';
    btn.style.color = '#22C55E';
    setTimeout(() => {
      btn.innerHTML = '<i class="fa-regular fa-copy"></i>';
      btn.style.color = ''
    }, 2000)
  })
}

// منوی موبایل رو باز/بسته می‌کنه
function toggleMobile() {
  const m = document.getElementById('mobile-menu'),
    h = document.getElementById('hamburger');
  m.classList.toggle('open');
  h.classList.toggle('open');
  document.body.style.overflow = m.classList.contains('open') ? 'hidden' : ''
}

// منوی موبایل رو می‌بنده
function closeMobile() {
  document.getElementById('mobile-menu').classList.remove('open');
  document.getElementById('hamburger').classList.remove('open');
  document.body.style.overflow = ''
}

let isDark = !(localStorage.getItem('theme') === 'light');
(function() {
  if (!isDark) {
    document.body.classList.add('light')
  }
  const ic = document.getElementById('theme-icon');
  if (ic) ic.className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'
})();

// بین حالت روشن و تاریک سایت جابه‌جا می‌کنه
function toggleTheme() {
  isDark = !isDark;
  document.body.classList.toggle('light', !isDark);
  document.getElementById('theme-icon').className = isDark ? 'fa-solid fa-sun' : 'fa-solid fa-moon';
  localStorage.setItem('theme', isDark ? 'dark' : 'light');
  const t = document.createElement('div');
  t.className = 'theme-saved-toast';
  t.innerHTML = (isDark ? '<i class="fa-solid fa-moon"></i> Dark' : '<i class="fa-solid fa-sun"></i> Light') + ' mode saved';
  document.body.appendChild(t);
  requestAnimationFrame(() => t.classList.add('show'));
  setTimeout(() => {
    t.classList.remove('show');
    setTimeout(() => t.remove(), 300)
  }, 1800)
}

let lang = 'en';

// زبان مستقل خودِ چت‌بات — پیش‌فرضش با زبان کل سایت هماهنگه، ولی با دکمه‌ی
// کوچیک بالای چت می‌شه بدون تغییر زبان کل سایت، فقط چت رو عوض کرد
window.chatLang = lang;

// زبان سایت رو بین فارسی و انگلیسی عوض می‌کنه
function toggleLang() {
  lang = lang === 'en' ? 'fa' : 'en';
  document.getElementById('lang-lbl').textContent = lang === 'en' ? 'فارسی' : 'English';
  document.body.classList.toggle('rtl', lang === 'fa');
  document.documentElement.lang = lang;
  document.documentElement.dir = lang === 'fa' ? 'rtl' : 'ltr';
  document.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.dataset[lang] || el.dataset.en
  })
  if (typeof initLocationMap === 'function') initLocationMap();
  if (typeof renderAchievementsToPage === 'function') renderAchievementsToPage(defaultAchievements());
  if (typeof renderBlogPostsToPage === 'function') renderBlogPostsToPage(defaultBlogPosts());
  if (typeof renderLatestActivityToPage === 'function') renderLatestActivityToPage(defaultLatestActivity());
  if (typeof renderExperienceToPage === 'function') renderExperienceToPage(defaultExperience());
  if (typeof renderJourneyAndResumeToPage === 'function') renderJourneyAndResumeToPage();
  if (typeof renderVideosToPage === 'function') renderVideosToPage();
  // تعویض زبان کل سایت، زبان چت رو هم هماهنگ می‌کنه (مگر این‌که کاربر قبلاً
  // با دکمه‌ی داخل خودِ چت جداگونه انتخاب کرده باشه — همون‌جوری که هست می‌مونه)
  window.chatLang = lang;
  syncChatLangUI();
  if (window.ChatFaqSlider) window.ChatFaqSlider.render();
}

// فقط زبان خودِ چت رو عوض می‌کنه — بدون این‌که به بقیه‌ی سایت دست بزنه
function toggleChatLang() {
  window.chatLang = window.chatLang === 'fa' ? 'en' : 'fa';
  syncChatLangUI();
  if (window.ChatFaqSlider) window.ChatFaqSlider.render();
}

// متن‌های داخل پنجره‌ی چت (عنوان، پیام خوش‌آمد، جای‌نگه‌دار ورودی، دکمه‌ی زبان)
// رو با زبان فعلیِ چت (window.chatLang) هماهنگ می‌کنه
function syncChatLangUI() {
  const cl = window.chatLang === 'fa' ? 'fa' : 'en';
  const chatWindow = document.getElementById('ai-chat-window');
  if (!chatWindow) return;

  chatWindow.querySelectorAll('[data-en]').forEach(el => {
    el.textContent = el.dataset[cl] || el.dataset.en;
  });

  const input = document.getElementById('chat-input');
  if (input) {
    input.placeholder = input.dataset['ph' + (cl === 'fa' ? 'Fa' : 'En')] || input.placeholder;
  }

  chatWindow.dir = cl === 'fa' ? 'rtl' : 'ltr';

  const lbl = document.getElementById('chat-lang-toggle-lbl');
  if (lbl) lbl.textContent = cl === 'fa' ? 'EN' : 'فا';
}

