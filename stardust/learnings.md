# Learnings — fairtrade.net replica

- 2026-11-05 · rollout C-final: the aem.live edge as seen from the run host kept block CSS cached for its full 2 h max-age after a push (admin code/cache POSTs answered 200 but did not clear it); gate on the preview host (`--eds-host https://…aem.page`, scheme required — a bare host fails every probe with "invalid URL") when code changed within the last 2 h.
- 2026-11-05 · gate-all: unit-geometry's origin inventory cache (stardust/current/measure/<slug>-units.json) is not width-keyed; move it aside before each width's run or the other width's boxes report as "off".
- 2026-11-05 · G-aem: source JSON-LD carries over through a `json-ld` page-metadata row — the pipeline renders it as a head script, no visible change, no gate impact.
