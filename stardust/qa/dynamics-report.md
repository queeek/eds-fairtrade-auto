# Dynamics parity check — https://main--a1eef8ec--aemcoder.aem.live — 2026-11-05T16:43:11.997Z

Replayed 11 checks over 11 features · pass 10 · fail 1. Flows, not presence.

| feature | class | status | check | result | detail | third-party requests |
|---|---|---|---|---|---|---|
| header flyout menus | M | done | dom-count | PASS | 4 × header button.main-nav-button (min 4) |  |
| locale selector dialog | I18N | interim | click-dialog | FAIL | dialog 1440px · heading "Go to a local website" · 1 fields · Escape closes: false |  |
| header search overlay | S | interim | dom-count | PASS | 1 × header button.topbar-search-trigger (min 1) |  |
| PageHeroCarousel | M | done | dom-count | PASS | 5 × .page-hero-carousel .page-hero-slide (min 2) |  |
| PageHeroCarousel | M | done | dom-count | PASS | 9 × .page-hero-carousel .page-hero-slide (min 2) |  |
| AccordionSection | M | done | dom-count | PASS | 3 × .accordion .accordion-item (min 2) |  |
| ProductTeaserCarousel | M | done | dom-count | PASS | 24 × .product-teaser-carousel .product-teaser-carousel-item (min 2) |  |
| news cards + Load more | L | interim | dom-count | PASS | 69 × .filtered-teaser-grid .teaser-grid-item (min 6) |  |
| Theory of Change embed | V | done | dom-count | PASS | 1 × iframe[src*="toc.fairtrade.net"] (min 1) | toc.fairtrade.net:200×26 matomo.schuttelaar.net:200×2 |
| page runtime | A | done | no-page-errors | PASS | none on 10 page(s) |  |
| martech: consent + tag routing | T | scaffolded-off | martech | PASS | no tag host requested (1 gated · 0 cross-site host(s) blocked) |  |

## Features without checks

- YouTube / Vimeo links (V) — done
