/**
 * page-lead — PageLead: a coloured band with the page title (h1) and a lead paragraph,
 * centred in the page grid. Used by the static, listing and article templates.
 * Schema: stardust/eds-schema/us-en-about.json § PageLead.
 * Decode tier: template-slotted (fixed composition; authored nodes are moved into slots).
 *
 * Authoring (one row, any cell split; content is classified, never indexed):
 *   optional short <p> before the heading = eyebrow · <h1> title · <p>s after it = lead
 *   (lists and link paragraphs after the heading stay in the lead, in order) · a button
 *   paragraph after the heading (authored <strong><a>, decorated p.button-wrapper) = CTA,
 *   rendered below the lead (PageLead--cta). No button paragraph → no CTA slot.
 * Missing cells are tolerated: no heading → lead only; no lead → title only.
 * Optional lead image (article template): a picture anywhere in the block — 1st = desktop
 *   (21:9, ≥ 768px), 2nd = mobile (4:3, < 768px); one picture shows at every width. It renders
 *   below the band on the source's band-colour → white gradient. No picture → no image row.
 *
 * @variants block: skyblue | nightsky | white (default leafgreen) — band colour;
 *   no-gap — no bottom spacing below the block (the band's grid carries it instead)
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
/** the picture of a media-only node (a <picture>, or a <p> holding only a picture) */
const mediaOf = (n) => {
  const media = n.matches('picture, img') ? n : n.querySelector('picture, img');
  if (!media || n.textContent.trim()) return null;
  return media.closest('picture') || media;
};

/** a paragraph holding only one link: decorated button, or an authored <strong>/<em> link */
const isCta = (n) => {
  if (n.tagName !== 'P' || n.children.length !== 1) return false;
  if (n.classList.contains('button-wrapper')) return true;
  const a = n.querySelector(':scope > :is(strong, em) > a, :scope > em > strong > a');
  return !!a && a.textContent.trim() === n.textContent.trim();
};

function cellNodes(cell) {
  if (cell.children.length) return [...cell.children];
  if (!cell.textContent.trim()) return [];
  // HARNESS-ONLY fallback (EW5): bare text in a cell — move the text nodes into a <p>
  const p = document.createElement('p');
  p.append(...cell.childNodes);
  return [p];
}

export default async function decorate(block) {
  const all = [...block.children].flatMap((row) => [...row.children].flatMap(cellNodes));
  const pictures = all.map(mediaOf).filter(Boolean);
  const nodes = all.filter((n) => !mediaOf(n));
  const headingIndex = nodes.findIndex(isHeading);

  const grid = el('div', 'page-lead-grid page-grid');
  let lead = null;
  let cta = null;
  nodes.forEach((n, i) => {
    if (i > headingIndex && headingIndex >= 0 && isCta(n)) {
      if (!cta) cta = el('div', 'page-lead-cta');
      cta.append(n);
    } else if (i === headingIndex) {
      const title = el('div', 'page-lead-title');
      title.append(n);
      grid.append(title);
    } else if (headingIndex > i) {
      const eyebrow = el('div', 'page-lead-eyebrow');
      eyebrow.append(n);
      grid.append(eyebrow);
    } else {
      if (!lead) {
        lead = el('div', 'page-lead-lead');
        grid.append(lead);
      }
      lead.append(n);
    }
  });

  if (cta) grid.append(cta);

  const content = el('div', 'page-lead-content');
  content.append(grid);
  if (!pictures.length) {
    block.replaceChildren(content);
    return;
  }

  const imageGrid = el('div', 'page-lead-image-grid page-grid');
  pictures.slice(0, 2).forEach((pic, i) => {
    let kind = 'ultra-wide';
    if (pictures.length > 1) kind = i ? 'rectangular mobile' : 'ultra-wide desktop';
    const box = el('div', `ft-image page-lead-image-box ${kind}`);
    box.append(pic);
    imageGrid.append(box);
  });
  const image = el('div', 'page-lead-image');
  image.append(imageGrid);
  block.replaceChildren(content, image);
}
