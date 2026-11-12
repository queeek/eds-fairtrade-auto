/* eslint-disable */
/* global WebImporter */

/**
 * Fairtrade sections transformer.
 *
 * Uses payload.template.sections. In beforeTransform (while parser targets
 * still exist) inserts an <hr> section break before every non-first section.
 * Styled sections get a temporary data-excat-section-id marker on their <hr>
 * (a styled first section gets a temporary marked <hr> too). In afterTransform
 * a Section Metadata block is added for styled sections, markers are removed,
 * and the first section's temporary <hr> is dropped.
 *
 * For the get-involved template both sections have style null, so this only
 * yields the break between section-1 (breadcrumbs + page-lead) and section-2
 * (article body). The breadcrumbs are moved before div.page-lead by the
 * cleanup transformer, so they stay in section-1.
 */

const MARKER = 'data-excat-section-id';

function findSectionElement(root, section) {
  const selectors = Array.isArray(section.selector) ? section.selector : [section.selector];
  for (let i = 0; i < selectors.length; i += 1) {
    const sel = selectors[i];
    if (sel) {
      try {
        const el = root.querySelector(sel);
        if (el) return el;
      } catch (e) {
        // invalid selector, try next
      }
    }
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const template = payload && payload.template;
  const sections = template && Array.isArray(template.sections) ? template.sections : [];
  if (sections.length < 2) return;
  const doc = element.ownerDocument || (payload && payload.document) || document;

  if (hookName === 'beforeTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      const el = findSectionElement(element, section);
      if (el && el.parentElement) {
        // section-1 starts with the relocated breadcrumbs, keep them inside it
        let anchor = el;
        if (i === 0) {
          const prev = el.previousElementSibling;
          if (prev && prev.matches('div.breadcrumb')) anchor = prev;
        }
        if (i > 0 || section.style) {
          const hr = doc.createElement('hr');
          if (section.style) hr.setAttribute(MARKER, section.id);
          if (i === 0) hr.setAttribute('data-excat-first', 'true');
          anchor.parentElement.insertBefore(hr, anchor);
        }
      }
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (section.style) {
        const marker = element.querySelector(`hr[${MARKER}="${section.id}"]`);
        const metadata = WebImporter.Blocks.createBlock(doc, {
          name: 'Section Metadata',
          cells: { style: section.style },
        });
        if (marker) {
          // place metadata at the end of the section: before the next <hr> or at end
          let cursor = marker.nextElementSibling;
          let last = marker;
          while (cursor && cursor.tagName !== 'HR') {
            last = cursor;
            cursor = cursor.nextElementSibling;
          }
          last.after(metadata);
        } else {
          const el = findSectionElement(element, section);
          if (el) el.after(metadata);
        }
      }
    }
    element.querySelectorAll(`hr[${MARKER}]`).forEach((hr) => hr.removeAttribute(MARKER));
    element.querySelectorAll('hr[data-excat-first]').forEach((hr) => hr.remove());
  }
}
