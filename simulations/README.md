# پوشه‌ی شبیه‌سازها

هر فایل `.html` داخل این پوشه می‌تونه یک اسلاید در بخش «Live Simulator» بشه.

## اضافه کردن شبیه‌ساز جدید (۲ مرحله)
1. فایل HTML کامل رو اینجا بذار، مثلاً `simulations/conveyor.html`
   (می‌تونی از `_template.html` شروع کنی؛ شبیه‌ساز درگ‌اندراپ PLC که قبلاً ساختی رو هم مستقیم می‌شه گذاشت).
2. در `js/data/simulators.js` یک بلوک اضافه کن:

```js
{
  id: 'conveyor',
  type: 'html',
  file: 'simulations/conveyor.html',
  icon: 'fa-solid fa-gears',
  titleEn: 'Conveyor Control', titleFa: 'کنترل نوار نقاله',
  descEn: 'Start/stop with interlocks.', descFa: 'استارت/استپ با اینترلاک.',
  tags: 'PLC, Interlock',
  height: 640
}
```

## نکته‌ها
- نام فایل بدون فاصله و فارسی باشه؛ حروف کوچک بهتره.
- هر شبیه‌ساز فقط وقتی اسلایدش باز باشه اجرا می‌شه و با رفتن به اسلاید دیگه ریست می‌شه.
- لینک مستقیم به یک شبیه‌ساز: `https://دامنه-تو/#sim-conveyor`
- اگه فایل پیدا نشه، خود اسلاید پیام خطا با مسیر فایل نشون می‌ده.
- فایل‌ها با دستور `node build/build.js` خودکار وارد `dist/` می‌شن.
- اگه فایلت از CDN اسکریپت لود می‌کنه (مثلاً Chart.js)، توی حالت آفلاین (PWA) کار نمی‌کنه.
