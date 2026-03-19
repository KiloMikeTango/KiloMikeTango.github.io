/**
 * main.js — Performance-optimised bootstrap
 *
 * Key changes:
 * - Scripts are defer'd so they never block HTML parsing
 * - DOMContentLoaded listener removed — defer guarantees DOM is ready
 * - Lazy images use rootMargin:'400px' + immediate load for visible images
 * - Scroll handler throttled with requestAnimationFrame
 * - IntersectionObserver reused across features
 * - Contact cards use event delegation (not per-card listeners)
 * - will-change applied only while animating, removed after
 */

const likeState = {};

/* ── Boot — defer means DOM is ready when this runs ── */
initTheme();
buildFeed();
initLazyImages();
initInteractions();
initLightbox();
initMobileNav();
initScrollBehavior();
initContactCards();

/* ══════════════════════════════
   THEME — light only
══════════════════════════════ */
function initTheme() {
  localStorage.removeItem('theme');
}

/* ══════════════════════════════
   FEED
══════════════════════════════ */
function buildFeed() {
  POSTS.forEach((post, i) => {
    post._id = post.id ?? (i + 1);
    likeState[post._id] = { liked: false, count: post.likes ?? 0 };
  });
  document.getElementById('feed').innerHTML = POSTS.map(renderPost).join('');
}

/* ══════════════════════════════
   LAZY IMAGES
   - Larger rootMargin so images start
     loading well before they scroll in
   - Images already in viewport load
     immediately without observer
══════════════════════════════ */
function initLazyImages() {
  const imgs = document.querySelectorAll('img[data-src]');

  // Split: in-viewport images load right now, others use observer
  const toObserve = [];
  const viewH = window.innerHeight;

  imgs.forEach(img => {
    const rect = img.getBoundingClientRect();
    if (rect.top < viewH + 100) {
      // Already visible or nearly — load immediately
      loadImage(img);
    } else {
      toObserve.push(img);
    }
  });

  if (!toObserve.length) return;

  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      loadImage(entry.target);
      observer.unobserve(entry.target);
    }),
    // Large margin — start loading 500px before image enters view
    { rootMargin: '500px 0px' }
  );

  toObserve.forEach(img => observer.observe(img));
}

function loadImage(img) {
  if (img.src === img.dataset.src) return; // already loaded
  img.src = img.dataset.src;
  img.onload = () => {
    img.classList.add('loaded');
    document.getElementById('sk-' + img.id.replace('img-', ''))?.classList.add('hidden');
  };
  img.onerror = () => {
    // Hide skeleton on error too — don't leave shimmer forever
    document.getElementById('sk-' + img.id.replace('img-', ''))?.classList.add('hidden');
  };
}

/* ══════════════════════════════
   FEED INTERACTIONS — delegation
══════════════════════════════ */
function initInteractions() {
  document.getElementById('feed').addEventListener('click', e => {
    const likeBtn   = e.target.closest('.like-btn');
    const shareBtn  = e.target.closest('.share-btn');
    const viewBtn   = e.target.closest('.view-btn');
    const photoWrap = e.target.closest('.piece-photo');

    if (likeBtn)   return handleLike(likeBtn);
    if (shareBtn)  return handleShare(shareBtn);
    if (viewBtn)   return openLightbox(viewBtn.dataset.img, viewBtn.dataset.caption);
    if (photoWrap && !e.target.closest('.piece-btn')) {
      const img = photoWrap.querySelector('img');
      const src = (img?.src && img.src !== window.location.href)
        ? img.src : img?.dataset?.src;
      if (src) openLightbox(src, photoWrap.dataset.caption || '');
    }
  });
}

function handleLike(btn) {
  const id = parseInt(btn.dataset.id);
  const s  = likeState[id];
  s.liked  = !s.liked;
  s.count += s.liked ? 1 : -1;
  btn.classList.toggle('liked', s.liked);
  btn.querySelector('svg').setAttribute('fill', s.liked ? 'currentColor' : 'none');
  btn.querySelector('.like-count').textContent = s.count;
  if (s.liked) {
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => { btn.style.transform = ''; }, 180);
  }
}

function handleShare(btn) {
  navigator.clipboard.writeText(btn.dataset.src)
    .then(() => {
      btn.classList.add('copied');
      showToast('Link copied');
      setTimeout(() => btn.classList.remove('copied'), 2000);
    })
    .catch(() => showToast('Could not copy'));
}

/* ══════════════════════════════
   LIGHTBOX
══════════════════════════════ */
function initLightbox() {
  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxBackdrop').addEventListener('click', closeLightbox);
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeLightbox(); });
}
function openLightbox(src, caption) {
  const lb  = document.getElementById('lightbox');
  const img = document.getElementById('lightboxImg');
  img.src = src;
  document.getElementById('lightboxCaption').textContent = caption;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => { document.getElementById('lightboxImg').src = ''; }, 320);
}

/* ══════════════════════════════
   MOBILE NAV DRAWER
══════════════════════════════ */
function initMobileNav() {
  const btn     = document.getElementById('navMenuBtn');
  const drawer  = document.getElementById('navDrawer');
  const overlay = document.getElementById('navOverlay');

  const openMenu = () => {
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  };
  const closeMenu = () => {
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  };

  btn.addEventListener('click', () =>
    btn.classList.contains('open') ? closeMenu() : openMenu()
  );
  overlay.addEventListener('click', closeMenu);
  drawer.querySelectorAll('.drawer-link').forEach(l =>
    l.addEventListener('click', closeMenu)
  );
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeMenu();
  });
}

/* ══════════════════════════════
   SCROLL — throttled with rAF
   Active nav + back-to-top
══════════════════════════════ */
function initScrollBehavior() {
  const btt      = document.getElementById('backToTop');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  btt.addEventListener('click', () =>
    window.scrollTo({ top: 0, behavior: 'smooth' })
  );

  // Section observer for active nav link
  const io = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l =>
        l.classList.toggle('active', l.dataset.section === entry.target.id)
      );
    }),
    { rootMargin: '-30% 0px -60% 0px' }
  );
  ['work', 'about', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });

  // rAF-throttled scroll handler — back-to-top visibility only
  let ticking = false;
  window.addEventListener('scroll', () => {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      btt.classList.toggle('visible', window.scrollY > 500);
      ticking = false;
    });
  }, { passive: true });
}

/* ══════════════════════════════
   CONTACT CARDS — delegation
   One listener on the container
   instead of one per card
══════════════════════════════ */
function initContactCards() {
  const container = document.querySelector('.contact-listing-details');
  if (!container) return;

  // keyboard support for rows
  container.querySelectorAll('.contact-row[data-copy]').forEach(row => {
    row.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); copyRow(row); }
    });
  });

  container.addEventListener('click', e => {
    const row = e.target.closest('.contact-row[data-copy]');
    if (row) copyRow(row);
  });
}

function copyRow(row) {
  const text = row.dataset.copy;
  const action = row.querySelector('.contact-row-action');
  navigator.clipboard.writeText(text)
    .then(() => {
      row.classList.add('copied');
      if (action) { const orig = action.textContent; action.textContent = 'copied!';
        setTimeout(() => { row.classList.remove('copied'); action.textContent = orig; }, 2000);
      }
      showToast(`"${text}" copied`);
    })
    .catch(() => showToast('Could not copy'));
}

/* ══════════════════════════════
   TOAST
══════════════════════════════ */
let _toastTimer;
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => t.classList.remove('show'), 2600);
}