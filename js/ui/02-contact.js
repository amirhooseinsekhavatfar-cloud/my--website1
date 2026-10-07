// ════════════════════════════════════════
//  02-contact.js — فرم تماس، رزرو وقت، کونامی
//  از js/interactions.js (خط 318 تا 467) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
// ── Konami Code Easter Egg 🎮 ──
// تخم‌مرغ شانسی کد کونامی 🎮
(function konamiEgg() {
  const seq = ['ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight', 'b', 'a'];
  let pos = 0;
  window.addEventListener('keydown', e => {
    pos = (e.key === seq[pos]) ? pos + 1 : (e.key === seq[0] ? 1 : 0);
    if (pos === seq.length) {
      pos = 0;
      if (typeof startParticleExplosion === 'function') startParticleExplosion();
      document.body.style.transition = 'filter .6s';
      document.body.style.filter = 'hue-rotate(180deg) saturate(1.6)';
      setTimeout(() => {
        document.body.style.filter = '';
      }, 3000);
      const t = document.createElement('div');
      t.className = 'theme-saved-toast';
      t.style.background = 'linear-gradient(135deg,#B34700,#FF7A1A)';
      t.innerHTML = '🎮 حالت مخفی مهندس فعال شد!';
      document.body.appendChild(t);
      requestAnimationFrame(() => t.classList.add('show'));
      setTimeout(() => {
        t.classList.remove('show');
        setTimeout(() => t.remove(), 300)
      }, 2600);
    }
  });
})();

// فرم تماس رو ارسال می‌کنه
function submitForm(e) {
  e.preventDefault();
  const form = e.target;
  const name = form.querySelector('input[type=text]')?.value || '';
  const email = form.querySelector('input[type=email]')?.value || '';
  const subject = form.querySelectorAll('input[type=text]')[1]?.value || 'Portfolio Contact';
  const msg = form.querySelector('textarea')?.value || '';
  const mailtoLink = 'mailto:' + window.SiteData.config.email +
    '?subject=' + encodeURIComponent('[Portfolio] ' + subject) +
    '&body=' + encodeURIComponent('Name: ' + name + '\nEmail: ' + email + '\n\n' + msg);
  window.location.href = mailtoLink;
  const btn = form.querySelector('button[type=submit]');
  const sp = btn.querySelector('span');
  btn.disabled = true;
  btn.style.opacity = '.7';
  sp.textContent = lang === 'en' ? 'Opening email…' : 'در حال باز کردن ایمیل…';
  const succ = form.querySelector('.form-success');
  if (succ) {
    succ.style.display = 'block'
  }
  setTimeout(() => {
    btn.disabled = false;
    btn.style.opacity = '';
    sp.textContent = lang === 'en' ? 'Send Message' : 'ارسال پیام';
    form.reset();
    if (succ) succ.style.display = 'none'
  }, 4000)
}

(function buildCal() {
  const grid = document.getElementById('cal-grid');
  if (!grid) return; // بخش رزرو از صفحه برداشته شده
  const days = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  let offset = 3;
  for (let i = 0; i < offset; i++) {
    const d = document.createElement('div');
    d.className = 'cal-day disabled';
    grid.appendChild(d)
  }
  for (let d = 1; d <= 31; d++) {
    const el = document.createElement('div');
    el.className = 'cal-day' + (d < new Date().getDate() ? ' disabled' : '');
    el.textContent = d;
    if (d >= new Date().getDate()) el.onclick = () => {
      document.querySelectorAll('.cal-day.active').forEach(x => x.classList.remove('active'));
      el.classList.add('active')
    };
    grid.appendChild(el)
  }
})();

// یک بازه زمانی برای رزرو وقت انتخاب می‌کنه
function selectTime(btn) {
  document.querySelectorAll('.ts.active').forEach(b => b.classList.remove('active'));
  btn.classList.add('active')
}

// درخواست رزرو وقت رو ثبت می‌کنه
function bookMeeting(btn) {
  const orig = btn.innerHTML;
  btn.disabled = true;
  btn.style.opacity = '.7';
  const sp = btn.querySelector('span');
  sp.textContent = lang === 'en' ? 'Booking…' : 'در حال رزرو…';
  setTimeout(() => {
    sp.textContent = lang === 'en' ? 'Booked! ✓' : 'رزرو شد! ✓';
    btn.style.background = 'linear-gradient(135deg,#16a34a,#22c55e)';
    setTimeout(() => {
      btn.disabled = false;
      btn.style.opacity = '';
      btn.style.background = '';
      btn.innerHTML = orig
    }, 3500)
  }, 1800)
}


