/**
 * main.js
 * Portfolio bootstrap — feed, lazy images, theme, lightbox,
 * interactions, mobile nav, active nav links, back-to-top,
 * contact card copy-on-click.
 */

const likeState = {};

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  buildFeed();
  initLazyImages();
  initInteractions();
  initLightbox();
  initMobileNav();
  initScrollBehavior();
  initContactCards();
});

/* ══════════════════════════════
   THEME — light only
══════════════════════════════ */
function initTheme() {
  // Dark mode removed — light theme only
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
══════════════════════════════ */
function initLazyImages() {
  const observer = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      const img = entry.target;
      img.src = img.dataset.src;
      img.onload = () => {
        img.classList.add('loaded');
        document.getElementById('sk-' + img.id.replace('img-', ''))?.classList.add('hidden');
      };
      observer.unobserve(img);
    }),
    { rootMargin: '200px' }
  );
  document.querySelectorAll('img[data-src]').forEach(img => observer.observe(img));
}

/* ══════════════════════════════
   FEED INTERACTIONS
══════════════════════════════ */
function initInteractions() {
  document.getElementById('feed').addEventListener('click', e => {
    const likeBtn   = e.target.closest('.like-btn');
    const shareBtn  = e.target.closest('.share-btn');
    const viewBtn   = e.target.closest('.view-btn');
    const imageWrap = e.target.closest('.post-image-wrap');

    if (likeBtn)   return handleLike(likeBtn);
    if (shareBtn)  return handleShare(shareBtn);
    if (viewBtn)   return openLightbox(viewBtn.dataset.img, viewBtn.dataset.caption);
    if (imageWrap && !e.target.closest('.action-btn')) {
      const img = imageWrap.querySelector('img');
      if (img?.src && img.src !== window.location.href)
        openLightbox(img.src, imageWrap.dataset.caption || '');
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
      showToast('Link copied to clipboard');
      setTimeout(() => btn.classList.remove('copied'), 2000);
    })
    .catch(() => showToast('Could not copy link'));
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
  document.getElementById('lightboxImg').src = src;
  document.getElementById('lightboxCaption').textContent = caption;
  document.getElementById('lightbox').classList.add('open');
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

  const openMenu  = () => {
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

  btn.addEventListener('click', () => btn.classList.contains('open') ? closeMenu() : openMenu());
  overlay.addEventListener('click', closeMenu);
  drawer.querySelectorAll('.drawer-link').forEach(l => l.addEventListener('click', closeMenu));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

/* ══════════════════════════════
   SCROLL — active nav + back-to-top
══════════════════════════════ */
function initScrollBehavior() {
  const btt      = document.getElementById('backToTop');
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const io = new IntersectionObserver(
    entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      navLinks.forEach(l => l.classList.toggle('active', l.dataset.section === entry.target.id));
    }),
    { rootMargin: '-30% 0px -60% 0px' }
  );
  ['work', 'about', 'contact'].forEach(id => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });

  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
}

/* ══════════════════════════════
   CONTACT CARDS — copy on click
══════════════════════════════ */
function initContactCards() {
  document.querySelectorAll('.contact-card[data-copy]').forEach(card => {
    card.addEventListener('click', () => {
      const text = card.dataset.copy;
      navigator.clipboard.writeText(text)
        .then(() => {
          card.classList.add('copied');
          const hint = card.querySelector('.copy-hint');
          const original = hint.textContent;
          hint.textContent = 'Copied!';
          showToast(`"${text}" copied`);
          setTimeout(() => {
            card.classList.remove('copied');
            hint.textContent = original;
          }, 2200);
        })
        .catch(() => showToast('Could not copy — try manually'));
    });
  });
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