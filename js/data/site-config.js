// ══════════════════════════════════════════════
//  DATA: اطلاعات کلی سایت (Site Config)
//  نام، ایمیل، شبکه‌های اجتماعی، آمار هیرو و رنگ‌های پیش‌فرض
//  Edit ONLY this file to change name, contact info, socials,
//  hero stats, and default theme colors.
// ══════════════════════════════════════════════
window.SiteData = window.SiteData || {};
window.SiteData.config = {
  // نام و عنوان (Name & title)
  nameEn: 'Amir Hosin',
  lnameEn: 'Sekhavatfar',
  nameFa: 'امیرحسین',
  lnameFa: 'سخاوتفر',
  title: 'Amir Hosin Sekhavatfar',
  location: 'Iran',

  // اطلاعات تماس (Contact)
  email: 'amirhooseinsekhavatfar@gmail.com',
  // لینک دانلود فایل رزومه (PDF). می‌تونه لینک یه فایل روی خود سایت باشه
  // (مثلاً 'assets/resume.pdf') یا لینک مستقیم به یه فایل PDF روی اینترنت.
  // تا وقتی خالیه، دکمه‌ی «دانلود رزومه» غیرفعال نشون داده می‌شه.
  cv: '',

  // لینک صفحه‌ی رزرو جلسه‌ی Calendly (یا هر سرویس مشابه با embed مستقیم).
  // مثال: 'https://calendly.com/your-username/30min'
  // تا وقتی خالیه، همون تقویم نمایشی فعلی (بدون بک‌اند واقعی) نشون داده می‌شه.
  calendlyUrl: '',

  // شبکه‌های اجتماعی (Social links)
  github: 'https://github.com/amirhooseinsekhavatfar-cloud',
  linkedin: 'https://linkedin.com/in/amirhosins',
  telegram: 'https://t.me/AmirHosinSekhavatfar',
  instagram: '',
  youtube: '',

  // آمار بخش هیرو (Hero stats)
  statProjects: 15,
  statYears: 3,
  statTech: 8,
  statCerts: 5,

  // نشان زیر نام (Hero badge) — مقدار خالی یعنی از پیش‌فرض HTML استفاده شود
  badge: '',

  // رنگ‌های پیش‌فرض تم (Default theme colors — must match css/main.css)
  colors: {
    accent: '#FF7A1A',
    bg: '#0A0E14',
    bg2: '#131A22',
    tx: '#FFFFFF'
  },

  // پس‌زمینه‌ی کل سایت (هم نسخه‌ی موبایل، هم دسکتاپ — با همین یه تنظیم هر دو عوض می‌شن)
  background: {
    // نوع پس‌زمینه — یکی از این چهار مقدار:
    //   'grid'     → گرید ظریف (پیش‌فرض فعلی)
    //   'solid'    → رنگ تخت و ساده (بدون هیچ الگو)
    //   'gradient' → گرادیان ملایم بین دو رنگ
    //   'image'    → یه عکس دلخواه به‌عنوان پس‌زمینه
    type: 'grid',

    // برای type: 'grid' — اندازه و شفافیت خطوط گرید
    gridSize: 46,              // فاصله‌ی خطوط گرید (px)
    gridOpacityDark: 0.045,    // شفافیت خطوط در حالت تیره (0 تا 1)
    gridOpacityLight: 0.05,    // شفافیت خطوط در حالت روشن (0 تا 1)

    // برای type: 'gradient' — رنگ شروع و پایان + زاویه (درجه)
    gradientFrom: '#0A0E14',
    gradientTo: '#131A22',
    gradientAngle: 135,

    // برای type: 'image' — مسیر عکس (نسبت به ریشه‌ی سایت)
    imageUrl: 'assets/img/background/bg.jpg',
    // تیرگیِ لایه‌ی روی عکس، برای خوانا موندن متن‌ها (0 = بدون تیرگی، 1 = کاملاً مشکی)
    imageOverlay: 0.6,
    // روی دسکتاپ عکس می‌تونه هنگام اسکرول ثابت بمونه (fixed)؛ روی موبایل به‌خاطر
    // مشکل رندر بعضی مرورگرها همیشه به‌صورت عادی اسکرول می‌شه، صرف‌نظر از این مقدار
    fixedOnDesktop: true,

    // اگه true باشه، صرف‌نظر از type بالا، روی موبایل (عرض کمتر از ۷۶۸px)
    // همیشه پس‌زمینه‌ی رنگ تخت (solid) نشون داده می‌شه — برای کارایی و
    // باتری بهتر روی گوشی. اگه false باشه، همون type بالا روی موبایل هم
    // دقیقاً مثل دسکتاپ اعمال می‌شه.
    simplifyOnMobile: false
  },

  // ── عنوان شغلی (برای کارت دیجیتال و رزومه) ──
  jobTitleEn: 'Industrial Automation & IoT Engineer',
  jobTitleFa: 'مهندس اتوماسیون صنعتی و IoT',

  // ── وضعیت فعلی — نشان داخل هیرو، بخش تماس و کارت دیجیتال ──
  // یکی از: 'open' (آماده همکاری) | 'freelance' (پروژه‌ی فریلنس) |
  //         'studying' (درگیر تحصیل) | 'busy' (فعلاً ظرفیت ندارم)
  // اگه بالاتر «badge» رو پر کرده باشی، همون برای هیرو اولویت داره.
  status: 'open',

  // ── تماس سریع ──
  telegramUser: 'AmirHosinSekhavatfar',   // بدون @ — برای دکمه‌های باز کردن تلگرام
  whatsapp: '',                            // مثال: '989121234567' (بدون + و بدون صفر اول)
  siteUrl: '',                             // آدرس نهایی سایت برای QR کارت دیجیتال؛ خالی = آدرس همین صفحه

  // ── ارسال واقعی پیام از فرم‌ها (راهنما: docs/SENDING-SETUP.md) ──
  // هرکدوم رو پر کنی فعال می‌شه؛ اگه چندتا پر باشه، پیام به همه‌شون می‌ره.
  //
  // تلگرام (پیشنهادی): آدرس Cloudflare Worker که توی serverless/telegram-worker.js هست.
  // این راه توکن ربات رو مخفی نگه می‌داره و برای بازدیدکننده‌ی ایرانی هم کار می‌کنه.
  telegramWorker: '',                      // مثال: 'https://contact.YOUR-NAME.workers.dev'
  //
  // تلگرام سریع بدون Worker (⚠️ توکن داخل کد سایت عمومی می‌شه؛ هرکس می‌تونه با ربات تو
  // پیام بفرسته. برای بازدیدکننده‌ی داخل ایران بدون VPN هم کار نمی‌کنه):
  telegramBotToken: '',
  telegramChatId: '',
  //
  // ایمیل: کلید رایگان Web3Forms (از web3forms.com با وارد کردن ایمیلت می‌گیری؛ کلید طبق
  // طراحی سرویس عمومیه و مشکلی نداره) یا آدرس Formspree. فقط یکی کافیه.
  web3formsKey: '',
  formEndpoint: '',                        // مثال Formspree: 'https://formspree.io/f/xxxxxxxx'

  // ── نوتیفیکیشن (Web Push) — راهنما: docs/NOTIFICATIONS.md ──
  // خالی باشه → فقط نوتیفیکیشن محلی (وقتی سایت بازه و notify.json تغییر کرده).
  // پر باشه → پوش واقعی حتی وقتی سایت/اپ بسته‌ست.
  pushWorker: '',                          // مثال: 'https://push.YOUR-NAME.workers.dev'
  vapidPublicKey: '',                      // خروجی: node tools/generate-vapid.js

  // ── شمارنده‌ی دانلود سراسری (اختیاری) ──
  // سایت بک‌اند نداره؛ برای شمارش واقعی از یک سرویس شمارنده استفاده کن و
  // آدرس‌ها رو با {key} بنویس. نمونه برای counterapi.dev (نام‌فضا رو خودت بساز):
  //   up:  'https://api.counterapi.dev/v1/YOUR-NAMESPACE/{key}/up'
  //   get: 'https://api.counterapi.dev/v1/YOUR-NAMESPACE/{key}'
  // خالی باشه → شمارنده نشون داده نمی‌شه.
  downloadCounter: { up: '', get: '' },

  // موقعیت روی نقشه (بخش «Location» صفحه اصلی).
  // فقط lat/lng رو عوض کنید تا هم پین روی نقشه (کارت کوچک و نمای
  // بزرگ‌شده) و هم متن مختصات، خودکار به موقعیت جدید منتقل بشه.
  mapLocation: {
    city: 'Yasuj',
    cityFa: 'یاسوج',
    country: 'Iran',
    countryFa: 'ایران',
    lat: 30.6682,               // عرض جغرافیایی — مثبت = شمالی (N)، منفی = جنوبی (S)
    lng: 51.5880,                // طول جغرافیایی — مثبت = شرقی (E)، منفی = غربی (W)
    timezone: 'Asia/Tehran',    // IANA timezone, e.g. "Europe/Berlin"
    timezoneLabel: 'GMT+3:30',
    available: true             // نشان «آماده همکاری» رو نشون بده یا نه
  }
};
