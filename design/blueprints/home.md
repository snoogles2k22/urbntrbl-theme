# Blueprint: Startseite

Template: `templates/index.json` · Route: `/`

## Zweck

Den aktuellen oder nächsten Drop nach vorne stellen, dann Produkte, dann Marke. Die
Startseite setzt nur Komponenten zusammen, die in den anderen Blueprints definiert
sind, plus drei eigene Sections (Hero, Ticker, Image-with-Text). Reihenfolge und
Anzahl der Sections sind im Editor frei, das hier ist der Default.

## Layout (Default)

```
┌──────────────────────────────────────────────┐
│ hero                                         │
│  Quelle: aktueller Drop (auto) oder manuell  │
│  Media · Eyebrow · Headline · Sub · CTA(s)   │
│  <ut-countdown> wenn Drop upcoming           │
├──────────────────────────────────────────────┤
│ drop-teaser (nur wenn Drop live/upcoming und │
│  Hero nicht bereits den Drop zeigt)          │
├──────────────────────────────────────────────┤
│ featured-collection                          │
│  .ut-section-header · .ut-product-grid oder  │
│  <ut-carousel> · Link „Alle ansehen“          │
├──────────────────────────────────────────────┤
│ ticker (.ut-ticker, CSS-only Marquee)        │
├──────────────────────────────────────────────┤
│ image-with-text (Marke / Story / Lookbook)   │
├──────────────────────────────────────────────┤
│ featured-collection (zweite Instanz)         │
├──────────────────────────────────────────────┤
│ newsletter                                   │
└──────────────────────────────────────────────┘
```

## Sections

| # | Section                      | Komponenten                                                                     | Settings (Editor)                                                                                                          |
|---|------------------------------|---------------------------------------------------------------------------------|----------------------------------------------------------------------------------------------------------------------------|
| 1 | `hero.liquid`                | `.ut-hero`, `.ut-image`/Video, `.ut-button`, `.ut-badge`, `<ut-countdown>`      | `source` (`current_drop`/`manual`), `media` (image/video), `eyebrow`, `heading`, `text`, `cta_1_label/url`, `cta_2_label/url`, `height` (`md`/`lg`/`full`), `text_position` (`start`/`center`), `overlay` (bool) |
| 2 | `drop-teaser.liquid`         | `.ut-drop-card--wide`, `.ut-badge`, `<ut-countdown>`, `.ut-button`             | `drop` (`auto`/manuell: metaobject-Picker), `hide_if_shown_in_hero` (bool)                                                 |
| 3 | `featured-collection.liquid` | `.ut-section-header`, `.ut-product-grid` oder `<ut-carousel>`, `.ut-product-card`, `.ut-price--compact`, `.ut-badge`, `.ut-button` | `collection`, `heading`, `limit` (4–12), `layout` (`grid`/`carousel`), `columns_desktop`, `show_view_all` (bool) |
| 4 | `ticker.liquid`              | `.ut-ticker`                                                                     | Blöcke `item` (text, optionaler Link), `speed` (`slow`/`normal`/`fast`), `direction`                                      |
| 5 | `image-with-text.liquid`     | `.ut-split`, `.ut-image`, `.ut-rich-text`, `.ut-button`                          | `image`, `image_position` (`start`/`end`), `eyebrow`, `heading`, `text` (richtext), `cta_label/url`, `tone` (`default`/`inverse`) |
| 6 | `newsletter.liquid`          | `.ut-newsletter`, `.ut-form-field`, `.ut-button`                                 | `heading`, `text`, `success_text`, `tone`                                                                                  |

`tone: inverse` ist das einzige „Design“-Setting und zeigt auf einen Token-Scope
(`[data-tone="inverse"]` setzt `--ut-color-bg-default` und `--ut-color-text-default`
auf die Inverse-Werte). Siehe ADR 0004.

## Datenbedarf

| Feld                       | Quelle                                                                  |
|----------------------------|-------------------------------------------------------------------------|
| aktueller Drop             | Snippet `current-drop.liquid`: erster `drop` mit Status `live`, sonst erster `upcoming` (nach `launch_at` aufsteigend), sonst nil |
| Drop-Felder                | siehe `drop.md`                                                         |
| Featured-Produkte          | `collections[settings.collection].products`, ProductCard-Felder (siehe `collection.md`) |
| Newsletter                 | Shopify `customer_form` mit `tags: newsletter`                          |

Die Startseite liest **keine** eigenen Metafelder. Alles kommt aus Settings, Drop-
Metaobjekt und Kollektionen.

## Zustände

| Zustand           | Bedingung                             | Darstellung                                                          |
|-------------------|---------------------------------------|----------------------------------------------------------------------|
| drop live         | current-drop.status == live           | Hero (auto) zeigt Drop mit CTA „Zum Drop“, Teaser-Section ausgeblendet |
| drop upcoming     | status == upcoming                    | Hero mit Countdown und CTA „Erinnere mich“ (Anchor auf Drop-Seite)   |
| kein Drop         | current-drop == nil                   | Hero fällt auf manuelle Settings zurück; sind die leer, wird die Section nicht gerendert; Teaser nicht gerendert |
| collection empty  | Featured Collection ohne Produkte     | Section nicht gerendert (kein Empty-State auf der Startseite)        |

## Accessibility und Performance

- Hero-Media ist das LCP-Element: `fetchpriority="high"`, `loading="eager"`, Breiten-Set aus `image_url`, Video mit Poster.
- Ticker: pausiert bei `prefers-reduced-motion`, Text bleibt lesbar (statisch).
- Genau ein `<h1>` auf der Seite: Hero-Headline. Alle anderen Section-Headings sind `<h2>`.

## Port-Hinweise

- Alle Sections werden Server Components; nur `<ut-countdown>` und `<ut-carousel>` Client.
- Section-Settings aus dem Editor werden zu einem CMS-Dokument oder einer `home.json`-Config mit denselben Keys.
