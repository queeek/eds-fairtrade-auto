/* us-en-news — FilteredTeaserGrid "Load more" (observed on live: +6 cards per click from the inline
   data island; when exhausted the CTASection gets .is-hidden). Cards mirror the server-rendered InfoTeaser. */
(() => {
  const root = document.querySelector('[data-filtered-teaser-grid]');
  if (!root) return;
  const grid = root.querySelector('.TeaserGrid--grid');
  const cta = root.querySelector('[data-teaser-grid="cta-section"]');
  const btn = root.querySelector('[data-teaser-grid="load-more"]');
  const dataEl = root.querySelector('script[data-teaser-grid="data"]');
  if (!grid || !cta || !btn || !dataEl) return;
  let items;
  try { items = JSON.parse(dataEl.textContent); } catch { return; }
  const PAGE = 6;
  const M = 'assets/media/';

  const el = (tag, cls, text) => {
    const n = document.createElement(tag);
    if (cls) n.className = cls;
    if (text != null) n.textContent = text;
    return n;
  };

  const card = (t) => {
    const li = el('li', `TeaserGrid--item${t.highlight ? ' isHighlight' : ''}`);
    const a = el('a', 'InfoTeaser');
    a.href = t.href;
    a.id = t.id;
    const inner = el('div', 'InfoTeaser--inner');
    const media = el('div', 'InfoTeaser--image');
    const image = el('div', 'Image rectangular');
    const img = el('img');
    img.src = `${M}usn${t.n}-4x3_640w.webp`;
    img.srcset = `${M}usn${t.n}-4x3_375w.webp 375w, ${M}usn${t.n}-4x3_640w.webp 640w`;
    img.sizes = '(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw';
    img.alt = t.alt || '';
    img.width = 640;
    img.height = 480;
    img.loading = 'lazy';
    image.append(img);
    media.append(image);
    const tags = el('div', 'InfoTeaser--tags');
    t.tags.forEach((x) => tags.append(el('span', 'Tag gray', x)));
    const content = el('div', 'InfoTeaser--content');
    const h = el('h3', 'InfoTeaser--header');
    h.append(el('span', 'InfoTeaser--pretitle', t.pre), el('span', 'InfoTeaser--title', t.title));
    content.append(h);
    if (t.text != null) {
      const text = el('div', 'InfoTeaser--text');
      text.append(el('p', null, t.text));
      content.append(text);
    }
    const b = el('span', 'Button InfoTeaser--cta variant-tertiary');
    b.append(el('span', 'Button--inner', t.cta));
    content.append(b);
    inner.append(media, tags, content);
    a.append(inner);
    li.append(a);
    return li;
  };

  let next = 0;
  const sync = () => cta.classList.toggle('is-hidden', next >= items.length);
  const append = () => {
    const frag = document.createDocumentFragment();
    items.slice(next, next + PAGE).forEach((t) => frag.append(card(t)));
    next = Math.min(next + PAGE, items.length);
    grid.append(frag);
    sync();
  };
  // observed on live: the append runs inside a root view transition (UA cross-fade on <html>)
  btn.addEventListener('click', () => (document.startViewTransition ? document.startViewTransition(append) : append()));
  sync();
})();
