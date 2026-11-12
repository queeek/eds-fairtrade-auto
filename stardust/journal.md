# Journal — fairtrade.net replica

## Extract — 10 planned pages captured live (2026-11-05)
- crawl.mjs `--pages` (10 URLs from site-plan, concurrency 3, `--dynamics`): 10/10 live, http 200, waitMode medium. No bot wall.
- Crawler slugs carried a `-html` suffix; renamed to the site-plan slugs (en, us-en, …) in pages/, screenshots and _crawl-log.
- Style census at 1440 + 360; header contract via chrome-explore `--root .Topbar` (default root found 0 controls): 1440 = 7 controls (4 flyout menus, search, locale, drawer); 390 truncated at request budget.
- Fonts: Exo 2 (variable) + Alegreya Sans, OFL, self-hosted by source → copied to assets/fonts.
- Page types: landing (en, us-en, ch-fr), listing (us-en-news), static (about, contact, why-fairtrade), article (theory-of-change, child-protection, assuring-integrity).
- Vision: scroll-reveal sections blank in static full-page shots (en, us-en, child-protection), consent dialog on ch-fr, theory-of-change iframe blank.
- cap-probe: content cap 1920 (module), shell fluid; register candidates noted.
- Run is pages-scoped (10 URLs), so first-page-first two-track opening was not used; sequential phases instead.

## Preserve direction — spec promoted verbatim, empty register, dynamics triaged (2026-11-05)
- current/PRODUCT.md, DESIGN.md, DESIGN.json → project root, verbatim. direction.md in preserve mode.
- Inconsistency register empty (pure replica; hands-off adopts no audit items). cap-probe's register candidates (shell fluid vs 1920 on news; 399px single-module cap) are measurement notes, not deltas.
- Dynamics: detect on 4 archetypes, plan with --martech --chrome --target-origin; curated 16 rows into dynamic-features.md, all with dispositions. Martech: 2 GTM containers, Usercentrics on ch-fr, no Launch/OneTrust; contract written, all routes disabled.
- Publish decision recorded in eds-conversion-log.md.

## Recreate — landing archetype (en) gated (2026-11-05)
- Canon layer (canon.css/canon.js, fonts, tokens, Topbar, footer, shared modules) + en prototype, built by a subagent from the archetype brief (stardust/replica/archetype-brief.md).
- 1440: 3 rounds, 6.02% → 0.26%, Δh 0; 360: 2 rounds, 0.74%, Δh 0. content-diff 0🔴/0🟡, clip 0, no overflow, chrome parity ok, cap-probe PASS.
- Gate deviation: `gate.sh --full` not used (it starts ~6 Chromiums; machine limit is 3). The same probes ran as separate run-bg jobs with outputs in the gate dir under the --full file names.
- Motion: 11 behaviours observed and implemented; card hover + header scroll morph dead on live.

## Recreate — static archetype (us-en-about) gated (2026-11-05)
- 1440 0.03% / 360 0.10%, Δh 0, content-diff 0🔴/0🟡, clip 0, cap PASS. Mission/Vision is a baked image (SingleImage). Footer title links + locale per-page links handled in build script; canon requests queued.

## Recreate — article archetype (child-protection) gated (2026-11-05)
- 1440 0.00% / 360 0.00% (pixelmatch tolerance; PNGs differ byte-wise), Δh 0, content-diff 0🔴/0🟡, clip 0, cap PASS. Generic PageLead/Breadcrumbs/SingleImage CSS for theory-of-change + assuring-integrity siblings.

## Recreate — listing archetype (us-en-news) gated; prototype tables 4/4 (2026-11-05)
- us-en-news: 1440 1.96% / 360 1.99%, Δh 0, content-diff 0🔴/0🟡, clip 0, cap PASS. Load more reveals 6 cards/click from inline data (51 extra articles) — needs a data source at delivery.
- Prototype tables (gate-all --stage prototype): 1440 4/4 PASS, 360 4/4 PASS.
- Instrument notes: unit-geometry's origin cache `stardust/current/measure/<slug>-units.json` is not keyed by width — moved aside between widths (else 360 compared against 1440 origin geometry). gate-all ignores `required:false`, so the advisory families hero-slide (decorative peek slide + the source's stray ">" text node) and breadcrumb-item (hidden <1024 both sides) were removed from units.json.
- en: hero desktop images made eager (live loads all slides' desktop images).

## Handoff — started (2026-11-05)
- Phase 5 start written. Session ended at the context ceiling before rollout A-inventory. Prototype server (port 8791) stopped; restart from stardust/prototypes when needed.
- Resume: read replica/reference/handoff-contract.md § 3–5 by section; rollout A-inventory → B-block → B2 → C-deliver units (foundation, archetype×4, cluster×4, gate-all, final). Gate briefs: no `gate.sh --full` (3-browser limit); unit-geometry origin cache stardust/current/measure/*-units.json must be moved aside between widths.

## Migrate plan — 4 gated archetypes rendered to stardust/migrated (2026-11-05)
- `migrate.mjs render` over en, us-en-about, us-en-news, child-protection: rendered 4, refused 0; modules[] recorded per page. Sibling render units (landing 2, static 2, article 2; listing has none) wait for each template's C-archetype unit.

## A-inventory — 10 pages inventoried, 4 to deliver now (2026-11-05)
- inventory.mjs: 10/10 in scope; 4 archetypes pending, 6 siblings content-pending until their template's archetype is live. rollout.json site = aemcoder/a1eef8ec@main, live host main--a1eef8ec--aemcoder.aem.live.

## B-block — 9 distinct blocks, representative-first plan (2026-11-05)
- blocks.mjs: 9 module blocks, 15 instances. plan.mjs order: en (page-hero-carousel, number-fact-teaser, teaser-grid, text-image, accordion) → us-en-about (page-lead, single-image) → us-en-news (filtered-teaser-grid) → child-protection (breadcrumbs); every later page reuses. Blocks are shared across templates, so the archetype units run in that order, not concurrently.

## B2-dynamic — dynamic surface re-verified; martech runtime scaffolded (2026-11-05)
- dynamics-plan.mjs re-run with --target-origin (aem.page), --migrated, --martech, --chrome: 30 rows, 3 now delivered-by-capture (YouTube embeds, social links); curated dynamic-features.md unchanged (16 dispositions hold).
- martech-scaffold.mjs: scripts/martech.js written and hooked into scripts.js — no CMP, 0 routes enabled (contract parts all disabled; owner switches them on).

## C-deliver foundation — shared chrome, styles and fonts live and gated (2026-11-05)
- Foundation subagent: styles, self-hosted Alegreya Sans/Exo 2, favicon, template-slotted header/footer, 6 chrome docs (/, /us-en, /ch-fr nav+footer, Robots noindex) published live; per-locale chrome resolved by path prefix.
- Main-agent gate on /drafts/foundation-shell (preview only): header band 0.00%/0.00%, footer 0.77%/0.55% at 1440/360 vs live en. Fallback @font-face local("Arial") failed in the gate browser (no Arial) → added local("Liberation Sans") so captures do not flag font-not-loaded. chrome-compare: 1 delta (search click fades hero controls on source) deferred to the landing archetype unit.
- foundation-freeze.mjs freeze.

## C-deliver archetype-landing — /en live and gated (2026-11-05)
- 5 blocks converted (page-hero-carousel, number-fact-teaser, teaser-grid, text-image, accordion); gate-all 0.25% / 1.16% (1440/360), Δh 0, clip 0, missing 0; header 0.00%, footer 0.34%/0.55%; chrome-compare exit 0 on .topbar root. 2 fix rounds. units.json build selectors moved to EDS classes. 2 foundation requests queued.

## C-deliver archetypes + clusters — 10/10 pages live; foundation queue awaits C-final (2026-11-05)
- archetype-static 0.44/1.61, archetype-listing 1.45/2.54, archetype-article 0.06/1.06 (after page-lead gained optional lead image); clusters landing (us-en 5.74/7.32, ch-fr 0.87/1.21), static (0.37/2.32 worst), article (0.20/2.60 worst); listing cluster 0 pages. Render units landing/static/article done via a state copy (pages at `extracted` would be rendered as archetypes).
- Every /us-en page fails footer-link-row (Δh −42/−138, footer-only) → queued request in foundation-requests.md; theory-of-change fails |Δh| at 360 for that reason alone. C-final next: apply the queue (us-en footer doc + blocks/footer title links, hero skyblue controls, quote section, drop interim no-gap rule in product-teaser-carousel, localize the one link in content/us-en.html), re-gate affected archetypes, then gate-all unit, update-coverage --gate, C-deliver end.

## C-final — foundation queue applied, roster 10/10 at both widths (2026-11-05)
- Applied once: us-en footer titles as links (Δh −42/−138 on every us-en page → 0), leafgreen hero CTA/arrows skyblue, page-lead owns `no-gap` (interim rule removed). RichtextSection treatments kept block-scoped (gating clean). Foundation re-frozen.
- aem.live edge from this host kept pre-push block CSS cached (max-age 7200, admin POSTs did not clear it) → gates ran with `--eds-host` on aem.page (same published content). unit-geometry origin cache is not width-keyed: moved aside before each width.
- gate-all: 10/10 PASS 1440 (worst us-en 5.55%) and 360 (worst us-en 6.73%); coverage updated from both summaries.

## D-site — redirects sheet live, root answers, served sitemap = 10 (2026-11-05)
- Source root 302s to /us-en.html, so the sheet carries `/` and `/index.html` → /us-en plus the 10 `.html` → extensionless rows (stardust/redirects.tsv → DA /redirects.json, previewed + published). `/` 301 → /us-en 200 on aem.page and aem.live.
- All 6 chrome documents carry Robots noindex; assemble --verify-origin: served 10 = assembled 10, extra 0, missing 0.

## D2-dynamic — parity replayed on the published origin (2026-11-05)
- stardust/dynamics/parity.json written: 10 features, 11 checks (+ martech from the contract). aem.page and aem.live: menus, carousels (5 / 9 slides), accordion, product carousel (24), news cards (69), ToC iframe, no page errors on 10/10, martech gate (no tag host before consent, all parts disabled) PASS.
- locale dialog click-dialog reads "Escape closes: false": direct probe shows Escape closes it (class off, visibility hidden, focus returned) — the check samples inside the 200 ms source-matched fade. Recorded on the row; interim rows (locale list, search, news listing) carry their owner decisions.

## E-full-site — 10/10 verified on aem.live (2026-11-05)
- /us-en/news coverage row was left at `converting` by its archetype unit although live and gated; set `deployed` via update-coverage, then verify.mjs --base aem.live: 10 checked, 10 verified, 0 failed (reachable, no about:error, internal links resolve, gate pass true at both widths).
- No restoreAtDelivery entries (no autoplay/rotation observed on the source); render check per template covered by D2's dom-count + no-page-errors replay.

## E2-link-audit — delivered targets local, scope extension repointed to source (2026-11-05)
- localize-links: 2 source-host links to delivered pages localized (/us-en, /us-en/contact), both pages re-deployed live; --check exit 0. ≈375 out-of-plan targets kept absolute to www.fairtrade.net (scope extension; decision in direction.md).
- 10 distinct internal hrefs across content + chrome: all 200 on aem.live; verify 10/10.

## F-optimize — P1 gate clean; JSON-LD gap routed to G (2026-11-05)
- optimize.mjs --base aem.live --all: P1 0 · P2 10 · P3 0; 4 source-parity P3 (short titles, same on the source). The 10 P2 are missing JSON-LD: the source ships one `WebSite` object per page (alternateName Fairtrade / Fairtrade America / Fairtrade Switzerland by locale) → fixed in G.

## G-aem — source WebSite JSON-LD carried over on 10/10 pages (2026-11-05)
- autofix-aem routed eds-jsonld to manual; fixed through a `json-ld` page-metadata row (the pipeline renders it as <script type=application/ld+json> in the served head, no meta leak) carrying the source object verbatim per locale. 10 pages re-deployed live; optimize: P2 10 → 0, health 100/100; verify 10/10 (metadata rows render nothing in the body, gates unaffected).

## H-report — summary written (2026-11-05)
- stardust/rollout/report.md: 10/10 verified, 4 templates, 9 blocks, gate 10/10 both widths, health 100, open owner decisions listed. Three learnings recorded in stardust/learnings.md.

## I-dashboard — dashboard built (2026-11-05)
- stardust/rollout/dashboard/{index.html,data.json}: 10 pages identified · prototyped · deployed.

## Handoff — complete: 10/10 pages live, verified and gated (2026-11-05)
- Rollout A → I ended; done-check complete, no gaps. state.json: 10 migrated. Published-origin gate 10/10 PASS at 1440 and 360; optimize health 100; martech carried over with every part disabled (owner activates).
- Open owner decisions (not blockers): locale-switcher list, search results page, news listing source, martech activation.

