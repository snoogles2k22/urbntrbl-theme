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
   Komponenten nutzen nur Semantik-Tokens (`color.text.*`, `color.bg.*`, `color.action.*`,
   `radius.control` …), nie Primitive (`color.neutral.*`, `color.brand.*`).
   Scopes (z. B. `tone: inverse`) stehen in `tokens.json` unter `$scopes`, nie als
   Handmapping in CSS. Text-Paare halten 4.5:1, Bedienelement-Rahmen 3:1; neue Paare
   vor dem Einsatz nachrechnen und den Wert in `$description` notieren.
   Lokale Custom Properties einer Komponente heißen `--_name`. Sie zeigen nur auf Tokens
   und werden in `:hover`/Zuständen nie aus sich selbst neu berechnet (var()-Zyklen).
2. **Reines CSS, kein Sass/PostCSS/Tailwind.** BEM mit Präfix `ut-`: `.ut-block`,
   `.ut-block__element`, `.ut-block--modifier`. Der Präfix verhindert Kollisionen mit
   CSS von Shopify-Apps und Drittskripten. Eine Datei pro Komponente:
   `assets/component-<name>.css` (Dateiname ohne Präfix).
   Cascade Layers in dieser Reihenfolge: `reset, base, components, utilities`.
3. **Vanilla JS, ES-Module, Web Components.** Custom Elements mit Prefix `ut-`
   (`<ut-cart-drawer>`), eine Datei pro Element: `assets/ut-<name>.js`. Kein jQuery, kein
   Framework, kein Bundler. Alle Platform-Zugriffe (Cart, Produkt, Suche, Section
   Rendering API, Serverzeit) laufen über `assets/ut-api.js`, nie direkt im Element.
   Kein globales `window.*`-Objekt. Das ist die Stelle, die beim Port
   durch einen Medusa-Adapter ersetzt wird.
4. **Jede Komponente hat eine Spezifikation** in `design/components/<name>.md`
   (Vorlage: `design/components/_TEMPLATE.md`), **bevor** Liquid/CSS/JS geschrieben wird.
   Neue Komponenten nur, wenn ein Blueprint in `design/blueprints/` sie braucht;
   sonst erst den Blueprint ändern.
   Die Spec beschreibt Anatomie (BEM), Datenvertrag (plattformneutral), Zustände,
   Accessibility, verwendete Tokens und Port-Hinweise.
   Snippets beginnen mit einem LiquidDoc-Block (`{% doc %}` mit `@param`, `@example`).
   **Render-Argumente werten keine Filter aus:** `{% render 'x', label: 'key' | t %}`
   übergibt den rohen Key. Übersetzte oder berechnete Werte immer vorher `assign`en.
5. **Jedes Metafeld ist dokumentiert** in `docs/metafields.md`, bevor es im Theme
   verwendet wird. Namespace immer `urbntrbl`. Jedes globale Theme-Setting steht in
   der Theme-Settings-Registry in `docs/data-model.md`.
   Änderungen an Blueprint, Inventar, Datenmodell oder Registry ziehen die anderen
   drei nach. Punkte mit **[RECHT-PRÜFEN]** sind Annahmen, keine Rechtsberatung, und
   werden vor Launch geprüft.
6. **Vor jeder Installation (npm-Paket, CLI, Shopify-App, Skill):**
   Scan mit `nvidia-skillspector`, Risiko-Score nennen, **auf OK warten**. Keine
   Installation ohne explizites OK. Aktuell hat das Repo **null** npm-Dependencies,
   das soll so bleiben, solange es geht.
7. Brand-Farben sind freigegeben (2026-11-17, `color.brand.*`: black, offwhite, red,
   red-bright). `red-bright` nur auf dunklem Grund. Dunkle Flächen sind nur `brand.black`;
   auf Graustufen (`neutral.*`, `bg.muted`) kein roter Text. Die Neutralskala ist warm
   gestimmt. Grün (`signal.success`) ist nicht Teil der Marke: nur Formular-Feedback,
   nie Badges oder Flächen. Live-Status = schwarze Badge mit rotem Punkt.
   Body- und Heading-Schrift ist Archivo (OFL, `assets/Archivo-Variable.woff2`).
   Logo und Radien sind noch offen: Platzhalter sind in `tokens.json` mit
   `"$description": "PLATZHALTER …"` markiert. Platzhalter nicht „verbessern“, sondern bis zur Freigabe stehen lassen.
   **Display-Font:** `font.family.display` („UT Display“, `assets/URBNTRBLGothic-Regular.woff2`,
   URBN TRBL Gothic) ist eine **Demo-Version 0.2, Kerning noch offen**. Fallback Georgia, serif.
   Regeln:
   - Display nur über die Komponenten-Tokens `component.wordmark`, `component.hero-headline`
     und `component.section-title`, **nie über Tag-Selektoren** (`h1`, `h2` sind Archivo).
   - Mindestgröße `font.display.min-size` (32px). Alles darunter ist Archivo, auch
     Styleguide-Labels, Rich-Text-Überschriften, h3/h4, Body, Preise, Formulare.
   - Größen: Hero/h1-Rolle `font.size.hero` = clamp(2.75rem, 8vw, 7rem),
     Section-Titel/h2-Rolle `font.size.title` = clamp(2rem, 4vw, 3rem).
   - Nur Regular, `font-synthesis: none` an jeder Verwendung.
   - Letter-Spacing `font.display.letter-spacing` = -0.01em bis Font v0.3.
8. Theme-Editor-Settings (`config/settings_schema.json`) enthalten **nur Inhalt und
   Verhalten** (Texte, Bilder, Ein/Aus, Anzahl), **keine** Farben, Fonts oder Abstände.
   Die kommen ausschließlich aus Tokens (siehe `docs/adr/0004`).

## Repo-Struktur

```
assets/            Shopify-Assets: tokens.css (generiert), base.css, component-*.css, ut-*.js, Fonts, Icons
blocks/            Shopify Theme Blocks (wiederverwendbar in Sections)
config/            settings_schema.json, settings_data.json
layout/            theme.liquid, password.liquid
locales/           de.default.json (Default), en.json (zweitsprachig), *.schema.json analog
sections/          Shopify Sections (Liquid + {% schema %})
snippets/          Liquid-Partials (Render-Helfer, kein Design)
templates/         JSON-Templates (+ templates/customers/)

design/tokens/     tokens.json  ← Single Source of Truth
design/blueprints/ Seiten-Blueprints (Home, Collection, PDP, Drop, Cart): Sections, Daten, Zustände
design/logic/      Seitenübergreifendes Verhalten (drop.md: Status, Countdown, Restmenge, Ausverkauf, Warteliste)
design/components/ Komponenten-Specs (Markdown), _TEMPLATE.md, README.md = Inventar + Bau-Reihenfolge
docs/adr/          Architecture Decision Records (kurz, nummeriert)
docs/data-model.md Entitäten, Felder und Theme-Settings-Registry, aus den Blueprints abgeleitet
docs/metafields.md Metafeld-Registry
docs/migration.md  Port-Plan Liquid → React/Medusa pro Komponente und Seite, Risiken, Aufwand
docs/reviews/      Konsistenz-Reviews mit Befunden und offenen Entscheidungen
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
