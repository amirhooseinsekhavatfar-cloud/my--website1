// ══════════════════════════════════════════════
//  DATA: شبیه‌سازها (اسلایدر «Live Simulator»)
//  فقط همین فایل رو برای اضافه/حذف کردن شبیه‌ساز ویرایش کن.
//
//  برای اضافه کردن یک شبیه‌ساز جدید:
//    ۱) فایل HTML کامل رو بریز داخل پوشه‌ی  simulations/
//       (یک فایل مستقل؛ CSS و JS داخل خودش باشه)
//    ۲) یک بلوک {...} مثل نمونه‌ها زیر همین لیست اضافه کن، با کاما.
//
//  فیلدها:
//    id        - شناسه‌ی یکتا، انگلیسی و بدون فاصله. لینک مستقیم: صفحه#sim-<id>
//    type      - 'html' (فایل داخل simulations/) یا 'builtin' (شبیه‌ساز مخزن داخل سایت)
//    file      - مسیر فایل، مثلاً 'simulations/my-sim.html'   (فقط برای type: 'html')
//    icon      - کلاس آیکون فونت‌اوسام
//    titleEn/Fa, descEn/Fa - عنوان و توضیح کوتاه
//    tags      - برچسب‌ها با ویرگول جدا شده (اختیاری)
//    height    - ارتفاع پنجره‌ی شبیه‌ساز به پیکسل (اختیاری؛ پیش‌فرض ۶۰۰)
//
//  ترتیب اسلایدها همین ترتیب لیست‌ه. «builtin» رو می‌تونی حذف کنی.
//  اگه لیست خالی باشه کل بخش از صفحه مخفی می‌شه.
// ══════════════════════════════════════════════
window.SiteData = window.SiteData || {};
window.SiteData.simulators = [
  {
    id: 'tank',
    type: 'builtin',
    icon: 'fa-solid fa-water',
    titleEn: 'Tank Level Control',
    titleFa: 'کنترل سطح مخزن',
    descEn: 'A PLC scan cycle in your browser. Change the demand, switch to manual, or break the HIGH sensor and watch the independent overflow protection step in.',
    descFa: 'یک سیکل اسکن PLC داخل مرورگر. مصرف رو عوض کن، دستی‌اش کن، یا سنسور HIGH رو خراب کن و ببین حفاظت مستقل سرریز چطور وارد عمل می‌شه.',
    tags: 'PLC, SCL, Level control'
  },
  {
    id: 'traffic',
    type: 'html',
    file: 'simulations/traffic-light.html',
    icon: 'fa-solid fa-traffic-light',
    titleEn: 'Traffic Light Sequence',
    titleFa: 'توالی چراغ راهنما',
    descEn: 'A timer-driven state machine with a pedestrian request button. This is an example file; replace it with your own.',
    descFa: 'یک ماشین حالت با تایمر و دکمه‌ی درخواست عابر. این فقط یک فایل نمونه‌ست؛ با فایل خودت جایگزینش کن.',
    tags: 'State machine, Timers',
    height: 560
  }
];
