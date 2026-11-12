/**
 * accordion — AccordionSection: a list of collapsible items (question header with a
 * round chevron button; answer text plus tertiary links), height-animated open/close.
 * Schema: stardust/eds-schema/en.json § AccordionSection (4 × AccordionSection--item).
 * Decode tier: reconstructive (authors add/remove items).
 *
 * Authoring: one row per item — cell 1 the question (<h3>), cell 2 the answer (<p>s;
 * a paragraph that is only a link renders as a tertiary link). The section title is
 * default content before the block (styled in place via .accordion-container).
 * A row without a second cell takes everything after its heading as the answer.
 *
 * EW7: the toggle is a separate <button> holding only a visually hidden copy of the
 * question (source parity); the authored heading stays editable in a sibling div.
 * @ew-exempt toggle label — visually hidden presentational copy of the question
 */

const SPRITE = `${window.hlx?.codeBasePath || ''}/icons/ft-icons.svg`;
let uid = 0;

function el(tag, className, attrs = {}) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
}

const isHeading = (n) => /^H[1-6]$/.test(n.tagName);
const isLinkOnly = (n) => {
  const a = n.querySelector('a');
  return !!a && n.textContent.trim() === a.textContent.trim();
};

function cellNodes(cell) {
  if (cell.children.length) return [...cell.children];
  if (!cell.textContent.trim()) return [];
  // HARNESS-ONLY fallback (EW5): bare text in a cell — move the text nodes into a <p>
  const p = document.createElement('p');
  p.append(...cell.childNodes);
  return [p];
}

function buildItem(row) {
  const cells = [...row.children];
  let titleNodes = cellNodes(cells[0] || row);
  let bodyNodes = cells.slice(1).flatMap(cellNodes);
  if (cells.length < 2) {
    const all = titleNodes;
    const h = all.findIndex(isHeading);
    titleNodes = all.slice(0, h + 1);
    bodyNodes = all.slice(h + 1);
  }
  if (!titleNodes.length) return null;

  uid += 1;
  const id = `accordion-${uid}`;
  const item = el('li', 'accordion-item');
  const entry = el('div', 'accordion-entry');
  const header = el('div', 'accordion-header');
  const title = el('div', 'accordion-title', { id: `${id}-title` });
  title.append(...titleNodes);
  const toggle = el('button', 'accordion-toggle', {
    type: 'button',
    'aria-expanded': 'false',
    'aria-controls': `${id}-body`,
  });
  // source parity: the toggle carries the question as visually hidden text (a
  // presentational copy, not indexed — the editable heading is the sibling title)
  const label = el('span', 'visuallyhidden');
  label.textContent = title.textContent.trim();
  toggle.append(label);
  const chevron = el('div', 'btn accordion-button variant-icon-primary color-skyblue size-small', {
    'aria-hidden': 'true',
  });
  chevron.innerHTML = `<span class="btn-icon"><span class="ft-icon"><svg><use href="${SPRITE}#chevron-down"></use></svg></span></span>`;
  header.append(toggle, chevron, title);

  const panel = el('div', 'accordion-content', { id: `${id}-body`, role: 'region' });
  panel.setAttribute('aria-labelledby', `${id}-title`);
  const wrapper = el('div', 'accordion-content-wrapper');
  const box = el('div', 'accordion-content-padding-box');
  let text = null;
  let links = null;
  bodyNodes.forEach((n) => {
    if (n.tagName === 'P' && isLinkOnly(n)) {
      if (!links) {
        links = el('div', 'accordion-links');
        box.append(links);
      }
      links.append(n);
    } else {
      if (!text || links) {
        text = el('div', 'accordion-text');
        box.append(text);
        links = null;
      }
      text.append(n);
    }
  });
  wrapper.append(box);
  panel.append(wrapper);

  toggle.addEventListener('click', () => {
    const open = !entry.classList.contains('is-open');
    entry.classList.toggle('is-open', open);
    toggle.setAttribute('aria-expanded', String(open));
  });

  entry.append(header, panel);
  item.append(entry);
  return item;
}

export default async function decorate(block) {
  const list = el('ul', 'accordion-list');
  [...block.children].forEach((row) => {
    const item = buildItem(row);
    if (item) list.append(item);
  });
  const grid = el('div', 'accordion-grid page-grid');
  grid.append(list);
  block.replaceChildren(grid);
}
