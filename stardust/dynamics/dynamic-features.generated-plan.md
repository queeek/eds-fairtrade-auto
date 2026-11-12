<!-- stardust provenance: skill=stardust:dynamics · phase=plan draft · 2026-11-05T11:42:51.298Z · input stardust/current/_dynamics.json (4 pages, 30 findings) · target probe https://main--a1eef8ec--aemcoder.aem.page · reconciled against stardust/migrated -->
# Dynamic features — draft inventory (curate into `stardust/dynamic-features.md`)

One row per detected finding. Merge duplicates, drop noise, keep every axis honest. Columns: disposition = what we do · target = the delivery form (widget where no authored rows remain) · reproducibility = what it needs · status = where it stands (reference/triage.md).

| # | id | class | feature | pages | disposition | target | reproducibility | status | pattern | decision needed | notes |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | a-cms-app-settings-object-datalayer | A | CMS / app settings object dataLayer | 4/4 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 2 | a-cms-app-settings-object-adobedatalayer | A | CMS / app settings object adobeDataLayer | 4/4 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 3 | a-cms-app-settings-object-granite | A | CMS / app settings object Granite | 4/4 | static-snapshot | content | self | pending | read-settings | — (keys name endpoints, ids, vendors) |  |
| 4 | a-unknown-third-party-host-www-google-com | A | unknown third-party host www.google.com | 3/4 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 5 | a-unknown-third-party-host-px-ads-linkedin-com | A | unknown third-party host px.ads.linkedin.com | 3/4 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 6 | a-unknown-third-party-host-v5-b75ccb2b73c54aa4a5098ab7f85336 | A | unknown third-party host v5-b75ccb2b73c54aa4a5098ab7f8533696.ecs.us-east-2.on.aws | 3/4 | static-snapshot | — | needs-human-capture | pending | inspect | inspect the XHR, add a vendor row |  |
| 7 | d-first-party-data-file-get-libs-granite-csrf-token-json | D | first-party data file GET /libs/granite/csrf/token.json | 4/4 (reach 10/10) | data-fed | content | self | pending | sheet-sync | none (sync from the source origin) | **dead on target (404)** |
| 8 | i18n-locale-variants-bg-bg-hr-hr-gr-el-hu-hu-mt-en | I18N | locale variants bg-bg,hr-hr,gr-el,hu-hu,mt-en | 1/4 | rebuild-native | runtime | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 9 | i18n-locale-variants-bg-bg-hr-hr-gr-el-hu-hu-it-it | I18N | locale variants bg-bg,hr-hr,gr-el,hu-hu,it-it | 1/4 | rebuild-native | runtime | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 10 | i18n-locale-variants-en-bg-bg-ca-en-hr-hr-gr-el | I18N | locale variants en,bg-bg,ca-en,hr-hr,gr-el | 1/4 | rebuild-native | runtime | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 11 | i18n-locale-variants-en-at-de-bg-bg-ca-en-ca-fr | I18N | locale variants en,at-de,bg-bg,ca-en,ca-fr | 1/4 | rebuild-native | runtime | needs-business-decision | pending | locale-tree | scope of the locale trees |  |
| 12 | l-listing-candidate-swiper-wrapper-3-cards | L | listing candidate swiper-wrapper (3 cards) | 1/4 | index-backed | block | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 13 | l-listing-candidate-teasergrid-grid-18-cards | L | listing candidate TeaserGrid--grid (18 cards) | 1/4 | index-backed | block | needs-business-decision | pending | listing-index-backed | index-driven or editorially curated? |  |
| 14 | m-modal-trigger-aria-haspopup-chrome-only-dialog-form | M | modal trigger aria-haspopup (chrome only) → dialog:form | 4/4 (reach 30/10) | rebuild-native | runtime | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 15 | s-site-search-form-js-submitted | S | site search form → (JS-submitted) | 4/4 (reach 0/10) | index-backed | widget | self | pending | search-index-backed | none (corpus = the migrated pages; second corpora stay out) |  |
| 16 | t-tag-manager-google-tag-manager | T | tag manager: Google Tag Manager | 4/4 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 17 | t-analytics-google-analytics-ads | T | analytics: Google Analytics / Ads | 4/4 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 18 | t-marketing-ad-retargeting-pixel | T | marketing: ad / retargeting pixel | 3/4 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 19 | t-analytics-session-replay | T | analytics: session replay | 3/4 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 20 | t-unknown-third-party-host-www-facebook-com | T | unknown third-party host www.facebook.com | 3/4 | embed-passthrough | embed | needs-business-decision | delivered-by-capture | consent-gated-tags | which tags run on the new host; property ids | output already carries "www.facebook.com" |
| 21 | t-unknown-third-party-host-www-linkedin-com | T | unknown third-party host www.linkedin.com | 3/4 | embed-passthrough | embed | needs-business-decision | delivered-by-capture | consent-gated-tags | which tags run on the new host; property ids | output already carries "www.linkedin.com" |
| 22 | t-unknown-third-party-host-c-bing-com | T | unknown third-party host c.bing.com | 3/4 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 23 | t-unknown-third-party-host-www2-fairtradeamerica-org | T | unknown third-party host www2.fairtradeamerica.org | 2/4 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | which tags run on the new host; property ids |  |
| 24 | t-consent-usercentrics | T | consent: Usercentrics | 1/4 | embed-passthrough | embed | needs-business-decision | pending | consent-gated-tags | CMP domain script reuse on the new host |  |
| 25 | v-video-vimeo | V | video: Vimeo | 3/4 | embed-passthrough | content | self | pending | media-as-url | none (player ids are public) |  |
| 26 | v-video-youtube | V | video: YouTube | 3/4 | embed-passthrough | content | self | delivered-by-capture | media-as-url | none (player ids are public) | output already carries "www.youtube.com" |
| 27 | chrome-search | S | header search: Open the search box, Search Open the search box (chrome only) | 1/1 | index-backed | widget | self | pending | search-index-backed | none (results from the query index; overlay and typeahead per the contract) |  |
| 28 | chrome-drawer | M | header drawer: Open Mobile Menu Close Mobile Menu, Open Open the meta menu (chrome only) | 1/1 | rebuild-native | runtime | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 29 | chrome-menu | M | header menu: Why Fairtrade, Products, For Business, Get Involved (chrome only) | 1/1 | rebuild-native | runtime | self | pending | chrome-interaction | none (the header contract is the spec) |  |
| 30 | chrome-locale | I18N | header locale: GLOBAL • EN Open or close the locale selector. The currently selected locale is  (chrome only) | 1/1 | rebuild-native | runtime | needs-business-decision | pending | locale-tree | which locales the switcher lists |  |

## Triage

- **Ships autonomously (reproducibility `self`):** 10 row(s) — read-settings, sheet-sync, chrome-interaction, search-index-backed, media-as-url.
- **One owner decision batch:** 17 row(s) — inspect the XHR, add a vendor row · scope of the locale trees · index-driven or editorially curated? · which tags run on the new host; property ids · CMP domain script reuse on the new host · which locales the switcher lists.
- **Already delivered by the capture pipeline:** 3 row(s) — no work.
- **Host-bound on the target:** 1 of 1 probed API paths — the off-origin data work.
- **Martech:** no CMP · 0/2 route(s) enabled by the owner — `stardust/martech-handoff.md`.

## Phases

- **tags** — 9
- **detect** — 6
- **interactive** — 5
- **locale wave** — 4
- **listings** — 2
- **media** — 2
- **data** — 1
- **search** — 1
