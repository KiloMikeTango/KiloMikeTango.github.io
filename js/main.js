/**
 * main.js
 * Portfolio bootstrap — feed, lazy images, theme, lightbox,
 * interactions, mobile nav, active nav links, back-to-top,
 * contact form validation.
 */

/* ── Like state ── */
const likeState = {};

/* ── Init ── */
document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  buildFeed();
  initLazyImages();
  initInteractions();
  initLightbox();
  initMobileNav();
  initScrollBehavior();
  initContactForm();
});

/* ══════════════════════════════
   THEME
══════════════════════════════ */
function initTheme() {
  const saved = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', saved);

  document.getElementById('themeToggle').addEventListener('click', () => {
    const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
  });
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

  function openMenu() {
    btn.classList.add('open');
    btn.setAttribute('aria-expanded', 'true');
    drawer.classList.add('open');
    drawer.setAttribute('aria-hidden', 'false');
  }
  function closeMenu() {
    btn.classList.remove('open');
    btn.setAttribute('aria-expanded', 'false');
    drawer.classList.remove('open');
    drawer.setAttribute('aria-hidden', 'true');
  }

  btn.addEventListener('click', () => btn.classList.contains('open') ? closeMenu() : openMenu());
  overlay.addEventListener('click', closeMenu);

  // Close drawer when a drawer link is clicked
  drawer.querySelectorAll('.drawer-link').forEach(link => {
    link.addEventListener('click', closeMenu);
  });

  // Close on Escape
  document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
}

/* ══════════════════════════════
   SCROLL — active nav + back-to-top
══════════════════════════════ */
function initScrollBehavior() {
  const btt      = document.getElementById('backToTop');
  const sections = ['work', 'about', 'contact'];
  const navLinks = document.querySelectorAll('.nav-link[data-section]');

  btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

  const io = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (!entry.isIntersecting) return;
        const id = entry.target.id;
        navLinks.forEach(l => {
          l.classList.toggle('active', l.dataset.section === id);
        });
      });
    },
    { rootMargin: '-30% 0px -60% 0px' }
  );

  sections.forEach(id => {
    const el = document.getElementById(id);
    if (el) io.observe(el);
  });

  window.addEventListener('scroll', () => {
    btt.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
}

/* ══════════════════════════════
   CONTACT FORM
══════════════════════════════ */
function initContactForm() {
  const form = document.getElementById('contactForm');
  if (!form) return;

  form.addEventListener('submit', e => {
    e.preventDefault();
    if (!validateForm(form)) return;

    const btn  = document.getElementById('formSubmit');
    const text = btn.querySelector('.submit-text');

    btn.disabled = true;
    text.textContent = 'Sending...';

    // Build mailto and open — works without a backend
    const name    = form.name.value.trim();
    const email   = form.email.value.trim();
    const subject = form.subject.value.trim() || 'Portfolio enquiry';
    const message = form.message.value.trim();

    const body = encodeURIComponent(
      `From: ${name} <${email}>\n\n${message}`
    );
    const mailtoUrl = `mailto:thuk6810@gmail.com?subject=${encodeURIComponent(subject)}&body=${body}`;

    window.location.href = mailtoUrl;

    setTimeout(() => {
      btn.disabled = false;
      text.textContent = 'Send message';
      form.reset();
      showToast('Opening your mail client…');
    }, 800);
  });

  // Live validation on blur
  ['fname', 'femail', 'fmessage'].forEach(id => {
    const input = document.getElementById(id);
    if (input) input.addEventListener('blur', () => validateField(input));
  });
}

function validateForm(form) {
  let valid = true;
  if (!validateField(document.getElementById('fname')))    valid = false;
  if (!validateField(document.getElementById('femail')))   valid = false;
  if (!validateField(document.getElementById('fmessage'))) valid = false;
  return valid;
}

function validateField(input) {
  if (!input) return true;
  const errorEl = document.getElementById(input.id + '-error');
  let msg = '';

  if (!input.value.trim()) {
    msg = 'This field is required.';
  } else if (input.type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.value)) {
    msg = 'Please enter a valid email.';
  }

  if (errorEl) errorEl.textContent = msg;
  input.classList.toggle('error', !!msg);
  return !msg;
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