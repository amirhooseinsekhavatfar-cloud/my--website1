# قابلیت‌های جدید و محل ویرایش هرکدوم

| قابلیت | کجا ویرایش کنم؟ |
|---|---|
| خدمات + گزینه‌های فرم درخواست | `js/data/services.js` |
| وضعیت (Open to work …) | `js/data/site-config.js` ← `status` |
| کارت دیجیتال (نام، عنوان، وضعیت، لینک‌ها) | `site-config.js` ← `nameEn/Fa`, `lnameEn/Fa`, `jobTitleEn/Fa`, `status`, `telegramUser`, `whatsapp`, `siteUrl`؛ برچسب‌ها از ۳ مهارت برتر `skills.js` |
| عنوان شغلی (کارت دیجیتال، رزومه) | `site-config.js` ← `jobTitleEn/Fa` |
| ارسال واقعی تلگرام و ایمیل از فرم‌ها | `site-config.js` ← `telegramWorker`, `web3formsKey` (راهنما: `docs/SENDING-SETUP.md`) |
| تلگرام / واتساپ / آدرس سایت | `site-config.js` ← `telegramUser`, `whatsapp`, `siteUrl` |
| اسلایدر شبیه‌سازها (افزودن پروژه‌ی جدید) | فایل HTML در `simulations/` + یک بلوک در `js/data/simulators.js` (راهنما: `simulations/README.md`) |
| کتابخانه کد (فیلتر و جستجو خودکاره) | `js/data/codes.js` |
| منابع دانلودی + شمارنده | `js/data/pdfs.js` و `site-config.js` ← `downloadCounter` |
| Case Study ساختاریافته | `js/data/projects.js` ← `problemEn/Fa`, `solutionEn/Fa`, `stackEn/Fa`, `resultEn/Fa` |
| اتصال مهارت به پروژه | خودکار از روی `tags` پروژه؛ یا `proof: ['عنوان پروژه']` در `skills.js` |
| رزومه‌ی PDF فارسی / انگلیسی / یک‌صفحه‌ای | از `journey-resume.js`، `projects.js`، `skills.js` و `experience.js` ساخته می‌شه |
| ماشین‌حساب‌ها و شبیه‌ساز مخزن | `js/pro.js` (آرایه‌ی `CALCS` و بخش `SIM`) |

## نکته‌ها
- نمونه‌ها (عنوانی که با Sample شروع بشه) در رزومه و «ثابت‌شده در» نادیده گرفته می‌شن.
- QR کارت دیجیتال محلیه (`js/vendor/qrcode.js`) و آفلاین کار می‌کنه. QR به `siteUrl` اشاره می‌کنه؛ بعد از انتشار حتماً `siteUrl` رو پر کن، وگرنه آدرس همین صفحه (مثلاً localhost) داخل QR می‌ره.
- شمارنده‌ی دانلود بدون `downloadCounter` فقط رویداد رو به Plausible/GA می‌فرسته (اگه نصب باشن).
- بعد از هر تغییر: `node build/build.js` و فقط پوشه‌ی `dist/` رو منتشر کن.
