// ══════════════════════════════════════════════
//  DATA: کتابخانه کد (Code Library)
//  فقط همین فایل رو برای تغییر «کتابخانه کد» ویرایش کن.
//
//  lang   - نام زبان (برای فیلتر بالای بخش هم استفاده می‌شه): 'SCL', 'ST', 'PYTHON', 'C++ / ESP32', ...
//  code   - خود کد. برای رنگ‌آمیزی از این span‌ها استفاده کن:
//           cm = کامنت | kw = کلمه‌ی کلیدی | fn = تابع | str = رشته | num = عدد
//           کاراکترهای < و > رو به صورت &lt; و &gt; بنویس.
//  titleEn/Fa, descEn/Fa - عنوان و توضیح کوتاه
//
//  برای اضافه کردن کد بعدی، یه بلوک {...} دیگه با کاما زیرش بذار.
//  این چهار نمونه، قطعه‌های عمومی و آماده‌ی استفاده‌ان.
// ══════════════════════════════════════════════
window.SiteData = window.SiteData || {};
window.SiteData.codes = [
  {
    lang: 'SCL',
    code: `<span class="cm">// Scale a 4–20 mA analog input (module set to 4..20 mA)</span>
<span class="cm">// raw: 0 .. 27648  →  lo .. hi</span>
<span class="kw">FUNCTION</span> <span class="str">"Scale_4_20"</span> : <span class="kw">Real</span>
<span class="kw">VAR_INPUT</span>
  raw : <span class="kw">Int</span>;
  lo  : <span class="kw">Real</span>;
  hi  : <span class="kw">Real</span>;
<span class="kw">END_VAR</span>
<span class="kw">BEGIN</span>
  #Scale_4_20 := #lo + (<span class="fn">INT_TO_REAL</span>(#raw) / <span class="num">27648.0</span>) * (#hi - #lo);
<span class="kw">END_FUNCTION</span>`,
    titleEn: '4–20 mA Scaling (Siemens)',
    titleFa: 'مقیاس‌دهی ۴–۲۰ mA (زیمنس)',
    descEn: 'Turn a raw analog value into an engineering value.',
    descFa: 'تبدیل مقدار خام ورودی آنالوگ به مقدار مهندسی.'
  },
  {
    lang: 'ST',
    code: `<span class="cm">// Motor start/stop with seal-in (IEC 61131-3 ST)</span>
<span class="cm">// Stop_NC and Overload_NC are wired normally-closed:</span>
<span class="cm">// TRUE = healthy, FALSE = pressed / tripped.</span>
Motor := (Start <span class="kw">OR</span> Motor) <span class="kw">AND</span> Stop_NC <span class="kw">AND</span> Overload_NC;`,
    titleEn: 'Motor Start / Stop Seal-in',
    titleFa: 'استارت / استپ موتور با خودنگهدار',
    descEn: 'The classic latching circuit with a fail-safe stop and overload input.',
    descFa: 'مدار خودنگهدار کلاسیک با استپ و اورلود فیل‌سیف.'
  },
  {
    lang: 'PYTHON',
    code: `<span class="cm"># Read Modbus TCP holding registers (pymodbus 3.x)</span>
<span class="cm"># Note: the unit-id keyword is "slave" in 3.x; newer releases call it "device_id".</span>
<span class="kw">from</span> pymodbus.client <span class="kw">import</span> ModbusTcpClient

<span class="kw">def</span> <span class="fn">read_regs</span>(host, address, count, slave=<span class="num">1</span>):
    client = <span class="fn">ModbusTcpClient</span>(host, port=<span class="num">502</span>)
    <span class="kw">try</span>:
        client.<span class="fn">connect</span>()
        rr = client.<span class="fn">read_holding_registers</span>(address, count=count, slave=slave)
        <span class="kw">if</span> rr.<span class="fn">isError</span>():
            <span class="kw">raise</span> <span class="fn">RuntimeError</span>(rr)
        <span class="kw">return</span> rr.registers
    <span class="kw">finally</span>:
        client.<span class="fn">close</span>()

<span class="fn">print</span>(<span class="fn">read_regs</span>(<span class="str">"192.168.1.10"</span>, <span class="num">0</span>, <span class="num">10</span>))`,
    titleEn: 'Modbus TCP Reader',
    titleFa: 'خواننده‌ی Modbus TCP',
    descEn: 'Read holding registers from a PLC or meter.',
    descFa: 'خواندن رجیسترهای Holding از PLC یا کنتور.'
  },
  {
    lang: 'C++ / ESP32',
    code: `<span class="cm">// ESP32: publish a reading over MQTT, reconnecting when needed</span>
<span class="kw">#include</span> <span class="str">&lt;WiFi.h&gt;</span>
<span class="kw">#include</span> <span class="str">&lt;PubSubClient.h&gt;</span>

WiFiClient net;
PubSubClient mqtt(net);

<span class="kw">void</span> <span class="fn">ensureMqtt</span>() {
  <span class="kw">while</span> (!mqtt.<span class="fn">connected</span>()) {
    <span class="kw">if</span> (!mqtt.<span class="fn">connect</span>(<span class="str">"esp32-node-1"</span>)) <span class="fn">delay</span>(<span class="num">2000</span>);
  }
}

<span class="kw">void</span> <span class="fn">publishTemp</span>(<span class="kw">float</span> t) {
  <span class="fn">ensureMqtt</span>();
  <span class="kw">char</span> msg[<span class="num">48</span>];
  <span class="fn">snprintf</span>(msg, <span class="kw">sizeof</span>(msg), <span class="str">"{\\"temp\\":%.2f}"</span>, t);
  mqtt.<span class="fn">publish</span>(<span class="str">"plant/line1/temp"</span>, msg);
}`,
    titleEn: 'ESP32 MQTT Publisher',
    titleFa: 'ارسال MQTT با ESP32',
    descEn: 'Send sensor JSON to a broker with automatic reconnect.',
    descFa: 'ارسال JSON سنسور به بروکر، با اتصال مجدد خودکار.'
  }
];
