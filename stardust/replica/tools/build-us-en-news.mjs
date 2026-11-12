// Builds stardust/prototypes/us-en-news-proposed.html (replica archetype: news listing, us-en).
// Content verbatim from stardust/current/pages/us-en-news.(json|html); chrome from stardust/replica/tools/data/chrome-us-en.json.
// Run: node stardust/replica/tools/build-us-en-news.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { header, footer, icon } from './chrome-html.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const require = createRequire('/app/node_modules/');
const cheerio = require('cheerio');
const chrome = JSON.parse(fs.readFileSync(path.join(root, 'stardust/replica/tools/data/chrome-us-en.json'), 'utf8'));
const locales = JSON.parse(fs.readFileSync(path.join(root, 'stardust/replica/tools/data/locales-en.json'), 'utf8'));
const $ = cheerio.load(fs.readFileSync(path.join(root, 'stardust/current/pages/us-en-news.html'), 'utf8'));
const M = 'assets/media/';
const LOCALE = { localeLabel: 'US • EN', localeSr: 'Open or close the locale selector. The currently selected locale is US-EN.' };
const attr = (s) => String(s).replace(/&/g, '&amp;').replace(/"/g, '&quot;');

// Lead + cards: read verbatim from the captured settled DOM (initial state: 18 cards).
const lead = { title: $('.PageLead--title').html().trim(), text: $('.PageLead--lead').html().trim() };
const cards = $('main .TeaserGrid--item').map((i, li) => {
  const a = $(li).find('a.InfoTeaser');
  const img = a.find('img');
  const text = a.find('.InfoTeaser--text');
  return {
    n: i + 1,
    href: a.attr('href'),
    id: a.attr('id'),
    alt: img.attr('alt'),
    tags: a.find('.InfoTeaser--tags .Tag').map((k, t) => `<span class="${$(t).attr('class')}">${$(t).html().trim()}</span>`).get().join(''),
    pre: a.find('.InfoTeaser--pretitle').html(),
    title: a.find('.InfoTeaser--title').html(),
    text: text.length ? text.html().trim() : null,
    cta: a.find('.InfoTeaser--cta .Button--inner').text().trim(),
  };
}).get();
const loadMore = $('main [data-teaser-grid="load-more"] .Button--inner').text().trim();

// "Load more" data: the live page ships every article as inline JSON (script[data-teaser-grid="data"]) and appends
// 6 per click (observed: 18 → 24 → … → 69, then the CTASection gets .is-hidden). Items 19+ go into the prototype's
// data island; their 4:3 renditions are harvested to assets/media/usn<n>-4x3_<w>.webp.
const dataEl = $('script[data-teaser-grid="data"]').first();
const all = JSON.parse(dataEl.html());
if (all.slice(0, cards.length).some((d, i) => d.id !== cards[i].id)) throw new Error('data island order differs from rendered cards');
const more = all.slice(cards.length).map((d, k) => ({
  n: cards.length + k + 1, href: d.cta.link, id: d.id, alt: d.teaserImage?.alt ?? '', highlight: !!d.isHighlight,
  tags: [d.date, d.themeTag?.title].filter(Boolean), pre: d.categoryTag?.title ?? '', title: d.title,
  text: d.description ?? null, cta: d.cta.label,
}));
const dataIsland = JSON.stringify(more).replace(/</g, '\\u003c');

const card = (t) => `
          <li class="TeaserGrid--item">
            <a class="InfoTeaser" href="${attr(t.href)}" id="${attr(t.id)}">
              <div class="InfoTeaser--inner">
                <div class="InfoTeaser--image rectangular"><div class="Image rectangular"><img src="${M}usn${t.n}-4x3_640w.webp" srcset="${M}usn${t.n}-4x3_375w.webp 375w, ${M}usn${t.n}-4x3_640w.webp 640w" sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw" alt="${attr(t.alt ?? '')}" width="640" height="480"${t.n > 3 ? ' loading="lazy"' : ''}></div></div>
                <div class="InfoTeaser--tags">${t.tags}</div>
                <div class="InfoTeaser--content">
                  <h3 class="InfoTeaser--header"><span class="InfoTeaser--pretitle">${t.pre}</span><span class="InfoTeaser--title">${t.title}</span></h3>${t.text != null ? `
                  <div class="InfoTeaser--text">${t.text}</div>` : ''}
                  <span class="Button InfoTeaser--cta variant-tertiary"><span class="Button--inner">${t.cta}</span></span>
                </div>
              </div>
            </a>
          </li>`;

const wave = (color) => `
          <div class="Wave color-${color}" aria-hidden="true">
            <div class="Wave--mobile"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor"><path d="M0 100 V138 H100 V22.22 C89.4722 10.3091 77.1944 3.5804 65.625 3.5804 C37.2325 3.5804 12.19 40.9839 0 100 Z"></path></svg></div>
            <div class="Wave--tablet"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 768 40" preserveAspectRatio="none" fill="currentColor"><path d="M0 39.5566V40H768V6.70221C693.951 2.74354 610.938 0.525391 523.261 0.525391C286.805 0.525391 84.2704 16.6588 0 39.5566Z"></path></svg></div>
            <div class="Wave--desktop"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 375 40" preserveAspectRatio="none" fill="currentColor"><path d="M0 39.4028V40H375V6.73263C338.773 2.75491 298.142 0.525391 255.221 0.525391C140.023 0.525391 41.3134 16.5866 0 39.4028Z"></path></svg></div>
          </div>`;

const main = `
  <main class="maincontainer" data-content-fader>
    <section class="PageLead theme-leafgreen">
      <div class="PageLead--content">
        <div class="PageLead--contentGrid">
          <h1 class="PageLead--title">${lead.title}</h1>
          <p class="PageLead--lead">${lead.text}</p>
        </div>
      </div>
    </section>
    <section class="FilteredTeaserGrid" data-filtered-teaser-grid>
      <div class="TeaserGrid small">${wave('leafgreen')}
        <div class="TeaserGrid--inner">
          <ul class="TeaserGrid--grid">${cards.map(card).join('')}
          </ul>
        </div>
      </div>
      <script type="application/json" data-teaser-grid="data">${dataIsland}</script>
      <div class="CTASection" data-teaser-grid="cta-section"><button class="Button variant-secondary color-skyblue" type="button" data-teaser-grid="load-more"><span class="Button--inner">${loadMore}</span></button></div>
    </section>
  </main>`;

// us-en footer list titles are links with a chevron (chrome-html renders a plain span; see canon-requests.md).
const titleLinks = {};
$('footer .FooterLinkList--title--link').each((i, a) => { titleLinks[$(a).text().trim()] = $(a).attr('href'); });
// chrome-us-en.json lists carry the title link as their first link (extractor grabs every <a>): drop it from the list.
const footChrome = { ...chrome, footer: { ...chrome.footer, lists: chrome.footer.lists.map((l) => ({ ...l, links: l.links.filter((k, i) => !(i === 0 && k.t === l.title)) })) } };
const foot = footer(footChrome, { ...LOCALE, newsletterHref: 'https://fairtrade.net/us-en/fairtrade-newsletter.html', newsletterLabel: 'Click to sign up' })
  .replace(/<div class="FooterLinkList--title"><span>([^<]*)<\/span><\/div>/g, (m, t) => {
    const key = t.replace(/&amp;/g, '&');
    return titleLinks[key] ? `<div class="FooterLinkList--title">${icon('chevron-right', 'FooterLinkList--title--icon')}<a class="FooterLinkList--title--link" href="${attr(titleLinks[key])}">${t}</a></div>` : m;
  });

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>News</title>
  <meta property="og:title" content="News">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/exo-2-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/alegreya-sans-latin-900-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="canon.css">
  <link rel="stylesheet" href="us-en-news.css">
  <script src="canon.js" defer></script>
  <script src="us-en-news.js" defer></script>
</head>
<body>
${header(chrome, locales, { home: 'https://www.fairtrade.net/us-en.html', searchUrl: 'https://www.fairtrade.net/us-en/search-results.html', logo: 'assets/media/fairtrade-america-logo-80.png', ...LOCALE })}
${main}
${foot}
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'stardust/prototypes/us-en-news-proposed.html'), html);
console.log('wrote us-en-news-proposed.html', html.length, 'cards', cards.length);
