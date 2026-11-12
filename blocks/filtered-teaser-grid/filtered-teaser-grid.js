/**
 * filtered-teaser-grid — FilteredTeaserGrid news listing: a TeaserGrid of InfoTeaser cards
 * (whole card is one link) followed by a "Load more" CTASection.
 * Schema: stardust/eds-schema/us-en-news.json § FilteredTeaserGrid (18 × TeaserGrid--item).
 * Decode tier: reconstructive (authors add/remove cards).
 * Dynamics row 8 (news-listing, static-snapshot): every card is an authored row; the first
 * 18 show, "Load more" reveals the next 6 authored rows client-side (source: +6 per click from
 * its data island, inside a root view transition) and hides itself when none are left.
 * The source's filter select wrapper is empty on this page, so no filter UI is rendered.
 *
 * Authoring rows (one per card; cells classified by content, any split across cells):
 *   <picture> image · <p> tag (date, before the heading) ·
 *   <h3><strong>pretitle</strong> title</h3> · <p> text · <p><a href>label</a></p> (card link)
 * Optional last row without heading/picture: its text is the "Load more" label (EW5).
 *
 * @variants block: small (3-up ≥1024) | (default 2/3-up)
 */

const INITIAL = 18;
const PAGE = 6;

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
  // runtime wrapTextNodes folds a media-led cell into one <p>: expand it back
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

function collectCards(rows) {
  const perRow = rows.map((row) => [...row.children].flatMap(cellNodes));
  if (perRow.length !== 1 || perRow[0].filter(isHeading).length < 2) {
    return perRow.filter((n) => n.length);
  }
  // flattened: one card per heading; media/tag seen before the heading open that card,
  // the card's link-only paragraph closes it
  const cards = [];
  let pending = [];
  let current = null;
  let closed = true;
  perRow[0].forEach((n) => {
    if (isHeading(n)) {
      current = [...pending, n];
      pending = [];
      closed = false;
      cards.push(current);
    } else if (!closed && !isMedia(n)) {
      current.push(n);
      closed = isLinkOnly(n);
    } else {
      pending.push(n);
    }
  });
  if (pending.length && current) current.push(...pending);
  return cards;
}

function buildCard(nodes) {
  const li = el('li', 'teaser-grid-item');
  const card = el('a', 'info-teaser');
  const inner = el('div', 'info-teaser-inner');
  const image = el('div', 'info-teaser-image');
  const tags = el('div', 'info-teaser-tags');
  const content = el('div', 'info-teaser-content');
  let seenHeading = false;
  let ctaNode = null;

  nodes.forEach((n) => {
    if (isMedia(n)) {
      const pic = n.matches('picture, img') ? n : n.querySelector('picture') || n.querySelector('img');
      image.append(wrapNode(pic.closest('picture') || pic, 'ft-image rectangular'));
    } else if (isHeading(n)) {
      seenHeading = true;
      // presentation refinement (EW2): the title text after the pretitle <strong> gets a
      // span so it lays out as its own block; the heading's textContent is unchanged
      const strong = n.querySelector('strong');
      if (strong && strong.parentElement === n) {
        const rest = [];
        for (let x = strong.nextSibling; x; x = x.nextSibling) rest.push(x);
        if (rest.some((x) => x.textContent.trim())) {
          const span = el('span', 'info-teaser-title');
          span.append(...rest);
          n.append(span);
        }
      }
      content.append(wrapNode(n, 'info-teaser-header'));
    } else if (isLinkOnly(n) && !ctaNode) {
      ctaNode = n;
    } else if (!seenHeading) {
      tags.append(wrapNode(n, 'tag gray'));
    } else {
      content.append(wrapNode(n, 'info-teaser-text'));
    }
  });

  if (ctaNode) {
    const link = ctaNode.matches('a') ? ctaNode : ctaNode.querySelector('a');
    card.href = link.getAttribute('href');
    if (link.title && link.title !== link.textContent) card.title = link.title;
    // EW6: card-as-link — keep the indexed paragraph, unwrap the inner anchor
    link.replaceWith(...link.childNodes);
    ctaNode.classList.remove('button-wrapper');
    const cta = el('div', 'btn info-teaser-cta variant-tertiary');
    cta.append(wrapNode(ctaNode, 'btn-inner'));
    content.append(cta);
  }

  if (image.children.length) inner.append(image);
  if (tags.children.length) inner.append(tags);
  inner.append(content);
  card.append(inner);
  li.append(card);
  return li;
}

/* the trailing label row: no heading, no media, no link — its paragraph is the button label */
function takeLabelRow(rows) {
  const last = rows[rows.length - 1];
  if (!last || rows.length < 2) return null;
  if (last.querySelector('h1, h2, h3, h4, h5, h6, picture, img, a')) return null;
  if (!last.textContent.trim()) return null;
  rows.pop();
  return last;
}

export default async function decorate(block) {
  const rows = [...block.children];
  const labelRow = takeLabelRow(rows);
  const cards = collectCards(rows);

  const wrap = el('div', 'teaser-grid-inner');
  const list = el('ul', 'teaser-grid-grid');
  const items = cards.map(buildCard);
  items.forEach((li, i) => {
    if (i >= INITIAL) li.classList.add('is-hidden');
    list.append(li);
  });
  wrap.append(list);

  const children = [wrap];
  if (items.length > INITIAL) {
    const section = el('div', 'cta-section');
    const btn = el('button', 'btn variant-secondary color-skyblue', { type: 'button' });
    const label = el('span', 'btn-inner');
    // EW1: MOVE the authored label paragraph into the button (bare cell text → wrapped)
    let labelNode = labelRow && labelRow.querySelector('p');
    if (!labelNode && labelRow) {
      // HARNESS-ONLY fallback (EW5)
      labelNode = document.createElement('p');
      labelNode.append(...labelRow.querySelector('div > div').childNodes);
    }
    if (labelNode) label.append(labelNode);
    else label.textContent = 'Load more';
    btn.append(label);
    section.append(btn);
    children.push(section);

    let next = INITIAL;
    const sync = () => section.classList.toggle('is-hidden', next >= items.length);
    const reveal = () => {
      items.slice(next, next + PAGE).forEach((li) => li.classList.remove('is-hidden'));
      next = Math.min(next + PAGE, items.length);
      sync();
    };
    btn.addEventListener('click', () => {
      if (document.startViewTransition) document.startViewTransition(reveal);
      else reveal();
    });
    sync();
  }

  block.replaceChildren(...children);
}
