# Dynamic features — plan

| phase | deliverables | authoring contract | verification | owner decision | effort |
|---|---|---|---|---|---|
| interactive | header flyouts, drawer, locale dialog, search overlay (runtime, foundation); hero/product carousel and accordion block JS | header/footer from nav/footer documents; carousel slides and accordion items as block rows | chrome-compare vs header contract; motion-compare per archetype | locale scope, search page | M |
| listings | news cards as authored rows + client-side Load more | one row per card | gate rows on news and home | index vs curated | S |
| media | IframeSection embed, video links | embed block with URL row | content-presence | — | S |
| tags | scripts/martech.js scaffolded from stardust/martech-contract.json, all routes disabled | owner flips `enabled` | dynamics-check martech feature | tags + CMP id | S |
