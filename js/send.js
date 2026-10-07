/* ══════════════════════════════════════════════════════════
   send.js — ارسال واقعی پیام‌ها (تلگرام + ایمیل) از همه‌ی فرم‌های سایت
   ──────────────────────────────────────────────────────────
   سایت بک‌اند نداره، پس ارسال از سه راه ممکنه (هرکدوم که تنظیم بشه کار می‌کنه
   و اگه چندتا تنظیم شده باشه، پیام به همه‌شون می‌ره):
     ۱) تلگرام از طریق Worker   → site-config.js: telegramWorker   (پیشنهادی)
     ۲) تلگرام مستقیم با ربات   → telegramBotToken + telegramChatId (توکن عمومی می‌شه!)
     ۳) ایمیل با Web3Forms      → web3formsKey
        ایمیل با Formspree      → formEndpoint
   اگه هیچ‌کدوم تنظیم نباشه یا همه شکست بخورن، پیام کپی می‌شه و
   تلگرام (یا برنامه‌ی ایمیل) باز می‌شه تا کاربر دستی بفرسته.

   راهنمای راه‌اندازی قدم‌به‌قدم: docs/SENDING-SETUP.md
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';
  const CFG = () => ((window.SiteData || {}).config) || {};
  const fa = () => document.body.classList.contains('rtl');
  const toast = (m) => { try { showToast(m); } catch (e) { /* ignore */ } };
  const clip = (t) => (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject());
  const cut = (s, n) => String(s == null ? '' : s).slice(0, n);
  const isEmail = (s) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(String(s || '').trim());
  const COOLDOWN_MS = 20000;
  let lastSend = 0;

  function channels() {
    const c = CFG(), a = [];
    if (c.telegramWorker) a.push('telegram-worker');
    else if (c.telegramBotToken && c.telegramChatId) a.push('telegram-bot');
    if (c.web3formsKey) a.push('email-web3forms');
    if (c.formEndpoint) a.push('email-formspree');
    return a;
  }

  const KIND = {
    request: ['📩 New project request', '📩 درخواست پروژه‌ی جدید'],
    contact: ['✉️ New contact message', '✉️ پیام جدید از فرم تماس'],
    report:  ['⚠️ Report from the site', '⚠️ گزارش از سایت']
  };
  // متن خوانا و یکسان برای تلگرام و ایمیل
  function textOf(l) {
    const k = KIND[l.kind] || KIND.contact;
    const rows = [
      k[0], '',
      l.name && '👤 ' + l.name,
      l.contact && '📞 ' + l.contact,
      l.service && '🗂 ' + l.service,
      l.size && '📏 ' + l.size,
      l.deadline && '⏱ ' + l.deadline,
      l.subject && '📌 ' + l.subject,
      '', l.message,
      '', '🌐 ' + (fa() ? 'fa' : 'en') + ' · ' + location.href.split('#')[0]
    ];
    return cut(rows.filter((x) => x || x === '').join('\n').replace(/\n{3,}/g, '\n\n'), 3800);
  }
  // متنی که کاربر می‌تونه دستی بفرسته (نسخه‌ی قابل‌خواندن برای انسان در زبان سایت)
  function plainOf(l) {
    return fa()
      ? `سلام، من ${l.name || ''} هستم.\n${l.service ? 'نوع کار: ' + l.service + '\n' : ''}${l.size ? 'حجم کار: ' + l.size + '\n' : ''}${l.deadline ? 'زمان‌بندی: ' + l.deadline + '\n' : ''}${l.subject ? 'موضوع: ' + l.subject + '\n' : ''}\n${l.message}\n\n${l.contact ? 'راه تماس من: ' + l.contact : ''}`.trim()
      : `Hi, I'm ${l.name || ''}.\n${l.service ? 'Type of work: ' + l.service + '\n' : ''}${l.size ? 'Size: ' + l.size + '\n' : ''}${l.deadline ? 'Timeline: ' + l.deadline + '\n' : ''}${l.subject ? 'Subject: ' + l.subject + '\n' : ''}\n${l.message}\n\n${l.contact ? 'My contact: ' + l.contact : ''}`.trim();
  }

  function post(url, body, timeout) {
    const ctl = typeof AbortController === 'function' ? new AbortController() : null;
    const t = setTimeout(() => ctl && ctl.abort(), timeout || 12000);
    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: JSON.stringify(body),
      signal: ctl ? ctl.signal : undefined
    }).then((r) => r.json().catch(() => ({})).then((j) => ({ r, j }))).finally(() => clearTimeout(t));
  }

  const SENDERS = {
    'telegram-worker': (l) => post(CFG().telegramWorker, {
      kind: l.kind, name: l.name, contact: l.contact, service: l.service, size: l.size, deadline: l.deadline,
      subject: l.subject, message: l.message, lang: fa() ? 'fa' : 'en', page: location.href.split('#')[0]
    }).then(({ r, j }) => { if (!r.ok || j.ok === false) throw new Error('worker'); }),

    'telegram-bot': (l) => post('https://api.telegram.org/bot' + encodeURIComponent(CFG().telegramBotToken) + '/sendMessage',
      { chat_id: CFG().telegramChatId, text: textOf(l), disable_web_page_preview: true })
      .then(({ r, j }) => { if (!r.ok || j.ok !== true) throw new Error('telegram'); }),

    'email-web3forms': (l) => {
      const b = {
        access_key: CFG().web3formsKey,
        subject: '[Portfolio] ' + (l.subject || (KIND[l.kind] || KIND.contact)[0].replace(/^\S+\s/, '')),
        from_name: l.name || 'Portfolio visitor',
        message: textOf(l),
        botcheck: ''
      };
      const em = isEmail(l.email) ? l.email : (isEmail(l.contact) ? l.contact : '');
      if (em) b.email = em;
      return post('https://api.web3forms.com/submit', b).then(({ r, j }) => { if (!r.ok || j.success === false) throw new Error('web3forms'); });
    },

    'email-formspree': (l) => post(CFG().formEndpoint, {
      name: l.name, email: isEmail(l.email) ? l.email : (isEmail(l.contact) ? l.contact : undefined),
      contact: l.contact, subject: l.subject, message: textOf(l)
    }).then(({ r }) => { if (!r.ok) throw new Error('formspree'); })
  };

  // دستی‌فرستادن (وقتی ارسال مستقیم ممکن نیست)
  function fallback(l) {
    const c = CFG(), text = plainOf(l);
    clip(text).catch(() => { });
    const tg = (c.telegramUser || (c.telegram || '').replace(/^https?:\/\/t\.me\//, '')).replace(/^@/, '');
    if (tg) {
      window.open('https://t.me/' + tg + '?text=' + encodeURIComponent(text), '_blank', 'noopener');
      return 'telegram';
    }
    if (c.email) {
      window.location.href = 'mailto:' + c.email + '?subject=' + encodeURIComponent('[Portfolio] ' + (l.subject || '')) + '&body=' + encodeURIComponent(text);
      return 'mail';
    }
    return null;
  }

  // lead: {kind, name, contact, email?, service?, size?, deadline?, subject?, message, hp?}
  // خروجی: {ok, via:[...], failed:[...], fallback?:'telegram'|'mail', cooldown?:true}
  function send(lead) {
    const l = Object.assign({ kind: 'contact' }, lead);
    ['name', 'contact', 'email', 'service', 'size', 'deadline', 'subject'].forEach((k) => { if (l[k] != null) l[k] = cut(l[k], 200); });
    l.message = cut(l.message, 3000);
    if (l.hp) return Promise.resolve({ ok: true, via: ['ignored'], failed: [] }); // ربات اسپم
    const now = Date.now();
    if (now - lastSend < COOLDOWN_MS) return Promise.resolve({ ok: false, cooldown: true, via: [], failed: [] });
    const list = channels();
    if (!list.length) return Promise.resolve({ ok: false, via: [], failed: [], fallback: fallback(l), unconfigured: true });
    lastSend = now;
    return Promise.all(list.map((ch) => SENDERS[ch](l).then(() => ({ ch, ok: true })).catch(() => ({ ch, ok: false }))))
      .then((rs) => {
        const via = rs.filter((x) => x.ok).map((x) => x.ch), failed = rs.filter((x) => !x.ok).map((x) => x.ch);
        if (via.length) return { ok: true, via, failed };
        lastSend = 0; // اجازه‌ی تلاش دوباره
        return { ok: false, via, failed, fallback: fallback(l) };
      });
  }

  // پیام آماده برای نمایش به کاربر
  function describe(res) {
    const F = fa();
    if (res.cooldown) return { type: 'warn', text: F ? 'چند ثانیه صبر کن و دوباره بفرست.' : 'Please wait a few seconds before sending again.' };
    if (res.ok) {
      const tg = res.via.some((v) => v.indexOf('telegram') === 0), em = res.via.some((v) => v.indexOf('email') === 0);
      const where = tg && em ? (F ? 'تلگرام و ایمیل' : 'Telegram and email') : tg ? (F ? 'تلگرام' : 'Telegram') : em ? (F ? 'ایمیل' : 'email') : '';
      return { type: 'ok', text: res.via[0] === 'ignored' ? '' : (F ? '✅ پیامت از طریق ' + where + ' ارسال شد. به‌زودی جواب می‌دم.' : '✅ Your message was sent via ' + where + '. I will reply soon.') };
    }
    if (res.fallback === 'telegram') return { type: 'warn', text: F ? 'ارسال مستقیم ممکن نبود؛ پیام کپی شد و تلگرام باز شد. اگه خالی بود paste کن و بفرست.' : 'Direct sending was not possible. The message is copied and Telegram is opening; paste it there and press send.' };
    if (res.fallback === 'mail') return { type: 'warn', text: F ? 'ارسال مستقیم ممکن نبود؛ برنامه‌ی ایمیل باز شد.' : 'Direct sending was not possible, so your email app is opening.' };
    return { type: 'warn', text: F ? 'ارسال نشد. لطفاً از راه‌های تماس پایین صفحه استفاده کن.' : 'Sending failed. Please use one of the contact links below.' };
  }

  function addHoneypot(form) {
    if (!form || form.querySelector('.pro-hp')) return;
    const i = document.createElement('input');
    i.type = 'text'; i.name = 'website'; i.tabIndex = -1; i.autocomplete = 'off';
    i.className = 'pro-hp'; i.setAttribute('aria-hidden', 'true');
    form.appendChild(i);
  }

  window.ProSend = { send, channels, describe, plainOf, textOf, addHoneypot, isEmail };

  /* ── فرم تماس قدیمی (#contact): به‌جای mailto، واقعاً ارسال می‌کنه ── */
  window.submitForm = function (e) {
    e.preventDefault();
    const form = e.target;
    addHoneypot(form);
    const texts = form.querySelectorAll('input[type=text]:not(.pro-hp)');
    const lead = {
      kind: 'contact',
      name: (texts[0] || {}).value || '',
      email: (form.querySelector('input[type=email]') || {}).value || '',
      subject: (texts[1] || {}).value || '',
      message: (form.querySelector('textarea') || {}).value || '',
      hp: (form.querySelector('.pro-hp') || {}).value || ''
    };
    lead.contact = lead.email;
    const btn = form.querySelector('button[type=submit]');
    const sp = btn && btn.querySelector('span');
    const succ = form.querySelector('.form-success');
    const setBtn = (en, faT) => { if (sp) { sp.dataset.en = en; sp.dataset.fa = faT; sp.textContent = fa() ? faT : en; } };
    if (btn) { btn.disabled = true; btn.style.opacity = '.7'; }
    setBtn('Sending…', 'در حال ارسال…');
    const restore = () => { if (btn) { btn.disabled = false; btn.style.opacity = ''; } setBtn('Send Message', 'ارسال پیام'); };
    send(lead).then((res) => {
      const d = describe(res);
      if (succ) {
        const h = succ.querySelector('h4'), p = succ.querySelector('p');
        const en = res.ok ? 'Message sent!' : (res.cooldown ? 'Please wait' : 'Almost there');
        const faT = res.ok ? 'پیام ارسال شد!' : (res.cooldown ? 'کمی صبر کن' : 'یک قدم مونده');
        if (h) { h.dataset.en = en; h.dataset.fa = faT; h.textContent = fa() ? faT : en; }
        if (p) { p.removeAttribute('data-en'); p.removeAttribute('data-fa'); p.textContent = d.text; }
        succ.style.display = 'block';
      } else toast(d.text);
      if (res.ok) form.reset();
      setTimeout(() => { restore(); if (succ) succ.style.display = 'none'; }, res.ok ? 6000 : 7000);
    });
  };

  /* ── «گزارش لینک خراب ویدیو»: اگه ارسال مستقیم تنظیم باشه، بی‌صدا می‌فرسته ── */
  const origReport = window.reportBrokenVideo;
  window.reportBrokenVideo = function (btn) {
    if (!channels().length || typeof origReport !== 'function') return origReport && origReport.apply(this, arguments);
    const F = fa(), url = btn && btn.dataset ? btn.dataset.url : '';
    let title = '';
    try { const v = findVideoByUrl(url); title = v ? (F ? (v.titleFa || v.titleEn) : (v.titleEn || v.titleFa)) : ''; } catch (x) { /* ignore */ }
    send({ kind: 'report', name: F ? 'بازدیدکننده' : 'Visitor', subject: F ? 'گزارش لینک خراب ویدیو' : 'Broken video link report', message: (F ? 'عنوان: ' : 'Title: ') + (title || '-') + '\n' + (F ? 'لینک: ' : 'Link: ') + (url || '-') })
      .then((res) => toast(res.ok ? (F ? '✅ گزارش ارسال شد، ممنون' : '✅ Report sent, thank you') : describe(res).text));
  };
})();
