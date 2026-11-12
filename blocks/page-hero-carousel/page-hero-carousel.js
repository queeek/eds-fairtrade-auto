/**
 * page-hero-carousel — PageHeroCarousel: full-bleed themed hero with a slide track,
 * prev/next controls (desktop: shown on hover) and pagination bullets.
 * Schema: stardust/eds-schema/en.json § PageHeroCarousel (3 × PageHeroSlide).
 * Decode tier: reconstructive (one row per slide; authors add/remove slides).
 *
 * Authoring rows (one per slide; cells are classified by content, not position):
 *   cell 1  <picture> mobile image (square crop)
 *   cell 2  <picture> desktop image (wide crop) — optional; a single picture serves both
 *   cell 3  heading (<h1> on the first slide, <h2> on the others), text <p>,
 *           CTA <p><em><strong><a></a></strong></em></p> (accent = leafgreen pill)
 * The flattened single-cell shape (all slides in one cell) is segmented on headings (#69).
 *
 * @variants block: skyblue | nightsky (default leafgreen)
 * Generated controls carry no text (aria-label only) — decorate adds no words (#100).
 */

const SPRITE = `${window.hlx?.codeBasePath || ''}/icons/ft-icons.svg`;

function el(tag, className, attrs = {}) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
}

function wrapNode(node, className) {
  const w = el('div', className);
  w.append(node);
  return w;
}

function stripInstrumentation(node) {
  node.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  node.removeAttribute('data-prose-index');
  node.removeAttribute('data-image-index');
  return node;
}

function icon(name) {
  const span = el('span', 'ft-icon', { 'aria-hidden': 'true' });
  span.innerHTML = `<svg><use href="${SPRITE}#${name}"></use></svg>`;
  return span;
}

/** Expand the runtime's wrapTextNodes <p> around a media-led cell (#104). */
function cellNodes(cell) {
  let kids = [...cell.children];
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === 1) return n;
      // HARNESS-ONLY fallback (EW5): bare text inside the wrapper <p> — move the node
      if (n.textContent.trim()) {
        const p = document.createElement('p');
        p.append(n);
        return p;
      }
      return null;
    }).filter(Boolean);
  }
  return kids;
}

const isMedia = (n) => n.matches('picture, img') || n.querySelector('picture, img');
const isHeading = (n) => /^H[1-6]$/.test(n.tagName);

/** Group authored nodes into slides: one group per row, or per heading when flattened. */
function collectSlides(block) {
  const rows = [...block.children];
  const perRow = rows.map((row) => [...row.children].flatMap(cellNodes));
  const headingRows = perRow.filter((nodes) => nodes.some(isHeading)).length;
  if (rows.length > 1 || headingRows === 0) return perRow.filter((nodes) => nodes.length);
  // flattened: segment on headings; media seen before a heading belongs to that slide
  const slides = [];
  let pending = [];
  let current = null;
  perRow[0].forEach((n) => {
    if (isHeading(n)) {
      current = [...pending, n];
      pending = [];
      slides.push(current);
    } else if (isMedia(n) && (!current || current.some(isHeading))) {
      pending.push(n);
    } else if (current) current.push(n);
    else pending.push(n);
  });
  if (pending.length && current) current.push(...pending);
  return slides.length ? slides : perRow;
}

function buildSlide(nodes) {
  const slide = el('div', 'page-hero-slide');
  const inner = el('div', 'page-hero-slide-inner');
  const media = el('div', 'page-hero-slide-media');
  const content = el('div', 'page-hero-slide-content');
  const contentInner = el('div', 'page-hero-slide-content-inner');

  const pictures = [];
  nodes.forEach((n) => {
    if (isMedia(n)) {
      const p = n.matches('picture, img') ? n : n.querySelector('picture') || n.querySelector('img');
      pictures.push(p.closest('picture') || p);
      return;
    }
    if (isHeading(n)) {
      contentInner.append(wrapNode(n, 'page-hero-slide-title'));
    } else if (n.querySelector('a') && n.textContent.trim() === n.querySelector('a').textContent.trim()) {
      contentInner.append(wrapNode(n, 'page-hero-slide-actions'));
    } else if (n.textContent.trim()) {
      contentInner.append(wrapNode(n, 'page-hero-slide-text'));
    }
  });

  if (pictures.length) {
    const [mobile, desktop] = pictures;
    media.append(wrapNode(mobile, 'ft-image square cover page-hero-slide-image-mobile'));
    // a single authored picture serves both crops; the desktop copy is presentational (EW4)
    const wide = desktop || stripInstrumentation(mobile.cloneNode(true));
    media.append(wrapNode(wide, 'ft-image landscape cover page-hero-slide-image-desktop'));
    pictures.slice(2).forEach((p) => p.remove());
  }

  content.append(contentInner);
  inner.append(media, content);
  slide.append(inner);
  return slide;
}

function controlButton(dir) {
  const b = el('button', `btn variant-icon-primary page-hero-carousel-control-${dir}`, {
    type: 'button',
    'aria-hidden': 'true',
    tabindex: '-1',
  });
  const wrap = el('span', 'btn-icon');
  wrap.append(icon(dir === 'previous' ? 'chevron-left' : 'chevron-right'));
  b.append(wrap);
  return b;
}

export default async function decorate(block) {
  const groups = collectSlides(block);
  if (!groups.length) return;

  const slides = groups.map(buildSlide);
  slides.forEach((s, k) => {
    const loading = k === 0 ? 'eager' : 'lazy';
    s.querySelectorAll('img').forEach((img) => img.setAttribute('loading', loading));
  });

  const grid = el('div', 'page-hero-carousel-grid page-grid');
  const inner = el('div', 'page-hero-carousel-inner');
  const carousel = el('div', 'page-hero-carousel-carousel');
  const track = el('div', 'page-hero-carousel-track');
  track.append(...slides);
  carousel.append(track);

  const bullets = [];
  let prev = null;
  let next = null;
  if (slides.length > 1) {
    const pagination = el('div', 'page-hero-carousel-pagination');
    slides.forEach(() => {
      const b = el('span', 'page-hero-carousel-bullet');
      bullets.push(b);
      pagination.append(b);
    });
    const controls = el('div', 'page-hero-carousel-controls');
    prev = controlButton('previous');
    next = controlButton('next');
    controls.append(prev, next);
    carousel.append(pagination, controls);
  }
  inner.append(carousel);
  grid.append(inner);
  block.replaceChildren(grid);

  let i = 0;
  const go = (n) => {
    i = Math.max(0, Math.min(slides.length - 1, n));
    slides.forEach((s, k) => {
      s.classList.toggle('is-active', k === i);
      s.classList.toggle('is-next', k === i + 1);
      s.classList.toggle('is-after', k > i + 1);
      s.classList.toggle('is-before', k < i);
      s.toggleAttribute('aria-hidden', k !== i);
      s.querySelectorAll('a').forEach((a) => {
        if (k === i) a.removeAttribute('tabindex');
        else a.setAttribute('tabindex', '-1');
      });
    });
    bullets.forEach((b, k) => {
      b.classList.toggle('is-active', k === i);
      b.toggleAttribute('aria-current', k === i);
    });
    if (prev) prev.disabled = i === 0;
    if (next) next.disabled = i === slides.length - 1;
  };
  go(0);
  if (slides.length < 2) return;

  prev.addEventListener('click', () => go(i - 1));
  next.addEventListener('click', () => go(i + 1));
  bullets.forEach((b, k) => b.addEventListener('click', () => go(k)));
  slides.forEach((s, k) => s.addEventListener('click', (e) => {
    if (k !== i) {
      e.preventDefault();
      go(k);
    }
  }));
  let x0 = null;
  block.addEventListener('pointerdown', (e) => { x0 = e.clientX; });
  block.addEventListener('pointerup', (e) => {
    if (x0 === null) return;
    const dx = e.clientX - x0;
    x0 = null;
    if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
  });
}
