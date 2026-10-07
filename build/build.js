#!/usr/bin/env node
/* ══════════════════════════════════════════════════════════
   BUILD — ساخت نسخه‌ی نهایی سایت در پوشه‌ی dist/

   چی‌کار می‌کنه؟
     1) همه‌ی فایل‌های CSS رو (به همون ترتیب manifest) یکی می‌کنه
     2) همه‌ی فایل‌های JS رو در سه باندل منطقی یکی می‌کنه
     3) index.html رو طوری بازنویسی می‌کنه که باندل‌ها رو لود کنه
     4) sw.js رو با لیست فایل‌های dist دوباره می‌سازه
     5) assets و فایل‌های ثابت رو کپی می‌کنه

   نتیجه: تعداد درخواست‌های شبکه از ~۶۰ تا به ~۵ تا کم می‌شه.

   اجرا:  node build/build.js
   هیچ پکیجی لازم نیست (بدون npm install).
   ══════════════════════════════════════════════════════════ */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');
const manifest = JSON.parse(fs.readFileSync(path.join(__dirname, 'manifest.json'), 'utf8'));

const read = (p) => fs.readFileSync(path.join(ROOT, p), 'utf8');
const write = (rel, text) => {
  const p = path.join(DIST, rel);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, text);
};
const banner = (f) => `\n/* ────── ${f} ────── */\n`;

// پاک‌سازی پوشه‌ی خروجی
fs.rmSync(DIST, { recursive: true, force: true });
fs.mkdirSync(DIST, { recursive: true });

// ── 1) CSS ──────────────────────────────────────────────
const cssBundle = manifest.css.map((f) => banner(f) + read(f)).join('\n');
write('css/bundle.css', cssBundle);

// ── 2) JS ───────────────────────────────────────────────
// ترتیب اجرا دقیقاً مثل index.html نگه داشته می‌شه
const bundles = {
  'js/data.bundle.js': manifest.data,
  'js/ui.bundle.js': [...manifest.ui, 'js/shatter-glass.js'],
  'js/app.bundle.js': [...manifest.chatbot, ...manifest.app, 'js/features.js'],
};
for (const [out, files] of Object.entries(bundles)) {
  write(out, files.map((f) => banner(f) + read(f)).join('\n;\n'));
}

// ── 3) index.html ───────────────────────────────────────
let html = read('index.html');

// همه‌ی <link> استایل‌ها → یک باندل
const cssTags = manifest.css.map((f) => `<link rel="stylesheet" href="${f}">`);
html = html.replace(cssTags[0], '<link rel="stylesheet" href="css/bundle.css">');
cssTags.slice(1).forEach((t) => { html = html.replace(t + '\n', ''); html = html.replace(t, ''); });

// اسکریپت‌ها → سه باندل
const swap = (files, replacement) => {
  const tags = files.map((f) => `<script src="${f}" defer></script>`);
  html = html.replace(tags[0], replacement);
  tags.slice(1).forEach((t) => { html = html.replace(t + '\n', ''); html = html.replace(t, ''); });
};
swap(manifest.data, '<script src="js/data.bundle.js" defer></script>');
swap([...manifest.ui, 'js/shatter-glass.js'], '<script src="js/ui.bundle.js" defer></script>');
swap([...manifest.chatbot, ...manifest.app, 'js/features.js'], '<script src="js/app.bundle.js" defer></script>');

// خط‌های خالیِ به‌جا‌مانده
html = html.replace(/\n{3,}/g, '\n\n');
write('index.html', html);

// ── 4) sw.js با لیست فایل‌های dist ─────────────────────
const distAssets = ['./', './index.html', './offline.html', './manifest.webmanifest', './css/bundle.css', ...Object.keys(bundles).map((f) => './' + f),
  ...fs.readdirSync(path.join(ROOT, 'assets/icons')).map((f) => './assets/icons/' + f)];
let sw = read('sw.js')
  .replace(/const CORE_ASSETS = \[[\s\S]*?\];/, 'const CORE_ASSETS = [\n' + distAssets.map((a) => `  '${a}'`).join(',\n') + '\n];')
  .replace(/const CACHE_VERSION = '.*?';/, `const CACHE_VERSION = 'dist-${Date.now()}';`);
write('sw.js', sw);

// ── 5) فایل‌های ثابت ────────────────────────────────────
for (const rel of ['assets', 'simulations', 'manifest.webmanifest', 'offline.html', 'notify.json', 'robots.txt', 'sitemap.xml', 'rss.xml']) {
  const src = path.join(ROOT, rel);
  if (!fs.existsSync(src)) continue;
  fs.cpSync(src, path.join(DIST, rel), { recursive: true });
}

// ── دامنه: node build/build.js https://example.com ──────
// جایگزینی your-domain.example در خروجی (og:image هم آدرس مطلق می‌گیره)
const SITE = (process.argv[2] || process.env.SITE_URL ||
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? 'https://' + process.env.VERCEL_PROJECT_PRODUCTION_URL : '')).replace(/\/+$/, '');
if (SITE) {
  const host = SITE.replace(/^https?:\/\//, '');
  for (const f of ['index.html', 'sitemap.xml', 'rss.xml', 'robots.txt']) {
    const p = path.join(DIST, f);
    if (!fs.existsSync(p)) continue;
    let t = fs.readFileSync(p, 'utf8').replace(/https?:\/\/your-domain\.example/g, SITE).replace(/your-domain\.example/g, host);
    if (f === 'index.html') t = t.replace(/(og|twitter):image(" content=")assets\//g, '$1:image$2' + SITE + '/assets/');
    fs.writeFileSync(p, t);
  }
  console.log('   دامنه:', SITE);
} else console.log('   ⚠️ دامنه داده نشده: node build/build.js https://your-site.com');

const kb = (s) => (Buffer.byteLength(s) / 1024).toFixed(1) + ' KB';
console.log('✅ build → dist/');
console.log('   css/bundle.css      ', kb(cssBundle), `(${manifest.css.length} فایل)`);
for (const [out, files] of Object.entries(bundles)) {
  console.log('   ' + out.padEnd(20), kb(read('dist/' + out).toString()), `(${files.length} فایل)`);
}
console.log('\n   برای تست محلی:  cd dist && python3 -m http.server 8080');
