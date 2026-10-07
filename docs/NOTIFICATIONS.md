# نصب اپ (Add to Home Screen) و نوتیفیکیشن

## نصب روی هوم‌اسکرین
- دکمه‌ی «نصب اپ» داخل منوی شناور پایین-چپ (همون دکمه‌ی تماس) هست.
- اندروید/کروم/دسکتاپ: با یک کلیک نصب می‌شه.
- iPhone: سافاری نصب خودکار نداره؛ دکمه، راهنمای Share → Add to Home Screen رو نشون می‌ده.
- شرط‌ها: سایت باید روی **HTTPS** باشه (localhost هم برای تست اوکیه) و از پوشه‌ی `dist/` منتشر بشه.
- آیکون‌ها: `assets/icons/` (PNG). می‌تونی با لوگوی خودت جایگزینشون کنی (همون اسم‌ها و سایزها).

## نوتیفیکیشن — دو حالت

### حالت ۱: محلی (بدون سرور، پیش‌فرض)
کاربر نوتیفیکیشن رو فعال می‌کنه. هر بار سایت رو باز کنه، اگه `id` داخل `notify.json` عوض شده باشه، نوتیفیکیشن نشون داده می‌شه.
برای پیام جدید: `notify.json` رو ویرایش کن (`id` رو عوض کن)، `node build/build.js` و منتشر کن.
⚠️ وقتی سایت/اپ بسته‌ست نوتیفیکیشن نمی‌رسه.

### حالت ۲: پوش واقعی (حتی وقتی اپ بسته‌ست)
۱. `node tools/generate-vapid.js` → کلید عمومی و خصوصی می‌ده.
۲. در Cloudflare یک Worker بساز، محتوای `serverless/push-worker.js` رو بذار و تنظیم کن:
   - KV Namespace با نام binding: `SUBS`
   - `VAPID_PUBLIC_KEY` (Text)، `VAPID_PRIVATE_JWK` (Secret)، `VAPID_SUBJECT` (مثلاً `mailto:you@mail.com`)
   - `ADMIN_TOKEN` (Secret، یک رمز طولانی)، `ALLOWED_ORIGINS` (آدرس سایتت)
۳. در `js/data/site-config.js`: `pushWorker` (آدرس Worker) و `vapidPublicKey` رو پر کن.
۴. ارسال پوش به همه‌ی مشترک‌ها (بعد از ویرایش و انتشار `notify.json`):
```
curl -X POST https://push.YOUR-NAME.workers.dev/send -H "Authorization: Bearer ADMIN_TOKEN"
```
متن نوتیفیکیشن از `notify.json` خونده می‌شه.

## نکته‌های مهم
- iOS: نوتیفیکیشن فقط برای اپ نصب‌شده روی هوم‌اسکرین و iOS ‎16.4+ کار می‌کنه.
- پوش در اندروید از سرویس گوگل (FCM) عبور می‌کنه؛ روی بعضی شبکه‌ها/گوشی‌ها در ایران بدون VPN یا بدون Google Play Services ممکنه نرسه. حالت محلی این مشکل رو نداره.
- بعد از تغییر فایل‌ها، `CACHE_VERSION` در `sw.js` رو زیاد کن (در dist خودکار انجام می‌شه).

## انتشار روی Vercel
۱. پروژه رو در GitHub آپلود کن (پوشه‌ی `dist/` رو آپلود نکن؛ در `.gitignore` هست).
۲. vercel.com → Add New → Project → ریپو رو انتخاب کن. تنظیمات از `vercel.json` خونده می‌شه (Build: `node build/build.js`، Output: `dist`).
۳. Deploy بزن. دامنه‌ی `*.vercel.app` خودکار داخل canonical، sitemap و og:image می‌شینه. برای دامنه‌ی شخصی، در Settings → Environment Variables مقدار `SITE_URL` (مثلاً `https://amir.com`) رو بذار و دوباره Deploy کن.
۴. بدون GitHub: `npm i -g vercel` و بعد در پوشه‌ی پروژه `vercel --prod`.
