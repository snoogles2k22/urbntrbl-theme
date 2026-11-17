# Portabilität: Shopify/Liquid → Next.js + Medusa v2

Dieses Dokument hält fest, was beim Port **unverändert** übernommen wird und was
ersetzt werden muss. Ziel: kein Redesign, nur Render-Schicht und Datenquelle tauschen.

## Was 1:1 mitgeht

| Artefakt                        | Shopify-Theme                 | Next.js                                         |
|---------------------------------|-------------------------------|-------------------------------------------------|
| Design Tokens                   | `design/tokens/tokens.json`   | identische Datei, gleicher Generator            |
| `tokens.css`                    | `assets/tokens.css`           | `app/tokens.css`, in `layout.tsx` importiert    |
| Basis-CSS                       | `assets/base.css`             | `app/base.css`, unverändert                     |
| Komponenten-CSS                 | `assets/component-*.css`      | pro Komponente importiert, unverändert          |
| Web Components (Logik)          | `assets/ut-*.js`              | als Client-Module geladen oder in React portiert; Verhalten laut Spec |
| Komponenten-Specs               | `design/components/*.md`      | Vertrag für die React-Implementierung           |
| Metafeld-Registry               | `docs/metafields.md`          | Mapping-Spalte „Medusa“                         |
| Locale-Texte                    | `locales/*.json`              | nach `messages/*.json` (next-intl o. ä.) konvertiert, Keys bleiben |

## Was ersetzt wird

| Shopify                              | Next.js + Medusa                                        |
|--------------------------------------|---------------------------------------------------------|
| Liquid Section + `{% schema %}`      | React Server Component + CMS/Config für Settings        |
| Liquid Snippet                       | React Component (Server)                                |
| `{{ product.* }}`                    | Medusa Store API `GET /store/products`                  |
| `product.metafields.urbntrbl.*`      | `product.metadata.*` oder eigenes Modul                 |
| `/cart.js`, `/cart/add.js`           | `POST /store/carts`, `/store/carts/:id/line-items`      |
| `assets/ut-api.js` (Shopify-Adapter) | `lib/api.ts` (Medusa-Adapter), **gleiches Interface**   |
| `{{ 'key' | t }}`                    | `t('key')`                                              |
| `money`-Filter                       | `Intl.NumberFormat`                                     |
| `image_url`-Filter                   | `next/image` mit Medusa-File-URL                        |
| Theme-Editor                         | CMS oder JSON-Config (Settings sind nur Inhalt/Verhalten) |
| Section Rendering API                | React-State / Server Actions                            |

## Regeln, die den Port billig halten

1. Kein Design in Liquid: keine Inline-Styles, keine Klassen, die von Settings abhängen,
   außer als Custom-Property-Übergabe (`style="--ut-x: …"`).
2. Jeder Plattform-Zugriff im JS läuft über `ut-api.js`. Elemente kennen Shopify nicht.
3. Specs definieren den Datenvertrag plattformneutral. Liquid-Objektpfade sind nur
   eine Spalte der Tabelle, Medusa ist die andere.
4. CSS kennt kein Liquid. Komponenten-CSS hat keine Shopify-spezifischen Selektoren
   (`.shopify-section` wird nur in `base.css` neutralisiert, falls nötig).
5. Web Components nutzen nur Standard-DOM-APIs, keine Shopify-Globals außer
   `window.Shopify.routes.root` innerhalb von `ut-api.js`.

## Offene Punkte

- Mehrwährung: Shopify Markets vs. Medusa Regions.
- Suche: Shopify Predictive Search vs. Medusa + Meilisearch.
- Kundenkonto: Shopify Customer Accounts vs. Medusa Customer-Modul (Login-Flow neu).
