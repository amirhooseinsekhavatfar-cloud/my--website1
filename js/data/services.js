// ══════════════════════════════════════════════
//  DATA: خدمات (Services) + گزینه‌های فرم «درخواست پروژه»
//  فقط همین فایل رو برای تغییر بخش «چه کمکی می‌تونم بکنم» ویرایش کن.
//
//  key      - شناسه‌ی یکتا (انگلیسی، بدون فاصله) — برای انتخاب خودکار در فرم
//  icon     - کلاس آیکون فونت‌اوسام
//  titleEn/Fa, descEn/Fa - عنوان و توضیح کوتاه
//  itemsEn/itemsFa - فهرست «چی تحویل می‌گیری» (هر دو آرایه هم‌تعداد باشن)
//
//  متن‌های زیر نمونه‌ی اولیه‌ان — با خدمات و تحویلی‌های واقعی خودت عوضشون کن.
// ══════════════════════════════════════════════
window.SiteData = window.SiteData || {};
window.SiteData.services = [
  {
    key: 'plc',
    icon: 'fa-solid fa-microchip',
    titleEn: 'PLC Programming',
    titleFa: 'برنامه‌نویسی PLC',
    descEn: 'Control logic for machines and processes, written to be readable and maintainable.',
    descFa: 'منطق کنترلی ماشین‌ها و فرآیندها، با کدی خوانا و قابل نگهداری.',
    itemsEn: ['Ladder / ST / SCL program', 'I/O list and short documentation', 'Test and commissioning support'],
    itemsFa: ['برنامه‌ی Ladder / ST / SCL', 'لیست I/O و مستندات کوتاه', 'پشتیبانی در تست و راه‌اندازی']
  },
  {
    key: 'hmi',
    icon: 'fa-solid fa-display',
    titleEn: 'HMI & SCADA Screens',
    titleFa: 'صفحات HMI و SCADA',
    descEn: 'Operator screens that show the process clearly and make alarms easy to act on.',
    descFa: 'صفحات اپراتوری که وضعیت فرآیند رو شفاف نشون می‌دن و آلارم‌ها رو قابل‌پیگیری می‌کنن.',
    itemsEn: ['Screen design and tag mapping', 'Alarm and trend setup', 'Modbus / OPC-UA link to the PLC'],
    itemsFa: ['طراحی صفحه و نگاشت تگ‌ها', 'تنظیم آلارم و ترند', 'ارتباط Modbus / OPC-UA با PLC']
  },
  {
    key: 'iot',
    icon: 'fa-solid fa-cloud-arrow-up',
    titleEn: 'IoT Monitoring Dashboard',
    titleFa: 'داشبورد پایش IoT',
    descEn: 'Sensor data collected from the field and shown live on a dashboard you can open from a phone.',
    descFa: 'داده‌ی سنسورها از میدان جمع می‌شه و به‌صورت زنده روی داشبوردی که با گوشی هم باز می‌شه نشون داده می‌شه.',
    itemsEn: ['MQTT / Modbus data collection', 'Node-RED dashboard', 'Data logging and CSV export'],
    itemsFa: ['جمع‌آوری داده با MQTT / Modbus', 'داشبورد Node-RED', 'ثبت داده و خروجی CSV']
  },
  {
    key: 'esp32',
    icon: 'fa-solid fa-memory',
    titleEn: 'ESP32 Prototyping',
    titleFa: 'نمونه‌سازی با ESP32',
    descEn: 'A working prototype of your sensor or control idea, ready to test in the real environment.',
    descFa: 'یک نمونه‌ی کارکرده از ایده‌ی سنسوری یا کنترلی‌ت، آماده‌ی تست در محیط واقعی.',
    itemsEn: ['Firmware and wiring diagram', 'Wi-Fi / MQTT connectivity', 'Handover notes for your team'],
    itemsFa: ['فریمور و نقشه‌ی سیم‌کشی', 'اتصال Wi-Fi / MQTT', 'یادداشت تحویل برای تیم شما']
  }
];

// گزینه‌های «حجم کار» و «زمان‌بندی» در فرم درخواست (بدون عدد پولی — خودت بعداً توافق می‌کنی)
window.SiteData.requestOptions = {
  sizes: [
    { en: 'Not sure yet',               fa: 'هنوز مشخص نیست' },
    { en: 'Small — a few days',         fa: 'کوچک — چند روز' },
    { en: 'Medium — 1 to 3 weeks',      fa: 'متوسط — ۱ تا ۳ هفته' },
    { en: 'Large — a month or more',    fa: 'بزرگ — یک ماه یا بیشتر' }
  ],
  deadlines: [
    { en: 'Flexible',                   fa: 'انعطاف‌پذیر' },
    { en: 'Within 2 weeks',             fa: 'ظرف ۲ هفته' },
    { en: 'Within a month',             fa: 'ظرف یک ماه' },
    { en: 'Urgent',                     fa: 'فوری' }
  ]
};
