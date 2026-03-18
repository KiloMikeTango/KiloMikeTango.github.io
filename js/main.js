/**
 * main.js
 * App bootstrap — wires up the feed, lazy images, theme, lightbox,
 * like / share interactions. Reads from POSTS (data/posts.js).
 */

/* ── Config ─────────────────────────────────────────── */
const SITE_CONFIG = {
  authorName:     'Kaung Myat Thu',
  authorInitials: 'KMT',
  footerText:     '© 2026 Kaung Myat Thu · Available for projects · thuk6810@gmail.com',
};

/* ── Runtime like state (keyed by post._id) ─────────── */
const likeState = {};

/* ── Init ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  buildFeed();
  initLazyImages();
  initInteractions();
  initLightbox();
});

/* ═══════════════════════════════
   THEME
═══════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  document.getElementById('themeToggle')
    .addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next    = current === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
}

/* ═══════════════════════════════
   FEED BUILD
═══════════════════════════════ */
function buildFeed() {
  // Assign stable IDs in case user omitted them
  POSTS.forEach((post, i) => {
    post._id = post.id ?? (i + 1);
    likeState[post._id] = {
      liked: false,
      count: post.likes ?? 0,
    };
  });

  const feed = document.getElementById('feed');
  feed.innerHTML = POSTS.map(renderPost).join('');
}

/* ═══════════════════════════════
   LAZY IMAGES
═══════════════════════════════ */
function initLazyImages() {
  const imgs = document.querySelectorAll('img[data-src]');

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;

        const img = entry.target;
        img.src = img.dataset.src;

        img.onload = () => {
          img.classList.add('loaded');
          // Remove the skeleton shimmer
          const skeletonId = 'sk-' + img.id.replace('img-', '');
          document.getElementById(skeletonId)?.classList.add('hidden');
        };

        observer.unobserve(img);
      });
    },
    { rootMargin: '200px' }
  );

  imgs.forEach(img => observer.observe(img));
}

/* ═══════════════════════════════
   INTERACTIONS (event delegation)
═══════════════════════════════ */
function initInteractions() {
  const feed = document.getElementById('feed');

  feed.addEventListener('click', e => {
    const likeBtn    = e.target.closest('.like-btn');
    const shareBtn   = e.target.closest('.share-btn');
    const viewBtn    = e.target.closest('.view-btn');
    const imageWrap  = e.target.closest('.post-image-wrap');

    if (likeBtn)   return handleLike(likeBtn);
    if (shareBtn)  return handleShare(shareBtn);
    if (viewBtn)   return openLightbox(viewBtn.dataset.img, viewBtn.dataset.caption);

    // Clicking the image itself (not a button) also opens lightbox
    if (imageWrap && !e.target.closest('.action-btn')) {
      const img = imageWrap.querySelector('img');
      if (img?.src && img.src !== window.location.href) {
        openLightbox(img.src, imageWrap.dataset.caption || '');
      }
    }
  });
}

function handleLike(btn) {
  const id = parseInt(btn.dataset.id);
  const s  = likeState[id];
  s.liked  = !s.liked;
  s.count += s.liked ? 1 : -1;

  btn.classList.toggle('liked', s.liked);

  // Swap heart fill via innerHTML
  const svg = btn.querySelector('svg');
  svg.setAttribute('fill', s.liked ? 'currentColor' : 'none');

  btn.querySelector('.like-count').textContent = s.count;

  // Spring pop animation
  if (s.liked) {
    btn.style.transform = 'scale(1.3)';
    setTimeout(() => { btn.style.transform = ''; }, 200);
  }
}

function handleShare(btn) {
  const src = btn.dataset.src;

  navigator.clipboard.writeText(src)
    .then(() => {
      btn.classList.add('copied');
      showToast('Link copied to clipboard');
      setTimeout(() => btn.classList.remove('copied'), 2000);
    })
    .catch(() => showToast('Could not copy — try right-clicking the image'));
}

/* ═══════════════════════════════
   LIGHTBOX
═══════════════════════════════ */
function initLightbox() {
  const lb = document.getElementById('lightbox');

  document.getElementById('lightboxClose')
    .addEventListener('click', closeLightbox);

  document.getElementById('lightboxBackdrop')
    .addEventListener('click', closeLightbox);

  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeLightbox();
  });
}

function openLightbox(src, caption) {
  document.getElementById('lightboxImg').src     = src;
  document.getElementById('lightboxCaption').textContent = caption;
  document.getElementById('lightbox').classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closeLightbox() {
  const lb = document.getElementById('lightbox');
  lb.classList.remove('open');
  document.body.style.overflow = '';
  setTimeout(() => {
    document.getElementById('lightboxImg').src = '';
  }, 350);
}

/* ═══════════════════════════════
   TOAST
═══════════════════════════════ */
let _toastTimer;

function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => toast.classList.remove('show'), 2500);
}
