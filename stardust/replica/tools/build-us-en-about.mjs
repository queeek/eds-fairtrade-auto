// Builds stardust/prototypes/us-en-about-proposed.html (replica archetype: static / us-en about).
// Content verbatim from stardust/current/pages/us-en-about.(json|html); chrome from data/chrome-us-en.json.
// Run: node stardust/replica/tools/build-us-en-about.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { header, footer, icon } from './chrome-html.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const chromeRaw = JSON.parse(fs.readFileSync(path.join(root, 'stardust/replica/tools/data/chrome-us-en.json'), 'utf8'));
const locales = JSON.parse(fs.readFileSync(path.join(root, 'stardust/replica/tools/data/locales-en.json'), 'utf8'));
// Locale-selector hrefs are page alternates on live (e.g. /africa-en/about.html, /us-en/about.html):
// take them from this page's capture, matched by region + label.
{
  const cap = fs.readFileSync(path.join(root, 'stardust/current/pages/us-en-about.html'), 'utf8');
  const seg = cap.slice(cap.indexOf('class="LocaleSelector--regions"'), cap.indexOf('LocaleSelector--noMatchFound', cap.indexOf('class="LocaleSelector--regions"')));
  const capHrefs = new Map();
  for (const r of seg.split('LocaleSelector--regionName">').slice(1)) {
    const name = r.slice(0, r.indexOf('<')).trim();
    for (const m of r.matchAll(/href="([^"]*)"[^>]*>([^<]*)</g)) capHrefs.set(`${name}|${m[2].trim()}`, m[1]);
  }
  locales.regions.forEach((rg) => rg.locales.forEach((l) => { const h = capHrefs.get(`${rg.name}|${l.t}`); if (h) l.h = h; }));
}
const M = 'assets/media/';
const LOCALE = { localeLabel: 'US • EN', localeSr: 'Open or close the locale selector. The currently selected locale is US-EN.' };

// us-en footer: each list title is itself a link (icon + a.FooterLinkList--title--link); chrome-extract
// recorded it as the list's first link. chrome-html renders titles as plain spans, so we pass the lists
// without that first link and swap the title markup afterwards (canon request logged).
const titleLinks = chromeRaw.footer.lists.map((l) => l.links[0]);
const chrome = { ...chromeRaw, footer: { ...chromeRaw.footer, lists: chromeRaw.footer.lists.map((l) => ({ ...l, links: l.links.slice(1) })) } };

const textImage = ({ cls, title, text, cta, href, img, alt }) => `
    <section class="TextImage--wrapper">
      <div class="TextImage${cls}">
        <div class="TextImage--grid">
          <div class="TextImage--inner">
            <div class="TextImage--content">
              <h2 class="TextImage--title">${title}</h2>
              <div class="TextImage--text Richtext">${text}</div>
              <a class="Button TextImage--cta color-skyblue variant-primary" href="${href}"><span class="Button--inner">${cta}</span></a>
            </div>
            <div class="TextImage--image"><div class="Image square"><img src="${M}${img}-1x1_640w.webp" srcset="${M}${img}-1x1_375w.webp 375w, ${M}${img}-1x1_640w.webp 640w, ${M}${img}-1x1_768w.webp 768w" sizes="(min-width: 1280px) 538px, (min-width: 768px) 45vw, 90vw" alt="${alt}" width="640" height="640" loading="lazy"></div></div>
          </div>
        </div>
      </div>
    </section>`;

const main = `
  <main class="maincontainer" data-content-fader>
    <section class="PageLead theme-leafgreen">
      <div class="PageLead--content">
        <div class="PageLead--contentGrid">
          <h1 class="PageLead--title">About Us</h1>
          <p class="PageLead--lead">Fairtrade is a global movement reshaping the way the world does business. We challenge the status quo of exploitative trade and support a system rooted in dignity, equity and shared prosperity so that the people who grow our food and goods have a voice, receive a fairer price and have the power to shape their own futures.</p>
        </div>
      </div>
    </section>
    <section class="RichtextSection">
      <div class="Richtext">
        <h2>Fairtrade Brings People Together</h2>
        <p>Many of the products we enjoy every day –&nbsp;<a href="https://www.fairtradeamerica.org/shop-fairtrade/fairtrade-products/coffee/">coffee</a>,&nbsp;<a href="https://www.fairtradeamerica.org/shop-fairtrade/fairtrade-products/chocolate/">chocolate</a>,&nbsp;<a href="https://www.fairtradeamerica.org/shop-fairtrade/fairtrade-products/bananas-produce/">bananas</a>&nbsp;– have traveled over thousands of miles of oceans and through countless hands to land in stores in the United States.&nbsp;Fairtrade brings together all of these people - the farmers and the brands, the schools and the champions of advocacy, the retailers and the shoppers - to create a more equitable world through trade.</p>
        <ul><li><b>Over 2 million</b>&nbsp;farmers and workers worldwide are Fairtrade certified</li><li><b>50%</b>&nbsp;of the voting members at our General Assembly are Fairtrade farmers and workers.</li><li><b>2,500+</b>&nbsp;brands offer 36,000 Fairtrade certified products globally.</li></ul>
      </div>
    </section>
    <div class="CTASection"><a class="Button variant-primary color-leafgreen size-large" href="https://www.fairtrade.net/us-en/why-fairtrade/impact/impact-stories.html"><span class="Button--inner">Read Stories from Fairtrade Farmers and Brands</span></a></div>
    <section class="SingleImage size-content">
      <figure class="SingleImage--figure">
        <div class="Image landscape SingleImage--image desktop"><img src="${M}about-mvv-16x9_1280w.webp" srcset="${M}about-mvv-16x9_768w.webp 768w, ${M}about-mvv-16x9_1280w.webp 1280w, ${M}about-mvv-16x9_1440w.webp 1440w, ${M}about-mvv-16x9_1920w.webp 1920w" sizes="(min-width: 1024px) 78vw, 90vw" alt="fairtradevalues" width="1280" height="720" loading="lazy"></div>
        <div class="Image rectangular SingleImage--image mobile"><img src="${M}about-mvv-4x3_768w.webp" srcset="${M}about-mvv-4x3_375w.webp 375w, ${M}about-mvv-4x3_640w.webp 640w, ${M}about-mvv-4x3_768w.webp 768w, ${M}about-mvv-4x3_1280w.webp 1280w" sizes="90vw" alt="fairtradevalues" width="768" height="576" loading="lazy"></div>
      </figure>
    </section>
${textImage({ cls: ' order-reverse', title: 'Fairtrade is Complex, the Solution is Simple', text: 'Fairtrade recognizes that generations of exploitative trade systems have disadvantaged farmers, producers and creators around the world.  While we aim to ensure that all farmers can enjoy secure, sustainable livelihoods - the problem is complex. Poverty exacerbates child labor, deforestation challenges climate resilience and lack of access to education exacerbates gender inequality.  \n\nWhile our work exists in the context of complex global trade systems, the solution can be remarkably straightforward.  Farmers who are fairly compensated produce more sustainable products. When the farmers and farmworkers we work with receive a better deal for their labor, they re-invest in climate resilient practices. When alleviated from the pressure of always needing to grow more just to earn enough money to survive, they grow better instead.', cta: 'Read about Our Holistic Approach', href: 'https://www.fairtrade.net/us-en/why-fairtrade/why-we-do-it.html', img: 'about-cotton', alt: 'A Fairtrade cotton farmer in India picking cotton' })}
${textImage({ cls: '', title: 'Our People', text: 'Fairtrade America is powered by a talented team of values-driven individuals working to create a fairer global trade system.  We\'re coffee drinkers, dog lovers, outdoor explorers, crocheters, potters, yoga teachers, tea enthusiasts, co-op shoppers and so much more.  \n\nAt our core, we are a team of humans dedicated to fair trade practices and uplifting the dignity of farmers. Together, we collaborate with brands, educate consumers, support disaster relief projects and advocate for policy that uplifts farmers\' rights and helps build trade systems rooted in equity and sustainability.', cta: 'Learn about Our Incredible Team', href: 'https://www.fairtrade.net/us-en/about/fairtrade-america-staff.html', img: 'about-staff', alt: 'Fairtrade America staff' })}
    <div class="CTASection"><a class="Button variant-primary color-skyblue size-large" href="https://www.fairtrade.net/us-en/about/financials.html"><span class="Button--inner">Read our financials</span></a></div>
    <section class="RichtextSection">
      <div class="Richtext">
        <p>We are an independent non-profit 501(c)3 organization.</p>
      </div>
    </section>
  </main>`;

let foot = footer(chrome, { ...LOCALE, newsletterHref: 'https://fairtrade.net/us-en/fairtrade-newsletter.html', newsletterLabel: 'Click to sign up' });
chromeRaw.footer.lists.forEach((l, i) => {
  const t = titleLinks[i];
  foot = foot.replace(`<div class="FooterLinkList--title"><span>${l.title}</span></div>`,
    `<div class="FooterLinkList--title">${icon('chevron-right', 'FooterLinkList--title--icon')}<a class="FooterLinkList--title--link" href="${t.h}">${t.t}</a></div>`);
});

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>About</title>
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/exo-2-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/alegreya-sans-latin-900-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="canon.css">
  <link rel="stylesheet" href="us-en-about.css">
  <script src="canon.js" defer></script>
</head>
<body>
${header(chrome, locales, { home: 'https://www.fairtrade.net/us-en.html', searchUrl: 'https://www.fairtrade.net/us-en/search-results.html', logo: `${M}fairtrade-america-logo-80.png`, ...LOCALE })}
${main}
${foot}
</body>
</html>
`;
if (!foot.includes('FooterLinkList--title--link')) throw new Error('footer title swap failed');
fs.writeFileSync(path.join(root, 'stardust/prototypes/us-en-about-proposed.html'), html);
console.log('wrote us-en-about-proposed.html', html.length);
