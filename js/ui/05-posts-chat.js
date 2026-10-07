// ════════════════════════════════════════
//  05-posts-chat.js — پست‌ها، اسلایدر، چت‌بات
//  از js/interactions.js (خط 832 تا 1044) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
/* ═══ POSTS ═══ */
// لایک یک پست رو روشن/خاموش می‌کنه
function togglePostLike(btn) {
  btn.classList.toggle('liked');
  const i = btn.querySelector('i');
  const isLiked = btn.classList.contains('liked');
  i.className = isLiked ? 'fa-solid fa-heart' : 'fa-regular fa-heart';
  const txt = btn.textContent.trim();
  const num = parseInt(txt.replace(/\D/g, ''));
  btn.innerHTML = (isLiked ? '<i class="fa-solid fa-heart"></i> ' : '<i class="fa-regular fa-heart"></i> ') + (isLiked ? num + 1 : num - 1)
}

// ذخیره یک پست رو روشن/خاموش می‌کنه
function togglePostSave(btn) {
  btn.classList.toggle('saved');
  const i = btn.querySelector('i');
  i.className = btn.classList.contains('saved') ? 'fa-solid fa-bookmark' : 'fa-regular fa-bookmark';
  btn.lastChild.textContent = btn.classList.contains('saved') ? ' Saved' : ' Save'
}

// پست‌ها رو بر اساس نوع فیلتر می‌کنه
function filterPosts(type, btn) {
  document.querySelectorAll('.pfl').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  document.querySelectorAll('#posts-feed .post-card, #posts-feed .announcement-banner').forEach(c => {
    c.style.display = (type === 'all' || c.dataset.postType === type) ? '' : 'none'
  })
}

// پست‌های بیشتر رو نمایش می‌ده
function loadMorePosts(btn) {
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> <span>Loading…</span>';
  setTimeout(() => {
    btn.innerHTML = '<i class="fa-solid fa-check"></i> <span>All posts loaded</span>';
    btn.style.opacity = '.5'
  }, 1500)
}

/* ═══ CAROUSEL ═══ */
const carouselState = {};

// اسلایدر رو یک قدم جابه‌جا می‌کنه
function moveCarousel(wrapId, trackId, dotsId, dir) {
  const track = document.getElementById(trackId);
  const dots = document.getElementById(dotsId);
  const n = track.children.length;
  if (!carouselState[trackId]) carouselState[trackId] = 0;
  let idx = carouselState[trackId] + dir;
  if (idx < 0) idx = n - 1;
  if (idx >= n) idx = 0;
  goCarousel(trackId, dotsId, idx)
}

// اسلایدر رو به یک اسلاید مشخص می‌بره
function goCarousel(trackId, dotsId, idx) {
  const track = document.getElementById(trackId);
  const dots = document.getElementById(dotsId);
  carouselState[trackId] = idx;
  track.style.transform = `translateX(-${idx*100}%)`;
  if (dots) {
    dots.querySelectorAll('.c-dot').forEach((d, i) => d.classList.toggle('active', i === idx))
  }
}


/* ═══ AI CHATBOT ═══ */
// پنجره ربات گفتگو رو باز/بسته می‌کنه (چه دسکتاپ چه موبایل، به‌صورت تمام‌صفحه)
function toggleChat() {
  chatOpen = !chatOpen;
  const win = document.getElementById('ai-chat-window');
  const icon = document.getElementById('chat-fab-icon');
  const badge = document.getElementById('ai-chat-badge');
  if (chatOpen) {
    win.classList.add('open');
    icon.className = 'fa-solid fa-xmark';
    badge.style.display = 'none';
    document.body.style.overflow = 'hidden';
    document.getElementById('chat-input').focus();
  } else {
    win.classList.remove('open');
    icon.className = 'fa-solid fa-robot';
    badge.style.display = 'flex';
    document.body.style.overflow = '';
    // با بسته شدن چت، پاپ‌آپ سوالات هم بسته بشه (ولی خودِ لیست حذف نمی‌شه)
    toggleChatFaq(false);
  }
}

// توپ شناورِ سوالات: پاپ‌آپ لیست سوالات رو باز/بسته می‌کنه بدون این‌که
// چیزی از DOM حذف بشه — پس لیست سوالات همیشه همون‌جاست و از بین نمی‌ره
function toggleChatFaq(force) {
  const popup = document.getElementById('chat-faq-popup');
  const ball = document.getElementById('chat-faq-ball');
  if (!popup) return;
  const shouldOpen = typeof force === 'boolean' ? force : !popup.classList.contains('open');
  popup.classList.toggle('open', shouldOpen);
  if (ball) ball.classList.toggle('active', shouldOpen);
}

// یک پیام آماده به ربات گفتگو می‌فرسته
function sendQuick(msg) {
  document.getElementById('chat-input').value = msg;
  sendChat();
  // بعد از پرسیدن سوال، پاپ‌آپ بسته می‌شه ولی لیست سوالات پاک نمی‌شه
  // و کاربر می‌تونه دوباره با زدن توپ شناور بازش کنه
  toggleChatFaq(false);
}

// متن رو کاراکتر به کاراکتر داخل یک المان نمایش می‌ده (افکت تایپ)
function typeMessage(el, text, speed) {
  return new Promise(resolve => {
    let i = 0;
    el.textContent = '';
    const msgs = document.getElementById('chat-messages');
    const timer = setInterval(() => {
      el.textContent += text[i];
      i++;
      if (msgs) msgs.scrollTop = msgs.scrollHeight;
      if (i >= text.length) {
        clearInterval(timer);
        resolve();
      }
    }, speed);
  });
}

async function sendChat() {
  const input = document.getElementById('chat-input');
  const msg = input.value.trim();
  if (!msg) return;
  input.value = '';

  const msgs = document.getElementById('chat-messages');

  // Add user message
  const userEl = document.createElement('div');
  userEl.className = 'chat-msg user';
  userEl.textContent = msg;
  msgs.appendChild(userEl);
  msgs.scrollTop = msgs.scrollHeight;

  // Add typing indicator
  const typingEl = document.createElement('div');
  typingEl.className = 'chat-msg typing';
  typingEl.innerHTML = '<div class="typing-dots"><span></span><span></span><span></span></div>';
  msgs.appendChild(typingEl);
  msgs.scrollTop = msgs.scrollHeight;

  // یه مکث کوتاه و طبیعی قبل از پاسخ ربات آفلاین
  await new Promise(r => setTimeout(r, 350 + Math.random() * 350));

  // تشخیص زبان به‌صورت مستقل از ChatbotEngine، تا حتی اگه خودِ موتور
  // چت‌بات درست لود نشده باشه، پیام خطا هم باز به فارسی/انگلیسیِ درست نشون داده بشه
  const safeLang = /[\u0600-\u06FF]/.test(msg)
    ? 'fa'
    : ((window.chatLang || document.documentElement.lang) === 'fa' ? 'fa' : 'en');

  const fallbackAnswer = {
    text: (safeLang === 'fa'
      ? 'مشکلی پیش اومد. برای تماس مستقیم: ایمیل ' + (window.SiteData && window.SiteData.config && window.SiteData.config.email || '') + (window.SiteData && window.SiteData.config && window.SiteData.config.telegram ? ' یا تلگرام ' + window.SiteData.config.telegram.replace('https://t.me/', '@') : '')
      : 'Something went wrong. For direct contact, email: ' + (window.SiteData && window.SiteData.config && window.SiteData.config.email || '') + (window.SiteData && window.SiteData.config && window.SiteData.config.telegram ? ' or Telegram: ' + window.SiteData.config.telegram.replace('https://t.me/', '@') : '')),
    suggestions: []
  };

  let answer;
  try {
    answer = window.ChatbotEngine && window.ChatbotEngine.ask(msg);
  } catch (err) {
    console.error('Chatbot error:', err);
    answer = null;
  }

  // اگه هر دلیلی پاسخ نامعتبر/خالی برگشت، به‌جای گیر کردنِ ابدی روی «...در حال تایپ»
  // همون پیام خطای امن رو نشون می‌دیم تا کاربر همیشه یه جواب ببینه
  if (!answer || typeof answer.text !== 'string' || !answer.text.trim()) {
    answer = fallbackAnswer;
  }

  typingEl.remove();

  const botEl = document.createElement('div');
  botEl.className = 'chat-msg bot';
  msgs.appendChild(botEl);

  const speed = (window.ChatbotConfig && window.ChatbotConfig.typingSpeed) || 18;
  await typeMessage(botEl, answer.text, speed);

  if (window.ChatbotConfig && window.ChatbotConfig.showSource && answer.source) {
    const srcEl = document.createElement('div');
    srcEl.className = 'chat-msg-source';
    const answerLang = window.ChatbotEngine.detectLang(msg);
    srcEl.textContent = (answerLang === 'fa' ? 'منبع: ' : 'Source: ') + answer.source;
    msgs.appendChild(srcEl);
  }

  if (window.ChatbotConfig && window.ChatbotConfig.showSuggestions && answer.suggestions && answer.suggestions.length) {
    const sugWrap = document.createElement('div');
    sugWrap.className = 'chat-msg-suggestions';
    answer.suggestions.forEach(s => {
      const b = document.createElement('button');
      b.className = 'chat-quick-btn';
      b.type = 'button';
      b.textContent = s;
      b.onclick = () => sendQuick(s);
      sugWrap.appendChild(b);
    });
    msgs.appendChild(sugWrap);
  }

  msgs.scrollTop = msgs.scrollHeight;
}

