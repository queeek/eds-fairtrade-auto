# Martech hand-off

Everything below is scaffolded **off**. To ship it, set `enabled: true` on `consent.cmp` and on each route in `stardust/martech-contract.json`, then re-run `deploy/scripts/martech-scaffold.mjs` and `dynamics/scripts/dynamics-check.mjs` to confirm the enabled tags load. Enabled tags load on `www.fairtrade.net` only; preview with `?martech=on` (add `&consent=accept` to grant every category).

## Consent

- **CMP:** none detected
- **Model `owner-decision`:** no evidence of consent gating inside the tag manager. Keep the source behaviour (route `category` null), or set a route `category` to a consent group id to load that tag manager only once the group is granted.
- **Google Consent Mode:** consent-mode calls in `tags/www.googletagmanager.com-gtm-GTM-MTCXFW4G.js`, `tags/www.googletagmanager.com-gtm-GTM-P8D4TL3.js`. Check it with the owner before gating a route on a category.
- **Categories:** no CMP configuration read — run `spec-martech.mjs` first, or decide categories with the owner.

## Routes

| id | vendor | src | CMP groups listing its host | enabled |
|---|---|---|---|---|
| google-tag-manager-1 | Google Tag Manager | `https://www.googletagmanager.com/gtm.js?id=GTM-MTCXFW4G` | — | false |
| google-tag-manager-2 | Google Tag Manager | `https://www.googletagmanager.com/gtm.js?id=GTM-P8D4TL3` | — | false |

Also seen, not routed (loaded by the tag manager or inline on the source — confirm each still fires): consent: Usercentrics · analytics: Google Analytics / Ads · analytics: session replay · marketing: ad / retargeting pixel.

## Rewrite before go-live

Nothing found (or no tag-manager library read).

## Data layer

The source pages expose `adobeDataLayer`, `dataLayer`; keep the same global names.
Rules in Google Tag Manager were not parsed. Read each library listed in `martech/tags.json` and record its rules and data elements in the contract's `tagNotes`, keyed by tag manager, each citing where it was read (`from`); until then their triggers and events come from the tagging plan.
Ask the owner for the tagging plan (solution design reference): each event, its payload and the interaction that pushes it. With it, add each push in the block that owns the interaction.
