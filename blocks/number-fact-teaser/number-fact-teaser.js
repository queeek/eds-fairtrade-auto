/**
 * number-fact-teaser — NumberFactTeaser: a column of big number facts on a coloured
 * bubble (a scroll-snap slider with prev/next below 768px) beside a sticky text panel.
 * Schema: stardust/eds-schema/en.json § NumberFactTeaser (2 × NumberFactTeaser--item).
 * Decode tier: reconstructive (authors add/remove facts).
 *
 * Authoring rows (classified by content):
 *   fact rows   one row per fact: <p> number, <p> fact text (one cell, or two cells)
 *   text row    the row holding the heading: <p><strong>eyebrow</strong></p>, <h2>, text <p>,
 *               CTA <p><em><a></a></em></p> (secondary outline pill)
 * A section head authored as default content right before the block is reabsorbed (EW8).
 *
 * @variants block: flower | eggplant | skyblue | leafgreen (default flower) — bubble colour
 * Generated slider buttons carry no text (aria-label only) — decorate adds no words (#100).
 */

const SPRITE = `${window.hlx?.codeBasePath || ''}/icons/ft-icons.svg`;
const COLORS = ['flower', 'eggplant', 'skyblue', 'leafgreen'];
const BUBBLE = '<svg viewBox="0 0 613 612" fill="none" preserveAspectRatio="none" aria-hidden="true">'
  + '<path d="M14.1082 290.5C40.7449 193.681 94.4564 111.976 147.182 61.5808C201.266 10.5752 '
  + '254.364 -9.12045 311.194 3.89536C367.813 16.9369 422.737 56.6462 476.236 103.181C528.604 '
  + '150.705 579.547 205.047 602.152 270.409C624.706 335.325 610.69 404.384 557.162 468.001C504.801 '
  + '530.613 412.92 587.8 306.68 606.017C200.674 624.99 106.15 597.901 53.5555 538.058C-0.440844 '
  + '478.842 -12.5139 386.872 14.1082 290.5Z" fill="currentColor"></path></svg>';

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
const isCta = (n) => {
  const a = n.querySelector('a');
  return !!a && n.textContent.trim() === a.textContent.trim();
};

/** Authored elements of a row, in order, across its cells. */
function rowNodes(row) {
  return [...row.children].flatMap((cell) => {
    if (cell.children.length) return [...cell.children];
    if (!cell.textContent.trim()) return [];
    // HARNESS-ONLY fallback (EW5): bare text in a cell — move the text nodes into a <p>
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    return [p];
  });
}

function sliderButton(dir, label) {
  const b = el('button', `btn variant-icon-primary color-skyblue number-fact-teaser-slider-${dir}`, {
    type: 'button',
    'aria-label': label,
  });
  const wrap = el('span', 'btn-icon');
  wrap.innerHTML = `<span class="ft-icon" aria-hidden="true"><svg><use href="${SPRITE}#chevron-${dir === 'prev' ? 'left' : 'right'}"></use></svg></span>`;
  b.append(wrap);
  return b;
}

function buildPanel(nodes) {
  const content = el('div', 'number-fact-teaser-content');
  let seenHeading = false;
  nodes.forEach((n) => {
    if (isHeading(n)) {
      seenHeading = true;
      content.append(wrapNode(n, 'number-fact-teaser-title'));
    } else if (isCta(n)) {
      content.append(wrapNode(n, 'number-fact-teaser-cta'));
    } else if (!seenHeading) {
      content.append(wrapNode(n, 'number-fact-teaser-label'));
    } else {
      content.append(wrapNode(n, 'number-fact-teaser-text'));
    }
  });
  return content;
}

export default async function decorate(block) {
  const color = COLORS.find((c) => block.classList.contains(c)) || 'flower';
  const rows = [...block.children];

  const factRows = [];
  let panelNodes = [];
  rows.forEach((row) => {
    const nodes = rowNodes(row);
    if (!nodes.length) return;
    if (nodes.some(isHeading) || nodes.some(isCta)) panelNodes.push(...nodes);
    else factRows.push(nodes);
  });

  // EW8: a head authored as default content right before the block joins the panel
  const prevWrapper = block.parentElement?.previousElementSibling;
  if (!panelNodes.length && prevWrapper?.classList.contains('default-content-wrapper')) {
    panelNodes = [...prevWrapper.children];
    prevWrapper.remove();
  }

  const grid = el('div', 'number-fact-teaser-grid page-grid');
  const slider = el('div', 'number-fact-teaser-slider');
  const list = el('ul', 'number-fact-teaser-items');
  factRows.forEach((nodes) => {
    const li = el('li', 'number-fact-teaser-item');
    const fact = el('div', `number-fact color-${color}`);
    const bubble = el('div', `bubble number-fact-bubble color-${color}`);
    bubble.innerHTML = BUBBLE;
    const body = el('div', 'number-fact-content');
    const [number, ...rest] = nodes;
    body.append(wrapNode(number, 'number-fact-number'));
    if (rest.length) {
      const text = el('div', 'number-fact-fact');
      text.append(...rest);
      body.append(text);
    }
    fact.append(bubble, body);
    li.append(fact);
    list.append(li);
  });
  slider.append(list);

  let prev = null;
  let next = null;
  if (factRows.length > 1) {
    prev = sliderButton('prev', 'Go to the previous fact');
    next = sliderButton('next', 'Go to the next fact');
    slider.append(prev, next);
  }
  grid.append(slider);
  if (panelNodes.length) grid.append(buildPanel(panelNodes));
  block.replaceChildren(grid);

  if (!prev) return;
  const step = () => list.clientWidth + parseFloat(getComputedStyle(list).columnGap || 0);
  const sync = () => {
    prev.disabled = list.scrollLeft <= 2;
    next.disabled = list.scrollLeft >= list.scrollWidth - list.clientWidth - 2;
  };
  prev.addEventListener('click', () => list.scrollBy({ left: -step() }));
  next.addEventListener('click', () => list.scrollBy({ left: step() }));
  list.addEventListener('scroll', sync, { passive: true });
  prev.disabled = true;
}
