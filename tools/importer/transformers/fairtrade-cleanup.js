/* eslint-disable */
/* global WebImporter */

/**
 * Fairtrade cleanup transformer.
 *
 * beforeTransform (runs before parsers, affects block matching):
 *  - moves the breadcrumb trail (div.breadcrumb, which lives in the header
 *    experience fragment) into <main>, directly before div.page-lead, so the
 *    breadcrumbs parser finds it at the top of section-1
 *  - removes global header/topbar, footer, consent root, svg sprite, scripts
 *  - resolves lazy-loaded images (placeholder GIF src -> real URL from
 *    data-src / data-srcset / srcset largest candidate)
 *  - drops empty (&nbsp;/whitespace-only) paragraphs and empty anchors in
 *    the article body (div.Richtext)
 *
 * afterTransform (final cleanup):
 *  - removes any leftover non-authorable chrome and tracking attributes.
 *    HTML comments are intentionally left untouched.
 */

const PLACEHOLDER_SRC = /^(data:image\/(gif|svg\+xml)|blob:)/i;

function largestFromSrcset(srcset) {
  if (!srcset) return null;
  let best = null;
  let bestSize = -1;
  srcset.split(',').forEach((candidate) => {
    const parts = candidate.trim().split(/\s+/);
    const url = parts[0];
    if (!url || PLACEHOLDER_SRC.test(url)) return;
    const descriptor = parts[1] || '1x';
    const size = parseFloat(descriptor) || 0;
    const weighted = /x$/i.test(descriptor) ? size * 1000 : size;
    if (weighted > bestSize) {
      bestSize = weighted;
      best = url;
    }
  });
  return best;
}

function resolveLazyImages(root) {
  root.querySelectorAll('img').forEach((img) => {
    const src = img.getAttribute('src') || '';
    if (src && !PLACEHOLDER_SRC.test(src)) return;
    const picture = img.closest('picture');
    let real = img.getAttribute('data-src')
      || largestFromSrcset(img.getAttribute('data-srcset'))
      || largestFromSrcset(img.getAttribute('srcset'));
    if (!real && picture) {
      const sources = picture.querySelectorAll('source');
      for (let i = 0; i < sources.length && !real; i += 1) {
        real = largestFromSrcset(sources[i].getAttribute('data-srcset'))
          || largestFromSrcset(sources[i].getAttribute('srcset'));
      }
    }
    if (real) {
      img.setAttribute('src', real);
      ['data-src', 'data-srcset', 'srcset', 'data-sizes', 'sizes'].forEach((a) => img.removeAttribute(a));
    }
  });
}

function isBlank(text) {
  return !text || text.replace(/[\s ]+/g, '') === '';
}

function cleanRichtext(root) {
  root.querySelectorAll('div.Richtext').forEach((rt) => {
    // empty anchors (no href, no text, no media)
    rt.querySelectorAll('a').forEach((a) => {
      if (!a.getAttribute('href') && isBlank(a.textContent) && !a.querySelector('img, picture')) {
        a.remove();
      }
    });
    // paragraphs that contain only &nbsp; / whitespace
    rt.querySelectorAll('p').forEach((p) => {
      if (isBlank(p.textContent) && !p.querySelector('img, picture, video, iframe, a[href]')) {
        p.remove();
      }
    });
  });
}

export default function transform(hookName, element, payload) {
  const doc = element.ownerDocument || (payload && payload.document) || document;

  if (hookName === 'beforeTransform') {
    // 1. Rescue breadcrumbs from the header experience fragment.
    const breadcrumb = doc.querySelector('div.breadcrumb');
    const pageLead = element.querySelector('div.page-lead');
    const main = element.querySelector('main') || element;
    if (breadcrumb && !main.contains(breadcrumb)) {
      if (pageLead) {
        pageLead.parentElement.insertBefore(breadcrumb, pageLead);
      } else {
        main.insertBefore(breadcrumb, main.firstChild);
      }
    }

    // 2. Resolve lazy images before parsers read <img> nodes.
    resolveLazyImages(element);

    // 3. Article body: drop empty paragraphs / anchors.
    cleanRichtext(element);

    // 4. Remove global chrome and blockers.
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment',
      'footer.experiencefragment',
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--footer',
      'div.topbar',
      'div.Topbar',
      'div.footer',
      '#usercentrics-root',
      'script',
      'style',
      'noscript',
      'link',
      'iframe[src*="usercentrics"]',
    ]);

    // Body-level svg sprite (rendered as a data:image/svg+xml img outside main).
    Array.from(element.querySelectorAll('img[src^="data:image/svg+xml"]')).forEach((img) => {
      if (!img.closest('main')) img.remove();
    });
  }

  if (hookName === 'afterTransform') {
    WebImporter.DOMUtils.remove(element, [
      'header',
      'footer',
      'nav.TopbarMainNavigation',
      'nav.MobileNavigation--meta',
      'nav.MobileNavigation--main',
      '.TopbarSearch',
      '#usercentrics-root',
      'script',
      'style',
      'noscript',
      'link',
    ]);

    // Strip tracking / AEM component data attributes.
    element.querySelectorAll('*').forEach((el) => {
      Array.from(el.attributes).forEach((attr) => {
        const n = attr.name;
        if (n.startsWith('data-cmp-') || n.startsWith('data-analytics') || n.startsWith('data-tracking')
          || n === 'data-layer' || n.startsWith('on')) {
          el.removeAttribute(n);
        }
      });
    });
  }
}
