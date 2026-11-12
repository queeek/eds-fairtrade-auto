# Dynamic features — www.fairtrade.net (10-page replica scope)

Curated from `stardust/dynamics/dynamic-features.generated-plan.md` (30 draft rows) + crawl reach (10/10 pages). Hands-off: every non-self row ships its interim tier; the decision is recorded by name, never as decided-out.

## Listings contract
News cards (us-en-news TeaserGrid, 18 cards + "Load more"; home "Latest News" rows) link to article pages outside this run's scope. Delivered document-first: each card is an authored row (image, date, eyebrow, title, excerpt, link to the source article URL). No query index is read in this run; `Load more` is reproduced as a client-side reveal of the authored rows beyond the first visible set. Meta fields for a later index: `title`, `description`, `image`, `date`, `category`.

## Features
| # | id | feature | class | reach | disposition | target | reproducibility | status | pattern | decision / owner | evidence |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | chrome-menu | header flyout menus (Why Fairtrade, Products, For Business, Get Involved) | M | 10/10 | rebuild-native | runtime | self | planned | chrome-interaction | — header contract is the spec | stardust/chrome/header-contract.json |
| 2 | chrome-drawer | mobile drawer + meta menu | M | 10/10 | rebuild-native | runtime | self | planned | chrome-interaction | — | header contract @390 |
| 3 | chrome-locale | locale selector dialog (28 regions) | I18N | 10/10 | rebuild-native | runtime | needs-business-decision | interim | locale-tree | which locales the switcher lists — interim: full list, out-of-scope locales link to the source origin | m-modal-trigger rows |
| 4 | chrome-search | header search overlay | S | 10/10 | index-backed | widget | self | interim | search-index-backed | interim: overlay rebuilt; query submits to the source site search until a results page is in scope | s-site-search-form-js-submitted |
| 5 | hero-carousel | PageHeroCarousel (Swiper) | M | 3/10 | rebuild-native | block | self | planned | carousel | — | swiper-wrapper |
| 6 | accordion | AccordionSection (FAQ / documents) | M | 5/10 | rebuild-native | block | self | planned | disclosure | — | Accordion |
| 7 | product-carousel | ProductTeaserCarousel (ch-fr) | M | 1/10 | rebuild-native | block | self | planned | carousel | — | ch-fr |
| 8 | news-listing | TeaserGrid / FilteredTeaserGrid news cards + Load more | L | 3/10 | static-snapshot | block | needs-business-decision | interim | listing-index-backed | index-driven or curated? interim: authored rows (articles out of scope) | l-listing-candidate-* |
| 9 | toc-iframe | Theory of Change embed (https://toc.fairtrade.net) | V | 1/10 | embed-passthrough | embed | self | planned | iframe-embed | — | IframeSection |
| 10 | video | YouTube / Vimeo players | V | 3/4 | embed-passthrough | content | self | planned | media-as-url | — | v-video-* |
| 11 | martech-gtm | Google Tag Manager ×2 (GTM-MTCXFW4G, GTM-P8D4TL3) + GA/Ads, LinkedIn, Facebook, Bing, Clarity via GTM | T | 4/4 | embed-passthrough | embed | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | which tags run on the new host — contract disabled | stardust/martech-contract.json |
| 12 | martech-consent | Usercentrics CMP (ch-fr) | T | 1/4 | embed-passthrough | embed | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | CMP settings id for the new host | t-consent-usercentrics |
| 13 | settings-objects | dataLayer / adobeDataLayer / Granite globals | A | 4/4 | static-snapshot | content | self | n/a | read-settings | undecided — revisit at rollout (no consumer on migrated pages) | a-cms-app-settings-* |
| 14 | csrf-token | GET /libs/granite/csrf/token.json (AEM author plumbing, dead on target) | D | 10/10 | static-snapshot | content | self | n/a | — | undecided — revisit at rollout (no consumer on migrated pages) | host-bound 404 |
| 15 | unknown-hosts | www.google.com, px.ads.linkedin.com, ecs.us-east-2.on.aws, facebook, linkedin, c.bing.com, www2.fairtradeamerica.org | T | 3/4 | embed-passthrough | embed | needs-business-decision | scaffolded-awaiting-owner | consent-gated-tags | GTM-injected; ride with row 11 | t-unknown-* |
| 16 | locale-variants | hreflang / alternate locale trees | I18N | 4/4 | rebuild-native | runtime | needs-business-decision | interim | locale-tree | locale tree scope — only en, us-en, ch-fr roots in scope | i18n-* |

## Decision batch
One message for the site owner (recorded, run continues on interim tiers):
1. **Tags & consent** — which GTM containers and tags run on the new host, and the Usercentrics settings id; everything ships disabled in `scripts/martech.js` (`stardust/martech-handoff.md`).
2. **Locale scope** — which locales beyond en / us-en / ch-fr move to the new site; until then the selector links to the source.
3. **Search** — a search results page on the new site; until then the header search submits to the source search.
4. **News listings** — index-driven or curated; interim is authored cards.

## Register (decided-out)
| feature | reason | production statement |
|---|---|---|
| — | none | — |
