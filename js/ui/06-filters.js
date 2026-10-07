// ════════════════════════════════════════
//  06-filters.js — تب تجربه، فیلتر/مرتب‌سازی پروژه‌ها، ریویل
//  از js/interactions.js (خط 1045 تا 1183) جدا شده.
//  ترتیب لود در index.html مهمه.
// ════════════════════════════════════════
/* ═══ EXPERIENCE TABS ═══ */
// تب بخش تجربه تعاملی رو عوض می‌کنه
function switchExpTab(tabId, btn) {
  document.querySelectorAll('.exp-tab').forEach(b => b.classList.remove('active'));
  document.querySelectorAll('.exp-panel').forEach(p => p.classList.remove('active'));
  btn.classList.add('active');
  const panel = document.getElementById('exp-' + tabId);
  if (panel) panel.classList.add('active');
  // re-trigger reveals inside panel
  panel.querySelectorAll('.reveal').forEach((el, i) => {
    el.classList.remove('visible');
    setTimeout(() => el.classList.add('visible'), 80 * i);
  });
}

/* ═══ ENHANCED PROJECT FILTERING ═══ */
// پروژه‌ها رو بر اساس دسته‌بندی فیلتر می‌کنه
function filterProjects() {
  const search = document.getElementById('proj-search')?.value.toLowerCase() || '';
  const activeFilter = document.querySelector('.pf .fb.active')?.dataset.filter || 'all';
  const grid = document.getElementById('proj-grid');
  if (!grid) return;

  const cards = grid.querySelectorAll('.pc');
  let visible = 0;
  cards.forEach(card => {
    const title = (card.querySelector('.ptitle')?.textContent || '').toLowerCase();
    const desc = (card.querySelector('.pdesc')?.textContent || '').toLowerCase();
    const tags = Array.from(card.querySelectorAll('.tag')).map(t => t.textContent.toLowerCase()).join(' ');
    const cat = card.dataset.category || '';

    const matchSearch = !search || title.includes(search) || desc.includes(search) || tags.includes(search);
    const matchFilter = activeFilter === 'all' || cat === activeFilter;

    if (matchSearch && matchFilter) {
      card.style.display = '';
      card.classList.remove('hidden');
      visible++;
    } else {
      card.classList.add('hidden');
      setTimeout(() => {
        if (card.classList.contains('hidden')) card.style.display = 'none';
      }, 350);
    }
  });

  const badge = document.getElementById('proj-count');
  if (badge) badge.textContent = visible + ' project' + (visible !== 1 ? 's' : '');

  const noRes = document.getElementById('proj-no-results');
  if (noRes) noRes.style.display = visible === 0 ? 'block' : 'none';
}

// Patch existing filter buttons to also call filterProjects
document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('.pf .fb').forEach(btn => {
    const origClick = btn.onclick;
    btn.onclick = function(e) {
      if (origClick) origClick.call(this, e);
      filterProjects();
    };
  });
});

// ترتیب نمایش پروژه‌ها رو عوض می‌کنه
function sortProjects(by, btn) {
  document.querySelectorAll('.sort-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  const grid = document.getElementById('proj-grid');
  if (!grid) return;
  const cards = Array.from(grid.querySelectorAll('.pc'));
  if (by === 'name') {
    cards.sort((a, b) => (a.querySelector('.ptitle')?.textContent || '').localeCompare(b.querySelector('.ptitle')?.textContent || ''));
  } else if (by === 'category') {
    cards.sort((a, b) => (a.dataset.category || '').localeCompare(b.dataset.category || ''));
  } else {
    cards.sort((a, b) => (a.dataset.origIdx || 0) - (b.dataset.origIdx || 0));
  }
  cards.forEach((card, i) => {
    card.dataset.origIdx = card.dataset.origIdx || i;
    grid.appendChild(card);
  });
}

/* ═══ SCROLL REVEAL ═══ */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      revealObs.unobserve(e.target);
    }
  });
}, {
  threshold: 0.15
});

document.querySelectorAll('.reveal, .reveal-left, .reveal-scale').forEach((el, i) => {
  el.dataset.origIdx = i;
  revealObs.observe(el);
});

// Store original indices for project cards
document.querySelectorAll('#proj-grid .pc').forEach((card, i) => {
  card.dataset.origIdx = i;
});

/* ═══ MAGNETIC BUTTONS ═══ */
document.querySelectorAll('.btn-p, .btn-o').forEach(btn => {
  btn.classList.add('btn-mag');
  btn.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    this.style.transform = `translate(${x * 0.18}px, ${y * 0.18}px)`;
  });
  btn.addEventListener('mouseleave', function() {
    this.style.transform = '';
  });
});

/* ═══ EXPERIENCE CARD MOUSE TRACKING ═══ */
document.querySelectorAll('.exp-card').forEach(card => {
  card.addEventListener('mousemove', function(e) {
    const rect = this.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width * 100).toFixed(1);
    const y = ((e.clientY - rect.top) / rect.height * 100).toFixed(1);
    this.style.setProperty('--mx', x + '%');
    this.style.setProperty('--my', y + '%');
  });
});

/* ═══ PARTICLE ENHANCEMENTS ═══ */
// Additional glow colors for particles
const origNewP = window.newP;

/* ═══ SMOOTH REVEAL FOR HERO ELEMENTS ═══ */
/* Removed — handled by CSS heroItemIn animation to avoid conflict */


