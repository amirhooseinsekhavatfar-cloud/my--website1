// ══════════════════════════════════════════════
//  SERVICE WORKER — کارکرد آفلاین سایت (PWA)
//  این فایل خودکار کش می‌کنه تا سایت بدون اینترنت هم باز بشه.
//
//  اگه فایل‌های اصلی سایت رو عوض کردی (CSS/JS/HTML) و می‌خوای
//  کاربرها نسخه‌ی جدید رو بگیرن، فقط عدد CACHE_VERSION رو
//  یکی زیاد کن — بقیه‌ش خودکاره.
//
//  لیست پایین با `node build/build.js` از build/manifest.json ساخته می‌شه؛
//  دستی ویرایشش نکن.
// ══════════════════════════════════════════════
const CACHE_VERSION = 'v6';
const CACHE_NAME = 'ahs-portfolio-' + CACHE_VERSION;

// فایل‌های اصلی که همیشه باید برای کارکرد آفلاین کش بشن
const CORE_ASSETS = [
  './',
  './index.html',
  './css/01-tokens.css',
  './css/02-base.css',
  './css/03-layout.css',
  './css/04-sections-main.css',
  './css/05-sections-info.css',
  './css/06-media.css',
  './css/07-chatbot.css',
  './css/08-effects.css',
  './css/09-video.css',
  './css/10-extras.css',
  './css/20-theme-industrial.css',
  './css/30-simlink.css',
  './css/40-features.css',
  './css/50-pro.css',
  './js/data/site-config.js',
  './js/data/skills.js',
  './js/data/projects.js',
  './js/data/achievements.js',
  './js/data/posts.js',
  './js/data/posts-settings.js',
  './js/data/blog-posts.js',
  './js/data/latest-activity.js',
  './js/data/experience.js',
  './js/data/journey-resume.js',
  './js/data/codes.js',
  './js/data/pdfs.js',
  './js/data/videos.js',
  './js/data/simlink-posts.js',
  './js/data/chatbot-knowledge.js',
  './js/data/faq-knowledge.js',
  './js/data/testimonials.js',
  './js/data/services.js',
  './js/data/simulators.js',
  './js/chatbot/config.js',
  './js/chatbot/utils.js',
  './js/chatbot/normalizer.js',
  './js/chatbot/synonyms.js',
  './js/chatbot/search.js',
  './js/chatbot/ranking.js',
  './js/chatbot/intent.js',
  './js/chatbot/memory.js',
  './js/chatbot/context.js',
  './js/chatbot/history.js',
  './js/chatbot/answer.js',
  './js/chatbot/engine.js',
  './js/chatbot/faq-slider.js',
  './js/chatbot/pdf-knowledge.js',
  './js/app/01-toast.js',
  './js/app/02-render.js',
  './js/app/03-video-data.js',
  './js/app/04-video-filters.js',
  './js/app/05-library-posts.js',
  './js/app/06-video-player.js',
  './js/ui/01-shell.js',
  './js/ui/02-contact.js',
  './js/ui/03-integrations.js',
  './js/ui/04-players.js',
  './js/ui/05-posts-chat.js',
  './js/ui/06-filters.js',
  './js/ui/07-cinematic.js',
  './js/shatter-glass.js',
  './js/features.js',
  './js/send.js',
  './js/vendor/qrcode.js',
  './js/sim-slider.js',
  './js/pro.js',
  './js/pwa.js',
  './manifest.webmanifest',
  './offline.html',
  './assets/icons/icon-192.png',
  './assets/icons/icon-512.png',
  './assets/icons/maskable-192.png',
  './assets/icons/maskable-512.png',
  './assets/icons/apple-touch-icon.png',
  './assets/icons/badge-96.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      // تک‌تک کش می‌کنیم تا یه فایل ناموجود جلوی کش شدن بقیه رو نگیره
      .then((cache) => Promise.allSettled(CORE_ASSETS.map((a) => cache.add(a))))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// استراتژی: network-first برای HTML (تا محتوای جدید همیشه اولویت داشته باشه)
// و cache-first برای بقیه‌ی فایل‌های هم‌مبدأ (CSS/JS/تصاویر)
self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  // محتوای نوتیفیکیشن و خود سرویس‌ورکر هرگز کش نمی‌شن
  if (url.origin === self.location.origin && /\/(notify\.json|sw\.js)$/.test(url.pathname)) return;
  const isSameOrigin = url.origin === self.location.origin;
  const isHTML = req.mode === 'navigate' || (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
          return res;
        })
        .catch(() => caches.match(req).then((r) => r || caches.match('./index.html')).then((r) => r || caches.match('./offline.html')))
    );
    return;
  }

  if (isSameOrigin) {
    event.respondWith(
      caches.match(req).then((cached) => {
        const fetchPromise = fetch(req)
          .then((res) => {
            if (res && res.status === 200) {
              const copy = res.clone();
              caches.open(CACHE_NAME).then((cache) => cache.put(req, copy));
            }
            return res;
          })
          .catch(() => cached);
        return cached || fetchPromise;
      })
    );
  }
  // درخواست‌های برون‌مبدأ (فونت‌ها، آیکون‌ها) از شبکه‌ی معمولی رد می‌شن
});


// ── نوتیفیکیشن (Web Push) ───────────────────────────────
// پوش بدون payload می‌رسه؛ متن از notify.json خونده می‌شه (ساده و بدون رمزنگاری سمت سرور).
self.addEventListener('push', (event) => {
  event.waitUntil((async () => {
    let d = {};
    try { if (event.data) d = event.data.json(); } catch (e) {}
    if (!d.title) {
      try {
        const r = await fetch('./notify.json?t=' + Date.now(), { cache: 'no-store' });
        if (r.ok) d = await r.json();
      } catch (e) {}
    }
    await self.registration.showNotification(d.title || 'AHS.dev', {
      body: d.body || 'محتوای جدید روی سایت منتشر شد.',
      icon: './assets/icons/icon-192.png',
      badge: './assets/icons/badge-96.png',
      tag: d.id || 'ahs-update',
      renotify: true,
      dir: 'auto',
      lang: 'fa',
      data: { url: d.url || './' }
    });
  })());
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const target = new URL((event.notification.data && event.notification.data.url) || './', self.registration.scope).href;
  event.waitUntil((async () => {
    const list = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (const c of list) {
      if (c.url.startsWith(self.registration.scope) && 'focus' in c) {
        await c.focus();
        if ('navigate' in c) { try { await c.navigate(target); } catch (e) {} }
        return;
      }
    }
    await self.clients.openWindow(target);
  })());
});
