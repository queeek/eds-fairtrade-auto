/* eslint-disable */
/* global WebImporter */

/**
 * breadcrumbs parser (Fairtrade nav.Breadcrumbs -> EDS breadcrumbs block).
 *
 * Block contract (blocks/breadcrumbs/breadcrumbs.js): one cell holding a list,
 * one item per step, home first, current page last; linked item = <a href>,
 * plain-text item = label step.
 *
 * Source: nav.Breadcrumbs > .Breadcrumbs--desktop > ol.Breadcrumbs--list >
 * li.Breadcrumbs--breadcrumb (a.Breadcrumbs--breadcrumb--link | span.Breadcrumbs--breadcrumb--title).
 * The mobile duplicate (.Breadcrumbs--mobile) is ignored. The source trail
 * omits the current page, so the page title (page-lead h1, else document title)
 * is appended as the final plain-text step.
 */
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();

export default function parse(element, { document }) {
  const nav = element.matches('nav.Breadcrumbs') ? element : (element.querySelector('nav.Breadcrumbs') || element);
  const scope = nav.querySelector('.Breadcrumbs--desktop') || nav;

  let items = Array.from(scope.querySelectorAll('li.Breadcrumbs--breadcrumb'));
  if (!items.length) items = Array.from(scope.querySelectorAll('li'));
  items = items.filter((li) => !li.closest('.Breadcrumbs--mobile'));

  const ul = document.createElement('ul');
  const labels = [];
  items.forEach((li) => {
    const link = li.querySelector('a[href]');
    const label = clean(link ? link.textContent : (li.querySelector('.Breadcrumbs--breadcrumb--title') || li).textContent);
    if (!label) return;
    const item = document.createElement('li');
    if (link) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = label;
      item.append(a);
    } else {
      item.textContent = label;
    }
    labels.push(label.toLowerCase());
    ul.append(item);
  });

  // Current page (not in the source trail) as the final plain-text step.
  const h1 = document.querySelector('.PageLead--title, .PageLead h1, main h1, h1');
  const title = clean(h1 ? h1.textContent : document.title);
  if (title && labels[labels.length - 1] !== title.toLowerCase()) {
    const current = document.createElement('li');
    current.textContent = title;
    ul.append(current);
  }

  if (!ul.children.length) {
    element.remove();
    return;
  }

  const cells = [[ul]];
  const block = WebImporter.Blocks.createBlock(document, { name: 'breadcrumbs', cells });
  element.replaceWith(block);
}
