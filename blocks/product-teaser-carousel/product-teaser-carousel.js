/**
 * product-teaser-carousel — ProductTeaserCarousel (ch-fr): white band with a skyblue wave, a
 * skyblue panel holding a centred subtitle + h2, a horizontally scrolling track of
 * ProductTeaser cards (image, merchant, title, tertiary "read more" label; whole card is one
 * link) with prev/next controls, and a white outline CTA under the track.
 * Schema: stardust/eds-schema/ch-fr.json § ProductTeaserCarousel (24 × ProductTeaser).
 * Decode tier: reconstructive (one row per product; authors add/remove/reorder products).
 * Behaviour (source clientlib Carousel, options controlsOnHover + initAtScrollCenter):
 * native scroll-snap track, starts scrolled to its centre, controls step one card width,
 * prev/next disabled at the ends, controls only while the track overflows (hover-only ≥1024).
 *
 * Authoring rows (cells classified by content, any split across cells):
 *   heading row  <p> subtitle · <h2> title (no picture)
 *   product row  <picture> image · <p> merchant · <p> title · <p><a href>label</a></p> (card link)
 *   CTA row      <p><em><a href>label</a></em></p> (white outline button)
 * The flattened single-cell shape is segmented on the product pictures.
 * Generated controls carry no text (aria-label only) — decorate adds no words.
 */

const SPRITE = `${window.hlx?.codeBasePath || ''}/icons/ft-icons.svg`;

const WAVES = {
  mobile: '<svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">'
    + '<path d="M0 100 V138 H100 V22.22 C89.4722 10.3091 77.1944 3.5804 65.625 3.5804 '
    + 'C37.2325 3.5804 12.19 40.9839 0 100 Z"></path></svg>',
  tablet: '<svg width="100%" height="100%" viewBox="0 0 768 40" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">'
    + '<path d="M0 39.5566V40H768V6.70221C693.951 2.74354 610.938 0.525391 523.261 0.525391'
    + 'C286.805 0.525391 84.2704 16.6588 0 39.5566Z"></path></svg>',
  desktop: '<svg width="100%" height="100%" viewBox="0 0 375 40" preserveAspectRatio="none" fill="currentColor" aria-hidden="true">'
    + '<path d="M0 39.4028V40H375V6.73263C338.773 2.75491 298.142 0.525391 255.221 0.525391'
    + 'C140.023 0.525391 41.3134 16.5866 0 39.4028Z"></path></svg>',
};

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

const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
const isMedia = (n) => n.matches('picture, img') || !!n.querySelector('picture, img');
const isLinkOnly = (n) => {
  const a = n.matches('a') ? n : n.querySelector('a');
  return !!a && n.textContent.trim() === a.textContent.trim();
};

function cellNodes(cell) {
  let kids = [...cell.children];
  // #104 — runtime wrapTextNodes folds a media-led cell into one <p>: expand it back
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].map((n) => {
      if (n.nodeType === 1) return n;
      // HARNESS-ONLY fallback (EW5): move bare text into a <p>
      if (n.textContent.trim()) {
        const p = document.createElement('p');
        p.append(n);
        return p;
      }
      return null;
    }).filter(Boolean);
  }
  if (!kids.length && cell.textContent.trim()) {
    // HARNESS-ONLY fallback (EW5)
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    kids = [p];
  }
  return kids;
}

/** Sort authored nodes into head (subtitle/title), products and the trailing CTA. */
function collect(block) {
  const rows = [...block.children].map((row) => [...row.children].flatMap(cellNodes));
  const head = [];
  const products = [];
  const actions = [];
  const flat = rows.length === 1 && rows[0].filter(isMedia).length > 1;
  const groups = flat ? [rows[0]] : rows;
  groups.forEach((nodes) => {
    if (flat || nodes.some(isMedia)) {
      // one product per picture; a link-only paragraph closes it
      let current = null;
      nodes.forEach((n) => {
        if (isMedia(n)) {
          current = [n];
          products.push(current);
        } else if (current) {
          current.push(n);
          if (isLinkOnly(n)) current = null;
        } else if (products.length) {
          actions.push(n);
        } else {
          head.push(n);
        }
      });
    } else if (products.length && !nodes.some(isHeading)) {
      actions.push(...nodes);
    } else {
      head.push(...nodes);
    }
  });
  return { head, products, actions };
}

function buildProduct(nodes) {
  const li = el('li', 'product-teaser-carousel-item');
  const card = el('a', 'product-teaser');
  const image = el('div', 'product-teaser-image');
  const texts = [];
  let ctaNode = null;

  nodes.forEach((n) => {
    if (isMedia(n)) {
      const pic = n.matches('picture, img') ? n : n.querySelector('picture') || n.querySelector('img');
      image.append(wrapNode(pic.closest('picture') || pic, 'ft-image square'));
    } else if (isLinkOnly(n) && !ctaNode) {
      ctaNode = n;
    } else if (n.textContent.trim()) {
      texts.push(n);
    }
  });

  card.append(image);
  texts.forEach((n, i) => {
    card.append(wrapNode(n, i === 0 && texts.length > 1 ? 'product-teaser-merchant' : 'product-teaser-title'));
  });
  if (ctaNode) {
    const link = ctaNode.matches('a') ? ctaNode : ctaNode.querySelector('a');
    card.href = link.getAttribute('href');
    // EW6: card-as-link — keep the indexed paragraph, unwrap the inner anchor
    link.replaceWith(...link.childNodes);
    ctaNode.classList.remove('button-wrapper');
    const cta = el('div', 'product-teaser-cta');
    const btn = el('div', 'btn variant-tertiary product-teaser-fake-link');
    btn.append(wrapNode(ctaNode, 'btn-inner'));
    cta.append(btn);
    card.append(cta);
  }
  li.append(card);
  return li;
}

function controlButton(dir) {
  const b = el('button', `btn variant-icon-primary color-leafgreen product-teaser-carousel-control-${dir}`, {
    type: 'button',
    'aria-hidden': 'true',
    tabindex: '-1',
  });
  const wrap = el('span', 'btn-icon');
  const icon = el('span', 'ft-icon', { 'aria-hidden': 'true' });
  icon.innerHTML = `<svg><use href="${SPRITE}#${dir === 'previous' ? 'chevron-left' : 'chevron-right'}"></use></svg>`;
  wrap.append(icon);
  b.append(wrap);
  return b;
}

/** Source Carousel behaviour: centre start, item-sized steps, end states, overflow flag. */
function initCarousel(slider, track, prev, next) {
  const items = [...track.children];
  if (!items.length) return;
  let step = 0;
  const setup = () => {
    step = items[0].clientWidth;
    track.scroll({ left: track.scrollWidth / 2 - track.clientWidth / 2 });
    slider.classList.add('is-initialized');
  };
  prev.addEventListener('click', () => track.scrollBy({ left: -step }));
  next.addEventListener('click', () => track.scrollBy({ left: step }));
  items.forEach((item) => item.addEventListener('focusin', ({ target, currentTarget }) => {
    if (target instanceof HTMLElement && target.matches(':focus-visible')) {
      currentTarget.scrollIntoView({ block: 'center', inline: 'center' });
    }
  }));
  const ends = new IntersectionObserver((entries) => {
    entries.forEach(({ target, isIntersecting }) => {
      if (target === items[0]) prev.toggleAttribute('disabled', isIntersecting);
      if (target === items[items.length - 1]) next.toggleAttribute('disabled', isIntersecting);
    });
  }, { root: track, threshold: 1 });
  ends.observe(items[0]);
  ends.observe(items[items.length - 1]);
  // the section is laid out after decorate: centre the track on its first real size
  new ResizeObserver(() => {
    if (!track.clientWidth) return;
    if (!slider.classList.contains('is-initialized')) setup();
    slider.classList.toggle('is-overflowing', track.scrollWidth > track.clientWidth);
  }).observe(track);
}

export default async function decorate(block) {
  const { head, products, actions } = collect(block);

  const wave = el('div', 'wave color-skyblue', { 'aria-hidden': 'true' });
  Object.entries(WAVES).forEach(([size, svg]) => {
    const w = el('div', `wave-${size}`);
    w.innerHTML = svg;
    wave.append(w);
  });

  const content = el('div', 'product-teaser-carousel-content');

  if (head.length) {
    const grid = el('div', 'page-grid product-teaser-carousel-grid');
    head.forEach((n) => {
      grid.append(wrapNode(n, isHeading(n) ? 'product-teaser-carousel-title' : 'product-teaser-carousel-subtitle'));
    });
    content.append(grid);
  }

  const carousel = el('div', 'product-teaser-carousel-carousel');
  const slider = el('div', 'product-teaser-carousel-slider has-controls-on-hover');
  const track = el('ul', 'product-teaser-carousel-list');
  products.forEach((nodes) => track.append(buildProduct(nodes)));
  const controls = el('div', 'product-teaser-carousel-controls');
  const prev = controlButton('previous');
  const next = controlButton('next');
  controls.append(prev, next);
  slider.append(track, controls);
  carousel.append(slider);
  content.append(carousel);

  if (actions.length) {
    const grid = el('div', 'page-grid product-teaser-carousel-grid');
    const wrap = el('div', 'product-teaser-carousel-actions');
    wrap.append(...actions);
    grid.append(wrap);
    content.append(grid);
  }

  block.replaceChildren(wave, content);
  initCarousel(slider, track, prev, next);
}
