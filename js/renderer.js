/**
 * renderer.js
 * Builds post HTML from data/posts.js objects.
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

  return /* html */ `
    <article class="post" data-id="${_id}">

      <div class="post-header">
        <div class="post-avatar">
          <img src="${AUTHOR_PFP}" alt="${AUTHOR_NAME}">
        </div>
        <div class="post-meta">
          <div class="post-author-row">
            <span class="post-author">${AUTHOR_NAME}</span>
            <span class="verified-badge" title="Verified">${svgCheckmark()}</span>
          </div>
          <div class="post-date-row">
            <span class="post-date">${date}</span>
            <span class="post-tag">${postType}</span>
          </div>
        </div>
      </div>

      <div class="post-image-wrap" data-img="${image}" data-caption="${postType}">
        <div class="skeleton-img" id="sk-${_id}"></div>
        <img id="img-${_id}" src="" data-src="${image}" alt="${alt}" loading="lazy">
        <div class="image-overlay">
          <div class="zoom-icon">${svgZoom()}</div>
        </div>
      </div>

      <div class="post-body">
        <p class="post-caption">${content}</p>
      </div>

      <div class="post-actions">
        <button class="action-btn like-btn" data-id="${_id}" aria-label="Like">
          ${svgHeart(false)}
          <span class="like-count">${likes}</span>
        </button>
        <button class="action-btn share-btn" data-id="${_id}" data-src="${image}" aria-label="Share">
          ${svgShare()} Share
        </button>
        <span class="action-spacer"></span>
        <button class="action-btn view-btn"
                data-img="${image}" data-caption="${postType}" aria-label="View full image">
          ${svgEye()} View
        </button>
      </div>

    </article>
  `;
}

function svgCheckmark() {
  return `<svg viewBox="0 0 8 8" fill="none" xmlns="http://www.w3.org/2000/svg">
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
    <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
    <polyline points="16 6 12 2 8 6"/>
    <line x1="12" y1="2" x2="12" y2="15"/>
  </svg>`;
}
function svgZoom() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="11" cy="11" r="8"/>
    <path d="M21 21l-4.35-4.35"/>
    <line x1="11" y1="8" x2="11" y2="14"/>
    <line x1="8"  y1="11" x2="14" y2="11"/>
  </svg>`;
}
function svgEye() {
  return `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
               stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
    <circle cx="12" cy="12" r="3"/>
  </svg>`;
}