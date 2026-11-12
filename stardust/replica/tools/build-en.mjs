// Builds stardust/prototypes/en-proposed.html (replica archetype: home / landing).
// Content verbatim from stardust/current/pages/en.(json|html); chrome from stardust/replica/tools/data/chrome-en.json.
// Run: node stardust/replica/tools/build-en.mjs
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { header, footer, icon } from './chrome-html.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const chrome = JSON.parse(fs.readFileSync(path.join(root, 'stardust/replica/tools/data/chrome-en.json'), 'utf8'));
const locales = JSON.parse(fs.readFileSync(path.join(root, 'stardust/replica/tools/data/locales-en.json'), 'utf8'));
const I = (id, cls) => icon(id, cls);
const M = 'assets/media/';
const LOCALE = { localeLabel: 'GLOBAL • EN', localeSr: 'Open or close the locale selector. The currently selected locale is GLOBAL-EN.' };

const slides = [
  { n: 1, title: 'What is Fairtrade?', text: 'For more than three decades, Fairtrade has been making an impact on the way trade works. ', cta: 'Find out more ', href: 'https://www.fairtrade.net/en/why-fairtrade/what-we-do/what-is-fairtrade.html' },
  { n: 2, title: 'Fairtrade International Annual Report 2025', text: 'Learn about our collective progress alongside farmers, workers, businesses, and partners worldwide in advancing fairer trade.', cta: 'Read more', href: 'https://www.fairtrade.net/en/get-involved/library/2025-annual-report.html' },
  { n: 3, title: 'Catalyst for resilience', text: 'Fairtrade\'s Global Strategy for 2026-2028 is here. Accelerating&nbsp;action today that drives resilience for tomorrow.', cta: 'Find out more', href: 'https://www.fairtrade.net/en/about/our-strategy.html' },
];
const slideState = ['is-active', 'is-next', 'is-after'];
const hero = `
    <section class="PageHeroCarousel theme-skyblue">
      <div class="PageHeroCarousel--grid">
        <div class="PageHeroCarousel--inner">
          <div class="PageHeroCarousel--carousel">
            <div class="PageHeroCarousel--track">${slides.map((s, i) => `
              <div class="PageHeroSlide ${slideState[i]}"${i ? ' aria-hidden="true"' : ''}>
                <div class="PageHeroSlide--inner">
                  <div class="PageHeroSlide--media">
                    <div class="Image square cover PageHeroSlide--imageMobile"><img src="${M}hero${s.n}-16x9_768w.webp" alt="" width="768" height="432"${i ? ' loading="lazy"' : ''}></div>
                    <div class="Image landscape cover PageHeroSlide--imageDesktop"><img src="${M}hero${s.n}-21x9_1280w.webp" srcset="${M}hero${s.n}-21x9_640w.webp 640w, ${M}hero${s.n}-21x9_1280w.webp 1280w, ${M}hero${s.n}-21x9_1920w.webp 1920w" sizes="(min-width: 1024px) 78vw, 100vw" alt="" width="1280" height="549"></div>
                  </div>
                  <div class="PageHeroSlide--content">
                    <div class="PageHeroSlide--content-inner">
                      <h2 class="PageHeroSlide--title">${s.title}</h2>
                      <p class="PageHeroSlide--text">${s.text}</p>
                      <a class="Button PageHeroSlide--button variant-primary size-large" href="${s.href}"${i ? ' tabindex="-1"' : ''}><span class="Button--inner">${s.cta}</span></a>
                    </div>
                  </div>
                </div>
              </div>`).join('')}
            </div>
            <div class="PageHeroCarousel--pagination">${slides.map((s, i) => `<span class="PageHeroCarousel--bullet${i ? '' : ' is-active'}"></span>`).join('')}</div>
            <div class="PageHeroCarousel--controls">
              <button class="Button PageHeroCarousel--control-previous variant-icon-primary" type="button" aria-hidden="true" tabindex="-1" disabled><span class="Button--icon">${I('chevron-left')}</span></button>
              <button class="Button PageHeroCarousel--control-next variant-icon-primary" type="button" aria-hidden="true" tabindex="-1"><span class="Button--icon">${I('chevron-right')}</span></button>
            </div>
          </div>
        </div>
      </div>
    </section>`;

const bubble = `<svg width="100%" height="100%" viewBox="0 0 613 612" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true"><path d="M14.1082 290.5C40.7449 193.681 94.4564 111.976 147.182 61.5808C201.266 10.5752 254.364 -9.12045 311.194 3.89536C367.813 16.9369 422.737 56.6462 476.236 103.181C528.604 150.705 579.547 205.047 602.152 270.409C624.706 335.325 610.69 404.384 557.162 468.001C504.801 530.613 412.92 587.8 306.68 606.017C200.674 624.99 106.15 597.901 53.5555 538.058C-0.440844 478.842 -12.5139 386.872 14.1082 290.5Z" fill="currentColor"></path></svg>`;
const numberFacts = ({ color, facts, label, title, text, cta, href }) => `
    <section class="NumberFactTeaser">
      <div class="NumberFactTeaser--slider">
        <ul class="NumberFactTeaser--items">${facts.map(([num, fact]) => `
          <li class="NumberFactTeaser--item">
            <div class="NumberFact color-${color}">
              <div class="Bubble NumberFact--bubble color-${color}">${bubble}</div>
              <div class="NumberFact--content">
                <div class="NumberFact--number">${num}</div>
                <div class="NumberFact--fact">${fact}</div>
              </div>
            </div>
          </li>`).join('')}
        </ul>
        <button class="Button NumberFactTeaser--slider--prev variant-icon-primary color-skyblue" type="button" disabled><span class="Button--icon">${I('chevron-left')}</span><span class="visuallyhidden">Go to the previous fact</span></button>
        <button class="Button NumberFactTeaser--slider--next variant-icon-primary color-skyblue" type="button"><span class="Button--icon">${I('chevron-right')}</span><span class="visuallyhidden">Go to the next fact</span></button>
      </div>
      <div class="NumberFactTeaser--content">
        <strong class="NumberFactTeaser--label">${label}</strong>
        <h2 class="NumberFactTeaser--title">${title}</h2>
        <p class="NumberFactTeaser--text">${text}</p>
        <a class="Button NumberFactTeaser--cta variant-secondary color-skyblue" href="${href}"><span class="Button--inner">${cta}</span></a>
      </div>
    </section>`;

const wave = (color) => `
      <div class="Wave color-${color}" aria-hidden="true">
        <div class="Wave--mobile"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="none" fill="currentColor"><path d="M0 100 V138 H100 V22.22 C89.4722 10.3091 77.1944 3.5804 65.625 3.5804 C37.2325 3.5804 12.19 40.9839 0 100 Z"></path></svg></div>
        <div class="Wave--tablet"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 768 40" preserveAspectRatio="none" fill="currentColor"><path d="M0 39.5566V40H768V6.70221C693.951 2.74354 610.938 0.525391 523.261 0.525391C286.805 0.525391 84.2704 16.6588 0 39.5566Z"></path></svg></div>
        <div class="Wave--desktop"><svg xmlns="http://www.w3.org/2000/svg" width="100%" height="100%" viewBox="0 0 375 40" preserveAspectRatio="none" fill="currentColor"><path d="M0 39.4028V40H375V6.73263C338.773 2.75491 298.142 0.525391 255.221 0.525391C140.023 0.525391 41.3134 16.5866 0 39.4028Z"></path></svg></div>
      </div>`;

const teasers = [
  { n: 1, href: 'https://www.fairtrade.net/en/get-involved/news/from-casual-worker-to-supervisor-jacqueline-chepsergon-25-year-journey-in-kenya-flower-industry.html', alt: 'Jacqueline Chepsergon, Supervisor at Maji Mazuri Flowers working on her computer', date: '15.10.26', pre: 'Fairtrade news', title: 'From Casual Worker to Supervisor: Jacqueline Chepsergon’s 25-year journey in Kenya’s flower Industry', text: 'Today is the International Day of Rural Women, and it’s a moment to celebrate the critical role and contributions of women in agriculture. This year, Fairtrade is shining a light on Jacqueline Chepsergon, a supervisor at certified flower farm Maji Mazuri Flowers in Kenya.' },
  { n: 2, href: 'https://www.fairtrade.net/en/get-involved/Press-centre/fairtrade-raises-minimum-price-for-bananas-amid-soaring-costs-for-farmers.html', alt: 'Bunches of fresh green bananas with Fairtrade stickers on display.', date: '05.10.26', pre: 'Press releases', title: 'Fairtrade raises Minimum Price for bananas amid soaring costs for farmers ', text: 'Fairtrade International has increased its Minimum Prices for bananas in direct response to a combination of external pressures negatively impacting producers, including geopolitical instability, climate change, and rising input and logistics costs.' },
  { n: 3, href: 'https://www.fairtrade.net/en/get-involved/news/coffee-is-like-raising-a-child-how-mrs-rizkani-nurtures-her-crops-and-her-community.html', alt: 'Mrs. Rizkani nurturing her coffee crops', date: '01.10.26', pre: 'Fairtrade news', title: '“Coffee is like raising a child," how Mrs. Rizkani nurtures her crops and her community', text: 'For Mrs. Rizkani tending a coffee farm is like raising a child, it requires love, patience, and an unwavering commitment to watch something grow.' },
];
const teaserGrid = `
    <section class="TeaserGrid small">${wave('leafgreen')}
      <div class="TeaserGrid--inner">
        <ul class="TeaserGrid--grid">${teasers.map(t => `
          <li class="TeaserGrid--item">
            <a class="InfoTeaser" href="${t.href}">
              <div class="InfoTeaser--inner">
                <div class="InfoTeaser--image"><div class="Image rectangular"><img src="${M}teaser${t.n}-4x3_640w.webp" srcset="${M}teaser${t.n}-4x3_375w.webp 375w, ${M}teaser${t.n}-4x3_640w.webp 640w" sizes="(min-width: 1024px) 30vw, (min-width: 768px) 45vw, 90vw" alt="${t.alt}" width="640" height="480" loading="lazy"></div></div>
                <div class="InfoTeaser--tags"><span class="Tag gray">${t.date}</span></div>
                <div class="InfoTeaser--content">
                  <h3 class="InfoTeaser--header"><span class="InfoTeaser--pretitle">${t.pre}</span><span class="InfoTeaser--title">${t.title}</span></h3>
                  <div class="InfoTeaser--text"><p>${t.text}</p></div>
                  <span class="Button InfoTeaser--cta variant-tertiary"><span class="Button--inner">Read more</span></span>
                </div>
              </div>
            </a>
          </li>`).join('')}
        </ul>
      </div>
    </section>`;

const textImage = ({ cls, title, text, cta, href, img }) => `
      <div class="TextImage${cls}">
        <div class="TextImage--grid">
          <div class="TextImage--inner">
            <div class="TextImage--content">
              <h2 class="TextImage--title">${title}</h2>
              <div class="TextImage--text Richtext">${text}</div>
              <a class="Button TextImage--cta color-skyblue variant-primary" href="${href}"><span class="Button--inner">${cta}</span></a>
            </div>
            <div class="TextImage--image"><div class="Image square"><img src="${M}${img}-1x1_640w.webp" srcset="${M}${img}-1x1_375w.webp 375w, ${M}${img}-1x1_640w.webp 640w, ${M}${img}-1x1_768w.webp 768w" sizes="(min-width: 1280px) 538px, (min-width: 768px) 45vw, 90vw" alt="" width="640" height="640" loading="lazy"></div></div>
          </div>
        </div>
      </div>`;

const accordion = [
  ['Do you want to know the basics?', 'Our what is Fairtrade section covers what we do and why we do it. You can watch a short video about us, learn how many Fairtrade organisations are there, and what areas are critical to our work.', 'What is Fairtrade', 'https://www.fairtrade.net/en/why-fairtrade/what-we-do.html'],
  ['Do you want to dive deep into how Fairtrade works?', 'Our how we work section covers the Fairtrade standards that are available, our different types of labels and a detailed list of our projects and programmes across the world.', 'Read more', 'https://www.fairtrade.net/en/why-fairtrade/how-we-do-it.html'],
  ['Do you want to become Fairtrade certified?', 'Our For Business section gives you a summary of the reasons why to get certified and all the steps you must follow.', 'Read more', 'https://www.fairtrade.net/en/for-business.html'],
  ['Do you want to read the latest news?', 'Visit our news section to stay informed', 'Read more', 'https://www.fairtrade.net/en/get-involved/news.html'],
];
const accordionSection = `
    <section class="AccordionSection">
      <h2 class="AccordionSection--title">Find what you are looking for</h2>
      <ul class="AccordionSection--list">${accordion.map(([q, a, cta, href], i) => `
        <li class="AccordionSection--item">
          <div class="Accordion">
            <div class="Accordion--header">
              <button class="Accordion--toggle" type="button" aria-expanded="false" aria-controls="accordion-item-${i + 1}-body"><span class="visuallyhidden">${q}</span></button>
              <div class="Button Accordion--button variant-icon-primary color-skyblue size-small"><span class="Button--icon">${I('chevron-down')}</span></div>
              <h3 class="Accordion--title">${q}</h3>
            </div>
            <div class="ActionItem--content" id="accordion-item-${i + 1}-body">
              <div class="Accordion--content--wrapper">
                <div class="Accordion--content--padding-box">
                  <div class="Richtext"><p>${a}</p></div>
                  <a class="Button variant-tertiary" href="${href}"><span class="Button--inner">${cta}</span></a>
                </div>
              </div>
            </div>
          </div>
        </li>`).join('')}
      </ul>
    </section>`;

const main = `
  <main class="maincontainer" data-content-fader>${hero}
${numberFacts({ color: 'flower', facts: [['1,824', 'producer organisations in 68 countries'], ['+37,000', 'products sold with the Fairtrade MARK in more than 140 countries']], label: 'Good for people and planet', title: 'Benefits of Fairtrade', text: 'Sustainable consumption and production has become the expectation rather than the exception. \n\nFairtrade offers solutions for companies and producers to put fairness at the heart of their operations.\n\n', cta: 'Key benefits', href: 'https://www.fairtrade.net/en/why-fairtrade/what-we-do/key-benefits.html' })}
    <section class="RichtextSection">
      <div class="Richtext">
        <h2 style="text-align: center">Latest News</h2>
      </div>
    </section>
${teaserGrid}
    <div class="CTASection"><a class="Button variant-primary color-skyblue size-large" href="https://www.fairtrade.net/en/get-involved/news.html"><span class="Button--inner">To all news</span></a></div>
    <section class="TextImage--wrapper">${wave('monochrome-100')}
${textImage({ cls: ' theme-grey', title: 'Fairtrade Products', text: 'What if purchases could drive sustainable growth, support communities, and protect resources? \n\nFrom cocoa to sugar and coffee, there is a wide array Fairtrade products creating measurable impact.', cta: 'Learn more', href: 'https://www.fairtrade.net/en/products.html', img: 'ti1' })}
    </section>
    <section class="TextImage--wrapper">
${textImage({ cls: ' order-reverse', title: 'Areas of focus', text: 'We want to build a world where everyone benefits from quality products, and enjoys quality of life. But this cannot be done in silo. You cannot separate human rights from environmental rights, child protection from living incomes and gender equity from worker’s rights. ', cta: 'Key issues', href: 'https://www.fairtrade.net/en/why-fairtrade/why-we-do-it.html', img: 'ti2' })}
    </section>
${numberFacts({ color: 'eggplant', facts: [['€ 1+ billion', 'Fairtrade Premium earned in the last 5 years alone'], ['+150', 'externally funded projects implemented since 2021']], label: 'Driven by results', title: 'Our impact', text: 'Achieving meaningful change requires significant systemic shifts.\n\nWe track our progress through various metrics, so our approach is well-informed and can continuously be improved.', cta: 'Learn more', href: 'https://www.fairtrade.net/en/why-fairtrade/impact.html' })}
    <section class="RichtextSection">
      <div class="Richtext">
        <h2><i>"Fairtrade has changed my life. Indeed, in a crisis situation, I have an inflow of money for my needs instead of going into debt. And Fairtrade has made me a woman leader.”</i></h2>
        <p>Affoué Angèle Kouassi has farmed cocoa on her own land for 14 years. She participated in Fairtrade’s Women’s School of Leadership in 2021.</p>
      </div>
    </section>
    <div class="CTASection"><a class="Button variant-primary color-skyblue size-large" href="https://www.fairtrade.net/en/why-fairtrade/impact/impact-stories-.html"><span class="Button--inner">Producer stories</span></a></div>
${accordionSection}
  </main>`;

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>English</title>
  <meta property="og:title" content="English">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/exo-2-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/alegreya-sans-latin-900-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="canon.css">
  <link rel="stylesheet" href="en.css">
  <script src="canon.js" defer></script>
</head>
<body>
${header(chrome, locales, { home: 'https://www.fairtrade.net/en.html', searchUrl: 'https://www.fairtrade.net/en/search-results.html', ...LOCALE })}
${main}
${footer(chrome, { ...LOCALE, newsletterHref: 'https://confirmsubscription.com/h/r/B7B6655272524E04' })}
</body>
</html>
`;
fs.writeFileSync(path.join(root, 'stardust/prototypes/en-proposed.html'), html);
console.log('wrote en-proposed.html', html.length);
