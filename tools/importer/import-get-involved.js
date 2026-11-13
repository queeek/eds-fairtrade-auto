/* eslint-disable */
/* global WebImporter */

import breadcrumbsParser from "./parsers/breadcrumbs.js";
import pageLeadParser from "./parsers/page-lead.js";
import cleanupTransformer from "./transformers/fairtrade-cleanup.js";
import sectionsTransformer from "./transformers/fairtrade-sections.js";

const PAGE_TEMPLATE = {
  "name": "get-involved",
  "urls": [
    "https://www.fairtrade.net/en/get-involved/Press-centre/fairtrade-raises-minimum-price-for-bananas-amid-soaring-costs-for-farmers.html",
    "https://www.fairtrade.net/en/get-involved/news/from-casual-worker-to-supervisor-jacqueline-chepsergon-25-year-journey-in-kenya-flower-industry.html"
  ],
  "representativeUrl": "https://www.fairtrade.net/en/get-involved/Press-centre/fairtrade-raises-minimum-price-for-bananas-amid-soaring-costs-for-farmers.html",
  "description": "News and press-release article pages under Get Involved: breadcrumbs, leafgreen page lead with title, date/category tags and lead image, then a rich-text article body.",
  "blocks": [
    {
      "name": "breadcrumbs",
      "instances": [
        "div.breadcrumb nav.Breadcrumbs",
        "nav.Breadcrumbs"
      ]
    },
    {
      "name": "page-lead",
      "instances": [
        "div.page-lead div.PageLead",
        ".PageLead"
      ]
    }
  ],
  "urlPattern": "/en/get-involved/*",
  "sections": [
    {
      "id": "section-1",
      "name": "Breadcrumbs and page lead",
      "selector": [
        "div.page-lead.is-visible",
        "div.page-lead"
      ],
      "style": null,
      "blocks": [
        "breadcrumbs",
        "page-lead"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "Article body",
      "selector": [
        "div.richtextsection.is-visible",
        "div.richtextsection"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        "div.RichtextSection div.Richtext"
      ]
    }
  ]
};

const parsers = {
  breadcrumbs: breadcrumbsParser,
  "page-lead": pageLeadParser,
};
// Late transformers change the DOM (section <hr> markers, shared fragments), so their beforeTransform
// runs after block discovery.
const sectionTransformers = [sectionsTransformer];
const fragmentTransformers = [];
const lateTransformers = [...sectionTransformers, ...fragmentTransformers];
const transformers = [cleanupTransformer, ...lateTransformers];
const earlyTransformers = transformers.filter((fn) => !lateTransformers.includes(fn));
// Catalog selectors (pageInstances, pageCleanup) count the <script> and <hr> elements the importer
// removes before transform, so a catalog template finds its targets in preprocess.
const CATALOG = Boolean(PAGE_TEMPLATE.pageCleanup || PAGE_TEMPLATE.blocks.some((b) => b.pageInstances));

function executeTransformers(hookName, element, payload, list = transformers) {
  const enhancedPayload = { ...payload, template: payload.params?.targets?.template || PAGE_TEMPLATE };
  list.forEach((fn) => {
    try { fn(hookName, element, enhancedPayload); }
    catch (e) { console.error(`Transformer failed at ${hookName}:`, e); }
  });
}

function findBlocksOnPage(document, template, url) {
  const pageBlocks = [];
  const pageKey = (u) => {
    try { const { origin, pathname } = new URL(u); return `${origin}${pathname.replace(/\/$/, "")}`; }
    catch { return u; }
  };
  const key = pageKey(url);
  const claim = (blockDef, selector) => {
    let matches = [];
    try { matches = document.querySelectorAll(selector); } catch { return; }
    matches.forEach((element) => {
      if (pageBlocks.some((b) => b.element === element || b.element.contains(element) || element.contains(b.element))) return;
      pageBlocks.push({ name: blockDef.name, selector, element });
    });
  };
  template.blocks.forEach((blockDef) => {
    const entry = Object.entries(blockDef.pageInstances || {}).find(([u]) => pageKey(u) === key);
    (entry ? entry[1] : []).forEach((selector) => claim(blockDef, selector));
  });
  template.blocks.forEach((blockDef) => (blockDef.instances || []).forEach((selector) => claim(blockDef, selector)));
  return pageBlocks;
}

// Runs the early transformers, then marks each block and section target with an attribute: the
// importer re-creates the body before transform, so only attributes survive, not element references.
function markPageTargets(payload) {
  const { document, params } = payload;
  executeTransformers("beforeTransform", document.body, payload, earlyTransformers);
  const blocks = findBlocksOnPage(document, PAGE_TEMPLATE, params.originalURL).map(({ name, selector, element }, i) => {
    element.setAttribute("data-excat-block", String(i));
    return { name, selector };
  });
  const sections = (PAGE_TEMPLATE.sections || []).map((section, i) => {
    const target = (section.selector || []).map((s) => { try { return document.querySelector(s); } catch { return null; } }).find(Boolean);
    if (!target) return section;
    target.setAttribute("data-excat-section", String(i));
    return { ...section, selector: [`[data-excat-section="${i}"]`] };
  });
  params.targets = { blocks, template: { ...PAGE_TEMPLATE, sections } };
}

export default {
  preprocess: (payload) => {
    if (CATALOG) markPageTargets(payload);
  },
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;
    params.fragments = [];

    if (!params.targets) markPageTargets(payload);
    const pageBlocks = params.targets.blocks
      .map((block, i) => ({ ...block, element: document.querySelector(`[data-excat-block="${i}"]`) }))
      .filter((block) => block.element);
    executeTransformers("beforeTransform", main, { ...payload, pageBlocks }, lateTransformers);

    pageBlocks.forEach((block) => {
      if (!main.contains(block.element)) return;
      const parser = parsers[block.name];
      if (!parser) return;
      try { parser(block.element, { document, url, params }); }
      catch (e) { console.error(`Failed to parse ${block.name} (${block.selector}):`, e); }
    });

    executeTransformers("afterTransform", main, payload);

    main.appendChild(document.createElement("hr"));
    // Page metadata, plus Tags from the source keywords (the article label, e.g. "Fairtrade news"
    // or "Press releases"), which teaser-grid shows above the title on linked cards.
    const meta = WebImporter.Blocks.getMetadata(document);
    const keywords = document.head?.querySelector('meta[name="keywords"]')?.content?.trim();
    if (keywords) meta.Tags = keywords;
    if (Object.keys(meta).length) main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // A fragment's nodes left main before afterTransform: finalize it the same way, without the
    // page-only section breaks and metadata.
    params.fragments.forEach(({ element }) => {
      executeTransformers("afterTransform", element, payload, earlyTransformers);
      WebImporter.rules.transformBackgroundImages(element, document);
      WebImporter.rules.adjustImageUrls(element, url, params.originalURL);
    });

    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, "")
      .replace(/\.html?$/, "");
    const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);

    return [{
      element: main,
      path,
      report: { title: document.title, template: PAGE_TEMPLATE.name, blocks: pageBlocks.map((b) => b.name) },
    }, ...params.fragments];
  },
};
