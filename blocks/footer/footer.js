import { getChromePath } from '../../scripts/scripts.js';
import { loadFragment } from '../fragment/fragment.js';

/**
 * Fairtrade footer — template-slotted from the replica prototype chrome.
 *
 * Reads the authored footer document (default `/footer`, `/<locale>/footer` under a locale
 * folder, or the page's `footer` metadata). Sections, in order:
 *   1. link lists — repeated `<p>` title + `<ul>` of links (one column each)
 *   2. social     — `<p>` title + `<ul>` of links (icon picked from the link host)
 *   3. newsletter — `<p>` title + `<p>` link
 *   4. labels     — list of `key: value` strings (locale-label, locale-hint)
 * The locale button opens the header's locale dialog (delegated in the header block).
 *
 * @ew-exempt labels — text-as-metadata (`key: value` strings, section 4)
 */

const SPRITE = `${window.hlx?.codeBasePath || ''}/icons/ft-icons.svg`;
const SOCIAL = [
  ['facebook.', 'facebook'],
  ['instagram.', 'instagram'],
  ['linkedin.', 'linkedin'],
  ['tiktok.', 'tiktok'],
  ['youtube.', 'youtube'],
  ['twitter.', 'x'],
  ['x.com', 'x'],
];

function h(tag, cls, ...children) {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  children.flat().forEach((c) => c && el.append(c));
  return el;
}

function icon(name, cls = '') {
  const span = h('span', `ft-icon ${cls}`.trim());
  span.setAttribute('aria-hidden', 'true');
  span.innerHTML = `<svg><use href="${SPRITE}#${name}"></use></svg>`;
  return span;
}

function wrapText(a, cls) {
  const span = h('span', cls);
  span.append(...a.childNodes);
  a.append(span);
}

function readLabels(section) {
  const labels = {};
  section?.querySelectorAll('li, p').forEach((el) => {
    const m = el.textContent.match(/^\s*([a-z0-9-]+)\s*:\s*([\s\S]*?)\s*$/);
    if (!m) return;
    const [, key, value] = m;
    labels[key] = value;
  });
  return labels;
}

function linkItems(ul, itemCls, build) {
  [...ul.children].forEach((li) => {
    li.className = itemCls;
    const a = li.querySelector('a');
    if (!a) return;
    if (a.parentElement !== li) li.append(a);
    [...li.children].forEach((c) => { if (c !== a && !c.textContent.trim()) c.remove(); });
    build(li, a);
  });
}

function buildLinkLists(section) {
  const lists = h('ul', 'ft-footer-link-lists');
  const wrapper = section?.querySelector('.default-content-wrapper') || section;
  let title = null;
  [...(wrapper?.children || [])].forEach((el) => {
    if (el.tagName === 'UL') {
      el.className = 'footer-link-list-list';
      linkItems(el, 'footer-link-list-item', (li, a) => {
        a.className = 'footer-link-list-link';
        li.prepend(icon('chevron-right', 'footer-link-list-item-icon'));
      });
      lists.append(h('li', 'ft-footer-link-list', h('div', 'footer-link-list', title, el)));
      title = null;
    } else if (el.textContent.trim()) {
      el.className = 'footer-link-list-title';
      const a = el.querySelector('a');
      if (a) {
        a.className = 'footer-link-list-title-link';
        el.replaceChildren(icon('chevron-right', 'footer-link-list-title-icon'), a);
      }
      title = el;
    }
  });
  return lists;
}

function buildSocial(section) {
  const wrapper = section?.querySelector('.default-content-wrapper') || section;
  const title = wrapper?.querySelector(':scope > p');
  if (title) title.className = 'footer-social-media-links-title';
  const ul = wrapper?.querySelector('ul') || h('ul');
  ul.className = 'footer-social-media-links-list';
  linkItems(ul, 'footer-social-media-links-item', (li, a) => {
    const host = (a.hostname || a.href || '').toLowerCase();
    const name = (SOCIAL.find(([k]) => host.includes(k)) || [null, 'chevron-right'])[1];
    a.className = 'btn variant-icon-primary color-leafgreen';
    a.target = '_blank';
    a.rel = 'noopener';
    wrapText(a, 'visuallyhidden');
    a.prepend(h('span', 'btn-icon', icon(name)));
  });
  return h('div', 'ft-footer-social', h('div', 'footer-social-media-links', title, ul));
}

function buildNewsletter(section) {
  const wrapper = section?.querySelector('.default-content-wrapper') || section;
  const ps = [...(wrapper?.querySelectorAll(':scope > p') || [])];
  const linkP = ps.find((p) => p.querySelector('a'));
  const title = ps.find((p) => p !== linkP);
  if (title) title.className = 'ft-footer-newsletter-title';
  const a = linkP?.querySelector('a');
  if (a) {
    linkP.className = 'ft-footer-newsletter-link';
    a.className = 'btn ft-footer-newsletter-button variant-secondary color-leafgreen theme-dark';
    a.removeAttribute('title');
    wrapText(a, 'btn-inner');
  }
  return h('div', 'ft-footer-newsletter', title, linkP);
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await loadFragment(getChromePath('footer'));
  const sections = fragment ? [...fragment.querySelectorAll(':scope > .section')] : [];
  const [listsSection, socialSection, newsletterSection, labelSection] = sections;
  const L = readLabels(labelSection);

  const trigger = h(
    'button',
    'locale-selector-trigger color-white',
    icon('globe'),
    h('span', 'locale-selector-trigger-label', L['locale-label'] || ''),
    h('span', 'visuallyhidden', L['locale-hint'] || ''),
  );
  trigger.type = 'button';
  trigger.setAttribute('aria-haspopup', 'dialog');
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', 'locale-selector');

  const grid = h(
    'div',
    'ft-footer-grid page-grid',
    h('div', 'ft-footer-meta', h('div', 'ft-footer-logo'), h('div', 'ft-footer-locale-selector-trigger', trigger)),
    buildLinkLists(listsSection),
    h('div', 'ft-footer-leads', buildSocial(socialSection), buildNewsletter(newsletterSection)),
  );
  block.replaceChildren(h('div', 'ft-footer', grid));
}
