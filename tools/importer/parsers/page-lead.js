/* eslint-disable */
/* global WebImporter */

/**
 * page-lead parser (Fairtrade div.PageLead -> EDS page-lead block, default leafgreen).
 *
 * Block contract (blocks/page-lead/page-lead.js): one row, content classified:
 *   <h1> title · lists/paragraphs after it = lead · 1st picture = desktop (21:9),
 *   2nd picture = mobile (4:3).
 * Output mirrors the authored example (child-protection): one row, a text cell
 * (h1 + tags list) and, when images exist, a media cell (desktop then mobile).
 *
 * Source: .PageLead--title (h1), ul.PageLead--tags > li.PageLead--tag (date, category),
 * .PageLead--imageDesktop (Image ultra-wide) / .PageLead--imageMobile (Image rectangular).
 * Lazy images: real URL from data-src / data-srcset / srcset / <source srcset>
 * (largest candidate), else src; data: placeholders are never emitted.
 */
const clean = (s) => (s || '').replace(/\s+/g, ' ').trim();
// data: placeholders (lazy GIFs) and blob: URLs (in-browser copies the importer makes) are never
// real image addresses.
const PLACEHOLDER = /^(data|blob):/i;

function largest(srcset) {
  if (!srcset) return null;
  let best = null;
  let bestSize = -1;
  srcset.split(',').forEach((c) => {
    const [url, d = '1x'] = c.trim().split(/\s+/);
    if (!url || PLACEHOLDER.test(url)) return;
    const n = parseFloat(d) || 0;
    const size = /x$/i.test(d) ? n * 1000 : n;
    if (size > bestSize) { bestSize = size; best = url; }
  });
  return best;
}

function realSrc(img) {
  const src = img.getAttribute('src') || '';
  if (src && !PLACEHOLDER.test(src)) return src;
  let url = img.getAttribute('data-src')
    || largest(img.getAttribute('data-srcset'))
    || largest(img.getAttribute('srcset'));
  const picture = img.closest('picture');
  if (!url && picture) {
    Array.from(picture.querySelectorAll('source')).some((s) => {
      url = largest(s.getAttribute('data-srcset')) || largest(s.getAttribute('srcset'));
      return !!url;
    });
  }
  return url || null;
}

function imageFrom(wrapper, document) {
  if (!wrapper) return null;
  const img = wrapper.matches('img') ? wrapper : wrapper.querySelector('img');
  if (!img) return null;
  const src = realSrc(img);
  if (!src) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = clean(img.getAttribute('alt'));
  const p = document.createElement('p');
  p.append(out);
  return p;
}

export default function parse(element, { document }) {
  const lead = element.matches('.PageLead') ? element : (element.querySelector('.PageLead') || element);
  const text = [];

  const h1src = lead.querySelector('.PageLead--title') || lead.querySelector('h1');
  const title = clean(h1src && h1src.textContent);
  if (title) {
    const h1 = document.createElement('h1');
    h1.textContent = title;
    text.push(h1);
  }

  const tags = Array.from(lead.querySelectorAll('ul.PageLead--tags > li'))
    .map((li) => clean(li.textContent)).filter(Boolean);
  if (tags.length) {
    const ul = document.createElement('ul');
    tags.forEach((t) => {
      const li = document.createElement('li');
      li.textContent = t;
      ul.append(li);
    });
    text.push(ul);
  }

  const media = [
    imageFrom(lead.querySelector('.PageLead--imageDesktop, .Image.ultra-wide'), document),
    imageFrom(lead.querySelector('.PageLead--imageMobile, .Image.rectangular'), document),
  ].filter(Boolean);

  const row = media.length ? [text, media] : [text];
  const cells = [row];
  const block = WebImporter.Blocks.createBlock(document, { name: 'page-lead', cells });
  element.replaceWith(block);
}
