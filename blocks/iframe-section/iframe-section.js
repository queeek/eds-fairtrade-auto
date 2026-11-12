/**
 * iframe-section — IframeSection: an external page embedded in a bordered 16:9 frame on the
 * page grid (theory-of-change embeds https://toc.fairtrade.net).
 * Schema: stardust/eds-schema/us-en-why-fairtrade-what-we-do-theory-of-change.json
 * § IframeSection. Values: the render's inline style, lifted from the source clientlib
 * `.IframeSection` rules. Dynamics row 9 toc-iframe: embed-passthrough (iframe-embed).
 * Decode tier: template-slotted (one embed per block).
 *
 * Authoring (one cell): a link — href = the embedded page URL, link text = the iframe title
 *   (accessible name). A link whose text is the URL itself gives no title from the text;
 *   then the URL's host is the title. No link → the block renders nothing.
 *
 * @ew-exempt embed link — the source link is config (EW5 a): it becomes the iframe's
 *   src/title; edit it in the document.
 */

export default async function decorate(block) {
  const link = block.querySelector('a[href]');
  if (!link) {
    block.replaceChildren();
    return;
  }
  const url = new URL(link.href, window.location.href);
  const text = link.textContent.trim();
  const title = text && text !== link.href && text !== link.getAttribute('href')
    ? text : url.host;

  const iframe = document.createElement('iframe');
  iframe.className = 'iframe-section-frame';
  iframe.src = url.href;
  iframe.title = title;
  iframe.loading = 'lazy';
  iframe.setAttribute('allowfullscreen', '');

  const grid = document.createElement('div');
  grid.className = 'iframe-section-grid';
  grid.append(iframe);
  block.replaceChildren(grid);
}
