/* ══════════════════════════════════════════════════════════
   PWA — نصب روی هوم‌اسکرین + نوتیفیکیشن
   • دکمه‌های «نصب اپ» و «نوتیفیکیشن» داخل منوی شناور (.pro-fab) اضافه می‌شن.
   • اندروید/دسکتاپ: نصب با یک کلیک (beforeinstallprompt)
   • iOS: راهنمای «Add to Home Screen» (سافاری نصب خودکار نداره)
   • نوتیفیکیشن: اگه pushWorker + vapidPublicKey پر باشه → پوش واقعی،
     وگرنه → نوتیفیکیشن محلی (با تغییر id در notify.json هنگام باز شدن سایت)
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const CFG = () => (window.SiteData && window.SiteData.config) || {};
  const isFa = () => document.body.classList.contains('rtl');
  const T = (en, fa) => (isFa() ? fa : en);
  const toast = (m) => { try { showToast(m); } catch (e) { alert(m); } };
  const LS = {
    get: (k) => { try { return localStorage.getItem(k); } catch (e) { return null; } },
    set: (k, v) => { try { localStorage.setItem(k, v); } catch (e) {} },
    del: (k) => { try { localStorage.removeItem(k); } catch (e) {} }
  };

  const isStandalone = () =>
    window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  const hasNotif = 'Notification' in window && 'serviceWorker' in navigator;

  let deferred = null;

  /* ── استایل دیالوگ راهنما ── */
  const st = document.createElement('style');
  st.textContent = `
  .pwa-dlg{position:fixed;inset:0;z-index:9500;display:grid;place-items:end center;background:rgba(0,0,0,.55);padding:16px}
  .pwa-dlg-box{width:min(420px,100%);background:var(--bg2,#131A22);color:var(--tx,#fff);border:1px solid var(--ac,#FF7A1A);border-radius:16px;padding:20px;line-height:1.9;font-size:.9rem;box-shadow:0 10px 40px rgba(0,0,0,.5)}
  .pwa-dlg-box h3{margin:0 0 8px;color:var(--ac,#FF7A1A);font-size:1rem}
  .pwa-dlg-box ol{margin:0;padding-inline-start:20px}
  .pwa-dlg-box button{margin-top:14px;width:100%;padding:10px;border:0;border-radius:10px;background:var(--ac,#FF7A1A);color:var(--bg,#0A0E14);font:inherit;font-weight:700;cursor:pointer}
  .pro-fab-item[hidden]{display:none!important}`;
  document.head.appendChild(st);

  function dialog(title, html) {
    const d = document.createElement('div');
    d.className = 'pwa-dlg';
    d.setAttribute('role', 'dialog');
    d.innerHTML = `<div class="pwa-dlg-box"><h3>${title}</h3>${html}<button type="button">${T('Got it', 'متوجه شدم')}</button></div>`;
    const close = () => d.remove();
    d.addEventListener('click', (e) => { if (e.target === d || e.target.tagName === 'BUTTON') close(); });
    document.body.appendChild(d);
  }

  /* ══ نصب ══ */
  window.addEventListener('beforeinstallprompt', (e) => { e.preventDefault(); deferred = e; render(); });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    toast(T('🎉 App installed!', '🎉 اپ نصب شد!'));
    render();
  });

  async function onInstall() {
    if (deferred) {
      deferred.prompt();
      const { outcome } = await deferred.userChoice;
      if (outcome === 'accepted') deferred = null;
      render();
      return;
    }
    if (isIOS) {
      dialog(T('Add to Home Screen', 'افزودن به صفحه‌ی اصلی'), T(
        '<ol><li>Open this page in <b>Safari</b></li><li>Tap the <b>Share</b> button (square with arrow)</li><li>Choose <b>Add to Home Screen</b></li></ol>',
        '<ol><li>این صفحه رو در <b>Safari</b> باز کن</li><li>روی دکمه‌ی <b>Share</b> (مربع با فلش) بزن</li><li>گزینه‌ی <b>Add to Home Screen</b> رو انتخاب کن</li></ol>'));
      return;
    }
    dialog(T('Install app', 'نصب اپ'), T(
      '<ol><li>Open the browser menu (⋮)</li><li>Choose <b>Install app</b> / <b>Add to Home screen</b></li></ol>',
      '<ol><li>منوی مرورگر (⋮) رو باز کن</li><li>گزینه‌ی <b>Install app</b> یا <b>Add to Home screen</b> رو بزن</li></ol>'));
  }

  /* ══ نوتیفیکیشن ══ */
  const b64ToU8 = (b64) => {
    const pad = '='.repeat((4 - (b64.length % 4)) % 4);
    const raw = atob((b64 + pad).replace(/-/g, '+').replace(/_/g, '/'));
    return Uint8Array.from(raw, (c) => c.charCodeAt(0));
  };
  const pushReady = () => !!(CFG().pushWorker && CFG().vapidPublicKey && 'PushManager' in window);
  const enabled = () => hasNotif && Notification.permission === 'granted' && LS.get('ahs_notify') === '1';

  async function subscribePush(reg) {
    const key = b64ToU8(CFG().vapidPublicKey);
    let sub = await reg.pushManager.getSubscription();
    if (!sub) sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: key });
    const r = await fetch(CFG().pushWorker.replace(/\/$/, '') + '/subscribe', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(sub)
    });
    if (!r.ok) throw new Error('subscribe-failed');
  }

  async function unsubscribePush(reg) {
    try {
      const sub = await reg.pushManager.getSubscription();
      if (!sub) return;
      fetch(CFG().pushWorker.replace(/\/$/, '') + '/unsubscribe', {
        method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ endpoint: sub.endpoint })
      }).catch(() => {});
      await sub.unsubscribe();
    } catch (e) {}
  }

  async function onNotify() {
    if (!hasNotif) {
      if (isIOS && !isStandalone()) {
        dialog(T('Notifications on iPhone', 'نوتیفیکیشن در آیفون'), T(
          '<p>iOS only allows notifications for apps added to the Home Screen (iOS 16.4+). Install the app first, then open it from the Home Screen and enable notifications.</p>',
          '<p>iOS فقط به اپ‌هایی که به صفحه‌ی اصلی اضافه شدن اجازه‌ی نوتیفیکیشن می‌ده (iOS ‎16.4 به بالا). اول اپ رو نصب کن، بعد از روی صفحه‌ی اصلی بازش کن و نوتیفیکیشن رو فعال کن.</p>'));
      } else toast(T('Notifications are not supported here', 'این مرورگر نوتیفیکیشن رو پشتیبانی نمی‌کنه'));
      return;
    }
    const reg = await navigator.serviceWorker.ready;

    if (enabled()) { // خاموش کردن
      LS.del('ahs_notify');
      if (pushReady()) await unsubscribePush(reg);
      toast(T('Notifications turned off', 'نوتیفیکیشن خاموش شد'));
      render();
      return;
    }
    if (Notification.permission === 'denied') {
      dialog(T('Notifications blocked', 'نوتیفیکیشن بلاک شده'), T(
        '<p>Notifications are blocked for this site. Allow them from the browser/site settings (lock icon next to the address), then try again.</p>',
        '<p>نوتیفیکیشن برای این سایت بلاک شده. از تنظیمات سایت (آیکون قفل کنار آدرس) اجازه بده و دوباره امتحان کن.</p>'));
      return;
    }
    const perm = await Notification.requestPermission();
    if (perm !== 'granted') { render(); return; }
    LS.set('ahs_notify', '1');
    try {
      if (pushReady()) await subscribePush(reg);
    } catch (e) {
      toast(T('Push setup failed — local notifications only', 'فعال‌سازی پوش نشد — فقط نوتیفیکیشن محلی'));
    }
    await reg.showNotification(T('Notifications enabled ✅', 'نوتیفیکیشن فعال شد ✅'), {
      body: T('You will be notified about new projects and updates.', 'از پروژه‌ها و بروزرسانی‌های جدید باخبر می‌شی.'),
      icon: 'assets/icons/icon-192.png', badge: 'assets/icons/badge-96.png', tag: 'ahs-welcome', dir: 'auto',
      data: { url: './' }
    });
    // پیام فعلی notify.json رو «دیده‌شده» حساب کن تا بلافاصله تکراری نیاد
    try { const n = await (await fetch('notify.json?t=' + Date.now(), { cache: 'no-store' })).json(); if (n.id) LS.set('ahs_seen_id', n.id); } catch (e) {}
    render();
  }

  /* نوتیفیکیشن محلی: وقتی سایت باز می‌شه و id در notify.json عوض شده */
  async function checkLocalNotify() {
    if (!enabled()) return;
    try {
      const r = await fetch('notify.json?t=' + Date.now(), { cache: 'no-store' });
      if (!r.ok) return;
      const d = await r.json();
      if (!d.id || d.id === LS.get('ahs_seen_id')) return;
      LS.set('ahs_seen_id', d.id);
      const reg = await navigator.serviceWorker.ready;
      await reg.showNotification(d.title || 'AHS.dev', {
        body: d.body || '', icon: 'assets/icons/icon-192.png', badge: 'assets/icons/badge-96.png',
        tag: d.id, dir: 'auto', data: { url: d.url || './' }
      });
    } catch (e) {}
  }

  /* ══ رابط کاربری: آیتم‌ها در منوی شناور ══ */
  function render() {
    const menu = document.querySelector('.pro-fab-menu');
    if (!menu) return;
    let ins = menu.querySelector('[data-pwa="install"]');
    let ntf = menu.querySelector('[data-pwa="notify"]');
    if (!ins) {
      ins = document.createElement('button');
      ins.type = 'button'; ins.className = 'pro-fab-item'; ins.dataset.pwa = 'install';
      ins.addEventListener('click', onInstall);
      menu.appendChild(ins);
    }
    if (!ntf) {
      ntf = document.createElement('button');
      ntf.type = 'button'; ntf.className = 'pro-fab-item'; ntf.dataset.pwa = 'notify';
      ntf.addEventListener('click', onNotify);
      menu.appendChild(ntf);
    }
    ins.hidden = isStandalone();
    ins.innerHTML = `<i class="fa-solid fa-download"></i>${T('Install app', 'نصب اپ')}`;
    const on = enabled();
    ntf.innerHTML = `<i class="fa-solid ${on ? 'fa-bell-slash' : 'fa-bell'}"></i>${on ? T('Turn off notifications', 'خاموش کردن نوتیفیکیشن') : T('Notifications', 'نوتیفیکیشن')}`;
  }

  function init() {
    render();
    // منوی شناور دیرتر ساخته می‌شه؛ تا پیدا شدنش صبر می‌کنیم
    const mo = new MutationObserver(() => {
      const menu = document.querySelector('.pro-fab-menu');
      if (menu && !menu.querySelector('[data-pwa]')) render();
    });
    mo.observe(document.body, { childList: true });
    // با عوض شدن زبان (کلاس rtl) متن‌ها رو تازه کن
    new MutationObserver(render).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    checkLocalNotify();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();
