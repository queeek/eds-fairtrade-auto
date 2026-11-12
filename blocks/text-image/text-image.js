/**
 * text-image — TextImage: heading, text and CTA beside a square image; optional grey
 * panel with a wave edge on top, optional reversed order (image left from 768px).
 * Schema: stardust/eds-schema/en.json § TextImage--wrapper (×2).
 * Decode tier: template-slotted (fixed composition; authored nodes are moved into slots).
 *
 * Authoring (one row; cells classified by content, any split):
 *   <h2> title · text <p>s (each paragraph renders with a blank line between) ·
 *   CTA <p><strong><a></a></strong></p> (primary pill) · <picture> image
 *
 * @variants block: grey (grey panel + wave) | reverse (image first) — combinable
 */

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

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function wrapNode(node, className) {
  const w = el('div', className);
  w.append(node);
  return w;
}

const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
const isMedia = (n) => n.matches('picture, img') || !!n.querySelector('picture, img');
const isCta = (n) => {
  const a = n.querySelector('a');
  return !!a && n.textContent.trim() === a.textContent.trim();
};

function cellNodes(cell) {
  let kids = [...cell.children];
  // #104 — runtime wrapTextNodes folds a media-led cell into one <p>: expand it back
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].filter((n) => n.nodeType === 1 || n.textContent.trim())
      .map((n) => {
        if (n.nodeType === 1) return n;
        // HARNESS-ONLY fallback (EW5): move bare text into a <p>
        const p = document.createElement('p');
        p.append(n);
        return p;
      });
  }
  if (!kids.length && cell.textContent.trim()) {
    // HARNESS-ONLY fallback (EW5)
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    kids = [p];
  }
  return kids;
}

export default async function decorate(block) {
  const nodes = [...block.children].flatMap((row) => [...row.children].flatMap(cellNodes));

  const content = el('div', 'text-image-content');
  const image = el('div', 'text-image-image');
  let text = null;
  const ctas = [];
  nodes.forEach((n) => {
    if (isMedia(n) && !n.textContent.trim()) {
      const pic = n.matches('picture, img') ? n : n.querySelector('picture') || n.querySelector('img');
      if (!image.children.length) image.append(wrapNode(pic.closest('picture') || pic, 'ft-image square'));
    } else if (isHeading(n)) {
      content.append(wrapNode(n, 'text-image-title'));
    } else if (isCta(n)) {
      ctas.push(n);
    } else {
      if (!text) {
        text = el('div', 'text-image-text');
        content.append(text);
      }
      text.append(n);
    }
  });
  if (ctas.length) {
    const actions = el('div', 'text-image-cta');
    actions.append(...ctas);
    content.append(actions);
  }

  const panel = el('div', 'text-image-panel');
  const grid = el('div', 'text-image-grid page-grid');
  const inner = el('div', 'text-image-inner');
  inner.append(content);
  if (image.children.length) inner.append(image);
  grid.append(inner);
  panel.append(grid);

  const parts = [];
  if (block.classList.contains('grey')) {
    const wave = el('div', 'wave color-monochrome-100');
    wave.setAttribute('aria-hidden', 'true');
    Object.entries(WAVES).forEach(([size, svg]) => {
      const w = el('div', `wave-${size}`);
      w.innerHTML = svg;
      wave.append(w);
    });
    parts.push(wave);
  }
  parts.push(panel);
  block.replaceChildren(...parts);
}
