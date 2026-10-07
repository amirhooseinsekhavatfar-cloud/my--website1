// ════════════════════════════════════════
//  04-players.js — پخش ویدیوی پروژه‌ها و ابزارهای مهندسی
//  از js/interactions.js (خط 683 تا 831) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
// لینک ویدیو رو به فرمت قابل‌نمایش (embed) تبدیل می‌کنه
function getVideoEmbed(url) {
  if (!url || !url.trim()) return null;
  url = url.trim().replace(/^['"]|['"]$/g, ''); // اگه کوتیشن اضافه دور لینک مونده بود، پاکش کن
  // YouTube watch / youtu.be
  let m = url.match(/(?:youtube\.com\/watch\?.*v=|youtu\.be\/)([^&?\s/#]+)/);
  if (m) return 'https://www.youtube.com/embed/' + m[1] + '?autoplay=1&rel=0&modestbranding=1';
  // YouTube shorts
  m = url.match(/youtube\.com\/shorts\/([^?&\s/#]+)/);
  if (m) return 'https://www.youtube.com/embed/' + m[1] + '?autoplay=1&rel=0';
  // YouTube live
  m = url.match(/youtube\.com\/live\/([^?&\s/#]+)/);
  if (m) return 'https://www.youtube.com/embed/' + m[1] + '?autoplay=1&rel=0';
  // YouTube — already an embed link
  m = url.match(/youtube\.com\/embed\/([^?&\s/#]+)/);
  if (m) return 'https://www.youtube.com/embed/' + m[1] + '?autoplay=1&rel=0&modestbranding=1';
  // Aparat — extract hash from URL like /v/AbCdEf یا /v/AbCdEf/...
  m = url.match(/aparat\.com\/v\/([^/?&#\s]+)/);
  if (m) return 'https://www.aparat.com/video/video/embed/videohash/' + m[1] + '/vt/frame?titleshow=true&autoplay=1';
  // Aparat — لینکی که از قبل embed هست
  m = url.match(/aparat\.com\/video\/video\/embed\/videohash\/([^/?&#\s]+)/);
  if (m) return 'https://www.aparat.com/video/video/embed/videohash/' + m[1] + '/vt/frame?titleshow=true&autoplay=1';
  // Aparat short share — مثل aparat.com/xyzAB12
  m = url.match(/aparat\.com\/([A-Za-z0-9]{4,15})(?:$|[/?#])/);
  if (m) return 'https://www.aparat.com/video/video/embed/videohash/' + m[1] + '/vt/frame?autoplay=1';
  // Direct video file
  if (/\.(mp4|webm|ogg)([?#]|$)/i.test(url)) return url;
  return null;
}

// پخش‌کننده تمام‌صفحه ویدیوی پروژه رو می‌بنده
function closeReel() {
  document.getElementById('fullscreen-overlay').classList.remove('open');
  document.body.style.overflow = '';
  const wrap = document.getElementById('fs-vm-media-wrap');
  if (wrap) wrap.innerHTML = '';
  const vm = document.getElementById('fs-video-modal');
  vm.classList.remove('fs-active');
  setTimeout(() => {
    vm.style.display = 'none';
  }, 350);
}

// اگه بیرون پخش‌کننده کلیک شد، می‌بندش
function closeReelIfOutside(e) {
  if (e.target === document.getElementById('fullscreen-overlay')) closeReel()
}

// یه ویدیوی پروژه رو (از لینک یوتیوب/آپارات/فایل مستقیم mp4) به‌صورت تمام‌صفحه باز می‌کنه
// از همون پخش‌کننده‌ی ویدیوییِ ریلز/ویدیوها استفاده می‌کنه، فقط بدون فیلدهای مخصوص ریل (لایک/بازدید و…)
function openProjectVideo(url, title) {
  const embedUrl = getVideoEmbed(url || '');
  if (!embedUrl) {
    // اگه لینک رو نتونستیم تشخیص بدیم، به‌جای این‌که دکمه هیچ‌کاری نکنه،
    // خودِ لینک رو مستقیم توی تب جدید باز می‌کنیم — همیشه یه اتفاقی می‌افته
    if (url) window.open(url, '_blank', 'noopener');
    return;
  }

  const ov = document.getElementById('fullscreen-overlay');
  const videoModal = document.getElementById('fs-video-modal');

  videoModal.style.display = 'flex';
  videoModal.classList.add('fs-active');

  document.getElementById('fs-vm-title').textContent = title || '';
  document.getElementById('fs-vm-date').textContent = '';
  document.getElementById('fs-vm-views').textContent = '';
  document.getElementById('fs-vm-tags').innerHTML = '';
  document.getElementById('fs-like-count').textContent = '';

  const wrap = document.getElementById('fs-vm-media-wrap');
  wrap.innerHTML = '';
  const isMP4 = /\.(mp4|webm|ogg)/i.test(embedUrl);
  if (isMP4) {
    const v = document.createElement('video');
    v.src = embedUrl;
    v.controls = true;
    v.autoplay = true;
    v.style.cssText = 'width:100%;aspect-ratio:16/9;display:block;background:#000';
    wrap.appendChild(v);
  } else {
    const fr = document.createElement('iframe');
    fr.src = embedUrl;
    fr.frameBorder = '0';
    fr.allow = 'autoplay; fullscreen; picture-in-picture; encrypted-media';
    fr.allowFullscreen = true;
    fr.style.cssText = 'width:100%;aspect-ratio:16/9;display:block;border:none;background:#000';
    wrap.appendChild(fr);
  }

  ov.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// یه فایل HTML بخش «ابزارهای مهندسی» رو به‌صورت تمام‌صفحه باز می‌کنه
function openEngTool(filePath, btnEl) {
  const modal = document.getElementById('tool-fullscreen-modal');
  const iframe = document.getElementById('tool-fs-iframe');
  const titleEl = document.getElementById('tool-fs-title');
  if (!modal || !iframe) return;

  const isFa = document.documentElement.lang === 'fa' || document.body.classList.contains('rtl');
  const card = btnEl ? btnEl.closest('.tool-card') : null;
  const titleNode = card ? card.querySelector('.tool-title') : null;
  titleEl.textContent = titleNode ? titleNode.textContent : (isFa ? 'ابزار مهندسی' : 'Engineering Tool');

  iframe.src = filePath;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

// پنجره‌ی تمام‌صفحه‌ی ابزار مهندسی رو می‌بنده
function closeEngTool() {
  const modal = document.getElementById('tool-fullscreen-modal');
  const iframe = document.getElementById('tool-fs-iframe');
  if (!modal) return;
  modal.classList.remove('open');
  document.body.style.overflow = '';
  // با تأخیر کوچیک، سورس iframe رو خالی می‌کنیم تا اجرای فایل (مثلاً شبیه‌سازی) واقعاً متوقف بشه
  setTimeout(() => { if (iframe) iframe.src = 'about:blank'; }, 300);
}

// لایک ویدیوی پروژه در حالت تمام‌صفحه رو روشن/خاموش می‌کنه
function toggleFsLike() {
  const btn = document.getElementById('fs-vm-like-btn');
  if (!btn) return;
  btn.classList.toggle('active');
  const icon = btn.querySelector('i');
  icon.className = btn.classList.contains('active') ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
}

// ذخیره ویدیوی پروژه در حالت تمام‌صفحه رو روشن/خاموش می‌کنه
function toggleFsSave() {
  const btn = document.getElementById('fs-vm-save-btn');
  if (!btn) return;
  btn.classList.toggle('active');
  const span = btn.querySelector('span');
  if (span) span.textContent = btn.classList.contains('active') ? 'Saved' : 'Save';
}

document.addEventListener('keydown', e => {
  if (document.getElementById('fullscreen-overlay').classList.contains('open')) {
    if (e.key === 'Escape') closeReel();
  }
  const toolModal = document.getElementById('tool-fullscreen-modal');
  if (toolModal && toolModal.classList.contains('open') && e.key === 'Escape') closeEngTool();
});

