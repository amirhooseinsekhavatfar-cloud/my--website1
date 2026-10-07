// ════════════════════════════════════════
//  01-toast.js — پیام‌های کوچک تأیید
//  از js/app.js (خط 1 تا 41) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
// ══════════════════════════════════════════════
//  UI TOAST (small confirmation messages)
// پیام‌های کوچک تأیید روی صفحه
// ══════════════════════════════════════════════
let _toastTimer = null;

// یک پیام کوچک اعلان (Toast) رو نمایش می‌ده
function showToast(msg) {
  const t = document.getElementById('toast-msg');
  if (!t) return;
  if (_toastTimer) {
    clearTimeout(_toastTimer);
    _toastTimer = null;
  }
  t.textContent = msg;
  t.classList.remove('show');
  void t.offsetWidth;
  t.classList.add('show');
  _toastTimer = setTimeout(() => {
    t.classList.remove('show');
    _toastTimer = null;
  }, 2800);
}

// پیام اعلان رو مخفی می‌کنه
function hideToast() {
  const t = document.getElementById('toast-msg');
  if (!t) return;
  if (_toastTimer) {
    clearTimeout(_toastTimer);
    _toastTimer = null;
  }
  t.classList.remove('show');
}

// ══════════════════════════════════════════════
//  PAGE RENDERING — everything below reads straight
//  from the js/data/*.js files (window.SiteData).
//  To change site content, edit those files only.
// رندر صفحه — همه‌چیز مستقیماً از فایل‌های js/data
//  خونده می‌شه. برای تغییر محتوا فقط همون فایل‌ها رو ویرایش کن.
