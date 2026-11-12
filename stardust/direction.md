---
_provenance:
  writtenBy: stardust:replica
  writtenAt: 2026-11-05T10:37:12Z
  againstInput: https://www.fairtrade.net/
  readArtifacts:
    - stardust/current/PRODUCT.md
    - stardust/current/DESIGN.md
    - stardust/current/DESIGN.json
---

# Direction — preserve mode (same-design migration)

Mode: PRESERVE. The target spec is the captured current state of https://www.fairtrade.net/,
promoted verbatim (no direct invocation, no creative decisions).

Promoted: current/PRODUCT.md → PRODUCT.md · current/DESIGN.md → DESIGN.md ·
current/DESIGN.json → DESIGN.json (at 2026-11-05T10:37:12Z).

Permitted deltas: ONLY the entries of stardust/replica/inconsistency-register.md
(empty — pure replica).

Fidelity: ia verbatim · design verbatim · content verbatim.

Scope: the 10 pages of stardust/.labs/site-plan.json (pages-scoped run). Gate widths 1440, 360.

## Link-audit decision (E2, 2026-11-05)
- Internal targets outside the fixed 10-page plan (≈375 distinct source paths: other locale roots, news articles, deeper why-fairtrade pages, business/media pages) are SCOPE EXTENSION — the page scope is fixed for this run — and stay as absolute links to www.fairtrade.net. No capture gaps: every captured page is delivered.
- Links to delivered pages are root-relative (2 localized at E2: /us-en, /us-en/contact); all 10 distinct internal hrefs answer 200 on aem.live.
