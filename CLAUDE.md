# URBN TRBL Theme – Arbeitsregeln für Claude

Eigenes Shopify-Liquid-Theme für URBN TRBL. Das Theme wird später **ohne Redesign** nach
Next.js + Medusa v2 portiert. Jede Entscheidung hier dient diesem Ziel: Design und
Verhalten liegen in portablen Artefakten (Tokens, CSS, Web Components, Specs), Liquid ist
nur die dünne Render-Schicht.

Sprache: Doku und Specs auf Deutsch, Code, Kommentare im Code und Identifier auf Englisch.

## Harte Regeln

1. **`design/tokens/tokens.json` ist die Single Source of Truth** für alle Design-Werte
   (Farben, Schrift, Abstände, Radien, Schatten, Breakpoints, Motion, z-Index).
   `assets/tokens.css` ist generiert und wird **nie** von Hand editiert.
   Nach jeder Token-Änderung: `npm run tokens:build`. CI/Pre-Push: `npm run tokens:check`.
   In Komponenten-CSS kommen **keine** Rohwerte (Hex, px für Abstände) vor, nur `var(--ut-…)`.
   Ausnahme: `0`, `1px`-Hairlines und `100%`/`auto`.
2. **Reines CSS, kein Sass/PostCSS/Tailwind.** BEM mit Präfix `ut-`: `.ut-block`,
   `.ut-block__element`, `.ut-block--modifier`. Der Präfix verhindert Kollisionen mit
   CSS von Shopify-Apps und Drittskripten. Eine Datei pro Komponente:
   `assets/component-<name>.css` (Dateiname ohne Präfix).
   Cascade Layers in dieser Reihenfolge: `reset, base, components, utilities`.
3. **Vanilla JS, ES-Module, Web Components.** Custom Elements mit Prefix `ut-`
   (`<ut-cart-drawer>`), eine Datei pro Element: `assets/ut-<name>.js`. Kein jQuery, kein
   Framework, kein Bundler. Alle Platform-Zugriffe (Cart, Produkt, Suche) laufen über
   `assets/ut-api.js`, nie direkt im Element. Das ist die Stelle, die beim Port
   durch einen Medusa-Adapter ersetzt wird.
4. **Jede Komponente hat eine Spezifikation** in `design/components/<name>.md`
   (Vorlage: `design/components/_TEMPLATE.md`), **bevor** Liquid/CSS/JS geschrieben wird.
   Neue Komponenten nur, wenn ein Blueprint in `design/blueprints/` sie braucht;
   sonst erst den Blueprint ändern.
   Die Spec beschreibt Anatomie (BEM), Datenvertrag (plattformneutral), Zustände,
   Accessibility, verwendete Tokens und Port-Hinweise.
5. **Jedes Metafeld ist dokumentiert** in `docs/metafields.md`, bevor es im Theme
   verwendet wird. Namespace immer `urbntrbl`.
6. **Vor jeder Installation (npm-Paket, CLI, Shopify-App, Skill):**
   Scan mit `nvidia-skillspector`, Risiko-Score nennen, **auf OK warten**. Keine
   Installation ohne explizites OK. Aktuell hat das Repo **null** npm-Dependencies,
   das soll so bleiben, solange es geht.
7. Brand-Werte (Logo, Farben, Schrift) sind noch offen. Platzhalter sind in `tokens.json`
   mit `"$description": "PLATZHALTER …"` markiert. Platzhalter nicht „verbessern“,
   sondern bis zur Freigabe stehen lassen.
8. Theme-Editor-Settings (`config/settings_schema.json`) enthalten **nur Inhalt und
   Verhalten** (Texte, Bilder, Ein/Aus, Anzahl), **keine** Farben, Fonts oder Abstände.
   Die kommen ausschließlich aus Tokens (siehe `docs/adr/0004`).

## Repo-Struktur

```
assets/            Shopify-Assets: tokens.css (generiert), base.css, component-*.css, ut-*.js, Fonts, Icons
blocks/            Shopify Theme Blocks (wiederverwendbar in Sections)
config/            settings_schema.json, settings_data.json
layout/            theme.liquid, password.liquid
locales/           en.default.json, de.json (Shop-Sprache ist Deutsch)
sections/          Shopify Sections (Liquid + {% schema %})
snippets/          Liquid-Partials (Render-Helfer, kein Design)
templates/         JSON-Templates (+ templates/customers/)

design/tokens/     tokens.json  ← Single Source of Truth
design/blueprints/ Seiten-Blueprints (Home, Collection, PDP, Drop, Cart): Sections, Daten, Zustände
design/components/ Komponenten-Specs (Markdown), _TEMPLATE.md, README.md = Inventar + Bau-Reihenfolge
docs/adr/          Architecture Decision Records (kurz, nummeriert)
docs/data-model.md Entitäten und Felder, aus den Blueprints abgeleitet
docs/metafields.md Metafeld-Registry
docs/portability.md Mapping Liquid/Shopify → Next.js/Medusa
scripts/           build-tokens.mjs (zero-dependency, Node ≥ 20)
```

Shopify kennt nur die oberen acht Ordner. `design/`, `docs/`, `scripts/` werden von
`shopify theme push` ignoriert und reisen beim Port mit.

## Befehle

```bash
npm run tokens:build      # tokens.json → assets/tokens.css
npm run tokens:check      # schlägt fehl, wenn tokens.css nicht aktuell ist
npm run dev               # shopify theme dev gegen den Dev-Shop
npm run check             # shopify theme check
```

Dev-Shop: `urbntrbl-dev-9tgmoc6p.myshopify.com`. Push nur auf unpublished Themes,
nie direkt auf das Live-Theme.

## Namenskonventionen

| Ding              | Konvention                         | Beispiel                              |
|-------------------|------------------------------------|---------------------------------------|
| CSS Custom Prop   | `--ut-<gruppe>-<pfad>`             | `--ut-color-text-default`             |
| BEM Block         | `ut-<name>`, kebab-case            | `.ut-product-card__price--sale`       |
| Custom Element    | `ut-<name>`                        | `<ut-quantity-input>`                 |
| CSS-Datei         | `component-<name>.css`             | `component-product-card.css`          |
| JS-Datei          | `ut-<element>.js`                  | `ut-quantity-input.js`                |
| Section           | `<name>.liquid`, Hauptsection `main-<template>.liquid` | `main-product.liquid` |
| Snippet           | `<name>.liquid`, Verb-first bei Helfern | `render-price.liquid`            |
| Metafeld          | `urbntrbl.<snake_case>`            | `urbntrbl.care_instructions`          |
| Locale-Key        | `<bereich>.<komponente>.<text>`    | `products.product_card.sold_out`      |

## Definition of Done für eine Komponente

- [ ] Spec in `design/components/<name>.md` vollständig
- [ ] CSS nutzt nur Tokens, liegt in `@layer components`, BEM-konform
- [ ] JS (falls nötig) als `ut-*` Custom Element, progressive enhancement, funktioniert ohne JS soweit sinnvoll
- [ ] Alle Texte über `{{ 'key' | t }}` aus `locales/`
- [ ] Verwendete Metafelder in `docs/metafields.md`
- [ ] `shopify theme check` ohne Fehler
- [ ] Port-Hinweise in der Spec ausgefüllt (was wird beim Next.js-Port zum Client Component, was zu Server Component)

## Was Claude nicht tun soll

- Keine Werte in `assets/tokens.css` ändern (Generat).
- Keine Shopify-Einstellungen für Farben/Fonts anlegen.
- Keine Inline-Styles in Liquid, außer dynamische Werte aus Settings/Metafeldern (dann als Custom Property, z. B. `style="--ut-section-bg-image: url(…)"`).
- Keine Dependencies, Apps oder CLIs ohne Scan und OK (Regel 6).
- Kein Dawn-Code kopieren. Referenz ist erlaubt, Copy-Paste nicht (Lizenz und Portabilität).
