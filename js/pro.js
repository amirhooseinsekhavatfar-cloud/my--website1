/* ══════════════════════════════════════════════════════════
   pro.js — قابلیت‌های کاربردی سایت
   ──────────────────────────────────────────────────────────
   برای بازدیدکننده:
     ۱) ماشین‌حساب‌های مهندسی   ۲) فیلتر و جستجوی کتابخانه کد
     ۳) شبیه‌ساز زنده‌ی مخزن     ۴) شمارنده/ردیابی دانلودها
     ۵) تماس سریع + فرم درخواست پروژه
   برای معرفی تو:
     ۶) بخش خدمات              ۷) Case Study ساختاریافته
     ۸) کارت دیجیتال (سه‌بعدی، با QR) ۹) اتصال مهارت‌ها به پروژه‌ها
    ۱۰) نشان وضعیت فعلی         ۱۱) رزومه‌ی دوزبانه (PDF) با یک کلیک

   محتوا از js/data/* و js/data/site-config.js خونده می‌شه.
   این فایل رو برای تغییر محتوا ویرایش نکن.
   ══════════════════════════════════════════════════════════ */
(function () {
  'use strict';

  /* ── ابزارهای کمکی ───────────────────────────────────── */
  const SD = () => window.SiteData || {};
  const CFG = () => SD().config || {};
  const isFa = () => document.body.classList.contains('rtl');
  const $ = (s, r) => (r || document).querySelector(s);
  const $$ = (s, r) => Array.from((r || document).querySelectorAll(s));
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  // متن دوزبانه: با تغییر زبان سایت، toggleLang خودش data-en/data-fa رو عوض می‌کنه
  const T = (en, fa) => `<span data-en="${esc(en)}" data-fa="${esc(fa || en)}">${esc(isFa() ? (fa || en) : en)}</span>`;
  const toast = (m) => { try { showToast(m); } catch (e) { /* ignore */ } };
  const num = (v) => {
    const s = String(v == null ? '' : v)
      .replace(/[۰-۹]/g, (d) => d.charCodeAt(0) - 1776)
      .replace(/[٠-٩]/g, (d) => d.charCodeAt(0) - 1632)
      .replace('٫', '.').replace(',', '.').trim();
    return s === '' ? NaN : Number(s);
  };
  const fmt = (n, d) => (isFinite(n) ? String(+n.toFixed(d == null ? 2 : d)) : '—');
  const realOnly = (arr) => (arr || []).filter((x) => x && !/^sample/i.test(x.titleEn || x.name || ''));
  const siteUrl = () => (CFG().siteUrl || location.href.split('#')[0]).trim();
  const clip = (t) => (navigator.clipboard ? navigator.clipboard.writeText(t) : Promise.reject());

  /* ══════════════════════════════════════════════════════
     ۱۰) وضعیت فعلی
     ══════════════════════════════════════════════════════ */
  const STATUS = {
    open:      { en: 'Open to work',                              fa: 'آماده همکاری',                      cls: '',     col: 'var(--ac3)' },
    freelance: { en: 'Available for freelance projects',          fa: 'پذیرای پروژه‌های فریلنس',            cls: '',     col: 'var(--ac3)' },
    studying:  { en: 'Focused on studies · limited availability', fa: 'درگیر تحصیل · ظرفیت محدود',          cls: 'warn', col: 'var(--ac)' },
    busy:      { en: 'Fully booked right now',                    fa: 'فعلاً ظرفیت ندارم',                  cls: 'off',  col: '#ff6b6b' }
  };
  const curStatus = () => STATUS[CFG().status] || null;

  function applyStatus() {
    const s = curStatus();
    if (!s) return;
    const en = s.en + (CFG().statusNoteEn ? ' — ' + CFG().statusNoteEn : '');
    const fa = s.fa + (CFG().statusNoteFa ? ' — ' + CFG().statusNoteFa : '');
    const hero = $('#hero-badge-text');
    if (hero && !CFG().badge) {
      hero.dataset.en = en; hero.dataset.fa = fa;
      hero.textContent = isFa() ? fa : en;
      const dot = $('.hero-badge .dot');
      if (dot) dot.style.background = s.col;
    }
    let pill = $('#pro-contact-status');
    if (!pill) {
      const anchor = $('.contact-info .social-orbit-card');
      if (!anchor) return;
      pill = document.createElement('div');
      pill.id = 'pro-contact-status';
      anchor.parentNode.insertBefore(pill, anchor);
    }
    pill.className = 'pro-status ' + s.cls;
    pill.innerHTML = T(en, fa);
  }

  /* ══════════════════════════════════════════════════════
     ۶) خدمات
     ══════════════════════════════════════════════════════ */
  function buildServices() {
    const g = $('#services-grid');
    if (!g) return;
    const list = SD().services || [];
    if (!list.length) { const sec = $('#services'); if (sec) sec.style.display = 'none'; return; }
    g.innerHTML = list.map((s) => `
      <article class="pro-card">
        <div class="pro-card-ico"><i class="${esc(s.icon)}"></i></div>
        <h3>${T(s.titleEn, s.titleFa)}</h3>
        <p>${T(s.descEn, s.descFa)}</p>
        <ul>${(s.itemsEn || []).map((x, i) => `<li><i class="fa-solid fa-check"></i>${T(x, (s.itemsFa || [])[i])}</li>`).join('')}</ul>
        <button type="button" class="btn btn-o" data-svc="${esc(s.key)}"><i class="fa-solid fa-paper-plane"></i>${T('Request this', 'درخواست همین کار')}</button>
      </article>`).join('');
    g.addEventListener('click', (e) => {
      const b = e.target.closest('[data-svc]');
      if (!b) return;
      const sel = $('#rq-service');
      if (sel) sel.value = b.dataset.svc;
      goRequest();
    });
  }
  function goRequest() {
    const r = $('#request');
    if (r) r.scrollIntoView({ behavior: 'smooth' });
    setTimeout(() => { const n = $('#rq-name'); if (n) n.focus({ preventScroll: true }); }, 700);
  }

  /* ══════════════════════════════════════════════════════
     ۱) ماشین‌حساب‌های مهندسی
     ══════════════════════════════════════════════════════ */
  const STD_S = [1.5, 2.5, 4, 6, 10, 16, 25, 35, 50, 70, 95, 120, 150, 185, 240];
  const bad = (v, keys) => keys.some((k) => !isFinite(v[k]));
  const ERR = ['Enter valid numbers in every field.', 'در همه‌ی فیلدها عدد معتبر وارد کن.'];

  const CALCS = [
    {
      id: 'scale', icon: 'fa-solid fa-gauge-high', en: '4–20 mA Scaling', fa: 'مقیاس‌دهی ۴–۲۰ mA',
      fields: [
        { id: 'ma',  en: 'Current (mA)',        fa: 'جریان (mA)',          v: '12' },
        { id: 'lo',  en: 'Range min',           fa: 'حداقل بازه',          v: '0' },
        { id: 'hi',  en: 'Range max',           fa: 'حداکثر بازه',         v: '100' },
        { id: 'val', en: 'Value → current',     fa: 'مقدار → جریان',       v: '50' }
      ],
      note: ['Siemens analog modules set to 4..20 mA report 0 at 4 mA and 27648 at 20 mA. Values below about 3.6 mA usually mean a broken wire or a failed transmitter.',
             'ماژول‌های آنالوگ زیمنس در حالت 4..20 mA، در ۴ میلی‌آمپر عدد ۰ و در ۲۰ میلی‌آمپر عدد ۲۷۶۴۸ می‌دهند. مقدار زیر حدود ۳٫۶ mA معمولاً یعنی سیم قطع یا ترانسمیتر خراب است.'],
      run(v) {
        if (bad(v, ['ma', 'lo', 'hi', 'val'])) return { err: ERR };
        if (v.hi === v.lo) return { err: ['Range max must differ from range min.', 'حداکثر بازه باید با حداقل فرق داشته باشد.'] };
        const p = (v.ma - 4) / 16;
        const out = {
          rows: [
            ['Engineering value', 'مقدار مهندسی', fmt(v.lo + p * (v.hi - v.lo), 3)],
            ['Percent of span', 'درصد از بازه', fmt(p * 100, 1) + ' %'],
            ['Siemens raw value', 'مقدار خام زیمنس', fmt(p * 27648, 0)],
            ['Value → current', 'مقدار → جریان', fmt(4 + (v.val - v.lo) / (v.hi - v.lo) * 16, 2) + ' mA']
          ]
        };
        if (v.ma < 3.6) out.warn = ['Below 3.6 mA: check the wiring and the transmitter.', 'کمتر از ۳٫۶ mA: سیم‌کشی و ترانسمیتر را بررسی کن.'];
        else if (v.ma > 20.5) out.warn = ['Above 20.5 mA: signal is over range.', 'بیشتر از ۲۰٫۵ mA: سیگنال از بازه خارج است.'];
        return out;
      }
    },
    {
      id: 'vdrop', icon: 'fa-solid fa-bolt', en: 'Cable Voltage Drop', fa: 'افت ولتاژ کابل',
      fields: [
        { id: 'ph',   en: 'Supply',           fa: 'نوع تغذیه',           v: '3', opts: [['1', 'Single-phase', 'تک‌فاز'], ['3', 'Three-phase', 'سه‌فاز']] },
        { id: 'V',    en: 'Voltage (V)',      fa: 'ولتاژ (V)',            v: '400' },
        { id: 'I',    en: 'Current (A)',      fa: 'جریان (A)',            v: '32' },
        { id: 'L',    en: 'Length one way (m)', fa: 'طول یک‌طرفه (m)',    v: '60' },
        { id: 'S',    en: 'Cross-section (mm²)', fa: 'سطح مقطع (mm²)',    v: '10', opts: STD_S.map((s) => [String(s), String(s), String(s)]) },
        { id: 'mat',  en: 'Conductor',        fa: 'جنس رسانا',            v: 'cu', opts: [['cu', 'Copper', 'مس'], ['al', 'Aluminium', 'آلومینیوم']] },
        { id: 'temp', en: 'Conductor temp (°C)', fa: 'دمای رسانا (°C)',   v: '70' },
        { id: 'cos',  en: 'Power factor',     fa: 'ضریب توان',            v: '0.9' },
        { id: 'lim',  en: 'Allowed drop (%)', fa: 'افت مجاز (%)',         v: '3' }
      ],
      note: ['Approximation using conductor resistance only. It does not check current capacity, short-circuit withstand or reactance on long, large cables. Always confirm against your local wiring code.',
             'تخمین فقط بر پایه‌ی مقاومت رسانا است. ظرفیت جریان، تحمل اتصال‌کوتاه و راکتانس کابل‌های بلند و حجیم بررسی نمی‌شود. همیشه با آیین‌نامه‌ی محلی تطبیق بده.'],
      run(v) {
        if (bad(v, ['V', 'I', 'L', 'S', 'temp', 'cos', 'lim']) || v.V <= 0 || v.S <= 0) return { err: ERR };
        const cu = v.mat === 'cu';
        const rho = (cu ? 0.0175 : 0.0282) * (1 + (cu ? 0.00393 : 0.00403) * (v.temp - 20));
        const k = Number(v.ph) === 3 ? Math.sqrt(3) : 2;
        const drop = (S) => k * rho * v.L * v.I * v.cos / S;
        const dv = drop(v.S), pct = dv / v.V * 100;
        const min = STD_S.find((S) => drop(S) / v.V * 100 <= v.lim);
        const out = {
          rows: [
            ['Voltage drop', 'افت ولتاژ', fmt(dv, 2) + ' V'],
            ['Voltage drop (percent)', 'افت ولتاژ (درصد)', fmt(pct, 2) + ' %'],
            ['Smallest standard section for the limit', 'کوچک‌ترین سطح مقطع استاندارد برای حد مجاز', min ? min + ' mm²' : '> 240 mm²']
          ]
        };
        if (pct > v.lim) out.warn = ['The drop is above your limit with this section. Use a larger cable.', 'افت از حد مجاز بیشتر است. کابل ضخیم‌تر انتخاب کن.'];
        else out.ok = ['This section meets your voltage-drop limit.', 'این سطح مقطع حد افت ولتاژ را رعایت می‌کند.'];
        return out;
      }
    },
    {
      id: 'motor', icon: 'fa-solid fa-gear', en: 'Motor Current', fa: 'جریان موتور',
      fields: [
        { id: 'ph',  en: 'Supply',         fa: 'نوع تغذیه',     v: '3', opts: [['1', 'Single-phase', 'تک‌فاز'], ['3', 'Three-phase', 'سه‌فاز']] },
        { id: 'kW',  en: 'Shaft power (kW)', fa: 'توان محوری (kW)', v: '7.5' },
        { id: 'V',   en: 'Voltage (V)',    fa: 'ولتاژ (V)',      v: '400' },
        { id: 'cos', en: 'Power factor',   fa: 'ضریب توان',      v: '0.85' },
        { id: 'eff', en: 'Efficiency (%)', fa: 'بازده (%)',      v: '90' }
      ],
      note: ['Use the nameplate current when you have it. This is an estimate for sizing the starter, overload relay and cable before you have the motor in hand.',
             'اگر پلاک موتور را داری از جریان پلاک استفاده کن. این عدد تخمینی است برای انتخاب استارتر، رله‌ی اورلود و کابل پیش از رسیدن موتور.'],
      run(v) {
        if (bad(v, ['kW', 'V', 'cos', 'eff']) || v.V <= 0 || v.cos <= 0 || v.eff <= 0) return { err: ERR };
        const eff = v.eff > 1 ? v.eff / 100 : v.eff;
        const k = Number(v.ph) === 3 ? Math.sqrt(3) : 1;
        const I = v.kW * 1000 / (k * v.V * v.cos * eff);
        return {
          rows: [
            ['Rated current In', 'جریان نامی In', fmt(I, 2) + ' A'],
            ['Apparent power', 'توان ظاهری', fmt(v.kW / (v.cos * eff), 2) + ' kVA'],
            ['Typical direct-on-line starting current', 'جریان راه‌اندازی مستقیم (معمول)', fmt(I * 5, 0) + ' – ' + fmt(I * 8, 0) + ' A']
          ]
        };
      }
    },
    {
      id: 'modbus', icon: 'fa-solid fa-network-wired', en: 'Modbus Address', fa: 'آدرس Modbus',
      fields: [
        { id: 'ref',  en: 'Register reference (e.g. 40001)', fa: 'شماره‌ی رجیستر (مثلاً 40001)', v: '40001', text: true },
        { id: 'type', en: 'Reverse: type',   fa: 'معکوس: نوع',    v: '4', opts: [['0', 'Coil (0x)', 'Coil (0x)'], ['1', 'Discrete input (1x)', 'Discrete input (1x)'], ['3', 'Input register (3x)', 'Input register (3x)'], ['4', 'Holding register (4x)', 'Holding register (4x)']] },
        { id: 'off',  en: 'Reverse: zero-based address', fa: 'معکوس: آدرس مبتنی بر صفر', v: '0' }
      ],
      note: ['Documentation and PLC tables count from 1 (40001). The address sent on the wire counts from 0. Many libraries want the zero-based value, which is why off-by-one errors are so common.',
             'مستندات و جدول PLC از ۱ شروع می‌کنند (40001) ولی آدرسی که روی سیم می‌رود از ۰ شروع می‌شود. بیشتر کتابخانه‌ها مقدار مبتنی بر صفر می‌خواهند و به همین دلیل خطای یکی‌کم‌وزیاد این‌قدر رایج است.'],
      run(v) {
        const TYPES = {
          0: ['Coil', 'Coil', 'FC01 read · FC05/15 write'],
          1: ['Discrete input', 'Discrete input', 'FC02 read'],
          3: ['Input register', 'Input register', 'FC04 read'],
          4: ['Holding register', 'Holding register', 'FC03 read · FC06/16 write']
        };
        const rows = [];
        const d = String(v.ref || '').replace(/[۰-۹]/g, (c) => c.charCodeAt(0) - 1776).replace(/\D/g, '');
        if (d.length === 5 || d.length === 6) {
          const p = Number(d[0]), n = Number(d.slice(1));
          if (TYPES[p] && n >= 1) {
            const off = n - 1;
            rows.push(['Type', 'نوع', TYPES[p][0]], ['Function code', 'کد تابع', TYPES[p][2]],
              ['Wire address (zero-based)', 'آدرس روی سیم (مبتنی بر صفر)', off + '  (0x' + off.toString(16).toUpperCase().padStart(4, '0') + ')']);
          } else rows.push(['Reference', 'شماره‌ی رجیستر', '—']);
        } else rows.push(['Reference', 'شماره‌ی رجیستر', '5 / 6 digits']);
        const t = Number(v.type), o = num(v.off);
        if (TYPES[t] && isFinite(o) && o >= 0) {
          const ref = o < 9999 ? t * 10000 + o + 1 : t * 100000 + o + 1;
          rows.push(['Reverse → reference', 'معکوس → شماره‌ی رجیستر', String(ref).padStart(5, '0')]);
        }
        return { rows };
      }
    }
  ];

  function fieldHTML(c, f) {
    const id = `${c.id}-${f.id}`;
    const label = `<label for="${id}">${T(f.en, f.fa)}</label>`;
    if (f.opts) {
      return `<div class="pro-f">${label}<select id="${id}" data-f="${f.id}">${f.opts.map((o) =>
        `<option value="${esc(o[0])}"${String(o[0]) === String(f.v) ? ' selected' : ''} data-en="${esc(o[1])}" data-fa="${esc(o[2])}">${esc(isFa() ? o[2] : o[1])}</option>`).join('')}</select></div>`;
    }
    return `<div class="pro-f">${label}<input id="${id}" data-f="${f.id}" type="text" inputmode="${f.text ? 'numeric' : 'decimal'}" autocomplete="off" value="${esc(f.v)}"></div>`;
  }

  function runCalc(c) {
    const panel = $('#calc-' + c.id);
    if (!panel) return;
    const v = {};
    $$('[data-f]', panel).forEach((el) => {
      const f = c.fields.find((x) => x.id === el.dataset.f);
      v[f.id] = f.opts ? (isNaN(+el.value) ? el.value : +el.value) : (f.text ? el.value.trim() : num(el.value));
    });
    let r;
    try { r = c.run(v); } catch (e) { r = { err: ERR }; }
    let html = '';
    if (r.err) html = `<div class="pro-warn">${T(r.err[0], r.err[1])}</div>`;
    else {
      html = (r.rows || []).map((x) => `<div class="pro-res"><span>${T(x[0], x[1])}</span><b>${esc(x[2])}</b></div>`).join('');
      if (r.warn) html += `<div class="pro-warn">${T(r.warn[0], r.warn[1])}</div>`;
      if (r.ok) html += `<div class="pro-ok">${T(r.ok[0], r.ok[1])}</div>`;
    }
    $('.pro-out', panel).innerHTML = html;
  }

  function buildCalcs() {
    const root = $('#calc-root');
    if (!root) return;
    root.innerHTML =
      `<div class="pro-tabs" role="tablist">${CALCS.map((c, i) =>
        `<button type="button" role="tab" class="pro-tab${i ? '' : ' on'}" data-calc="${c.id}" aria-selected="${i ? 'false' : 'true'}"><i class="${c.icon}"></i>${T(c.en, c.fa)}</button>`).join('')}</div>` +
      CALCS.map((c, i) => `
        <div class="pro-panel${i ? '' : ' on'}" id="calc-${c.id}" role="tabpanel">
          <div class="pro-calc">
            <div class="pro-fields">${c.fields.map((f) => fieldHTML(c, f)).join('')}</div>
            <div class="pro-out" aria-live="polite"></div>
          </div>
          <p class="pro-note">${T(c.note[0], c.note[1])}</p>
        </div>`).join('');
    CALCS.forEach(runCalc);
    root.addEventListener('input', (e) => {
      const p = e.target.closest('.pro-panel');
      if (p) runCalc(CALCS.find((c) => 'calc-' + c.id === p.id));
    });
    root.addEventListener('change', (e) => {
      const p = e.target.closest('.pro-panel');
      if (p) runCalc(CALCS.find((c) => 'calc-' + c.id === p.id));
    });
    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-calc]');
      if (!b) return;
      $$('.pro-tab', root).forEach((t) => { t.classList.toggle('on', t === b); t.setAttribute('aria-selected', t === b ? 'true' : 'false'); });
      $$('.pro-panel', root).forEach((p) => p.classList.toggle('on', p.id === 'calc-' + b.dataset.calc));
    });
  }

  /* ══════════════════════════════════════════════════════
     ۳) شبیه‌ساز زنده‌ی کنترل سطح مخزن
     ══════════════════════════════════════════════════════ */
  const SIM_ST =
`// FB_TankLevel — call every scan (e.g. OB30, 100 ms)
IF #LS_High OR #Alarm THEN
    #Pump := FALSE;               // full, or alarm active
ELSIF NOT #LS_Low THEN
    #Pump := TRUE;                // level fell below LOW: start
END_IF;                           // between LOW and HIGH: keep last state

// Independent overflow switch: latches the alarm
IF #Ovf_Sw THEN #Alarm := TRUE; END_IF;
IF #Reset AND NOT #Ovf_Sw THEN #Alarm := FALSE; END_IF;
IF #Alarm THEN #Pump := FALSE; END_IF;`;

  const SIM = { level: 45, pump: false, alarm: false, mode: 'auto', manual: false, demand: 2, valve: true, failHigh: false, visible: false };
  const yOf = (p) => 229 - p * 1.98;

  function buildSimSlider() { if (window.ProSimSlider) ProSimSlider.build(); }

  function buildSim() {
    const root = $('#sim-builtin') || $('#sim-root');
    if (!root) return;
    root.innerHTML = `
      <div class="sim">
        <div class="sim-view">
          <svg class="sim-svg" viewBox="0 0 260 270" role="img" aria-label="Tank level simulation">
            <text id="sim-alarm" class="sim-alarm" x="130" y="18" text-anchor="middle">ALARM</text>
            <path id="sim-pipe-in"  class="sim-pipe" d="M46 215 H70"/>
            <path id="sim-pipe-out" class="sim-pipe" d="M190 215 H216"/>
            <rect class="sim-tank" x="70" y="30" width="120" height="200" rx="6"/>
            <clipPath id="sim-clip"><rect x="71" y="31" width="118" height="198" rx="5"/></clipPath>
            <rect id="sim-water" class="sim-water" x="71" y="229" width="118" height="0" clip-path="url(#sim-clip)"/>
            <line class="sim-lvl-line" x1="70" y1="${yOf(20)}" x2="190" y2="${yOf(20)}"/>
            <line class="sim-lvl-line" x1="70" y1="${yOf(80)}" x2="190" y2="${yOf(80)}"/>
            <circle id="sim-sw-low"  class="sim-sw" cx="204" cy="${yOf(20)}" r="6"/><text x="214" y="${yOf(20) + 3}">LOW</text>
            <circle id="sim-sw-high" class="sim-sw" cx="204" cy="${yOf(80)}" r="6"/><text x="214" y="${yOf(80) + 3}">HIGH</text>
            <circle id="sim-sw-ovf"  class="sim-sw ovf" cx="204" cy="${yOf(98)}" r="6"/><text x="214" y="${yOf(98) + 3}">OVF</text>
            <circle id="sim-pump" class="sim-dev" cx="30" cy="215" r="16"/><text x="30" y="219" text-anchor="middle">P</text><text x="30" y="246" text-anchor="middle">PUMP</text>
            <circle id="sim-valve" class="sim-dev" cx="230" cy="215" r="12"/><text x="230" y="219" text-anchor="middle">V</text><text x="230" y="240" text-anchor="middle">DEMAND</text>
          </svg>
        </div>
        <div class="sim-side">
          <div class="sim-ctrl">
            <button type="button" class="pro-chip on" data-sim="auto">${T('Auto', 'خودکار')}</button>
            <button type="button" class="pro-chip" data-sim="manual">${T('Manual', 'دستی')}</button>
            <button type="button" class="pro-chip" data-sim="pump" id="sim-manual-btn" disabled>${T('Pump: OFF', 'پمپ: خاموش')}</button>
            <button type="button" class="pro-chip" data-sim="reset">${T('Reset alarm', 'ریست آلارم')}</button>
            <b id="sim-lvl" style="margin-inline-start:auto;font-family:var(--mo);color:var(--ac2)">45.0 %</b>
          </div>
          <div class="sim-ctrl">
            <label>${T('Consumer demand', 'مصرف')} <input type="range" id="sim-demand" min="0" max="4.5" step="0.5" value="2"> <span id="sim-demand-v" style="font-family:var(--mo)">2 %/s</span></label>
            <label><input type="checkbox" id="sim-valve-cb" checked> ${T('Consumer valve open', 'شیر مصرف باز')}</label>
            <label><input type="checkbox" id="sim-fail-cb"> ${T('Break HIGH sensor', 'خراب‌کردن سنسور HIGH')}</label>
          </div>
          <table class="sim-io">
            <tr><th>${T('Address', 'آدرس')}</th><th>${T('Tag', 'تگ')}</th><th>${T('State', 'وضعیت')}</th></tr>
            <tr><td>I0.0</td><td>LS_Low</td><td class="v" id="sim-v-low">0</td></tr>
            <tr><td>I0.1</td><td>LS_High</td><td class="v" id="sim-v-high">0</td></tr>
            <tr><td>I0.2</td><td>Ovf_Sw</td><td class="v bad" id="sim-v-ovf">0</td></tr>
            <tr><td>Q0.0</td><td>Pump</td><td class="v" id="sim-v-pump">0</td></tr>
            <tr><td>M0.0</td><td>Alarm</td><td class="v bad" id="sim-v-alarm">0</td></tr>
          </table>
          <div class="sim-code">
            <button type="button" class="pro-chip" data-sim="copy">${T('Copy', 'کپی')}</button>
            <pre>${esc(SIM_ST)}</pre>
          </div>
          <p class="pro-note" style="margin:0">${T('Pump adds 5 %/s. Try breaking the HIGH sensor: the pump keeps running until the independent overflow switch latches the alarm.', 'پمپ ۵ درصد در ثانیه پر می‌کند. سنسور HIGH را خراب کن: پمپ ادامه می‌دهد تا کلید مستقل سرریز آلارم را قفل کند.')}</p>
        </div>
      </div>`;

    root.addEventListener('click', (e) => {
      const b = e.target.closest('[data-sim]');
      if (!b || b.disabled) return;
      const a = b.dataset.sim;
      if (a === 'auto' || a === 'manual') {
        SIM.mode = a; SIM.manual = false;
        $$('[data-sim="auto"],[data-sim="manual"]', root).forEach((x) => x.classList.toggle('on', x.dataset.sim === a));
        $('#sim-manual-btn').disabled = a !== 'manual';
      } else if (a === 'pump') SIM.manual = !SIM.manual;
      else if (a === 'reset') {
        if (SIM.level >= 98) toast(isFa() ? 'تا وقتی سطح در ناحیه‌ی سرریز است ریست ممکن نیست' : 'Cannot reset while the level is still in the overflow zone');
        else SIM.alarm = false;
      } else if (a === 'copy') clip(SIM_ST).then(() => toast(isFa() ? '✅ کد کپی شد' : '✅ Code copied')).catch(() => { });
    });
    $('#sim-demand').addEventListener('input', (e) => { SIM.demand = +e.target.value; $('#sim-demand-v').textContent = SIM.demand + ' %/s'; });
    $('#sim-valve-cb').addEventListener('change', (e) => { SIM.valve = e.target.checked; });
    $('#sim-fail-cb').addEventListener('change', (e) => { SIM.failHigh = e.target.checked; });

    // فقط وقتی بخش دیده می‌شه و تب فعاله اجرا بشه (صرفه‌جویی باتری موبایل)
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((en) => { SIM.visible = en[0].isIntersecting; }, { threshold: 0.1 }).observe(root);
    } else SIM.visible = true;
    setInterval(simTick, 100);
    simPaint();
  }

  function simTick() {
    if (!SIM.visible || document.hidden) return;
    const lsLow = SIM.level >= 20;
    const lsHigh = SIM.failHigh ? false : SIM.level >= 80;
    const ovf = SIM.level >= 98;
    // ── اسکن PLC ──
    if (SIM.mode === 'auto') {
      if (lsHigh || SIM.alarm) SIM.pump = false;
      else if (!lsLow) SIM.pump = true;
    } else SIM.pump = SIM.manual && !lsHigh && !SIM.alarm;
    if (ovf) SIM.alarm = true;
    if (SIM.alarm) SIM.pump = false;
    // ── فرآیند ──
    const qin = SIM.pump ? 5 : 0;
    const qout = SIM.valve && SIM.level > 0 ? SIM.demand : 0;
    SIM.level = Math.max(0, Math.min(100, SIM.level + (qin - qout) * 0.1));
    SIM.flowOut = qout > 0;
    simPaint();
  }

  function simPaint() {
    const set = (id, on) => { const el = $('#' + id); if (el) el.classList.toggle('on', !!on); };
    const w = $('#sim-water');
    if (!w) return;
    const h = SIM.level * 1.98;
    w.setAttribute('y', 229 - h); w.setAttribute('height', h);
    const lsLow = SIM.level >= 20, lsHigh = SIM.failHigh ? false : SIM.level >= 80, ovf = SIM.level >= 98;
    set('sim-sw-low', lsLow); set('sim-sw-high', lsHigh); set('sim-sw-ovf', ovf);
    set('sim-pump', SIM.pump); set('sim-valve', SIM.valve && SIM.demand > 0);
    set('sim-alarm', SIM.alarm);
    $('#sim-pipe-in').classList.toggle('flow', SIM.pump);
    $('#sim-pipe-out').classList.toggle('flow', !!SIM.flowOut);
    const v = (id, on) => { const el = $('#' + id); if (el) { el.textContent = on ? '1' : '0'; el.classList.toggle('on', !!on); } };
    v('sim-v-low', lsLow); v('sim-v-high', lsHigh); v('sim-v-ovf', ovf); v('sim-v-pump', SIM.pump); v('sim-v-alarm', SIM.alarm);
    $('#sim-lvl').textContent = SIM.level.toFixed(1) + ' %';
    const mb = $('#sim-manual-btn');
    if (mb) { const a = mb.querySelector('span'); if (a) { a.dataset.en = 'Pump: ' + (SIM.manual ? 'ON' : 'OFF'); a.dataset.fa = 'پمپ: ' + (SIM.manual ? 'روشن' : 'خاموش'); a.textContent = isFa() ? a.dataset.fa : a.dataset.en; } }
  }

  /* ══════════════════════════════════════════════════════
     ۲) فیلتر و جستجوی کتابخانه کد
     ══════════════════════════════════════════════════════ */
  function buildCodeFilters() {
    const bar = $('#code-filterbar'), grid = $('#code-grid');
    if (!bar || !grid) return;
    const cards = $$('.cc', grid);
    if (cards.length < 2) { bar.style.display = 'none'; return; }
    const langs = Array.from(new Set(cards.map((c) => $('.cc-lang', c).textContent.trim())));
    let cur = '*', q = '';
    bar.innerHTML = `<button type="button" class="pro-chip on" data-l="*">${T('All', 'همه')}</button>` +
      langs.map((l) => `<button type="button" class="pro-chip" data-l="${esc(l)}">${esc(l)}</button>`).join('') +
      `<input type="search" class="pro-search" id="code-q" data-ph-en="Search snippets…" data-ph-fa="جستجو در کدها…" placeholder="${isFa() ? 'جستجو در کدها…' : 'Search snippets…'}" aria-label="Search">`;
    const empty = document.createElement('div');
    empty.className = 'pro-empty'; empty.style.display = 'none'; empty.innerHTML = T('No snippet matches.', 'کدی پیدا نشد.');
    grid.parentNode.appendChild(empty);
    const apply = () => {
      let n = 0;
      cards.forEach((c) => {
        const ok = (cur === '*' || $('.cc-lang', c).textContent.trim() === cur) && (!q || c.textContent.toLowerCase().includes(q));
        c.style.display = ok ? '' : 'none'; if (ok) n++;
      });
      empty.style.display = n ? 'none' : '';
    };
    bar.addEventListener('click', (e) => {
      const b = e.target.closest('[data-l]');
      if (!b) return;
      cur = b.dataset.l;
      $$('.pro-chip', bar).forEach((x) => x.classList.toggle('on', x === b));
      apply();
    });
    $('#code-q').addEventListener('input', (e) => { q = e.target.value.trim().toLowerCase(); apply(); });
  }

  /* ══════════════════════════════════════════════════════
     ۴) ردیابی و شمارنده‌ی دانلود
     ══════════════════════════════════════════════════════ */
  const keyOf = (href) => String(href || '').split('/').pop().replace(/\.[a-z0-9]+(\?.*)?$/i, '').replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '') || 'file';
  const hit = (tpl, key) => fetch(tpl.replace('{key}', encodeURIComponent(key)))
    .then((r) => r.json())
    .then((j) => (j && (j.count != null ? j.count : j.value != null ? j.value : null)))
    .catch(() => null);

  function buildDownloads() {
    const grid = $('#pdf-grid');
    if (!grid) return;
    const cc = CFG().downloadCounter || {};
    const setCount = (card, n) => {
      if (n == null || !card) return;
      let el = $('.pro-dl-count', card);
      if (!el) { el = document.createElement('div'); el.className = 'pro-dl-count'; card.appendChild(el); }
      el.innerHTML = `<i class="fa-solid fa-download"></i> ${esc(n)}`;
    };
    if (!$$('.pdf-card', grid).length) { const sec = $('#resources'); if (sec) sec.style.display = 'none'; return; }
    grid.addEventListener('click', (e) => {
      const a = e.target.closest('a[download]');
      if (!a) return;
      const key = keyOf(a.getAttribute('href'));
      try { if (window.plausible) window.plausible('Download', { props: { file: key } }); } catch (x) { /* ignore */ }
      try { if (window.gtag) window.gtag('event', 'file_download', { file_name: key }); } catch (x) { /* ignore */ }
      if (cc.up) hit(cc.up, key).then((n) => setCount(a.closest('.pdf-card'), n));
    });
    if (cc.get) $$('.pdf-card', grid).forEach((card) => {
      const a = $('a[download]', card);
      if (a) hit(cc.get, keyOf(a.getAttribute('href'))).then((n) => setCount(card, n));
    });
  }

  /* ══════════════════════════════════════════════════════
     ۵) تماس سریع + فرم درخواست پروژه
     ══════════════════════════════════════════════════════ */
  const tgUrl = (text) => 'https://t.me/' + (CFG().telegramUser || '').replace(/^@/, '') + (text ? '?text=' + encodeURIComponent(text) : '');
  const waUrl = (text) => 'https://wa.me/' + String(CFG().whatsapp || '').replace(/\D/g, '') + (text ? '?text=' + encodeURIComponent(text) : '');

  function buildFab() {
    if ($('#pro-fab')) return;
    const c = CFG();
    const items = [];
    if (c.telegramUser) items.push(`<a class="pro-fab-item" href="${esc(tgUrl())}" target="_blank" rel="noopener"><i class="fab fa-telegram"></i>${T('Telegram', 'تلگرام')}</a>`);
    if (c.whatsapp) items.push(`<a class="pro-fab-item" href="${esc(waUrl())}" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i>${T('WhatsApp', 'واتساپ')}</a>`);
    if (c.email) items.push(`<a class="pro-fab-item" href="mailto:${esc(c.email)}"><i class="fa-solid fa-envelope"></i>${T('Email', 'ایمیل')}</a>`);
    items.push(`<button type="button" class="pro-fab-item" data-fab="request"><i class="fa-solid fa-clipboard-list"></i>${T('Request a project', 'درخواست پروژه')}</button>`);
    items.push(`<button type="button" class="pro-fab-item" data-fab="card"><i class="fa-solid fa-id-card"></i>${T('Digital card', 'کارت دیجیتال')}</button>`);
    const d = document.createElement('div');
    d.className = 'pro-fab'; d.id = 'pro-fab';
    d.innerHTML = `<button type="button" class="pro-fab-main" aria-expanded="false" aria-label="Quick contact"><i class="fa-solid fa-comment-dots"></i></button><div class="pro-fab-menu">${items.join('')}</div>`;
    document.body.appendChild(d);
    const main = $('.pro-fab-main', d);
    const close = () => { d.classList.remove('open'); main.setAttribute('aria-expanded', 'false'); };
    main.addEventListener('click', () => { const o = d.classList.toggle('open'); main.setAttribute('aria-expanded', o ? 'true' : 'false'); });
    d.addEventListener('click', (e) => {
      const b = e.target.closest('[data-fab]');
      if (!b) return;
      close();
      if (b.dataset.fab === 'card') goCard(); else goRequest();
    });
    document.addEventListener('click', (e) => { if (!d.contains(e.target)) close(); });
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape') close(); });
  }

  function buildForm() {
    const f = $('#request-form');
    if (!f) return;
    const sv = SD().services || [];
    const ro = SD().requestOptions || { sizes: [], deadlines: [] };
    const opts = (arr) => arr.map((o, i) => `<option value="${i}" data-en="${esc(o.en)}" data-fa="${esc(o.fa)}">${esc(isFa() ? o.fa : o.en)}</option>`).join('');
    const ph = (en, fa) => `data-ph-en="${esc(en)}" data-ph-fa="${esc(fa)}" placeholder="${esc(isFa() ? fa : en)}"`;
    const direct = window.ProSend && ProSend.channels().length > 0;
    f.innerHTML = `
      <div class="pro-f"><label for="rq-name">${T('Your name', 'نام شما')}</label><input id="rq-name" type="text" autocomplete="name" ${ph('Name', 'نام')}><span class="pro-err" data-err="name"></span></div>
      <div class="pro-f"><label for="rq-contact">${T('How can I reach you?', 'چطور بهت دسترسی داشته باشم؟')}</label><input id="rq-contact" type="text" autocomplete="off" ${ph('Telegram @id, phone or email', 'آیدی تلگرام، شماره یا ایمیل')}><span class="pro-err" data-err="contact"></span></div>
      <div class="pro-f"><label for="rq-service">${T('Type of work', 'نوع کار')}</label>
        <select id="rq-service">${sv.map((s) => `<option value="${esc(s.key)}" data-en="${esc(s.titleEn)}" data-fa="${esc(s.titleFa)}">${esc(isFa() ? s.titleFa : s.titleEn)}</option>`).join('')}<option value="other" data-en="Something else" data-fa="چیز دیگر">${isFa() ? 'چیز دیگر' : 'Something else'}</option></select></div>
      <div class="pro-f"><label for="rq-size">${T('Size of the work', 'حجم کار')}</label><select id="rq-size">${opts(ro.sizes || [])}</select></div>
      <div class="pro-f"><label for="rq-deadline">${T('Timeline', 'زمان‌بندی')}</label><select id="rq-deadline">${opts(ro.deadlines || [])}</select></div>
      <div class="pro-f full"><label for="rq-desc">${T('What do you need?', 'چی نیاز داری؟')}</label><textarea id="rq-desc" ${ph('Describe the machine or process, what should happen, and what equipment you already have.', 'دستگاه یا فرآیند، کاری که باید انجام بشه و تجهیزاتی که از قبل داری رو توضیح بده.')}></textarea><span class="pro-err" data-err="desc"></span></div>
      <div class="pro-actions full">
        <button type="submit" class="btn btn-p" id="rq-submit"><i class="fa-solid fa-paper-plane"></i><span id="rq-submit-lbl" data-en="${direct ? 'Send request' : 'Send via Telegram'}" data-fa="${direct ? 'ارسال درخواست' : 'ارسال با تلگرام'}">${direct ? (isFa() ? 'ارسال درخواست' : 'Send request') : (isFa() ? 'ارسال با تلگرام' : 'Send via Telegram')}</span></button>
        ${CFG().telegramUser ? `<button type="button" class="btn btn-o" data-send="tg"><i class="fab fa-telegram"></i>${T('Open Telegram', 'باز کردن تلگرام')}</button>` : ''}
        ${CFG().whatsapp ? `<button type="button" class="btn btn-o" data-send="wa"><i class="fab fa-whatsapp"></i>${T('WhatsApp', 'واتساپ')}</button>` : ''}
        ${CFG().email ? `<button type="button" class="btn btn-o" data-send="mail"><i class="fa-solid fa-envelope"></i>${T('Email app', 'برنامه‌ی ایمیل')}</button>` : ''}
        <button type="button" class="btn btn-o" data-send="copy"><i class="fa-regular fa-copy"></i>${T('Copy message', 'کپی پیام')}</button>
      </div>
      <div class="pro-sendstatus full" role="status" aria-live="polite"></div>
      <p class="pro-hint full">${direct
        ? T('Your message goes straight to me. Nothing is stored on this site.', 'پیامت مستقیم به من می‌رسد. هیچ‌چیز روی این سایت ذخیره نمی‌شود.')
        : T('Nothing is stored on this site. The message opens in the app you choose.', 'هیچ‌چیز روی این سایت ذخیره نمی‌شود. پیام در برنامه‌ای که انتخاب کنی باز می‌شود.')}</p>`;
    if (window.ProSend) ProSend.addHoneypot(f);

    const val = (id) => ($('#' + id).value || '').trim();
    const sel = (id) => { const s = $('#' + id); return s.options[s.selectedIndex] ? s.options[s.selectedIndex].textContent : ''; };
    const status = (d) => { const el = $('.pro-sendstatus', f); el.className = 'pro-sendstatus full ' + (d && d.text ? d.type : ''); el.textContent = d ? d.text : ''; };
    const valid = () => {
      let ok = true;
      const m = {
        name: ['Please enter your name.', 'نامت را وارد کن.'],
        contact: ['Please tell me how to reach you.', 'راه تماست را بنویس.'],
        desc: ['Please describe what you need.', 'توضیح بده چی نیاز داری.']
      };
      ['name', 'contact', 'desc'].forEach((k) => {
        const empty = !val('rq-' + k);
        $(`[data-err="${k}"]`, f).textContent = empty ? (isFa() ? m[k][1] : m[k][0]) : '';
        if (empty) ok = false;
      });
      return ok;
    };
    const lead = () => ({
      kind: 'request', name: val('rq-name'), contact: val('rq-contact'),
      service: sel('rq-service'), size: sel('rq-size'), deadline: sel('rq-deadline'),
      message: val('rq-desc'), hp: (f.querySelector('.pro-hp') || {}).value || ''
    });
    f.addEventListener('click', (e) => {
      const b = e.target.closest('[data-send]');
      if (!b || !valid()) return;
      const l = lead(), msg = ProSend.plainOf(l), k = b.dataset.send;
      if (k === 'wa') window.open(waUrl(msg), '_blank', 'noopener');
      else if (k === 'tg') { clip(msg).then(() => toast(isFa() ? 'پیام کپی شد؛ اگر در تلگرام خالی بود، paste کن' : 'Message copied. If Telegram opens empty, just paste it.')).catch(() => { }); window.open(tgUrl(msg), '_blank', 'noopener'); }
      else if (k === 'mail') location.href = 'mailto:' + CFG().email + '?subject=' + encodeURIComponent(isFa() ? 'درخواست پروژه' : 'Project request') + '&body=' + encodeURIComponent(msg);
      else clip(msg).then(() => toast(isFa() ? '✅ پیام کپی شد' : '✅ Message copied')).catch(() => toast(msg));
    });
    f.addEventListener('submit', (e) => {
      e.preventDefault();
      status(null);
      if (!valid()) return;
      const btn = $('#rq-submit', f), lbl = $('#rq-submit-lbl', f);
      const restore = (en, faT) => { lbl.dataset.en = en; lbl.dataset.fa = faT; lbl.textContent = isFa() ? faT : en; };
      const prev = [lbl.dataset.en, lbl.dataset.fa];
      btn.disabled = true; restore('Sending…', 'در حال ارسال…');
      ProSend.send(lead()).then((res) => {
        const d = ProSend.describe(res);
        status(d);
        if (res.ok) { const keep = $('#rq-service').value; f.reset(); $('#rq-service').value = keep; }
      }).catch(() => status({ type: 'warn', text: isFa() ? 'خطای غیرمنتظره؛ دوباره تلاش کن.' : 'Unexpected error. Please try again.' }))
        .finally(() => { btn.disabled = false; restore(prev[0], prev[1]); });
    });
  }

  /* ══════════════════════════════════════════════════════
     ۸) کارت دیجیتال: کارت سه‌بعدی دورو (جلو: معرفی، پشت: QR سایت)
        QR به‌صورت محلی ساخته می‌شه و آفلاین کار می‌کنه.
     ══════════════════════════════════════════════════════ */
  function qrImg(text, cell) {
    try {
      if (typeof qrcode !== 'function') return '';
      const q = qrcode(0, 'M');
      q.addData(text); q.make();
      return q.createDataURL(cell || 5, (cell || 5) * 3);
    } catch (e) { return ''; }
  }

  function buildDigitalCard() {
    const slot = $('#digital-card');
    if (!slot || slot.dataset.built) return;
    slot.dataset.built = '1';
    const c = CFG(), s = curStatus();
    const url = siteUrl();
    const host = url.replace(/^https?:\/\//, '').replace(/\/$/, '');
    const local = /^(file:|https?:\/\/(localhost|127\.|192\.168\.))/i.test(url) || /^file:/i.test(location.href);
    const qr = qrImg(url, 4);
    let tags = realOnly(SD().skills).slice().sort((a, b) => (b.pct || 0) - (a.pct || 0)).slice(0, 3).map((x) => x.name).filter(Boolean);
    if (!tags.length) tags = ['PLC', 'HMI / SCADA', 'IoT'];
    const lines = [
      c.email && ['fa-solid fa-envelope', c.email],
      c.telegramUser && ['fab fa-telegram', '@' + String(c.telegramUser).replace(/^@/, '')],
      host && ['fa-solid fa-globe', host]
    ].filter(Boolean);
    const link = (href, ico, label) => href ? `<a href="${esc(href)}" target="_blank" rel="noopener" aria-label="${label}" title="${label}"><i class="${ico}"></i></a>` : '';
    const name = T((c.nameEn || '') + ' ' + (c.lnameEn || ''), (c.nameFa || '') + ' ' + (c.lnameFa || ''));

    slot.innerHTML = `
      <div class="dc">
        <div class="dc-scene" tabindex="0" role="button" aria-pressed="false" aria-label="Flip card">
          <div class="dc-tilt">
            <div class="dc-card">
              <div class="dc-face dc-front">
                <div class="dc-top">
                  <div class="dc-seal"><span>AHS</span></div>
                  ${s ? `<div class="dc-pill" style="--st:${s.col}">${T(s.en, s.fa)}</div>` : ''}
                </div>
                <div class="dc-mid">
                  <div class="dc-name">${name}</div>
                  <div class="dc-role">${T(c.jobTitleEn || '', c.jobTitleFa || c.jobTitleEn || '')}</div>
                  <div class="dc-tags">${tags.map((t) => `<span>${esc(t)}</span>`).join('')}</div>
                </div>
                <div class="dc-lines">${lines.map((l) => `<div><i class="${l[0]}"></i><span>${esc(l[1])}</span></div>`).join('')}</div>
                <div class="dc-sheen"></div>
              </div>
              <div class="dc-face dc-back">
                <div class="dc-qr-wrap">
                  ${qr ? `<img class="dc-qr" src="${qr}" alt="QR">` : `<div class="dc-qr dc-qr-off">QR</div>`}
                </div>
                <div class="dc-back-txt">
                  <div class="dc-back-title">${T('Scan to open my portfolio', 'اسکن کن تا پورتفولیو باز بشه')}</div>
                  <div class="dc-url">${esc(host)}</div>
                  ${local ? `<div class="dc-dev">${T('Local preview: set siteUrl in site-config.js before publishing.', 'پیش‌نمایش محلی: قبل از انتشار siteUrl را در site-config.js بگذار.')}</div>` : ''}
                </div>
                <div class="dc-sheen"></div>
              </div>
            </div>
          </div>
        </div>
        <div class="dc-actions">
          <button type="button" class="dc-btn" data-dc="flip"><i class="fa-solid fa-rotate"></i><span data-en="Show QR" data-fa="نمایش QR">${isFa() ? 'نمایش QR' : 'Show QR'}</span></button>
          <button type="button" class="dc-btn" data-dc="copy"><i class="fa-regular fa-copy"></i>${T('Copy link', 'کپی لینک')}</button>
          ${navigator.share ? `<button type="button" class="dc-btn" data-dc="share"><i class="fa-solid fa-share-nodes"></i>${T('Share', 'اشتراک')}</button>` : ''}
        </div>
        <div class="dc-links">
          ${link(c.telegramUser ? tgUrl() : '', 'fab fa-telegram', 'Telegram')}
          ${link(c.whatsapp ? waUrl() : '', 'fab fa-whatsapp', 'WhatsApp')}
          ${link(c.linkedin, 'fab fa-linkedin-in', 'LinkedIn')}
          ${link(c.github, 'fab fa-github', 'GitHub')}
          ${link(c.email ? 'mailto:' + c.email : '', 'fa-solid fa-envelope', 'Email')}
        </div>
      </div>`;

    const dc = $('.dc', slot), scene = $('.dc-scene', slot), tilt = $('.dc-tilt', slot), lbl = $('[data-dc=flip] span', slot);
    const setFlip = (on) => {
      dc.classList.toggle('flipped', on);
      scene.setAttribute('aria-pressed', on ? 'true' : 'false');
      lbl.dataset.en = on ? 'Show card' : 'Show QR';
      lbl.dataset.fa = on ? 'نمایش کارت' : 'نمایش QR';
      lbl.textContent = isFa() ? lbl.dataset.fa : lbl.dataset.en;
    };
    const flip = () => setFlip(!dc.classList.contains('flipped'));
    scene.addEventListener('click', flip);
    scene.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); flip(); } });
    // حرکت ملایم کارت با ماوس (روی لمس و با reduced-motion غیرفعاله)
    const calm = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    scene.addEventListener('pointermove', (e) => {
      if (calm || e.pointerType !== 'mouse') return;
      const r = scene.getBoundingClientRect(), x = (e.clientX - r.left) / r.width, y = (e.clientY - r.top) / r.height;
      tilt.style.transform = `rotateX(${((0.5 - y) * 12).toFixed(1)}deg) rotateY(${((x - 0.5) * 16).toFixed(1)}deg)`;
      scene.style.setProperty('--mx', (x * 100).toFixed(0) + '%'); scene.style.setProperty('--my', (y * 100).toFixed(0) + '%');
    });
    scene.addEventListener('pointerleave', () => { tilt.style.transform = ''; });
    slot.addEventListener('click', (e) => {
      const b = e.target.closest('[data-dc]');
      if (!b) return;
      if (b.dataset.dc === 'flip') flip();
      else if (b.dataset.dc === 'copy') clip(siteUrl()).then(() => toast(isFa() ? '✅ لینک کپی شد' : '✅ Link copied')).catch(() => toast(siteUrl()));
      else if (navigator.share) navigator.share({ title: document.title, url: siteUrl() }).catch(() => { });
    });
  }
  function goCard() {
    const el = $('#digital-card');
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    const dc = $('.dc', el);
    if (dc) { dc.classList.remove('dc-pulse'); void dc.offsetWidth; dc.classList.add('dc-pulse'); }
  }

  /* ══════════════════════════════════════════════════════
     ۷) Case Study ساختاریافته
     ══════════════════════════════════════════════════════ */
  function decorateCaseStudy(index) {
    const list = (typeof pcarProjects !== 'undefined' && pcarProjects) || SD().projects || [];
    const p = list[index];
    const desc = $('#cs-desc');
    if (!p || !desc) return;
    const old = $('#cs-struct'); if (old) old.remove();
    const F = isFa();
    const get = (k) => (F ? (p[k + 'Fa'] || p[k + 'En']) : (p[k + 'En'] || p[k + 'Fa'])) || '';
    const blocks = [
      ['problem', 'Problem', 'مسئله'], ['solution', 'Solution', 'راه‌حل'],
      ['stack', 'Hardware & software', 'سخت‌افزار و نرم‌افزار'], ['result', 'Result', 'نتیجه']
    ].filter((b) => get(b[0])).map((b) => `<div class="pro-cs-block"><h5>${esc(F ? b[2] : b[1])}</h5><p>${esc(get(b[0]))}</p></div>`);
    if (!blocks.length) return;
    const box = document.createElement('div');
    box.id = 'cs-struct'; box.className = 'pro-cs'; box.innerHTML = blocks.join('');
    desc.parentNode.insertBefore(box, desc.nextSibling);
  }
  function hookCaseStudy() {
    const orig = window.openCaseStudy;
    if (typeof orig !== 'function' || orig.__pro) return;
    const w = function (i) { const r = orig.apply(this, arguments); try { decorateCaseStudy(i); } catch (e) { /* ignore */ } return r; };
    w.__pro = true; window.openCaseStudy = w;
  }

  /* ══════════════════════════════════════════════════════
     ۹) اتصال مهارت‌ها به پروژه‌ها
     ══════════════════════════════════════════════════════ */
  function decorateSkills() {
    const grid = $('#skills-grid');
    if (!grid) return;
    const skills = SD().skills || [];
    const projs = (typeof pcarProjects !== 'undefined' && pcarProjects.length ? pcarProjects : SD().projects) || [];
    $$('.sk', grid).forEach((card, i) => {
      const s = skills[i];
      const old = $('.pro-proof', card); if (old) old.remove();
      if (!s || !s.name) return;
      const name = String(s.name).toLowerCase();
      const hits = [];
      projs.forEach((p, idx) => {
        if (!p || /^sample/i.test(p.titleEn || '')) return;
        const explicit = (s.proof || []).some((x) => x === idx || String(x).toLowerCase() === String(p.titleEn || '').toLowerCase());
        const tags = String(p.tags || '').split(',').map((t) => t.trim().toLowerCase()).filter((t) => t.length >= 3);
        const auto = tags.some((t) => name.includes(t) || t.includes(name));
        if (explicit || auto) hits.push(idx);
      });
      if (!hits.length) return;
      const d = document.createElement('div');
      d.className = 'pro-proof';
      d.innerHTML = `<span>${isFa() ? 'ثابت‌شده در:' : 'Proven in:'}</span>` +
        hits.slice(0, 3).map((idx) => `<button type="button" data-proj="${idx}">${esc(isFa() ? (projs[idx].titleFa || projs[idx].titleEn) : projs[idx].titleEn)}</button>`).join('');
      card.appendChild(d);
    });
  }
  function bindSkillProof() {
    const grid = $('#skills-grid');
    if (!grid) return;
    decorateSkills();
    new MutationObserver(decorateSkills).observe(grid, { childList: true });
    grid.addEventListener('click', (e) => {
      const b = e.target.closest('[data-proj]');
      if (!b) return;
      if (typeof pcarGoTo === 'function') pcarGoTo(Number(b.dataset.proj));
      const sec = $('#projects'); if (sec) sec.scrollIntoView({ behavior: 'smooth' });
    });
  }

  /* ══════════════════════════════════════════════════════
     ۱۱) رزومه‌ی دوزبانه (فارسی / انگلیسی / یک‌صفحه‌ای) → PDF با چاپ
     ══════════════════════════════════════════════════════ */
  function resumeHTML(lang, compact) {
    const F = lang === 'fa', c = CFG(), d = SD();
    const g = (o, k) => (F ? (o[k + 'Fa'] || o[k + 'En'] || '') : (o[k + 'En'] || o[k + 'Fa'] || ''));
    const date = (o) => (F ? (o.dateFa || o.date || '') : (o.date || o.dateFa || ''));
    const cut = (a, n) => (compact ? a.slice(0, n) : a);
    const exp = cut(realOnly(d.resumeExperience), 3), edu = cut(realOnly(d.resumeEducation), 2);
    const projs = cut(realOnly(d.projects), 3), certs = cut(realOnly((d.experience || {}).certs), 3);
    let sk = realOnly(d.skills); if (compact) sk = sk.slice().sort((a, b) => (b.pct || 0) - (a.pct || 0)).slice(0, 8);
    const groups = {};
    sk.forEach((s) => { const k = s.cat || (F ? 'مهارت‌ها' : 'Skills'); (groups[k] = groups[k] || []).push(s.name); });
    const line = (o) => `<div class="it"><div class="h"><b>${esc(g(o, 'title'))}</b><span>${esc(date(o))}</span></div><div class="s">${esc(g(o, 'sub'))}</div></div>`;
    const sec = (en, fa, body) => (body ? `<h2>${F ? fa : en}</h2>${body}` : '');
    const contacts = [c.email, c.linkedin && c.linkedin.replace(/^https?:\/\//, ''), c.github && c.github.replace(/^https?:\/\//, ''), c.telegramUser && '@' + c.telegramUser.replace(/^@/, ''), c.whatsapp && '+' + String(c.whatsapp).replace(/\D/g, '')].filter(Boolean);
    const name = F ? `${c.nameFa || ''} ${c.lnameFa || ''}` : `${c.nameEn || ''} ${c.lnameEn || ''}`;
    return `<!doctype html><html lang="${lang}" dir="${F ? 'rtl' : 'ltr'}"><head><meta charset="utf-8"><title>${esc(name.trim())} — ${F ? 'رزومه' : 'Resume'}</title>
<link href="https://fonts.googleapis.com/css2?family=Vazirmatn:wght@400;700&display=swap" rel="stylesheet">
<style>
@page{size:A4;margin:${compact ? '12mm' : '16mm'}}
*{box-sizing:border-box}
body{margin:0;color:#1b1f24;font:${compact ? '10.5px' : '12px'}/1.6 ${F ? "Vazirmatn,Tahoma," : ""}'Segoe UI',Arial,sans-serif;-webkit-print-color-adjust:exact;print-color-adjust:exact}
header{border-bottom:2px solid #b36b00;padding-bottom:8px;margin-bottom:6px}
h1{margin:0;font-size:${compact ? '20px' : '24px'}}
.role{color:#b36b00;font-weight:700;margin:2px 0 4px}
.contacts{color:#55606b;font-size:.92em;direction:ltr;unicode-bidi:plaintext}
h2{font-size:.95em;letter-spacing:.06em;text-transform:uppercase;color:#b36b00;border-bottom:1px solid #ddd;margin:${compact ? '10px 0 4px' : '16px 0 6px'};padding-bottom:2px}
.it{margin-bottom:${compact ? '3px' : '6px'};break-inside:avoid}
.h{display:flex;justify-content:space-between;gap:12px}.h span{color:#55606b;white-space:nowrap}
.s{color:#3b444d}
.sk b{color:#1b1f24}
.sk div{margin-bottom:2px}
</style></head><body>
<header><h1>${esc(name.trim())}</h1><div class="role">${esc(F ? (c.jobTitleFa || c.jobTitleEn || '') : (c.jobTitleEn || ''))}</div><div class="contacts">${contacts.map(esc).join(' · ')}</div></header>
${sec('Experience', 'تجربه‌ی کاری', exp.map(line).join(''))}
${sec('Projects', 'پروژه‌ها', projs.map((p) => `<div class="it"><div class="h"><b>${esc(g(p, 'title'))}</b><span>${esc(String(p.tags || '').split(',').slice(0, 4).map((t) => t.trim()).join(' · '))}</span></div><div class="s">${esc(g(p, 'desc'))}</div></div>`).join(''))}
${sec('Skills', 'مهارت‌ها', Object.keys(groups).map((k) => `<div class="sk"><b>${esc(k)}:</b> ${esc(groups[k].join(' · '))}</div>`).join(''))}
${sec('Education', 'تحصیلات', edu.map(line).join(''))}
${sec('Certifications', 'گواهی‌نامه‌ها', certs.map((x) => `<div class="it"><b>${esc(g(x, 'title'))}</b> <span class="s">${esc(g(x, 'desc'))}</span></div>`).join(''))}
<script>addEventListener('load',function(){setTimeout(function(){print()},900)})<\/script>
</body></html>`;
  }
  function printResume(lang, compact) {
    const html = resumeHTML(lang, compact);
    const url = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    const w = window.open(url, '_blank');
    if (!w) {
      const fr = document.createElement('iframe');
      fr.style.cssText = 'position:fixed;width:0;height:0;border:0;right:0;bottom:0';
      fr.srcdoc = html; document.body.appendChild(fr);
      setTimeout(() => fr.remove(), 60000);
    }
    toast(isFa() ? 'در پنجره‌ی چاپ «ذخیره به‌صورت PDF» را انتخاب کن' : 'In the print dialog choose “Save as PDF”');
  }
  function buildResumeActions() {
    const cv = $('#cv-download-btn');
    if (!cv || $('#pro-resume-actions')) return;
    const d = document.createElement('div');
    d.className = 'pro-resume-actions'; d.id = 'pro-resume-actions';
    d.innerHTML =
      `<button type="button" class="pro-chip" data-r="fa"><i class="fa-solid fa-file-pdf"></i>${T('PDF · Persian', 'PDF · فارسی')}</button>` +
      `<button type="button" class="pro-chip" data-r="en"><i class="fa-solid fa-file-pdf"></i>${T('PDF · English', 'PDF · انگلیسی')}</button>` +
      `<button type="button" class="pro-chip" data-r="short"><i class="fa-solid fa-file-lines"></i>${T('One-page version', 'نسخه‌ی یک‌صفحه‌ای')}</button>`;
    cv.insertAdjacentElement('afterend', d);
    d.addEventListener('click', (e) => {
      const b = e.target.closest('[data-r]');
      if (!b) return;
      if (b.dataset.r === 'short') printResume(isFa() ? 'fa' : 'en', true);
      else printResume(b.dataset.r, false);
    });
  }

  /* ══════════════════════════════════════════════════════
     راه‌اندازی
     ══════════════════════════════════════════════════════ */
  function syncPlaceholders() {
    $$('[data-ph-en]').forEach((el) => { el.placeholder = (isFa() ? el.dataset.phFa : el.dataset.phEn) || el.placeholder; });
  }
  function afterLang() {
    syncPlaceholders();
    applyStatus();
    decorateSkills();
    simPaint();
  }
  function hookLang() {
    const orig = window.toggleLang;
    if (typeof orig !== 'function' || orig.__pro) return;
    const w = function () { const r = orig.apply(this, arguments); try { afterLang(); } catch (e) { /* ignore */ } return r; };
    w.__pro = true; window.toggleLang = w;
  }

  function safe(fn) { try { fn(); } catch (e) { if (window.console) console.error('[pro.js]', fn.name, e); } }
  function init() {
    [buildServices, buildCalcs, buildSimSlider, buildSim, buildCodeFilters, buildDownloads, buildForm, buildFab,
      buildResumeActions, bindSkillProof, hookCaseStudy, hookLang, applyStatus, buildDigitalCard].forEach(safe);
    // بعضی اسکریپت‌های قدیمی بعد از لود دوباره نشان رو ست می‌کنن؛ یک بار دیگه اعمال می‌کنیم
    setTimeout(() => { safe(applyStatus); safe(decorateSkills); }, 800);
  }
  if (document.readyState === 'complete') init(); else window.addEventListener('load', init);
})();
