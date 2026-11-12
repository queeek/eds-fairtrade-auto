/**
 * breadcrumbs — Breadcrumbs: the trail above the page lead (article template). Desktop shows
 * every step with chevrons; below 1024px only the parent step shows, behind a back chevron.
 * Source: stardust/prototypes/us-en-why-fairtrade-why-we-do-it-child-protection.css
 * § Breadcrumbs (the source renders it in <header>, absolute under the Topbar).
 * Decode tier: template-slotted (fixed composition; authored nodes are moved into slots).
 *
 * Authoring (one cell): a list, one item per step, home first, current page last.
 *   linked item = link step · plain-text item = label step (a folder without its own page).
 *   Rows / paragraphs instead of a list are accepted (one step each).
 * The parent step (mobile) = the last linked step before the current page.
 *
 * @variants block: dark (light text on nightsky; automatic on a nightsky page-lead page)
 * Generated chevrons carry no text (aria-hidden) — decorate adds no words. The mobile parent
 * link is a presentational clone of the authored one (EW4: instrumentation stripped; the
 * authored link in the trail stays the editable one).
 */

const SPRITE = `${window.hlx?.codeBasePath || ''}/icons/ft-icons.svg`;

function el(tag, className, attrs = {}) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v));
  return n;
}

function stripInstrumentation(node) {
  node.querySelectorAll('[data-prose-index], [data-image-index]').forEach((n) => {
    n.removeAttribute('data-prose-index');
    n.removeAttribute('data-image-index');
  });
  node.removeAttribute('data-prose-index');
  return node;
}

function icon(name, extra) {
  const span = el('span', `ft-icon breadcrumbs-icon ${extra}`, { 'aria-hidden': 'true' });
  span.innerHTML = `<svg><use href="${SPRITE}#${name}"></use></svg>`;
  return span;
}

/**
 * The authored list (kept and decorated in place), or — rows / paragraphs authored instead
 * of a list — a new list whose items take the moved paragraphs' content.
 */
function stepList(block) {
  const authored = block.querySelector('ul, ol');
  if (authored) return authored;
  const list = el('ul');
  [...block.children].flatMap((row) => [...row.children]).forEach((cell) => {
    const nodes = cell.children.length ? [...cell.children] : [cell];
    nodes.filter((n) => n.textContent.trim()).forEach((n) => {
      const li = el('li');
      li.append(...n.childNodes);
      list.append(li);
    });
  });
  return list;
}

export default async function decorate(block) {
  const list = stepList(block);
  list.className = 'breadcrumbs-list';
  const items = [...list.children].filter((li) => li.tagName === 'LI');

  items.forEach((li, i) => {
    li.className = 'breadcrumbs-step';
    const link = li.querySelector('a');
    if (link) {
      link.className = 'breadcrumbs-link';
    } else {
      const label = el('span', 'breadcrumbs-title');
      label.append(...li.childNodes);
      li.append(label);
    }
    if (i < items.length - 1) li.append(icon('chevron-right', 'is-next'));
  });

  items[items.length - 1]?.querySelector('a')?.setAttribute('aria-current', 'page');

  const desktop = el('div', 'breadcrumbs-desktop');
  desktop.append(list);
  const nav = el('nav', 'breadcrumbs-nav', { 'aria-label': 'Breadcrumb' });
  nav.append(desktop);

  // below 1024px: back chevron + the parent step (last linked step before the current page)
  const parent = items.slice(0, -1).reverse().map((li) => li.querySelector('a')).find(Boolean);
  if (parent) {
    const mobile = el('div', 'breadcrumbs-mobile');
    const back = stripInstrumentation(parent.cloneNode(true));
    back.removeAttribute('aria-current');
    mobile.append(icon('chevron-left', 'is-back'), back);
    nav.append(mobile);
  }
  block.replaceChildren(nav);
}
