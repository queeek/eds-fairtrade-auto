/**
 * single-image — SingleImage: one editorial image in a figure, with an optional
 * mobile art-direction crop and an optional caption.
 * Schema: stardust/eds-schema/us-en-about.json § SingleImage.
 * Decode tier: template-slotted (fixed composition; authored nodes are moved into slots).
 *
 * Authoring (one row; cells classified by content, any split):
 *   1st <picture> = desktop image (16:9) · 2nd <picture> = mobile image (4:3, < 768px)
 *   · any text <p> = caption. One picture only → it shows at every width.
 *
 * @variants block: thumbnail | full-bleed (default content width)
 */

function el(tag, className) {
  const n = document.createElement(tag);
  if (className) n.className = className;
  return n;
}

function cellNodes(cell) {
  let kids = [...cell.children];
  // runtime wrapTextNodes folds a media-led cell into one <p>: expand it back
  if (kids.length === 1 && kids[0].tagName === 'P' && kids[0].querySelector('picture, img')) {
    kids = [...kids[0].childNodes].filter((n) => n.nodeType === 1 || n.textContent.trim())
      .map((n) => {
        if (n.nodeType === 1) return n;
        // HARNESS-ONLY fallback (EW5): move bare text into a <p>
        const p = document.createElement('p');
        p.append(n);
        return p;
      });
  }
  if (!kids.length && cell.textContent.trim()) {
    // HARNESS-ONLY fallback (EW5)
    const p = document.createElement('p');
    p.append(...cell.childNodes);
    kids = [p];
  }
  return kids;
}

export default async function decorate(block) {
  const nodes = [...block.children].flatMap((row) => [...row.children].flatMap(cellNodes));
  const pictures = [];
  const caption = [];
  nodes.forEach((n) => {
    const media = n.matches('picture, img') ? n : n.querySelector('picture, img');
    if (media && !n.textContent.trim()) {
      const pic = media.closest('picture') || media;
      pictures.push(pic);
    } else {
      caption.push(n);
    }
  });

  const figure = el('figure', 'single-image-figure');
  pictures.slice(0, 2).forEach((pic, i) => {
    let kind = '';
    if (pictures.length > 1) kind = i ? ' rectangular mobile' : ' landscape desktop';
    else kind = ' landscape';
    const box = el('div', `ft-image single-image-image${kind}`);
    box.append(pic);
    figure.append(box);
  });
  if (caption.length) {
    const cap = el('figcaption', 'single-image-caption');
    cap.append(...caption);
    figure.append(cap);
  }

  const size = ['thumbnail', 'full-bleed'].find((c) => block.classList.contains(c));
  const grid = el('div', 'single-image-grid');
  if (size !== 'full-bleed') grid.classList.add('page-grid');
  grid.append(figure);
  block.replaceChildren(grid);
}
