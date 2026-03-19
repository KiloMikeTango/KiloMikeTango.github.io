/**
 * renderer.js
 * Newspaper "piece" layout — image dominant, editorial caption below.
 * No cramped header bar. Each piece = press photo + headline + byline.
 */

const AUTHOR_NAME = 'Kaung Myat Thu';
const AUTHOR_PFP  = 'pfp.png';

function resolveImage(src) {
  if (!src) return '';
  if (src.startsWith('http') || src.startsWith('/') || src.startsWith('./')) return src;
  return 'images/' + src;
}

function renderPost(post) {
  const { _id, content, postType, date, likes = 0, alt = '' } = post;
  const image = resolveImage(post.image);

  // Strip strong tags to get a clean title (first bolded word group)
  const titleMatch = content.match(/<strong>(.*?)<\/strong>/);
  const title = titleMatch ? titleMatch[1] : postType;

  // Body text without the strong title prefix
  const body = content.replace(/<strong>.*?<\/strong>\s*[—–-]\s*/, '');

  return /* html */ `
    <article class="piece" data-id="${_id}">

      <!-- Press photo — image fills the piece, no padding -->
      <div class="piece-photo" data-img="${image}" data-caption="${title}">
        <div class="skeleton-img" id="sk-${_id}"></div>
        <img id="img-${_id}" src="" data-src="${image}" alt="${alt}" loading="lazy">
        <div class="piece-photo-overlay">
          <div class="piece-zoom">${svgZoom()}</div>
        </div>
        <!-- Category stamp — top-left corner like a section flag -->
        <div class="piece-flag">${postType}</div>
      </div>

      <!-- Editorial matter below the photo -->
      <div class="piece-editorial">

        <!-- Headline — the story title in Anton -->
        <h3 class="piece-title">${title}</h3>

        <!-- Deck rule — thin rule between headline and body -->
        <div class="piece-rule"></div>

        <!-- Body copy — the caption as editorial text -->
        <p class="piece-body">${body}</p>

        <!-- Byline strip — author + date, small caps -->
        <div class="piece-byline">
          <img src="${AUTHOR_PFP}" class="piece-byline-pfp" alt="${AUTHOR_NAME}">
          <span class="piece-byline-author">${AUTHOR_NAME}</span>
          <span class="piece-byline-dot">·</span>
          <span class="piece-byline-date">${date}</span>
        </div>

      </div>

      <!-- Actions — minimal, flush bottom -->
      <div class="piece-actions">
        <button class="piece-btn like-btn" data-id="${_id}" aria-label="Like">
          ${svgHeart(false)}
          <span class="like-count">${likes}</span>
        </button>
        <button class="piece-btn share-btn" data-id="${_id}" data-src="${image}" aria-label="Share">
          ${svgShare()}
        </button>
        <span class="piece-actions-spacer"></span>
        <button class="piece-btn view-btn"
                data-img="${image}" data-caption="${title}" aria-label="View">
          ${svgExpand()} View full
        </button>
      </div>

    </article>
  `;
}

/* ── SVGs ── */
function svgCheckmark() {
  return `<svg viewBox="0 0 8 8" fill="none">
    <path d="M1.5 4L3 5.5L6.5 2.5" stroke="white" stroke-width="1.4"
          stroke-linecap="round" stroke-linejoin="round"/>
  </svg>`;
}
function svgHeart(filled) {
  return `<svg viewBox="0 0 24 24" fill="${filled ? 'currentColor' : 'none'}"
               stroke="currentColor" stroke-width="2"
               stroke-linecap="round" stroke-linejoin="round">
    <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06
             a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23
             l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
  </svg>`;
}
function svgShare() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/>
    <circle cx="18" cy="19" r="3"/>
    <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"/>
    <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"/>
  </svg>`;
}
function svgZoom() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8" y1="11" x2="14" y2="11"/>
  </svg>`;
}
function svgExpand() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="15 3 21 3 21 9"/>
    <polyline points="9 21 3 21 3 15"/>
    <line x1="21" y1="3" x2="14" y2="10"/>
    <line x1="3" y1="21" x2="10" y2="14"/>
  </svg>`;
}