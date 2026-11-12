// Builds stardust/prototypes/us-en-why-fairtrade-why-we-do-it-child-protection-proposed.html
// (replica archetype: article — Breadcrumbs + PageLead + Richtext/NumberFact/Accordion/SingleImage).
// Content verbatim from stardust/current/pages/<slug>.(json|html); chrome from
// stardust/replica/tools/data/chrome-us-en.json; locale dialog list read from the captured page.
// Run: node stardust/replica/tools/build-child-protection.mjs
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import { header, footer, icon } from './chrome-html.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');
const SLUG = 'us-en-why-fairtrade-why-we-do-it-child-protection';
const ORIGIN = 'https://www.fairtrade.net';
const M = 'assets/media/';
const I = (id, cls) => icon(id, cls);
const esc = (s = '') => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ---------- chrome (us-en) ----------
const chrome = JSON.parse(fs.readFileSync(path.join(root, 'stardust/replica/tools/data/chrome-us-en.json'), 'utf8'));
// us-en footer list titles are links (FooterLinkList--title--link); chrome-us-en.json carries them as links[0].
const titleLinks = {};
chrome.footer.lists = chrome.footer.lists.map((l) => {
  if (l.links[0] && l.links[0].t === l.title) { titleLinks[l.title] = l.links[0].h; return { ...l, links: l.links.slice(1) }; }
  return l;
});

// Locale dialog list: per-page hrefs, read from the captured page (untrusted data — text/hrefs only).
const require = createRequire('/app/node_modules/');
const cheerio = require('cheerio');
const $ = cheerio.load(fs.readFileSync(path.join(root, `stardust/current/pages/${SLUG}.html`), 'utf8'));
const t = (el) => $(el).text().replace(/\s+/g, ' ').trim();
const ls = $('.LocaleSelector').first();
const locales = {
  lead: t(ls.find('.LocaleSelector--leadTitle')),
  text: t(ls.find('.LocaleSelector--leadText')),
  rest: { t: t(ls.find('.LocaleSelector--restOfTheWorld')), h: ls.find('.LocaleSelector--restOfTheWorld').attr('href') },
  filterLabel: t(ls.find('.LocaleSelector .Input--label, .Input--label').first()),
  regions: ls.find('.LocaleSelector--region').toArray().map((r) => ({
    name: t($(r).find('.LocaleSelector--regionName')),
    locales: $(r).find('.LocaleSelector--locale--link').toArray().map((a) => ({ t: t(a), h: $(a).attr('href') })),
  })),
};
const LOCALE = { localeLabel: 'US • EN', localeSr: 'Open or close the locale selector. The currently selected locale is US-EN.' };

// ---------- Breadcrumbs (live: inside <header>, absolutely positioned under the fixed Topbar) ----------
const crumbs = [
  { t: 'Home', h: `${ORIGIN}/us-en.html` },
  { t: 'Why Fairtrade' },
  { t: 'Why we do it', h: `${ORIGIN}/us-en/why-fairtrade/why-we-do-it.html` },
  { t: 'Child Protection', h: `${ORIGIN}/us-en/why-fairtrade/why-we-do-it/child-protection.html` },
];
const parent = crumbs[2];
const breadcrumbs = `
  <nav class="Breadcrumbs" aria-label="Breadcrumb">
    <div class="Breadcrumbs--desktop">
      <ol class="Breadcrumbs--list">${crumbs.map((c, i) => `
        <li class="Breadcrumbs--breadcrumb">${c.h
    ? `<a class="Breadcrumbs--breadcrumb--link" href="${c.h}">${c.t}</a>`
    : `<span class="Breadcrumbs--breadcrumb--title">${c.t}</span>`}${i < crumbs.length - 1 ? I('chevron-right', 'Breadcrumbs--breadcrumb--icon') : ''}</li>`).join('')}
      </ol>
    </div>
    <div class="Breadcrumbs--mobile">${I('chevron-left', 'Breadcrumbs--breadcrumb--icon')}<a class="Breadcrumbs--breadcrumb--link" href="${parent.h}">${parent.t}</a></div>
  </nav>`;

// ---------- main ----------
const pageLead = `
    <section class="PageLead theme-nightsky">
      <div class="PageLead--content">
        <div class="PageLead--contentGrid">
          <h1 class="PageLead--title">Fairtrade’s approach to child protection</h1>
          <p class="PageLead--lead">At Fairtrade, we are committed to fighting the root causes of child labour and preventing abuse and exploitation of children.</p>
        </div>
      </div>
      <div class="PageLead--image">
        <div class="PageLead--imageGrid">
          <div class="Image rectangular cover PageLead--imageMobile"><img src="${M}cp-lead-4x3_375w.webp" srcset="${M}cp-lead-4x3_375w.webp 375w, ${M}cp-lead-4x3_640w.webp 640w, ${M}cp-lead-4x3_768w.webp 768w, ${M}cp-lead-4x3_1280w.webp 1280w" sizes="calc(100vw - 36px)" alt="School playground and kids " width="375" height="281"></div>
          <div class="Image ultra-wide cover PageLead--imageDesktop"><img src="${M}cp-lead-21x9_1440w.webp" srcset="${M}cp-lead-21x9_768w.webp 768w, ${M}cp-lead-21x9_1280w.webp 1280w, ${M}cp-lead-21x9_1440w.webp 1440w, ${M}cp-lead-21x9_1920w.webp 1920w" sizes="(min-width: 1440px) 1344px, 94vw" alt="School playground and kids " width="1440" height="617"></div>
        </div>
      </div>
    </section>`;

const richtext = (body) => `
    <section class="RichtextSection">
      <div class="Richtext">
${body}
      </div>
    </section>`;

const intro = richtext(`        <p>Child protection is a key issue for Fairtrade, as child labor unfortunately remains commonplace in the agricultural sector, especially in communities who hardly earn a living income.</p>
        <p><u><a href="https://www.unicef.org/turkiye/en/press-releases/unicef-t%C3%BCrkiye-remains-committed-support-and-strengthen-national-strategies" target="_blank">UNICEF estimates</a></u>&nbsp;that 160 million children around the world are engaged in work that threatens their health and safety or interrupts schooling – 70 percent of them in the agricultural sector.</p>
        <p>Child labor refers to work – paid or unpaid – which harms a child’s health and wellbeing, their education, leisure or development. It involves both boys and girls, and in some regions such as sub-Saharan Africa,&nbsp;<u><a href="https://data.unicef.org/topic/child-protection/child-labour/" target="_blank">more than one child in four aged five to 17 are engaged in child labour</a></u>. The causes are multi-faceted and complex, but poverty remains the key driver.</p>
        <p>The Fairtrade approach to child protection is human rights-based and inclusive, and targets direct root causes.</p>`);

const bubble = `<svg width="100%" height="100%" viewBox="0 0 613 612" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" aria-hidden="true"><path d="M14.1082 290.5C40.7449 193.681 94.4564 111.976 147.182 61.5808C201.266 10.5752 254.364 -9.12045 311.194 3.89536C367.813 16.9369 422.737 56.6462 476.236 103.181C528.604 150.705 579.547 205.047 602.152 270.409C624.706 335.325 610.69 404.384 557.162 468.001C504.801 530.613 412.92 587.8 306.68 606.017C200.674 624.99 106.15 597.901 53.5555 538.058C-0.440844 478.842 -12.5139 386.872 14.1082 290.5Z" fill="currentColor"></path></svg>`;
const facts = [
  ['9M', 'additional working children after the Covid-19 pandemic and the subsequent global economic downturn, UNICEF estimates.'],
  ['1.5M', 'children aged five to 17 are working on cocoa farms in Côte d’Ivoire and Ghana alone.'],
];
const numberFacts = `
    <section class="NumberFactTeaser">
      <div class="NumberFactTeaser--slider">
        <ul class="NumberFactTeaser--items">${facts.map(([num, fact]) => `
          <li class="NumberFactTeaser--item">
            <div class="NumberFact color-eggplant">
              <div class="Bubble NumberFact--bubble color-eggplant">${bubble}</div>
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
        <strong class="NumberFactTeaser--label">Child labour</strong>
        <h2 class="NumberFactTeaser--title">Fast facts</h2>
        <p class="NumberFactTeaser--text">Here are a few facts about this critical systemic issue.</p>
      </div>
    </section>`;

const accordionItems = [
  ['Strong Standards', `<p>Strong standards:&nbsp;Fairtrade Standards prohibit <a href="https://www.ilo.org/international-programme-elimination-child-labour-ipec/what-child-labour/ilo-conventions-child-labour" target="_blank">child labor as defined by the International Labour Organization (ILO)</a>. That includes tackling root causes of child labor such as poverty and lack of access to education. Children under 15 must not be employed by Fairtrade organisations; under-18s cannot do work that jeopardizes their schooling or their development. Children are only allowed to help on family farms under strict conditions, including outside school hours or during holidays.</p>`],
  ['Targeted projects and programs', `<p>The&nbsp;<u>Fairtrade Child Labour and Forced Labour Prevention and Remediation Programme</u>&nbsp;has an initial €450,000 budget to help cocoa cooperatives in West Africa invest in generating&nbsp;additional household income so they don’t have to put children to work. Grants are also be available for children’s education and for community projects that address household poverty.</p>`],
  ['Community-based monitoring', `<p>Since 2016,&nbsp;<u><a href="https://www.fairtrade.org.uk/media-centre/blog/how-fairtrade-is-tackling-child-labour/" target="_blank">Fairtrade’s Youth-Inclusive Community-Based Monitoring and Remediation</a></u>&nbsp;(YICBMR) system has been deployed in 18 countries, covering various Fairtrade producers. An&nbsp;<u><a href="${ORIGIN}/content/dam/fairtrade/global/why-we-do-it/child-protection/Child-labour-monitoring-and-remediation-systems-study-dec2021-summary.pdf">independent report</a></u>&nbsp;found that Fairtrade’s YICBMR system was more relevant, stronger, more effective in awareness raising and capacity building, prevention, monitoring, and remediation than existing Internal Control Systems.</p>`],
];
const accordionSection = `
    <section class="AccordionSection">
      <h2 class="AccordionSection--title">How Fairtrade supports child protection</h2>
      <ul class="AccordionSection--list">${accordionItems.map(([q, a], i) => `
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
                  <div class="Richtext">${a}</div>
                </div>
              </div>
            </div>
          </div>
        </li>`).join('')}
      </ul>
    </section>`;

const singleImage = `
    <section class="SingleImage size-content">
      <figure class="SingleImage--figure">
        <div class="Image landscape SingleImage--image desktop"><img src="${M}cp-single-16x9_1280w.webp" srcset="${M}cp-single-16x9_768w.webp 768w, ${M}cp-single-16x9_1280w.webp 1280w, ${M}cp-single-16x9_1440w.webp 1440w, ${M}cp-single-16x9_1920w.webp 1920w" sizes="(min-width: 1024px) 78vw, 92vw" alt="" width="1280" height="720" loading="lazy"></div>
        <div class="Image rectangular SingleImage--image mobile"><img src="${M}cp-single-4x3_375w.webp" srcset="${M}cp-single-4x3_375w.webp 375w, ${M}cp-single-4x3_640w.webp 640w, ${M}cp-single-4x3_768w.webp 768w" sizes="calc(100vw - 36px)" alt="" width="375" height="281" loading="lazy"></div>
      </figure>
    </section>`;

const quote = richtext(`        <p><b>“The level of exploitation of children in cocoa growing areas has been a stumbling block to their education and the result has been the cyclical nature of poverty in these communities. Children can open up to you and discuss anything that troubles them if they feel safe with you. Community participation and active involvement eliminates the defensive position and enhances ownership and cooperation.”</b></p>
        <p>Anthony Badu, Fairtrade YICBMR monitor, Ghana</p>`);

const mitigation = richtext(`        <h3>Child protection through mitigation and remediation</h3>
        <p>If Fairtrade finds breaches of our child protection requirements in any Fairtrade certified organisation, we will take immediate action to protect the impacted child or children:</p>
        <ul>
          <li>We work with national child protection agencies, local authorities and child rights organisations to ensure children’s safe remediation and long-term wellbeing.</li>
          <li>Fairtrade connects companies with producers to tackle child labour - for example through the voluntary best practice section of Fairtrade’s <a href="${ORIGIN}/en/why-fairtrade/how-we-do-it/standards/who-we-have-standards-for/trader-standard.html" target="_blank">Trader Standard</a>.</li>
        </ul>
        <p>Ending child labor needs everyone – farmers, consumers, businesses and governments to play their part.</p>
        <p><b>By purchasing Fairtrade products you are not only supporting producers to earn a better living and send their children to school, but to also tackle the underlying causes of child labor in their communities.</b></p>
        <p>&nbsp;</p>`);

const resources = richtext(`        <h3>RESOURCES</h3>
        <ul>
          <li><p><u><a href="${ORIGIN}/content/dam/fairtrade/global/why-we-do-it/child-protection/2015_FairtradeChildForcedLabourGuidelines.pdf" target="_blank">Fairtrade's Child Labour and Forced Labour guidelines</a> (PDF)</u></p></li>
          <li><p><u>Fairtrade:&nbsp;Comparative Assessment of Monitoring and Remediation Systems on Child Labour as implemented by Fairtrade Small-scale Producer Organizations&nbsp;(2021)</u></p></li>
          <li><p><u>Global Deal:&nbsp;<a href="https://www.theglobaldeal.com/news/new-good-practice-case-fairtrade-belize.htm" target="_blank">New Good Practice case: Eliminating Child Labour: Lessons learned from Belize</a>&nbsp;(Nov 2021)</u></p></li>
          <li><p><u>US Department of Labor:&nbsp;<a href="https://www.dol.gov/agencies/ilab/reports/child-labor/list-of-goods" target="_blank">List of goods produced by child labor or forced labor</a></u></p></li>
          <li><p><u><a href="https://www.theglobaldeal.com/news/new-good-practice-case-fairtrade-belize.htm" target="_blank">New Good Practice case: Eliminating Child Labour: Lessons learned from Belize</a></u></p></li>
          <li><p><u><a href="https://www.ilo.org/sites/default/files/wcmsp5/groups/public/@asia/@ro-bangkok/@ilo-yangon/documents/publication/wcms_531953.pdf" target="_blank">International Labour Organization (ILO) definition of child labour</a> (PDF)</u></p></li>
        </ul>`);

const main = `
  <main class="maincontainer" data-content-fader>${pageLead}
${intro}
${numberFacts}
${accordionSection}
${singleImage}
${quote}
${mitigation}
${resources}
  </main>`;

// header: Breadcrumbs sit inside <header> after the Topbar (live structure)
let head = header(chrome, locales, { home: `${ORIGIN}/us-en.html`, searchUrl: `${ORIGIN}/us-en/search-results.html`, logo: `${M}Fairtrade_America_Logo_Vert_80x80.png`, ...LOCALE });
head = head.replace(/<\/header>$/, `${breadcrumbs}\n</header>`);
let foot = footer(chrome, { ...LOCALE, newsletterHref: 'https://fairtrade.net/us-en/fairtrade-newsletter.html', newsletterLabel: 'Click to sign up' });
foot = foot.replace(/<div class="FooterLinkList--title"><span>([^<]*)<\/span><\/div>/g, (m, title) => {
  const h = titleLinks[title.replace(/&amp;/g, '&')];
  return h ? `<div class="FooterLinkList--title">${I('chevron-right', 'FooterLinkList--title--icon')}<a class="FooterLinkList--title--link" href="${esc(h)}">${title}</a></div>` : m;
});

const html = `<!DOCTYPE html>
<html lang="en-US">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Child Protection</title>
  <meta property="og:title" content="Child Protection">
  <link rel="icon" href="assets/favicon.svg" type="image/svg+xml">
  <link rel="preload" href="assets/fonts/exo-2-latin-wght-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="preload" href="assets/fonts/alegreya-sans-latin-900-normal.woff2" as="font" type="font/woff2" crossorigin>
  <link rel="stylesheet" href="canon.css">
  <link rel="stylesheet" href="${SLUG}.css">
  <script src="canon.js" defer></script>
</head>
<body>
${head}
${main}
${foot}
</body>
</html>
`;
fs.writeFileSync(path.join(root, `stardust/prototypes/${SLUG}-proposed.html`), html);
console.log(`wrote ${SLUG}-proposed.html`, html.length, 'regions', locales.regions.length);
